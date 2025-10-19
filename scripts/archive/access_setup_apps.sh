#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/access_lib.sh"

# attach_app <host> <token_name>
attach_app() {
  local host="$1" token_name="$2"
  echo "== $host =="

  # Token id (use module-scoped token based on domain)
  local tok_id
  TOKEN="$(select_token_for_domain "$host")" || true
  [[ -n "$TOKEN" ]] || die "Missing module token for $host"
  tok_id=$(cf_get "${BASE_ACC}/access/service_tokens?per_page=1000" \
    | jq -r --arg n "$token_name" '.result[] | select(.name==$n) | .id' | head -n1)
  [[ -n "$tok_id" && "$tok_id" != "null" ]] || die "Token not found: $token_name"

  # App id (create if missing)
  local app_id
  app_id=$(cf_get "${BASE_ACC}/access/apps?type=self_hosted&name=${host}" \
    | jq -r '.result[0].id // empty')
  if [[ -z "$app_id" ]]; then
    app_id=$(cf_post "${BASE_ACC}/access/apps" \
      "{\"name\":\"${host}\",\"domain\":\"${host}\",\"type\":\"self_hosted\",\"app_launcher_visible\":false,\"auto_redirect_to_identity\":false}" \
      | jq -r '.result.id')
  fi
  echo "App ID: $app_id"

  # Upsert Service Auth policy
  local existing
  existing=$(cf_get "${BASE_ACC}/access/apps/${app_id}/policies" \
    | jq -r '.result[]? | select(.name=="Service Auth") | .id' | head -n1)
  local body
  body=$(jq -n --arg id "$tok_id" '{name:"Service Auth",precedence:1,decision:"allow",include:[{"service_token":{"token_id":$id}}],exclude:[],require:[]}')
  if [[ -n "$existing" && "$existing" != "null" ]]; then
    cf_put "${BASE_ACC}/access/apps/${app_id}/policies/${existing}" "$body" \
      | jq '{success, result:{id,name,decision}}'
  else
    cf_post "${BASE_ACC}/access/apps/${app_id}/policies" "$body" \
      | jq '{success, result:{id,name,decision}}'
  fi
}

# Execute for staging (canonical: staging-<module>.cloudcache.ai)
attach_app "staging-app.cloudcache.ai"   "monitor-readyz-app-staging"
attach_app "staging-admin.cloudcache.ai" "monitor-readyz-admin-staging"
attach_app "staging-apex.cloudcache.ai"  "monitor-readyz-apex-staging"

# Execute for prod
attach_app "app.cloudcache.ai"   "monitor-readyz-app-prod"
attach_app "admin.cloudcache.ai" "monitor-readyz-admin-prod"
attach_app "cloudcache.ai"       "monitor-readyz-apex-prod"

echo "Completed Access app setup."


