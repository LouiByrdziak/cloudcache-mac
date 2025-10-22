#!/usr/bin/env bash
#
# Hardened Shell Core Library
#
# Provides a robust foundation for shell scripts, with a focus on
# fail-fast execution, secure logging, and safe API interactions.
#

# ---
# Strict Mode & Error Handling
# ---
set -euo pipefail
IFS=$'\n\t'
trap 'die "Error at ${BASH_SOURCE[0]}:${LINENO}"' ERR

# ---
# Globals
# ---
API_ROOT="https://api.cloudflare.com/client/v4"
REDACTED_SECRETS=()

# ---
# Logging
# ---
msg() {
  echo >&2 -e "${1-}"
}

step() {
  msg "▶ ${1}"
}

log() {
  # Lightweight time-stamped log for uniformity with plan skeletons
  printf "[%s] %s\n" "$(date +'%H:%M:%S')" "$*" >&2
}

die() {
  msg "❌ ${1}"
  exit "${2:-1}"
}

abort() {
  die "$1"
}

# ---
# Security & User Interaction
# ---
has_cmd() { command -v "$1" >/dev/null 2>&1; }

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

redact() {
  REDACTED_SECRETS+=("$1")
}

confirm() {
  local prompt="${1:-Are you sure?}"
  local confirmation_text="${2:-YES}"
  read -p "$prompt [Type '$confirmation_text' to continue]: " confirm
  [[ "$confirm" == "$confirmation_text" ]] || die "Operation aborted."
}

# ---
# Env file + secrets resolution
# ---
load_env_file_if_exists() {
  local file="$1"
  if [[ -f "$file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
  fi
}

keychain_get() {
  # macOS Keychain lookup: service name "cloudcache:$1"
  if has_cmd security; then
    security find-generic-password -s "cloudcache:$1" -w 2>/dev/null || true
  fi
}

ensure_secret() {
  local var
  for var in "$@"; do
    if [[ -z "${!var:-}" ]]; then
      local val
      val="$(keychain_get "$var")"
      if [[ -n "$val" ]]; then
        # export dynamically by indirection
        printf -v "$var" '%s' "$val"
        export "$var"
      fi
    fi
  done
}

# Try multiple keychain service names for first hit
keychain_get_many() {
  if ! has_cmd security; then
    return 0
  fi
  local name
  for name in "$@"; do
    local v
    v=$(security find-generic-password -s "$name" -w 2>/dev/null || true)
    if [[ -n "$v" ]]; then
      printf "%s" "$v"
      return 0
    fi
  done
}

# Resolve a Cloudflare API token for a module: apex|admin|app
resolve_cf_token_for_module() {
  local module="$1"
  local upper
  upper=$(printf "%s" "$module" | tr '[:lower:]' '[:upper:]')
  # macOS bash 3.x lacks ${var^}; use awk to capitalize first letter
  local cap
  cap=$(printf "%s" "$module" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')

  # Candidate env var names in priority order
  local candidates=(
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_API_TOKEN_${upper}"
    "Cloudflare_Api_Token_${cap}"
    # Special-case: app may be referred to as Api in some setups
  )
  if [[ "$module" == "app" ]]; then
    candidates+=("Cloudflare_Api_Token_Api")
  fi
  candidates+=("CF_API_TOKEN")

  local name val
  for name in "${candidates[@]}"; do
    # 1) Env var present
    if [[ -n "${!name:-}" ]]; then
      printf "%s" "${!name}"
      return 0
    fi
    # 2) Keychain lookup under common service names
    val="$(keychain_get_many "cloudcache:${name}" "$name")"
    if [[ -n "$val" ]]; then
      # Export back to env for downstream tools
      printf -v "$name" '%s' "$val"
      export "$name"
      printf "%s" "$val"
      return 0
    fi
  done

  # Not found
  return 1
}

# ---
# Command Execution
# ---
run() {
  local cmd_str="$*"
  if [[ ${REDACTED_SECRETS+x} ]]; then
    local secret
    for secret in "${REDACTED_SECRETS[@]}"; do
      cmd_str="${cmd_str//$secret/[REDACTED]}"
    done
  fi
  step "Running: $cmd_str"
  if [[ "${DRY_RUN-}" == "1" ]]; then
    return 0
  fi
  "$@"
}

# ---
# Cloudflare API
# ---
setup_cf_env() {
  require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN
  redact "$CLOUDFLARE_API_TOKEN"
  CF_ACCT_BASE="${API_ROOT}/accounts/${CLOUDFLARE_ACCOUNT_ID}"
  CF_AUTH_HEADERS=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")
}

cf_api_call() {
  local method="$1" url="$2" data="${3:-}"
  local tmp_response=$(mktemp)
  
  local http_code
  http_code=$(run curl -sS -o "$tmp_response" -w '%{http_code}' \
    -X "$method" "${CF_AUTH_HEADERS[@]}" "$url" ${data:+--data "$data"})

  if [[ ! "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    die "Cloudflare API Error!\n  URL: ${method} ${url}\n  Code: ${http_code}\n  Response: $(cat "$tmp_response")"
  fi
  
  cat "$tmp_response"
  rm -f "$tmp_response"
}

cf_get() { cf_api_call "GET" "$1"; }
cf_post() { cf_api_call "POST" "$1" "${2:-}"; }
cf_delete() { cf_api_call "DELETE" "$1"; }

# ---
# ENV Handling (default to staging, allow prod)
# ---
ENV_INPUT="${1-}"
ENV="${ENV_INPUT:-${ENV:-staging}}"
if [[ "$ENV" != "staging" && "$ENV" != "prod" ]]; then
  die "ENV must be staging|prod"
fi

# ---
# Project root and dotenv loading
# ---
CORE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${ROOT_DIR:-$(cd "$CORE_DIR/../.." && pwd)}"
load_env_file_if_exists "$ROOT_DIR/.env"
load_env_file_if_exists "$ROOT_DIR/.env.local"
load_env_file_if_exists "$ROOT_DIR/.env.$ENV"
load_env_file_if_exists "$ROOT_DIR/.env.$ENV.local"
