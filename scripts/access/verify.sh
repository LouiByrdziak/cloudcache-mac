#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$ROOT_DIR/scripts/lib/core.sh"

HOST="${HOST_ADMIN:-staging-admin.cloudcache.ai}"
PATH_="${PATH_:-/}"

require_env CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET
ensure_secret CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET

HDR_ID="CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID"
HDR_SECRET="CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET"

log "Access verify (with headers → 200) https://$HOST$PATH_"
run curl -fsS -H "$HDR_ID" -H "$HDR_SECRET" "https://$HOST$PATH_" -o /dev/null

log "Access verify (without headers → 403) https://$HOST$PATH_"
set +e
code=$(curl -s -o /dev/null -w "%{http_code}" "https://$HOST$PATH_")
set -e
[[ "$code" == "403" ]] || abort "Expected 403 without headers, got $code"
log "Access verification passed"
