#!/usr/bin/env bash
#
# Start Local Development Servers
#
# Helper script to build and start local development servers for all modules

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
    log "Killing stale process on port $port (PID: $pid)"
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
}

# Clean up any stale processes on dev ports
step "Checking for stale processes on dev ports..."
kill_port 8789
kill_port 8787
kill_port 8788
# Also check for Node.js inspector ports (used by wrangler)
# APP uses 9229, ADMIN uses 9230, APEX uses 9231
kill_port 9229
kill_port 9230
kill_port 9231

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

step "Building all modules for local development..."

# Build APP module
step "Building APP module..."
cd "$ROOT_DIR/apps/app"
pnpm build || die "APP build failed"
log "✅ APP built successfully"

# Build ADMIN module
step "Building ADMIN module..."
cd "$ROOT_DIR/apps/admin"
pnpm build || die "ADMIN build failed"
log "✅ ADMIN built successfully"

# Build APEX module
step "Building APEX module..."
cd "$ROOT_DIR/apps/apex"
pnpm exec tsup src/index.ts --format esm || die "APEX build failed"
log "✅ APEX built successfully"

echo ""
log "🎉 All modules built successfully!"
echo ""
echo -e "${GREEN}Local Development URLs:${NC}"
echo -e "  ${BLUE}APP:${NC}   http://localhost:8789"
echo -e "  ${BLUE}ADMIN:${NC} http://localhost:8787"
echo -e "  ${BLUE}APEX:${NC}  http://localhost:8788"
echo ""
echo -e "${YELLOW}To start development servers, run:${NC}"
echo "  pnpm dev:app    # Start APP on port 8789"
echo "  pnpm dev:admin  # Start ADMIN on port 8787"
echo "  pnpm dev:apex   # Start APEX on port 8788"
echo "  pnpm dev        # Start all modules concurrently"
echo ""
echo -e "${YELLOW}Or start individually:${NC}"
echo "  cd apps/app && pnpm dev"
echo "  cd apps/admin && pnpm dev"
echo "  cd apps/apex && pnpm dev"
echo ""

