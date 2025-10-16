#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Usage: $0 <domain>" >&2
  exit 1
fi

# Find app id
APP_ID=$(curl -sS "${CF_ACCT_BASE}/access/apps?per_page=1000" "${CF_AUTH[@]}" | jq -r --arg d "$DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)
[[ -n "$APP_ID" ]] || { echo "❌ App not found: $DOMAIN" >&2; exit 2; }

# Patch to disable auto redirect and clear allowed_idps
PATCH=$(jq -n '{auto_redirect_to_identity:false, allowed_idps:[]}')
curl -sS -X PATCH "${CF_ACCT_BASE}/access/apps/${APP_ID}" "${CF_AUTH[@]}" --data "$PATCH" >/dev/null
echo "✅ Tuned app settings for ${DOMAIN} (auto_redirect_to_identity=false, allowed_idps=[])"














