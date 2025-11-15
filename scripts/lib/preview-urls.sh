#!/usr/bin/env bash
#
# Preview URL Utility Functions
#
# Provides functions to construct and extract preview URLs for Workers and Pages

# Source core library if not already sourced
if [[ -z "${ROOT_DIR:-}" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  source "$SCRIPT_DIR/core.sh" 2>/dev/null || true
fi

# Get Worker preview URL from worker name
# Usage: get_worker_preview_url <worker-name>
# Example: get_worker_preview_url "app-worker-preview"
get_worker_preview_url() {
  local worker_name="$1"
  [[ -z "$worker_name" ]] && die "Worker name is required"
  
  # Workers.dev URLs follow pattern: https://<worker-name>.<account-subdomain>.workers.dev
  # Based on deployment output, the account subdomain is "cloudcache"
  echo "https://${worker_name}.cloudcache.workers.dev"
}

# Extract Pages preview URL from deployment output
# Usage: extract_pages_preview_url <deployment-output>
# Example: extract_pages_preview_url "$(wrangler pages deploy ...)"
extract_pages_preview_url() {
  local output="$1"
  [[ -z "$output" ]] && die "Deployment output is required"
  
  # Pages deployment output typically contains a URL like:
  # "✨ Success! Uploaded 123 files
  #  🌍 https://<hash>-<project-name>.pages.dev"
  
  # Try to extract URL from output
  local url
  url=$(echo "$output" | grep -oE 'https://[a-zA-Z0-9-]+\.pages\.dev' | head -1)
  
  if [[ -z "$url" ]]; then
    # Fallback: try to get from Pages API
    die "Could not extract preview URL from deployment output"
  fi
  
  echo "$url"
}

# Get preview URL for a module
# Usage: get_module_preview_url <module> [worker-name-or-url]
# Example: get_module_preview_url "app" "app-worker-preview"
get_module_preview_url() {
  local module="$1"
  local worker_name_or_url="${2:-}"
  
  case "$module" in
    apex|app|admin)
      if [[ -n "$worker_name_or_url" ]]; then
        # If it's already a URL, return it
        if [[ "$worker_name_or_url" =~ ^https?:// ]]; then
          echo "$worker_name_or_url"
        else
          # Otherwise treat as worker name
          get_worker_preview_url "$worker_name_or_url"
        fi
      else
        # Default worker name pattern
        local worker_name="${module}-worker-preview"
        get_worker_preview_url "$worker_name"
      fi
      ;;
    *)
      die "Unknown module: $module. Must be one of: apex, app, admin"
      ;;
  esac
}

