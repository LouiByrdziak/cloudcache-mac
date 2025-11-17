#!/usr/bin/env bash
#
# Stop Local Development Servers
#
# Helper script to stop all local development servers

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/core.sh"

step "Stopping all local development servers..."

# Kill all dev and inspector ports using the centralized kill_ports function
# APP: 8789 (dev) + 9229 (inspector)
# ADMIN: 8787 (dev) + 9230 (inspector)
# APEX: 8788 (dev) + 9231 (inspector)
if kill_ports 8789 8787 8788 9229 9230 9231; then
  log "✅ All development servers stopped successfully"
else
  msg "⚠️  Some ports could not be freed. Development may fail if ports are in use."
  msg "    You can manually kill stuck processes if needed."
fi

