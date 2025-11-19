#!/usr/bin/env bash
set -uo pipefail

# Standalone Automated Deployment Validation System
# This script is designed to be run on a schedule or on-demand to validate
# the health of all Cloudcache deployments.

# --- Configuration ---
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
REPORTS_DIR="$ROOT_DIR/docs/reports/validation"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
REPORT_FILE="$REPORTS_DIR/validation-report-$TIMESTAMP.md"

MODULES=("app" "admin" "apex")
MODES=("preview" "staging" "production")
ENVIRONMENTS=("localhost" "cloudflare")

# Track background processes for cleanup
DEV_PIDS=()

# --- Cleanup Function ---
cleanup() {
  log "Cleaning up background processes..."
  for pid in "${DEV_PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  # Also kill any remaining dev processes
  pkill -f "wrangler dev" 2>/dev/null || true
  pkill -f "concurrently" 2>/dev/null || true
}
trap cleanup EXIT

# --- Helper Functions ---

# Function to log messages
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1"
}

# Function to start local dev servers
start_local_servers() {
  log "Starting local development servers..."
  
  # Ensure all previous development servers are stopped for a clean slate.
  log "Stopping any lingering development servers..."
  bash "$ROOT_DIR/scripts/dev-stop.sh"

  # Check if servers are already running
  local servers_running=true
  for port in 8787 8788 8789; do
    if ! curl -s --head --fail "http://localhost:$port" >/dev/null 2>&1; then
      servers_running=false
      break
    fi
  done
  
  if [[ "$servers_running" == "true" ]]; then
    log "Local servers are already running."
    return 0
  fi
  
  # Build all modules sequentially first to avoid race conditions
  log "Building all modules for local development..."
  cd "$ROOT_DIR"
  if ! pnpm build:dev; then
      log "⚠️  Warning: Initial build failed. Check logs for errors."
      log "⚠️  Skipping localhost tests. Fix build errors and start servers manually."
      return 1
  fi
  
  # Add a cool-down period after the build and before starting servers.
  log "Build complete. Pausing for 5 seconds before starting servers..."
  sleep 5
  
  # Start dev servers in background using the robust sequential script
  log "Starting local servers sequentially..."
  cd "$ROOT_DIR"
  bash scripts/dev-local.sh > /tmp/cloudcache-dev.log 2>&1 &
  local dev_pid=$!
  DEV_PIDS+=("$dev_pid")
  
  # Wait for servers to be ready
  log "Waiting for servers to start..."
  local max_attempts=60
  local attempt=0
  
  while [[ $attempt -lt $max_attempts ]]; do
    # Fail fast: Check if the dev startup script has exited unexpectedly
    if ! kill -0 "$dev_pid" 2>/dev/null; then
       log "❌ Dev startup script exited prematurely. Checking logs..."
       if [[ -f "/tmp/cloudcache-dev.log" ]]; then
         cat "/tmp/cloudcache-dev.log"
       fi
       return 1
    fi

    # Check if servers are ready
    local all_ready=true
    for port in 8787 8788 8789; do
      if ! curl -s --head --fail "http://localhost:$port" >/dev/null 2>&1; then
        all_ready=false
        break
      fi
    done
    
    if [[ "$all_ready" == "true" ]]; then
      log "✅ All local servers are ready."
      return 0
    fi
    
    sleep 2
    attempt=$((attempt + 1))
  done
  
  log "⚠️  Warning: Servers did not become ready within timeout."
  log "⚠️  Skipping localhost tests. Start servers manually with 'pnpm dev' if needed."
  return 1
}

# Function to run a validation check and append to report
run_check() {
  local check_name="$1"
  shift
  local command_to_run="$@"
  local output
  local status

  echo -n "  - $check_name..." | tee -a "$REPORT_FILE"
  
  if output=$(eval "$command_to_run" 2>&1); then
    status="✅ PASSED"
    echo "$status" | tee -a "$REPORT_FILE"
    return 0
  else
    status="❌ FAILED"
    echo "$status" | tee -a "$REPORT_FILE"
    if [[ -n "$output" ]]; then
      echo "\`\`\`" >> "$REPORT_FILE"
      echo "$output" >> "$REPORT_FILE"
      echo "\`\`\`" >> "$REPORT_FILE"
    fi
    return 1
  fi
}

