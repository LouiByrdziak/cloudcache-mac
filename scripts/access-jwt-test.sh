#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-}"
TOKEN_JSON="${2:-}"
if [[ -z "$DOMAIN" || -z "$TOKEN_JSON" ]]; then
  echo "Usage: $0 <domain> <token-json-file>" >&2
  exit 1
fi

CLIENT_ID=$(jq -r '.client_id' "$TOKEN_JSON")
CLIENT_SECRET=$(jq -r '.client_secret' "$TOKEN_JSON")

echo "== Exchange for JWT ($DOMAIN) =="
JWT=$(curl -s -X POST -H "CF-Access-Client-Id: $CLIENT_ID" -H "CF-Access-Client-Secret: $CLIENT_SECRET" "https://$DOMAIN/cdn-cgi/access/service/auth" | jq -r '.token // empty')
if [[ -z "$JWT" ]]; then
  echo "❌ Failed to obtain JWT"
  exit 2
fi
echo "obtained_jwt=ok"

printf "== %s / => " "$DOMAIN"
curl -s -o /dev/null -w "%{http_code}\n" -H "CF-Access-Jwt-Assertion: $JWT" "https://$DOMAIN/"













