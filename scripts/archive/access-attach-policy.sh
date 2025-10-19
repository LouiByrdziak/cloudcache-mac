#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/access_lib.sh"

APP_DOMAIN="${1:-}"
TOKEN_NAME="${2:-}"
if [[ -z "$APP_DOMAIN" || -z "$TOKEN_NAME" ]]; then
  echo "Usage: $0 <app-domain> <token-name>" >&2
  exit 1
fi

TOKEN="$(select_token_for_domain "$APP_DOMAIN")" || true
[[ -n "$TOKEN" ]] || { echo "❌ Missing module token for $APP_DOMAIN" >&2; exit 2; }
apps=$(cf_get "${BASE_ACC}/access/apps?per_page=1000")
app_id=$(echo "$apps" | jq -r --arg d "$APP_DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)
[[ -n "$app_id" ]] || { echo "❌ App not found for $APP_DOMAIN" >&2; exit 2; }

tokens=$(cf_get "${BASE_ACC}/access/service_tokens?per_page=1000")
tok_id=$(echo "$tokens" | jq -r --arg n "$TOKEN_NAME" '.result[] | select(.name==$n) | .id' | head -n1)
[[ -n "$tok_id" ]] || { echo "❌ Token name not found: $TOKEN_NAME" >&2; exit 3; }

body=$(jq -n --arg tid "$tok_id" '{name:"Service Auth", precedence: 1, decision:"allow", include:[{service_token:{token_id:$tid}}]}')
cf_post "${BASE_ACC}/access/apps/${app_id}/policies" "$body" >/dev/null
echo "✅ Policy attached: $APP_DOMAIN ← $TOKEN_NAME"










