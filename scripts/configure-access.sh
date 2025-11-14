#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Configure Cloudflare Access policies for all modules
# Usage: bash scripts/configure-access.sh [all|app|admin|apex]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment files
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

if [[ -f "$ROOT_DIR/.env.local" ]]; then
  set -a
  source "$ROOT_DIR/.env.local"
  set +a
fi

# Define minimal helper functions (avoid sourcing core.sh which has auto-execution)
die() {
  echo "❌ ${1}" >&2
  exit "${2:-1}"
}

require_env() {
  local missing=0
  for var in "$@"; do
    if [[ -z "${!var:-}" ]]; then
      echo "❌ Missing required environment variable: $var" >&2
      missing=1
    fi
  done
  if [[ $missing -eq 1 ]]; then
    die "Aborting due to missing environment variables."
  fi
}

step() {
  echo "▶ ${1}" >&2
}

log() {
  printf "[%s] %s\n" "$(date +'%H:%M:%S')" "$*" >&2
}

# Setup Cloudflare environment
require_env CF_ACCOUNT_ID CF_API_TOKEN
API_ROOT="https://api.cloudflare.com/client/v4"

# Check for required tools
command -v jq >/dev/null || die "jq is required (brew install jq)"
command -v curl >/dev/null || die "curl is required"

