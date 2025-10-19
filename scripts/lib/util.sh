#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

#
# Cloudcache Shell Utility Library
#
# Consolidates environment setup, API helpers, and common functions
# for all automation scripts. Sourced by scripts in `cf/` and `danger/`.
#

# ---
# Globals and Constants
# ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_ROOT="https://api.cloudflare.com/client/v4"

# ---
# Logging and Error Handling
# ---
msg() {
  echo >&2 -e "${1-}"
}

step() {
  msg "▶ ${1}"
}

die() {
  msg "❌ ${1}"
  exit "${2:-1}"
}

trap 'die "Error at ${BASH_SOURCE[0]}:${LINENO}"' ERR

# ---
# Prerequisite Checks
# ---
require_tools() {
  command -v jq >/dev/null || die "jq not found (brew install jq)"
  command -v curl >/dev/null || die "curl not found"
}

require_env() {
  local missing=0
  for var in "$@"; do
    if [[ -z "${!var:-}" ]]; then
      msg "❌ Missing required environment variable: $var"
      missing=1
    fi
  done
  (( missing )) && die "Aborting due to missing environment variables."
}

# ---
# Cloudflare Environment and API Setup
# ---
# Initializes CF_ACCOUNT_ID, CF_ZONE_ID, and CF_API_TOKEN from environment
# variables. Supports both CLOUDFLARE_ and legacy CF_ prefixes.
setup_env() {
  CF_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-${CF_ACCOUNT_ID:-}}"
  CF_ZONE_ID="${CLOUDFLARE_ZONE_ID:-${CF_ZONE_ID:-}}"
  
  CF_ACCT_BASE="${API_ROOT}/accounts/${CF_ACCOUNT_ID}"
  CF_ZONE_BASE="${API_ROOT}/zones/${CF_ZONE_ID}"
  
  # Module can be passed as an argument (e.g., app, admin, apex)
  local module="${1:-}"
  if [[ -n "$module" ]]; then
    select_module_token "$module"
  else
    # Fallback to a generic token if no module is specified
    CF_API_TOKEN="${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-}}"
  fi
  
  CF_AUTH_HEADERS=(-H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json")
}

# Selects the appropriate API token based on the module (app, admin, apex)
select_module_token() {
  local module="$1"
  local token_var="CLOUDFLARE_API_TOKEN_${module^^}"
  CF_API_TOKEN="${!token_var:-}"
  [[ -n "$CF_API_TOKEN" ]] || die "Missing token for module '$module'. Set ${token_var}."
}

# ---
# Cloudflare API Wrappers
# ---
cf_api_call() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local tmp_response
  tmp_response=$(mktemp)
  
  local http_code
  http_code=$(curl -sS -o "$tmp_response" -w '%{http_code}' \
    -X "$method" \
    "${CF_AUTH_HEADERS[@]}" \
    "$url" \
    ${data:+--data "$data"})

  if [[ ! "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    die "Cloudflare API request failed!\n  URL: ${method} ${url}\n  Code: ${http_code}\n  Response: $(cat "$tmp_response")"
  fi
  
  cat "$tmp_response"
  rm -f "$tmp_response"
}

cf_get() { cf_api_call "GET" "$1"; }
cf_post() { cf_api_call "POST" "$1" "${2:-}"; }
cf_put() { cf_api_call "PUT" "$1" "${2:-}"; }
cf_patch() { cf_api_call "PATCH" "$1" "${2:-}"; }
cf_delete() { cf_api_call "DELETE" "$1"; }


# ---
# Common Utility Functions
# ---
ts_suffix(){ date -u +%Y%m%d%H%M%S; }

# Ensures the account_id is present in a wrangler.toml.local file
ensure_local_toml_account_id() {
  local file="$1"
  [[ -n "$CF_ACCOUNT_ID" ]] || return 0
  if ! grep -q '^account_id\s*=' "$file" 2>/dev/null; then
    printf 'account_id = "%s"\n\n' "$CF_ACCOUNT_ID" | cat - "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
}
