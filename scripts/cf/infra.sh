#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/util.sh"

# ---
# Main command handler
# ---
main() {
  require_tools
  local cmd="${1:-}"
  shift || true
  case "$cmd" in
    dns) cmd_dns "$@" ;;
    route) cmd_route "$@" ;;
    storage) cmd_storage "$@" ;;
    snapshot) action_snapshot "$@" ;;
    help|--help|-h) usage ;;
    *) usage "Unknown command: $cmd" ;;
  esac
}

# ---
# Usage
# ---
usage() {
  [[ -n "${1:-}" ]] && msg "${1}\n"
  msg "Usage: infra.sh <command> [options]"
  msg ""
  msg "Commands:"
  msg "  dns <subcommand>      Manage DNS records"
  msg "  route <subcommand>    Manage Worker routes"
  msg "  storage <subcommand>  Manage storage resources (D1, KV, R2)"
  msg "  snapshot              Create a snapshot of current Cloudflare inventory"
  msg ""
  msg "Run 'infra.sh <command> --help' for more information on a specific command."
  exit 1
}

# -----------------------------------------------------------------------------
# DNS Subcommand
# -----------------------------------------------------------------------------
cmd_dns() {
    local action="${1:-}"
    shift || true
    case "$action" in
        upsert) action_dns_upsert "$@" ;;
        --help|-h) dns_usage ;;
        *) dns_usage "Unknown action: $action" ;;
    esac
}

dns_usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: infra.sh dns <action> [options]"
    msg ""
    msg "Actions:"
    msg "  upsert <module>     Upsert workers-only DNS records (AAAA 100::) for a module (app|admin|apex)."
    exit 1
}

action_dns_upsert() {
    local module="${1:-}"
    [[ -z "$module" ]] && dns_usage "Missing module for 'upsert' action."
    setup_env "$module"
    require_env CF_ACCOUNT_ID CF_ZONE_ID CF_API_TOKEN

    step "Upserting DNS for module '$module'..."
    
    local prod_domain="" staging_domain=""
    case "$module" in
        app) prod_domain="app.cloudcache.ai"; staging_domain="staging-app.cloudcache.ai" ;;
        admin) prod_domain="admin.cloudcache.ai"; staging_domain="staging-admin.cloudcache.ai" ;;
        apex) prod_domain="cloudcache.ai"; staging_domain="staging-apex.cloudcache.ai" ;;
        *) die "Unknown module: $module" ;;
    esac
    
    _upsert_aaaa_record "$prod_domain"
    _upsert_aaaa_record "$staging_domain"
    
    if [[ "$module" == "apex" ]]; then
        _upsert_cname_record "www.cloudcache.ai" "cloudcache.ai"
    fi
    msg "✅ DNS upsert complete for module '$module'."
}

_upsert_aaaa_record() {
    local fqdn="$1"
    local existing
    existing=$(cf_get "${CF_ZONE_BASE}/dns_records?type=AAAA&name=${fqdn}")
    local id
    id=$(echo "$existing" | jq -r '.result[0]?.id // empty')
    local body
    body=$(jq -n --arg name "$fqdn" '{type:"AAAA",name:$name,content:"100::",proxied:true,ttl:1}')
    
    if [[ -n "$id" ]]; then
        cf_put "${CF_ZONE_BASE}/dns_records/${id}" "$body" >/dev/null
        msg "  - Updated AAAA record for $fqdn"
    else
        cf_post "${CF_ZONE_BASE}/dns_records" "$body" >/dev/null
        msg "  - Created AAAA record for $fqdn"
    fi
}

_upsert_cname_record() {
    local fqdn="$1" content="$2"
    local existing
    existing=$(cf_get "${CF_ZONE_BASE}/dns_records?type=CNAME&name=${fqdn}")
    local id
    id=$(echo "$existing" | jq -r '.result[0]?.id // empty')
    local body
    body=$(jq -n --arg name "$fqdn" --arg content "$content" '{type:"CNAME",name:$name,content:$content,proxied:true,ttl:1}')
    
    if [[ -n "$id" ]]; then
        cf_put "${CF_ZONE_BASE}/dns_records/${id}" "$body" >/dev/null
        msg "  - Updated CNAME record for $fqdn"
    else
        cf_post "${CF_ZONE_BASE}/dns_records" "$body" >/dev/null
        msg "  - Created CNAME record for $fqdn"
    fi
}

# -----------------------------------------------------------------------------
# Route Subcommand
# -----------------------------------------------------------------------------
cmd_route() {
    local action="${1:-}"
    shift || true
    case "$action" in
        sync) action_route_sync "$@" ;;
        --help|-h) route_usage ;;
        *) route_usage "Unknown action: $action" ;;
    esac
}

route_usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: infra.sh route <action> [options]"
    msg ""
    msg "Actions:"
    msg "  sync <module>     Sync worker routes for a module (app|admin|apex)."
    exit 1
}

