#!/usr/bin/env bash
#
# Open Local Development URLs in External Chrome Browser
#
# Opens all three local development URLs in external Chrome browser

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/core.sh"

step "Opening local development URLs in external Chrome browser..."

# Detect OS and open Chrome
open_chrome() {
  local url="$1"
  case "$(uname -s)" in
    Darwin)
      # macOS - use open command with Chrome
      if command -v google-chrome >/dev/null 2>&1; then
        google-chrome "$url" 2>/dev/null &
      elif [ -d "/Applications/Google Chrome.app" ]; then
        open -a "Google Chrome" "$url"
      else
        open "$url"  # Fallback to default browser
      fi
      ;;
    Linux)
      if command -v google-chrome >/dev/null 2>&1; then
        google-chrome "$url" 2>/dev/null &
      elif command -v chromium-browser >/dev/null 2>&1; then
        chromium-browser "$url" 2>/dev/null &
      elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$url"
      else
        die "No browser launcher found. Please open $url manually"
      fi
      ;;
    *)
      log "Please open $url in your browser manually"
      ;;
  esac
}

# Open each URL
log "Opening APP: http://localhost:8789"
open_chrome "http://localhost:8789"
sleep 1

log "Opening ADMIN: http://localhost:8787"
open_chrome "http://localhost:8787"
sleep 1

log "Opening APEX: http://localhost:8788"
open_chrome "http://localhost:8788"

log "✅ All local development URLs opened in Chrome browser"
echo ""
echo "Local Development URLs:"
echo "  APP:   http://localhost:8789"
echo "  ADMIN: http://localhost:8787"
echo "  APEX:  http://localhost:8788"
echo ""
echo "Expected Content:"
echo "  - APP:   Green text 'I love Cloudcache APP' (centered)"
echo "  - ADMIN: Green text 'I love Cloudcache ADMIN' (centered)"
echo "  - APEX:  Green text 'I love Cloudcache APEX' (centered)"

