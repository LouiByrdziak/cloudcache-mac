#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/util.sh"

main() {
    local module="${1:-}"
    local env="${2:-production}"

    [[ -z "$module" || ! "$module" =~ ^(apex|app|admin)$ ]] && usage "Missing or invalid module."
    [[ "$env" =~ ^(production|staging|preview)$ ]] || usage "Invalid environment: $env"
    
    setup_env "$module"
    require_env CF_ACCOUNT_ID CF_API_TOKEN

    local module_dir="$ROOT_DIR/apps/$module"
    cd "$module_dir"

    step "Deploying module '$module' to '$env'..."

    # Ensure local wrangler config has account id
    ensure_local_toml_account_id "wrangler.toml.local"

    # Build if prebuilt artifact is missing
    local entry_path="$ROOT_DIR/dist/$module/index.mjs"
    if [[ ! -f "$entry_path" ]]; then
        _build_worker "$module" "$entry_path"
    fi

    # Generate a temporary wrangler config for this deployment
    local temp_config
    temp_config=$(_generate_config "$module" "$env")

    # Execute deployment
    _run_wrangler_deploy "$entry_path" "$temp_config" "$env"

    msg "✅ Deployment complete: $module -> $env"
}

usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: deploy.sh <app|admin|apex> [production|staging|preview]"
    exit 1
}

_build_worker() {
    local module="$1" entry_path="$2"
    msg "ℹ️  Prebuilt artifact missing, building $module..."
    mkdir -p "$(dirname "$entry_path")"
    pnpm dlx tsup "$ROOT_DIR/apps/$module/src/index.ts" \
        --format esm --target es2022 --dts=false --sourcemap=false \
        --out-dir "$(dirname "$entry_path")" --clean || die "Worker build failed."
}

_generate_config() {
    local module="$1" env="$2"
    local lower_module="${module,,}"
    local temp_config
    temp_config=$(mktemp)

    # Base configuration
    cat > "$temp_config" <<EOF
name = "${lower_module}-worker"
account_id = "${CF_ACCOUNT_ID}"
main = "src/index.ts" # This is a placeholder, as we use a prebuilt artifact
compatibility_date = "2025-10-07"
compatibility_flags = ["nodejs_compat"]
workers_dev = false
EOF

    # Environment-specific overrides
    cat >> "$temp_config" <<EOF

[env.staging]
name = "${lower_module}-worker-staging"

[env.preview]
name = "${lower_module}-worker-preview"
EOF
    echo "$temp_config"
}

_run_wrangler_deploy() {
    local entry_path="$1" config_path="$2" env="$3"
    
    local wrangler_env=""
    [[ "$env" != "production" ]] && wrangler_env="--env $env"

    # Unset NODE_OPTIONS to avoid conflicts with wrangler's internal esbuild
    env -u NODE_OPTIONS pnpm exec wrangler deploy "$entry_path" \
        --no-bundle \
        --config "$config_path" \
        $wrangler_env
    
    rm -f "$config_path"
}

main "$@"
