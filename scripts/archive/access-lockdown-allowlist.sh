#!/usr/bin/env bash
set -euo pipefail

# Usage: access-lockdown-allowlist.sh <domain> <ip1,ip2,ip3>
# Requires: CLOUDFLARE_ACCOUNT_ID and one of:
#  - CLOUDFLARE_API_TOKEN_APP
#  - CLOUDFLARE_API_TOKEN_ADMIN
#  - CLOUDFLARE_API_TOKEN_APEX

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DOMAIN="${1:-}"
ALLOWLIST_CSV="${2:-}"

if [[ -z "$DOMAIN" || -z "$ALLOWLIST_CSV" ]]; then
  echo "Usage: $0 <domain> <ip1,ip2,ip3>" >&2
  exit 1
fi

[[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || { echo "❌ CLOUDFLARE_ACCOUNT_ID not set" >&2; exit 2; }

# Minimal domain→module mapping without sourcing cf-env.sh
MODULE=""
case "$DOMAIN" in
  app.cloudcache.ai|staging-app.cloudcache.ai) MODULE=app ;;
  admin.cloudcache.ai|staging-admin.cloudcache.ai) MODULE=admin ;;
  *) MODULE=apex ;;
esac

case "$MODULE" in
  app)   SELECTED_TOKEN="${CLOUDFLARE_API_TOKEN_APP:-}" ;;
  admin) SELECTED_TOKEN="${CLOUDFLARE_API_TOKEN_ADMIN:-}" ;;
  apex)  SELECTED_TOKEN="${CLOUDFLARE_API_TOKEN_APEX:-}" ;;
esac
[[ -n "$SELECTED_TOKEN" ]] || { echo "❌ Missing token for module $MODULE" >&2; exit 2; }

CF_AUTH=(-H "Authorization: Bearer ${SELECTED_TOKEN}" -H "Content-Type: application/json")
CF_ACCT_BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}"

mkdir -p "$ROOT_DIR/docs/zero-trust/backups" >/dev/null 2>&1 || true

# Find the Access app by exact domain string
APPS_JSON=$(curl -sS "${CF_ACCT_BASE}/access/apps?per_page=1000" "${CF_AUTH[@]}")
APP_ID=$(echo "$APPS_JSON" | jq -r --arg d "$DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)
if [[ -z "$APP_ID" ]]; then
  # Create self_hosted Access app for this domain
  NEW_BODY=$(jq -n --arg name "$DOMAIN" --arg domain "$DOMAIN" '{name:$name, domain:$domain, type:"self_hosted", app_launcher_visible:false, auto_redirect_to_identity:false}')
  CREATE_RESP=$(curl -sS -X POST "${CF_ACCT_BASE}/access/apps" "${CF_AUTH[@]}" --data "$NEW_BODY")
  APP_ID=$(echo "$CREATE_RESP" | jq -r '.result.id')
  [[ -n "$APP_ID" && "$APP_ID" != "null" ]] || { echo "❌ Failed to create Access app for $DOMAIN" >&2; exit 3; }
  echo "➕ Created Access app for $DOMAIN → $APP_ID"
fi

# Backup current policies
POL_JSON=$(curl -sS "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies?per_page=1000" "${CF_AUTH[@]}")
TS=$(date -u +%Y%m%dT%H%M%SZ)
SAFE_DOMAIN=$(echo "$DOMAIN" | tr -c 'A-Za-z0-9._-' '_')
BACKUP_FILE="$ROOT_DIR/docs/zero-trust/backups/${SAFE_DOMAIN}-${TS}.json"
echo "$POL_JSON" > "$BACKUP_FILE"
echo "📦 Backed up policies for $DOMAIN → $BACKUP_FILE"

# Wipe existing policies
for pid in $(echo "$POL_JSON" | jq -r '.result[]?.id'); do
  curl -sS -X DELETE "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies/${pid}" "${CF_AUTH[@]}" >/dev/null || true
done

# Build include array for bypass IPs
IFS=',' read -r -a IPS <<< "$ALLOWLIST_CSV"
INCLUDES="[]"
for ip in "${IPS[@]}"; do
  ip_trim=$(echo "$ip" | xargs)
  [[ -z "$ip_trim" ]] && continue
  INCLUDES=$(jq -c --arg ip "$ip_trim" '. + [{ip:{ip:$ip}}]' <<< "$INCLUDES")
done

# Create bypass policy
BYPASS_BODY=$(jq -n --argjson inc "$INCLUDES" '{name:"Bypass Allowlist", precedence:1, decision:"bypass", include:$inc}')
curl -sS -X POST "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies" "${CF_AUTH[@]}" --data "$BYPASS_BODY" >/dev/null

# Create deny everyone policy
DENY_BODY='{"name":"Deny All","precedence":2,"decision":"deny","include":[{"everyone":{}}]}'
curl -sS -X POST "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies" "${CF_AUTH[@]}" --data "$DENY_BODY" >/dev/null

# Show resulting policies
curl -sS "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies?per_page=1000" "${CF_AUTH[@]}" | jq -r '.result[] | {id,name,decision,precedence,include}'
echo "✅ Locked down $DOMAIN"


