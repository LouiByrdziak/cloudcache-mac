#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/util.sh"

main() {
    msg "🚨 DANGER: This script will completely wipe and reset the Cloudflare environment."
    msg "This includes deleting ALL Access applications in the account."
    read -p "Type 'RESET' to confirm: " confirm
    if [[ "$confirm" != "RESET" ]]; then
        die "Operation aborted."
    fi

    setup_env "apex" # Use apex token for broad permissions
    require_env CLOUDFLARE_API_TOKEN_APP CLOUDFLARE_API_TOKEN_ADMIN CLOUDFLARE_API_TOKEN_APEX CF_ACCOUNT_ID CF_ZONE_ID
    
    _cleanup_resources
    _setup_infra_and_deploy
    
    msg "✅ Environment reset complete."
}

_cleanup_resources() {
    step "Cleaning up existing Cloudflare resources..."
    
    # Delete all Access applications
    msg "  - Deleting all Access applications..."
    local app_ids
    app_ids=$(cf_get "${CF_ACCT_BASE}/access/apps?per_page=1000" | jq -r '.result[]?.id')
    for id in $app_ids; do
        cf_delete "${CF_ACCT_BASE}/access/apps/${id}" >/dev/null || true
    done
}

_setup_infra_and_deploy() {
    step "Setting up new infrastructure and deploying workers..."
    
    local cf_script_dir="$SCRIPT_DIR/../cf"
    
    for module in "app" "admin" "apex"; do
        msg "  - Processing module: $module"
        
        # Setup infra (DNS, routes, storage)
        bash "$cf_script_dir/infra.sh" dns upsert "$module"
        bash "$cf_script_dir/infra.sh" route sync "$module"
        bash "$cf_script_dir/infra.sh" storage setup "$module"
        
        # Deploy workers (staging and production)
        bash "$cf_script_dir/deploy.sh" "$module" staging
        bash "$cf_script_dir/deploy.sh" "$module" production
    done
}

main "$@"
