#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

MODULE="${1:-}"
ENV_NAME="${2:-staging}"
ZONE_ID="${ZONE_ID:-${CLOUDFLARE_ZONE_ID:-}}"

[[ -z "$MODULE" || ! "$MODULE" =~ ^(apex|app|admin)$ ]] && { echo "Usage: $0 [apex|app|admin] [staging|production|preview]"; exit 1; }
[[ -z "$ZONE_ID" ]] && { echo "❌ Missing ZONE_ID (export ZONE_ID)"; exit 2; }

# If a generic token is already provided, use it; otherwise select per-module token
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  select_module_token "$MODULE"
fi

lower_module="$MODULE"
service_name="${lower_module}-worker"
# Determine script and domain by env
case "$ENV_NAME" in
  production)
    script_name="$service_name"
    ;;
  staging)
    script_name="${service_name}-staging"
    ;;
  preview)
    echo "ℹ️ preview env has no zone route; use wrangler dev/preview."
    exit 0
    ;;
  *)
    echo "❌ Unknown env: $ENV_NAME (expected: production|staging|preview)" >&2
    exit 1
    ;;
esac

domain=""
case "$MODULE" in
  app)   domain="app.cloudcache.ai" ;;
  admin) domain="admin.cloudcache.ai" ;;
  apex)  domain="cloudcache.ai" ;;
esac

if [[ "$ENV_NAME" == "staging" ]]; then
  case "$MODULE" in
    app)   domain="staging-app.cloudcache.ai" ;;
    admin) domain="staging-admin.cloudcache.ai" ;;
    apex)  domain="staging-apex.cloudcache.ai" ;;
  esac
fi

host_pattern="${domain}/*"

echo "🔧 Wiring route $host_pattern → script=$script_name"

# Fetch current routes
ROUTES_JSON=$(curl -sS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/routes")

EXISTING_ID=$(echo "$ROUTES_JSON" | jq -r --arg p "$host_pattern" '.result[]? | select(.pattern==$p) | .id' | head -n1 || true)

BODY=$(jq -n --arg pattern "$host_pattern" --arg script "$script_name" '{pattern: $pattern, script: $script}')

if [[ -n "${EXISTING_ID:-}" ]]; then
  echo "  • Updating existing route: $EXISTING_ID"
  curl -sS -X PUT -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
    -d "$BODY" \
    "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/routes/${EXISTING_ID}" | jq '{success, result: {id, pattern, script}}'
else
  echo "  + Creating route"
  curl -sS -X POST -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
    -d "$BODY" \
    "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/routes" | jq '{success, result: {id, pattern, script}}'
fi

echo "✅ Route wired for $MODULE/$ENV_NAME"

