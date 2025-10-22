#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$ROOT_DIR/scripts/lib/core.sh"

HOST_APEX="${HOST_APEX:-staging-apex.cloudcache.ai}"
HOST_ADMIN="${HOST_ADMIN:-staging-admin.cloudcache.ai}"
HOST_APP="${HOST_APP:-staging-app.cloudcache.ai}"

for host in "$HOST_APEX" "$HOST_ADMIN" "$HOST_APP"; do
  log "Ping https://$host/"
  run curl -fsSL --max-time 10 "https://$host/" >/dev/null
done

log "Ping checks passed for $ENV"