action_route_sync() {
    local module="${1:-}"
    [[ -z "$module" ]] && route_usage "Missing module for 'sync' action."
    setup_env "$module"
    require_env CF_ACCOUNT_ID CF_ZONE_ID CF_API_TOKEN

    step "Syncing worker routes for module '$module'..."

    local prod_domain="" staging_domain="" prod_script="" staging_script=""
    case "$module" in
        app)
            prod_domain="app.cloudcache.ai"; staging_domain="staging-app.cloudcache.ai"
            prod_script="app-worker"; staging_script="app-worker-staging"
            ;;
        admin)
            prod_domain="admin.cloudcache.ai"; staging_domain="staging-admin.cloudcache.ai"
            prod_script="admin-worker"; staging_script="admin-worker-staging"
            ;;
        apex)
            prod_domain="cloudcache.ai"; staging_domain="staging-apex.cloudcache.ai"
            prod_script="apex-worker"; staging_script="apex-worker-staging"
            ;;
        *) die "Unknown module: $module" ;;
    esac

    _sync_route "${prod_domain}/*" "$prod_script"
    _sync_route "${staging_domain}/*" "$staging_script"
    msg "✅ Route sync complete for module '$module'."
}

_sync_route() {
    local pattern="$1" script_name="$2"
    
    local routes
    routes=$(cf_get "${CF_ZONE_BASE}/workers/routes")
    local id
    id=$(echo "$routes" | jq -r --arg p "$pattern" '.result[]? | select(.pattern==$p) | .id' | head -n1)
    
    local body
    body=$(jq -n --arg pattern "$pattern" --arg script "$script_name" '{pattern: $pattern, script: $script}')

    if [[ -n "$id" ]]; then
        cf_put "${CF_ZONE_BASE}/workers/routes/${id}" "$body" >/dev/null
        msg "  - Updated route: $pattern -> $script_name"
    else
        cf_post "${CF_ZONE_BASE}/workers/routes" "$body" >/dev/null
        msg "  - Created route: $pattern -> $script_name"
    fi
}

# -----------------------------------------------------------------------------
# Storage Subcommand
# -----------------------------------------------------------------------------
cmd_storage() {
    local action="${1:-}"
    shift || true
    case "$action" in
        setup) action_storage_setup "$@" ;;
        --help|-h) storage_usage ;;
        *) storage_usage "Unknown action: $action" ;;
    esac
}

storage_usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: infra.sh storage <action> [options]"
    msg ""
    msg "Actions:"
    msg "  setup <module>    Setup D1, KV, and R2 resources for a module (app|admin|apex)."
    exit 1
}

action_storage_setup() {
    local module="${1:-}"
    [[ -z "$module" ]] && storage_usage "Missing module for 'setup' action."
    setup_env "$module"
    require_env CF_ACCOUNT_ID CF_API_TOKEN

    step "Setting up storage for module '$module'..."
    local module_dir="$ROOT_DIR/apps/$module"
    [ -d "$module_dir" ] || die "Module directory not found: $module_dir"
    cd "$module_dir"

    # Ensure local wrangler config has account id
    ensure_local_toml_account_id "wrangler.toml.local"

    # Setup D1, KV, R2
    _setup_d1 "$module"
    _setup_kv "$module"
    _setup_r2 "$module"

    msg "✅ Storage setup complete for module '$module'."
    msg "ℹ️  Wrangler config file 'wrangler.toml.local' has been updated with resource bindings."
}

_setup_d1() {
    local module="$1" lower_module="${module,,}" upper_module="${module^^}"
    msg "  - D1 Databases..."
    for env in "production" "staging" "preview"; do
        local suffix=""; [[ "$env" != "production" ]] && suffix="-$env"
        local db_name="${lower_module}${suffix}-db"
        # Idempotent create via wrangler
        pnpm exec wrangler d1 create "$db_name" >/dev/null 2>&1 || true
    done
}

_setup_kv() {
    local module="$1" upper_module="${module^^}"
    msg "  - KV Namespaces..."
    local kv_name="${upper_module}_KV"
    # Idempotent create via wrangler
    pnpm exec wrangler kv:namespace create "$kv_name" >/dev/null 2>&1 || true
}

_setup_r2() {
    local module="$1" lower_module="${module,,}"
    msg "  - R2 Buckets..."
    for env in "production" "staging" "preview"; do
        local suffix=""; [[ "$env" != "production" ]] && suffix="-$env"
        local bucket_name="${lower_module}${suffix}-bucket"
        # Idempotent create via wrangler
        pnpm exec wrangler r2 bucket create "$bucket_name" >/dev/null 2>&1 || true
    done
}

# -----------------------------------------------------------------------------
# Snapshot Action
# -----------------------------------------------------------------------------
action_snapshot() {
    setup_env
    require_env CF_ACCOUNT_ID CF_ZONE_ID CF_API_TOKEN
    step "Creating inventory snapshots..."

    _snapshot_to_tsv "dns_inventory.tsv" "${CF_ZONE_BASE}/dns_records?per_page=1000" \
        '.result[] | [.id,.type,.name,.content,(.proxied|tostring)]'
        
    _snapshot_to_tsv "workers_routes_inventory.tsv" "${CF_ZONE_BASE}/workers/routes" \
        '.result[] | [.id,.pattern,.script]'
        
    _snapshot_to_tsv "access_apps_inventory.tsv" "${CF_ACCT_BASE}/access/apps?per_page=1000" \
        '.result[] | [.id,.name,.domain,.type]'

    msg "✅ Snapshots complete."
}

_snapshot_to_tsv() {
    local filename="$1" url="$2" jq_filter="$3"
    local out_path="$ROOT_DIR/$filename"
    msg "  - Writing $filename..."
    cf_get "$url" | jq -r "$jq_filter | @tsv" > "$out_path"
}

main "$@"
