#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Usage: $0 <domain>" >&2
  exit 1
fi

APP_ID=$(curl -sS "${CF_ACCT_BASE}/access/apps?per_page=1000" "${CF_AUTH[@]}" | jq -r --arg d "$DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)
[[ -n "$APP_ID" ]] || { echo "❌ App not found: $DOMAIN" >&2; exit 2; }

curl -sS "${CF_ACCT_BASE}/access/apps/${APP_ID}/policies?per_page=100" "${CF_AUTH[@]}" \
  | jq -r '.result[] | [.id,.name,.decision,(.precedence|tostring),(.include[]?.service_token?.token_id // "")] | @tsv'














