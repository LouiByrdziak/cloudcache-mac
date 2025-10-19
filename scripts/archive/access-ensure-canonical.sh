#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/access_lib.sh"

ensure_app(){
  local domain="$1" name="$2"
  local id
  TOKEN="$(select_token_for_domain "$domain")" || true
  [[ -n "$TOKEN" ]] || die "Missing module token for $domain"
  id=$(cf_get "${BASE_ACC}/access/apps?per_page=1000" | jq -r --arg d "$domain" '.result[] | select(.domain==$d) | .id' | head -n1)
  if [[ -n "$id" ]]; then
    echo "✓ Access app exists: $domain ($id)"
  else
    echo "+ Create Access app: $domain"
    new_id=$(cf_post "${BASE_ACC}/access/apps" "$(jq -n --arg name "$name" --arg domain "$domain" '{name:$name,domain:$domain,type:"self_hosted"}')" | jq -r '.result.id')
    echo "  → $new_id"
  fi
}

# Canonical staging
ensure_app staging-app.cloudcache.ai staging-app
ensure_app staging-admin.cloudcache.ai staging-admin
ensure_app staging-apex.cloudcache.ai staging-apex

# Canonical prod
ensure_app app.cloudcache.ai app
ensure_app admin.cloudcache.ai admin
ensure_app cloudcache.ai apex

echo "✅ Canonical Access apps ensured"


