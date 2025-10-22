#!/usr/bin/env bash
#
# Health Probe Verification Script
#
# Checks a standard health endpoint (e.g., /readyz) to confirm that a
# service is running and responsive.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/core.sh"

main() {
    local domain="${1:-}"
    [[ -z "$domain" ]] && usage "Missing domain argument."
    
    local health_url="https://'${domain}'/readyz"
    
    step "Probing health endpoint for '$domain'..."
    
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_url")
    
    if [[ "$http_code" -eq 200 ]]; then
        msg "✅ Health check successful for '$domain': Received 200 OK from $health_url"
    else
        die "Health check failed for '$domain': Expected 200 OK from $health_url, but received $http_code."
    fi
}

usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: health.sh <domain>"
    exit 1
}

main "$@"
