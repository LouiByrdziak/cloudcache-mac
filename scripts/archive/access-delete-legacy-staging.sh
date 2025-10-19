#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/access_lib.sh"

# Delete legacy Access apps for non-canonical staging domains
delete_app(){
  local domain="$1"
  local id
  TOKEN="$(select_token_for_domain "$domain")" || true
  [[ -n "$TOKEN" ]] || die "Missing module token for $domain"
  id=$(cf_get "${BASE_ACC}/access/apps?per_page=1000" | jq -r --arg d "$domain" '.result[] | select(.domain==$d) | .id' | head -n1)
  if [[ -n "$id" ]]; then
    echo "🗑️  Delete Access app: $domain ($id)"
    curl -sS -X DELETE "${BASE_ACC}/access/apps/${id}" -H "$(auth_header)" >/dev/null || true
  else
    echo "ℹ️  No Access app for $domain"
  fi
}

delete_app app-staging.cloudcache.ai
delete_app admin-staging.cloudcache.ai
delete_app apex-staging.cloudcache.ai
delete_app staging.cloudcache.ai
delete_app staging.app.cloudcache.ai
delete_app staging.admin.cloudcache.ai

echo "✅ Legacy staging Access apps cleanup complete"


