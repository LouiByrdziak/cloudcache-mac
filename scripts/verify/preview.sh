#!/usr/bin/env bash
#
# Preview Deployment Verification Script
#
# Verifies preview deployments by testing health endpoints and module-specific functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$SCRIPT_DIR/../lib/core.sh"
source "$SCRIPT_DIR/../lib/preview-urls.sh"

# Test health endpoints
test_health_endpoints() {
  local base_url="$1"
  local module="$2"
  local failures=0
  
  step "Testing health endpoints for $module"
  
  # Test /healthz
  log "Testing /healthz endpoint..."
  local healthz_code
  healthz_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${base_url}/healthz" || echo "000")
  
  if [[ "$healthz_code" == "200" ]]; then
    log "✅ /healthz returned 200 OK"
  else
    log "❌ /healthz returned $healthz_code"
    failures=$((failures + 1))
  fi
  
  # Test /readyz
  log "Testing /readyz endpoint..."
  local readyz_code
  readyz_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${base_url}/readyz" || echo "000")
  
  if [[ "$readyz_code" == "200" ]]; then
    log "✅ /readyz returned 200 OK"
  else
    log "❌ /readyz returned $readyz_code"
    failures=$((failures + 1))
  fi
  
  # Test /api/v1/ping for app module
  if [[ "$module" == "app" ]]; then
    log "Testing /api/v1/ping endpoint..."
    local ping_code
    ping_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${base_url}/api/v1/ping" || echo "000")
    
    if [[ "$ping_code" == "200" ]]; then
      log "✅ /api/v1/ping returned 200 OK"
    else
      log "❌ /api/v1/ping returned $ping_code"
      failures=$((failures + 1))
    fi
  fi
  
  return $failures
}

# Test root endpoint
test_root_endpoint() {
  local base_url="$1"
  local module="$2"
  
  step "Testing root endpoint for $module"
  
  log "Testing root endpoint..."
  local root_code
  root_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${base_url}/" || echo "000")
  
  if [[ "$root_code" =~ ^2[0-9][0-9]$ ]]; then
    log "✅ Root endpoint returned $root_code"
    return 0
  else
    log "❌ Root endpoint returned $root_code"
    return 1
  fi
}

main() {
  local module="${1:-}"
  local preview_url="${2:-}"
  
  [[ -z "$module" ]] && die "Usage: $0 <module> [preview-url]"
  
  # Validate module
  case "$module" in
    apex|app|admin)
      ;;
    *)
      die "Invalid module: $module. Must be one of: apex, app, admin"
      ;;
  esac
  
  # Get preview URL if not provided
  if [[ -z "$preview_url" ]]; then
    case "$module" in
      apex)
        die "Pages preview URL must be provided for apex module"
        ;;
      app|admin)
        preview_url=$(get_module_preview_url "$module")
        ;;
    esac
  fi
  
  # Normalize URL (remove trailing slash, ensure https://)
  preview_url="${preview_url%/}"
  if [[ ! "$preview_url" =~ ^https?:// ]]; then
    preview_url="https://${preview_url}"
  fi
  
  step "Verifying preview deployment for $module at $preview_url"
  
  local total_failures=0
  
  # Test root endpoint
  if ! test_root_endpoint "$preview_url" "$module"; then
    total_failures=$((total_failures + 1))
  fi
  
  # Test health endpoints
  if ! test_health_endpoints "$preview_url" "$module"; then
    total_failures=$((total_failures + 1))
  fi
  
  if [[ $total_failures -eq 0 ]]; then
    log "✅ All preview verification tests passed for $module"
    echo "$preview_url"
    return 0
  else
    die "Preview verification failed for $module: $total_failures test(s) failed"
  fi
}

main "$@"

