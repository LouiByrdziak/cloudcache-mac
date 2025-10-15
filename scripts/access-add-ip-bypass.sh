#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

DOMAIN="${1:-}"
CIDR="${2:-}"
if [[ -z "$DOMAIN" || -z "$CIDR" ]]; then
  echo "Usage: $0 <domain> <ip-or-cidr>" >&2
  exit 1
fi

APP_ID=$(curl -sS "${CF_ACCT_BASE}/access/apps?per_page=1000" "${CF_AUTH[@]}" | jq -r --arg d "$DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)
[[ -n "$APP_ID" ]] || { echo "❌ App not found: $DOMAIN" >&2; exit 2; }

BODY=$(jq -n --arg ip "$CIDR" '{name:"Temp IP Bypass", precedence: 1, decision:"bypass", include:[{ip:{ip:$ip}}]}')
curl -sS -X POST "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies" "${CF_AUTH[@]}" --data "$BODY" >/dev/null
echo "✅ Added IP bypass policy for ${DOMAIN}: ${CIDR}"













