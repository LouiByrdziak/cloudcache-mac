#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$ROOT_DIR/scripts/lib/core.sh"

prompt="This will reset Cloudflare resources for ENV=$ENV. Type RESET $ENV to continue:"
confirm_text="RESET $ENV"

confirm "$prompt" "$confirm_text"

log "Resetting environment: $ENV"

# Add concrete destructive actions here guarded by ENV and confirmation
# For example: revoke tokens, delete routes, reset Access policies, etc.
log "No destructive actions defined yet. Exiting."


