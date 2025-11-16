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

# Function to kill process on a port
kill_port() {
  local port="$1"
  local pid
  pid=$(lsof -ti:"$port" 2>/dev/null || echo "")
  if [[ -n "$pid" ]]; then
    log "Stopping server on port $port (PID: $pid)"
    kill "$pid" 2>/dev/null || true
    return 0
  else
    log "No server running on port $port"
    return 1
  fi
}

step "Stopping all local development servers..."

stopped_any=false

if kill_port 8789; then
  stopped_any=true
fi

if kill_port 8787; then
  stopped_any=true
fi

if kill_port 8788; then
  stopped_any=true
fi

# Also stop Node.js inspector ports (used by wrangler)
# APP uses 9229, ADMIN uses 9230, APEX uses 9231
if kill_port 9229; then
  stopped_any=true
fi
if kill_port 9230; then
  stopped_any=true
fi
if kill_port 9231; then
  stopped_any=true
fi

if [[ "$stopped_any" == "true" ]]; then
  sleep 1
  log "✅ All development servers stopped"
else
  log "ℹ️  No development servers were running"
fi

