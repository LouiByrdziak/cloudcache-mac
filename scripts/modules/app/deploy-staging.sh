#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
. "$ROOT_DIR/scripts/lib/core.sh"

export CF_ENV="$ENV"
log "Deploying APP ($ENV)"
require_env CF_API_TOKEN CF_ACCOUNT_ID
pushd "$ROOT_DIR/apps/app" >/dev/null
run wrangler deploy --env "$ENV"
popd >/dev/null
log "APP $ENV deploy complete"
