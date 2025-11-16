#!/usr/bin/env bash
#
# Preview Browser Testing Script
#
# Validates preview deployments using health endpoint JSON responses
# This approach is content-agnostic and validates actual service functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$SCRIPT_DIR/../lib/core.sh"
source "$SCRIPT_DIR/../lib/preview-urls.sh"

# Validate deployment using health endpoint JSON responses
# This approach is content-agnostic and validates actual service functionality
test_healthz_json() {
  local preview_url="$1"
  local module="$2"
  
  log "Validating $module deployment using /healthz endpoint..."
  
  local healthz_response
  healthz_response=$(curl -s --max-time 10 "${preview_url}/healthz" || echo "")
  
  if [[ -z "$healthz_response" ]]; then
    log "❌ Failed to fetch /healthz endpoint"
    return 1
  fi
  
  # Check for valid JSON with status: "ok"
  if ! echo "$healthz_response" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'; then
    log "❌ /healthz response missing status: ok"
    log "Response: $healthz_response"
    return 1
  fi
  
  # For app/admin, also verify service field matches module name
  if [[ "$module" == "app" ]]; then
    if ! echo "$healthz_response" | grep -q '"service"[[:space:]]*:[[:space:]]*"app"'; then
      log "❌ /healthz response service field does not match 'app'"
      log "Response: $healthz_response"
      return 1
    fi
    log "✅ Found status: ok and service: app in /healthz response"
    return 0
  elif [[ "$module" == "admin" ]]; then
    if ! echo "$healthz_response" | grep -q '"service"[[:space:]]*:[[:space:]]*"admin"'; then
      log "❌ /healthz response service field does not match 'admin'"
      log "Response: $healthz_response"
      return 1
    fi
    log "✅ Found status: ok and service: admin in /healthz response"
    return 0
  else
    # apex just needs status: ok (may not have service field)
    log "✅ Found status: ok in /healthz response"
    return 0
  fi
}

# Test preview URL using health endpoint JSON validation
test_with_browser() {
  local preview_url="$1"
  local module="$2"
  local headless="${3:-false}"
  
  step "Testing $module preview URL: $preview_url"
  
  # Use health endpoint JSON validation (content-agnostic)
  if test_healthz_json "$preview_url" "$module"; then
    log "✅ Deployment validation passed for $module"
    return 0
  else
    log "❌ Deployment validation failed for $module"
    return 1
  fi
}

# Open browser interactively (local only)
open_browser_interactive() {
  local preview_url="$1"
  local module="$2"
  
  step "Opening browser for interactive testing: $preview_url"
  
  # Detect OS and open browser
  case "$(uname -s)" in
    Darwin)
      open "$preview_url"
      ;;
    Linux)
      if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$preview_url"
      elif command -v gnome-open >/dev/null 2>&1; then
        gnome-open "$preview_url"
      else
        die "No browser launcher found. Please open $preview_url manually"
      fi
      ;;
    *)
      log "Please open $preview_url in your browser manually"
      ;;
  esac
  
  log "Browser opened. Please verify:"
  log "  1. Page loads successfully (HTTP 200)"
  log "  2. Health endpoint works: ${preview_url}/healthz"
  log "  3. Service identification in /healthz JSON response"
}

main() {
  local module="${1:-}"
  local preview_url="${2:-}"
  local mode="${3:-auto}"  # auto, interactive, headless
  
  [[ -z "$module" ]] && die "Usage: $0 <module> [preview-url] [mode]"
  
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
    preview_url=$(get_module_preview_url "$module")
  fi
  
  # Normalize URL
  preview_url="${preview_url%/}"
  if [[ ! "$preview_url" =~ ^https?:// ]]; then
    preview_url="https://${preview_url}"
  fi
  
  case "$mode" in
    interactive)
      open_browser_interactive "$preview_url" "$module"
      ;;
    headless)
      test_with_browser "$preview_url" "$module" "true"
      ;;
    auto|*)
      # Use health endpoint JSON validation (content-agnostic)
      test_with_browser "$preview_url" "$module" "false"
      ;;
  esac
}

main "$@"
