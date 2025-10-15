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
if [[ -n "$APP_ID" ]]; then
  curl -sS -X DELETE "${CF_ACCT_BASE}/access/apps/${APP_ID}" "${CF_AUTH[@]}" >/dev/null
  echo "🗑️  Deleted Access app: ${DOMAIN} (${APP_ID})"
else
  echo "ℹ️  No Access app found for ${DOMAIN}"
fi













