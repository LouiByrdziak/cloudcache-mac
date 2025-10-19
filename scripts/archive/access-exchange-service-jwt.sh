#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

DOMAIN="${1:-}"
CLIENT_ID="${2:-}"
CLIENT_SECRET="${3:-}"
if [[ -z "$DOMAIN" || -z "$CLIENT_ID" || -z "$CLIENT_SECRET" ]]; then
  echo "Usage: $0 <domain> <client_id> <client_secret>" >&2
  exit 1
fi

# The JWT exchange must happen at the application's domain, not the team domain.
# The logic to resolve the team domain is not needed.

# 2. Resolve AUD (audience tag) for the domain's Access app
APP_ID=$(curl -sS "${CF_ACCT_BASE}/access/apps?per_page=1000" "${CF_AUTH[@]}" | jq -r --arg d "$DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)
[[ -n "$APP_ID" ]] || { echo "❌ App not found: $DOMAIN" >&2; exit 3; }
APP_DETAIL=$(curl -sS "${CF_ACCT_BASE}/access/apps/${APP_ID}" "${CF_AUTH[@]}")
AUD=$(echo "$APP_DETAIL" | jq -r '.result.aud' | head -n1)
[[ -n "$AUD" && "$AUD" != "null" ]] || { echo "❌ Missing AUD for app $DOMAIN" >&2; exit 4; }

# 3. Exchange for JWT at the APPLICATION domain, capturing full response for debugging
RESPONSE=$(curl -sS -w "\\n%{http_code}" -X POST \
  -H "CF-Access-Client-Id: ${CLIENT_ID}" \
  -H "CF-Access-Client-Secret: ${CLIENT_SECRET}" \
  -H 'Content-Type: application/json' \
  --data "$(jq -n --arg aud "$AUD" '{aud:$aud}')" \
  "https://${DOMAIN}/cdn-cgi/access/service/auth")

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
JWT=$(echo "$HTTP_BODY" | jq -r '.token // empty')

if [[ "$HTTP_STATUS" -ne 200 || -z "$JWT" ]]; then
  echo "❌ JWT exchange failed for ${DOMAIN} (aud=${AUD})" >&2
  echo "   HTTP Status: ${HTTP_STATUS}" >&2
  echo "   Response Body: ${HTTP_BODY}" >&2
  exit 5
fi

echo "$JWT"