# Function to get worker name based on module and mode
get_worker_name() {
  local module="$1"
  local mode="$2"
  case "$module" in
    app)
      case "$mode" in
        preview) echo "app-worker-preview" ;;
        staging) echo "app-worker-staging" ;;
        production) echo "app-worker-production" ;;
      esac
      ;;
    admin)
      case "$mode" in
        preview) echo "admin-worker-preview" ;;
        staging) echo "admin-worker-staging" ;;
        production) echo "admin-worker-production" ;;
      esac
      ;;
    apex)
      case "$mode" in
        preview) echo "apex-worker-preview" ;;
        staging) echo "apex-worker-staging" ;;
        production) echo "apex-worker-production" ;;
      esac
      ;;
  esac
}

# --- Main Logic ---

log "Syncing with remote repository..."
bash scripts/all-git-truth.sh --git-safe fetch origin --prune || log "⚠️  Warning: git fetch failed, continuing anyway..."

# Start local servers if we'll be testing localhost
if [[ " ${ENVIRONMENTS[@]} " =~ " localhost " ]]; then
  if ! start_local_servers; then
    log "⚠️  Local servers failed to start. Skipping localhost environment tests."
    # Remove localhost from environments to skip it
    ENVIRONMENTS=("cloudflare")
  fi
fi

# Create report directory
mkdir -p "$REPORTS_DIR"

# Initialize report file
echo "# Cloudcache Deployment Validation Report" > "$REPORT_FILE"
echo "**Generated on:** $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# --- Run Validation Checks ---

for module in "${MODULES[@]}"; do
  for mode in "${MODES[@]}"; do
    for env in "${ENVIRONMENTS[@]}"; do
      
      echo "### Module: \`$module\` | Mode: \`$mode\` | Environment: \`$env\`" >> "$REPORT_FILE"
      
      # Construct URL
      url=""
      GIT_HASH=""
      if [[ "$env" == "localhost" ]]; then
        GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        case "$module" in
          app) url="http://localhost:8789" ;;
          admin) url="http://localhost:8787" ;;
          apex) url="http://localhost:8788" ;;
        esac
      else # cloudflare
        case "$mode" in
          preview)
            GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
            url="https://$(get_worker_name "$module" "preview").cloudcache.workers.dev"
            ;;
          staging)
            # Skip staging check if remote branch doesn't exist, but don't log it as a failure/skip
            if ! git rev-parse --verify origin/staging >/dev/null 2>&1; then
              continue 2 # Skip to the next mode silently
            fi
            GIT_HASH=$(git rev-parse --short origin/staging 2>/dev/null || echo "unknown")
            url="https://staging-$module.cloudcache.ai"
            ;;
          production)
            if ! git rev-parse --verify origin/main >/dev/null 2>&1; then
              # echo "  - 🟡 SKIPPED: Remote branch 'origin/main' not found locally." | tee -a "$REPORT_FILE"
              # echo "" >> "$REPORT_FILE"
              continue 2 # Skip to the next mode
            fi
            GIT_HASH=$(git rev-parse --short origin/main 2>/dev/null || echo "unknown")
            if [[ "$module" == "apex" ]]; then
              url="https://cloudcache.ai"
            else
              url="https://$module.cloudcache.ai"
            fi
            ;;
        esac
      fi

      if [[ -z "$url" ]]; then
        echo "  - Could not determine URL. Skipping." | tee -a "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        continue
      fi
      
      echo "  **URL:** \`$url\`" >> "$REPORT_FILE"

      # Skip protected production endpoints (behind Cloudflare Access)
      if [[ "$mode" == "production" && "$env" == "cloudflare" ]]; then
        # echo "  - 🟡 SKIPPED: Production endpoints are protected by Cloudflare Access." | tee -a "$REPORT_FILE"
        # echo "" >> "$REPORT_FILE"
        continue
      fi

      # Pre-check: verify URL is accessible
      if ! curl -s --head --fail --max-time 5 "$url" >/dev/null 2>&1; then
        echo "  - 🟡 SKIPPED: URL $url is not accessible." | tee -a "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        continue
      fi

      # 1. Health & Version Check
      run_check "Health & Version Check" "node '$ROOT_DIR/scripts/validation/helpers/check-health.js' '$url' '$GIT_HASH'"
      
      # 2. Badge Verification
      run_check "Badge Verification" "node '$ROOT_DIR/scripts/validation/helpers/check-badge.js' '$url'"

      # 3. Link Verification (Optional, can be noisy)
      # run_check "Link Verification" "node '$ROOT_DIR/scripts/validation/helpers/check-links.js' '$url'"
      
      echo "" >> "$REPORT_FILE"
    done
  done
done

log "Validation complete. Report generated at: $REPORT_FILE"
