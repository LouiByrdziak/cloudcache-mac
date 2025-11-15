#!/usr/bin/env bash
#
# Deploy All Modules to Preview
#
# Builds and deploys all three modules (app, admin, apex) to preview environment
# with the latest code including visual validation markers

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment files first
load_env_file_if_exists() {
  local file="$1"
  if [[ -f "$file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
  fi
}

load_env_file_if_exists "$ROOT_DIR/.env"
load_env_file_if_exists "$ROOT_DIR/.env.local"

source "$SCRIPT_DIR/lib/core.sh"

# Check prerequisites
require_env CF_API_TOKEN CF_ACCOUNT_ID
setup_wrangler_token

step "Building and deploying all modules to preview"

# Build APP module
step "Building APP module..."
cd "$ROOT_DIR/apps/app"
pnpm build:bundle || die "APP build failed"

# Deploy APP module
step "Deploying APP module to preview..."
wrangler deploy --env preview --no-bundle || die "APP deployment failed"
log "✅ APP deployed to: https://app-worker-preview.cloudcache.workers.dev"

# Build ADMIN module
step "Building ADMIN module..."
cd "$ROOT_DIR/apps/admin"
pnpm build:bundle || die "ADMIN build failed"

# Deploy ADMIN module
step "Deploying ADMIN module to preview..."
wrangler deploy --env preview --no-bundle || die "ADMIN deployment failed"
log "✅ ADMIN deployed to: https://admin-worker-preview.cloudcache.workers.dev"

# Build APEX module
step "Building APEX module..."
cd "$ROOT_DIR/apps/apex"
# APEX uses src/index.ts, not index.ts
# Skip DTS generation for Pages deployment (not needed)
pnpm exec tsup src/index.ts --format esm || die "APEX build failed"

# Deploy APEX module (as Worker, not Pages)
step "Deploying APEX module to preview..."
wrangler deploy --env preview --no-bundle || die "APEX deployment failed"
log "✅ APEX deployed to: https://apex-worker-preview.cloudcache.workers.dev"

echo ""
log "🎉 All modules deployed to preview!"
echo ""
echo "Preview URLs:"
echo "  APP:   https://app-worker-preview.cloudcache.workers.dev"
echo "  ADMIN: https://admin-worker-preview.cloudcache.workers.dev"
echo "  APEX:  https://apex-worker-preview.cloudcache.workers.dev"
echo ""
echo "Verify visual markers:"
echo "  - Green text 'I love Cloudcache APP' should be visible"
echo "  - Green text 'I love Cloudcache ADMIN' should be visible"
echo "  - Green text 'I love Cloudcache APEX' should be visible"

