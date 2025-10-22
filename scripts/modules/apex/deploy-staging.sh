#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
. "$ROOT_DIR/scripts/lib/core.sh"

export CF_ENV="$ENV"
log "Deploying APEX ($ENV)"
pushd "$ROOT_DIR/apps/apex" >/dev/null
# Resolve per-module token (prefers CLOUDFLARE_API_TOKEN_APEX / Cloudflare_Api_Token_Apex)
token="$(resolve_cf_token_for_module apex || true)"
if [[ -n "$token" ]]; then export CLOUDFLARE_API_TOKEN="$token"; fi
ensure_secret CLOUDFLARE_ACCOUNT_ID
run wrangler deploy --env "$ENV"
popd >/dev/null
log "APEX $ENV deploy complete"
