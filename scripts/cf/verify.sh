#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/util.sh"

DOMAINS=(
  "app.cloudcache.ai"
  "admin.cloudcache.ai"
  "cloudcache.ai"
  "staging-app.cloudcache.ai"
  "staging-admin.cloudcache.ai"
  "staging-apex.cloudcache.ai"
)

main() {
    local cmd="${1:-all}"
    shift || true
    
    setup_env
    require_env CF_ACCOUNT_ID CF_ZONE_ID CF_API_TOKEN
    
    case "$cmd" in
        all) 
            action_dns_verify
            action_routes_verify
            action_http_verify
            ;;
        dns) action_dns_verify "$@" ;;
        routes) action_routes_verify "$@" ;;
        http) action_http_verify "$@" ;;
        help|--help|-h) usage ;;
        *) usage "Unknown command: $cmd" ;;
    esac
}

usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: verify.sh [command]"
    msg ""
    msg "Commands:"
    msg "  all (default)   Run all verification checks."
    msg "  dns             Verify DNS records for canonical domains."
    msg "  routes          Verify Worker routes."
    msg "  http            Perform HTTP status checks against canonical domains."
    exit 1
}

action_dns_verify() {
    step "Verifying DNS records..."
    for domain in "${DOMAINS[@]}"; do
        msg "  - $domain"
        local records
        records=$(cf_get "${CF_ZONE_BASE}/dns_records?name=$domain")
        echo "$records" | jq -r '.result[] | "    " + .type + " " + .content + " (proxied: " + (.proxied|tostring) + ")"'
    done
}

action_routes_verify() {
    step "Verifying Worker routes..."
    cf_get "${CF_ZONE_BASE}/workers/routes" | jq -r '.result[] | [.pattern, .script] | @tsv' | sed 's/^/  /g'
}

action_http_verify() {
    step "Performing HTTP status checks..."
    for domain in "${DOMAINS[@]}"; do
        local code
        code=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain/")
        msg "  - https://$domain/ -> $code"
    done
}

main "$@"