# API base URLs
CF_ACCT_BASE="${API_ROOT}/accounts/${CF_ACCOUNT_ID}"
CF_AUTH_HEADERS=(-H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json")

# Helper function to create or get service token
create_or_get_token() {
  local token_name="$1"
  step "Creating/getting service token: $token_name"
  
  # Check if token exists
  local existing=""
  local curl_output
  curl_output=$(curl -sS "${CF_AUTH_HEADERS[@]}" \
    "${CF_ACCT_BASE}/access/service_tokens?per_page=1000" 2>&1) || true
  if echo "$curl_output" | jq -e '.success != false' >/dev/null 2>&1; then
    existing=$(echo "$curl_output" | jq -r --arg n "$token_name" '.result[]? | select(.name==$n) | .id' 2>/dev/null | head -n1 || echo "")
  fi
  
  if [[ -n "$existing" && "$existing" != "null" ]]; then
    log "Token already exists: $token_name (ID: $existing)"
    echo "$existing"
    return 0
  fi
  
  # Create new token
  local resp
  resp=$(curl -sS -X POST "${CF_AUTH_HEADERS[@]}" \
    "${CF_ACCT_BASE}/access/service_tokens" \
    --data "$(jq -n --arg name "$token_name" '{name:$name}')" 2>&1)
  
  # Check for errors
  if echo "$resp" | jq -e '.success == false' >/dev/null 2>&1; then
    local error_msg
    error_msg=$(echo "$resp" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null || echo "Failed to create token")
    die "Failed to create service token '$token_name': $error_msg"
  fi
  
  local token_id
  token_id=$(echo "$resp" | jq -r '.result.id // empty' 2>/dev/null)
  if [[ -z "$token_id" || "$token_id" == "null" ]]; then
    die "Failed to create service token '$token_name': Invalid response from API"
  fi
  
  log "Created new token: $token_name (ID: $token_id)"
  echo "$token_id"
}

# Helper function to create or get Access app
create_or_get_app() {
  local domain="$1"
  local app_name="${2:-$domain}"
  
  step "Creating/getting Access app: $app_name ($domain)"
  
  # Check if app exists
  local existing=""
  local curl_output
  curl_output=$(curl -sS "${CF_AUTH_HEADERS[@]}" \
    "${CF_ACCT_BASE}/access/apps?type=self_hosted&name=${app_name}" 2>&1) || true
  if echo "$curl_output" | jq -e '.success != false' >/dev/null 2>&1; then
    existing=$(echo "$curl_output" | jq -r '.result[0]?.id // empty' 2>/dev/null || echo "")
  fi
  
  if [[ -n "$existing" && "$existing" != "null" ]]; then
    log "Access app already exists: $app_name (ID: $existing)"
    echo "$existing"
    return 0
  fi
  
  # Create new app
  local resp
  resp=$(curl -sS -X POST "${CF_AUTH_HEADERS[@]}" \
    "${CF_ACCT_BASE}/access/apps" \
    --data "$(jq -n --arg name "$app_name" --arg domain "$domain" \
      '{name:$name, domain:$domain, type:"self_hosted", app_launcher_visible:false, auto_redirect_to_identity:false}')" 2>&1)
  
  # Check for errors - but ignore "already exists" errors
  if echo "$resp" | jq -e '.success == false' >/dev/null 2>&1; then
    local error_code
    error_code=$(echo "$resp" | jq -r '.errors[0].code // ""' 2>/dev/null || echo "")
    local error_msg
    error_msg=$(echo "$resp" | jq -r '.errors[0].message // ""' 2>/dev/null || echo "")
    
    # Check if error indicates app already exists (check both code and message)
    if [[ "$error_code" == "access.api.error.application_already_exists" ]] || \
       [[ "$error_msg" == *"already exists"* ]] || \
       [[ "$error_msg" == *"application_already_exists"* ]]; then
      # App already exists, try to get it by domain
      log "App already exists, retrieving by domain: $domain"
      local lookup_resp
      lookup_resp=$(curl -sS "${CF_AUTH_HEADERS[@]}" \
        "${CF_ACCT_BASE}/access/apps?type=self_hosted" 2>&1) || true
      if echo "$lookup_resp" | jq -e '.success != false' >/dev/null 2>&1; then
        existing=$(echo "$lookup_resp" | jq -r --arg domain "$domain" '.result[]? | select(.domain==$domain) | .id' 2>/dev/null | head -n1 || echo "")
        if [[ -n "$existing" && "$existing" != "null" ]]; then
          log "Retrieved existing Access app: $app_name (ID: $existing)"
          echo "$existing"
          return 0
        fi
      fi
      # If we can't find it, die with error
      if [[ -z "$existing" || "$existing" == "null" ]]; then
        die "Access app '$app_name' already exists but could not retrieve its ID. Please check manually in Cloudflare dashboard."
      fi
    else
      die "Failed to create Access app '$app_name': $error_msg"
    fi
  fi
  
  # Get app_id from response (if creation was successful) or from existing (if it already existed)
  local app_id="${existing:-}"
  if [[ -z "$app_id" || "$app_id" == "null" ]]; then
    app_id=$(echo "$resp" | jq -r '.result.id // empty' 2>/dev/null)
    if [[ -z "$app_id" || "$app_id" == "null" ]]; then
      die "Failed to create Access app '$app_name': Invalid response from API"
    fi
  fi
  
  log "Created new Access app: $app_name (ID: $app_id)"
  echo "$app_id"
}

# Helper function to attach service token policy to Access app
attach_service_token_policy() {
  local app_id="$1"
  local token_id="$2"
  local policy_name="${3:-Service Auth}"
  
  step "Attaching service token policy to app: $app_id"
  
  # Check if policy already exists
  local existing=""
  local curl_output
  curl_output=$(curl -sS "${CF_AUTH_HEADERS[@]}" \
    "${CF_ACCT_BASE}/access/apps/${app_id}/policies" 2>&1) || true
  if echo "$curl_output" | jq -e '.success != false' >/dev/null 2>&1; then
    existing=$(echo "$curl_output" | jq -r --arg n "$policy_name" '.result[]? | select(.name==$n) | .id' 2>/dev/null | head -n1 || echo "")
  fi
  
  local body
  body=$(jq -n --arg id "$token_id" --arg name "$policy_name" \
    '{name:$name, precedence:1, decision:"allow", include:[{service_token:{token_id:$id}}], exclude:[], require:[]}')
  
  if [[ -n "$existing" && "$existing" != "null" ]]; then
    # Update existing policy - get current precedence first to avoid conflicts
    local current_policy
    current_policy=$(echo "$curl_output" | jq -r --arg n "$policy_name" '.result[]? | select(.name==$n)' 2>/dev/null || echo "{}")
    local current_precedence
    current_precedence=$(echo "$current_policy" | jq -r '.precedence // 1' 2>/dev/null || echo "1")
    
    # Use current precedence to avoid conflicts
    body=$(jq -n --arg id "$token_id" --arg name "$policy_name" --argjson prec "$current_precedence" \
      '{name:$name, precedence:$prec, decision:"allow", include:[{service_token:{token_id:$id}}], exclude:[], require:[]}')
    
    local update_resp
    update_resp=$(curl -sS -X PUT "${CF_AUTH_HEADERS[@]}" \
      "${CF_ACCT_BASE}/access/apps/${app_id}/policies/${existing}" \
      --data "$body" 2>&1)
    if echo "$update_resp" | jq -e '.success == false' >/dev/null 2>&1; then
      local error_msg
      error_msg=$(echo "$update_resp" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null || echo "Failed to update policy")
      die "Failed to update policy '$policy_name': $error_msg"
    fi
    log "Updated policy: $policy_name"
  else
    # Create new policy - find highest precedence and use +1
    local max_precedence
    max_precedence=$(echo "$curl_output" | jq -r '[.result[]?.precedence // 0] | max' 2>/dev/null || echo "0")
    max_precedence=$((max_precedence + 1))
    
    body=$(jq -n --arg id "$token_id" --arg name "$policy_name" --argjson prec "$max_precedence" \
      '{name:$name, precedence:$prec, decision:"allow", include:[{service_token:{token_id:$id}}], exclude:[], require:[]}')
    
    local create_resp
    create_resp=$(curl -sS -X POST "${CF_AUTH_HEADERS[@]}" \
      "${CF_ACCT_BASE}/access/apps/${app_id}/policies" \
      --data "$body" 2>&1)
    if echo "$create_resp" | jq -e '.success == false' >/dev/null 2>&1; then
      local error_msg
      error_msg=$(echo "$create_resp" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null || echo "Failed to create policy")
      die "Failed to create policy '$policy_name': $error_msg"
    fi
    log "Created policy: $policy_name"
  fi
}

# Configure Access for a specific module and environment
configure_module_env() {
  local module="$1"
  local env="$2"
  local domain="$3"
  local token_name="$4"
  
  log "Configuring $module ($env): $domain"
  
  # Create/get service token
  local token_id
  token_id=$(create_or_get_token "$token_name")
  
  # Create/get Access app
  local app_id
  app_id=$(create_or_get_app "$domain" "$domain")
  
  # Attach service token policy
  attach_service_token_policy "$app_id" "$token_id"
  
  log "✅ Completed configuration for $module ($env)"
}

# Main configuration function
configure_all() {
  log "Configuring Access policies for all modules and environments"
  
  # App module
  configure_module_env "app" "production" "app.cloudcache.ai" "monitor-readyz-app-prod"
  configure_module_env "app" "staging" "staging-app.cloudcache.ai" "monitor-readyz-app-staging"
  
  # Admin module
  configure_module_env "admin" "production" "admin.cloudcache.ai" "monitor-readyz-admin-prod"
  configure_module_env "admin" "staging" "staging-admin.cloudcache.ai" "monitor-readyz-admin-staging"
  
  # Apex module
  configure_module_env "apex" "production" "cloudcache.ai" "monitor-readyz-apex-prod"
  configure_module_env "apex" "staging" "staging-apex.cloudcache.ai" "monitor-readyz-apex-staging"
  
  log "✅ All Access policies configured successfully"
}

# Parse command line argument
MODULE_ARG="${1:-all}"

log "Starting Access configuration for: $MODULE_ARG"

case "$MODULE_ARG" in
  all)
    configure_all
    ;;
  app)
    configure_module_env "app" "production" "app.cloudcache.ai" "monitor-readyz-app-prod"
    configure_module_env "app" "staging" "staging-app.cloudcache.ai" "monitor-readyz-app-staging"
    ;;
  admin)
    configure_module_env "admin" "production" "admin.cloudcache.ai" "monitor-readyz-admin-prod"
    configure_module_env "admin" "staging" "staging-admin.cloudcache.ai" "monitor-readyz-admin-staging"
    ;;
  apex)
    configure_module_env "apex" "production" "cloudcache.ai" "monitor-readyz-apex-prod"
    configure_module_env "apex" "staging" "staging-apex.cloudcache.ai" "monitor-readyz-apex-staging"
    ;;
  *)
    die "Unknown module: $MODULE_ARG. Use: all|app|admin|apex"
    ;;
esac

