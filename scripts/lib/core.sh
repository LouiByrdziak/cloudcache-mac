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

# Resolve a Cloudflare API token.
# This function is simpler now, it just ensures the variable is set.
resolve_cf_token() {
  if [[ -z "${CF_API_TOKEN:-}" ]]; then
    die "CF_API_TOKEN is not set. Please configure it in your .env file."
  fi
  printf "%s" "$CF_API_TOKEN"
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
  require_env CF_ACCOUNT_ID CF_API_TOKEN
  redact "$CF_API_TOKEN"
  CF_ACCT_BASE="${API_ROOT}/accounts/${CF_ACCOUNT_ID}"
  CF_AUTH_HEADERS=(-H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json")
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
