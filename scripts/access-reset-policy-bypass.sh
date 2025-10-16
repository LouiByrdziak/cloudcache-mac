#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

DOMAIN="${1:-}"
TOKEN_NAME="${2:-}"
if [[ -z "$DOMAIN" || -z "$TOKEN_NAME" ]]; then
  echo "Usage: $0 <domain> <token-name>" >&2
  exit 1
fi

APP_ID=$(curl -sS "${CF_ACCT_BASE}/access/apps?per_page=1000" "${CF_AUTH[@]}" | jq -r --arg d "$DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)
[[ -n "$APP_ID" ]] || { echo "❌ App not found: $DOMAIN" >&2; exit 2; }

# wipe policies
POL_IDS=$(curl -sS "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies?per_page=1000" "${CF_AUTH[@]}" | jq -r '.result[]?.id')
for pid in $POL_IDS; do curl -sS -X DELETE "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies/${pid}" "${CF_AUTH[@]}" >/dev/null || true; done

# token id by name
TOK_ID=$(curl -sS "${CF_ACCT_BASE}/access/service_tokens?per_page=1000" "${CF_AUTH[@]}" | jq -r --arg n "$TOKEN_NAME" '.result[] | select(.name==$n) | .id' | head -n1)
[[ -n "$TOK_ID" ]] || { echo "❌ Token not found by name: $TOKEN_NAME" >&2; exit 3; }

# BYPASS decision policy with service_token include
BODY=$(jq -n --arg tid "$TOK_ID" '{name:"Service Auth (bypass)", precedence: 1, decision:"bypass", include:[{service_token:{token_id:$tid}}]}')
curl -sS -X POST "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies" "${CF_AUTH[@]}" --data "$BODY" >/dev/null

echo "✅ Reset BYPASS policy for ${DOMAIN} to token ${TOKEN_NAME} (${TOK_ID})"














