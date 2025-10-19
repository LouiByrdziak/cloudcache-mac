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
    app) cmd_app "$@" ;;
    policy) cmd_policy "$@" ;;
    token) cmd_token "$@" ;;
    help|--help|-h) usage ;;
    *) usage "Unknown command: $cmd" ;;
  esac
}

# ---
# Usage
# ---
usage() {
  [[ -n "${1:-}" ]] && msg "${1}\n"
  msg "Usage: access.sh <command> [options]"
  msg ""
  msg "Commands:"
  msg "  app <subcommand>      Manage Access applications"
  msg "  policy <subcommand>   Manage Access policies"
  msg "  token <subcommand>    Manage Access service tokens"
  msg ""
  msg "Run 'access.sh <command> --help' for more information on a specific command."
  exit 1
}

# -----------------------------------------------------------------------------
# App Subcommand
# -----------------------------------------------------------------------------
cmd_app() {
  local action="${1:-}"
  shift || true
  case "$action" in
    create) action_app_create "$@" ;;
    delete) action_app_delete "$@" ;;
    list) action_app_list "$@" ;;
    tune) action_app_tune "$@" ;;
    --help|-h) app_usage ;;
    *) app_usage "Unknown action: $action" ;;
  esac
}

app_usage() {
  [[ -n "${1:-}" ]] && msg "${1}\n"
  msg "Usage: access.sh app <action> [options]"
  msg ""
  msg "Actions:"
  msg "  create <domain> [name]        Create a self-hosted Access application."
  msg "  delete <domain>               Delete an Access application."
  msg "  list                          List all Access applications."
  msg "  tune <domain>                 Apply standard tuning to an application (disable redirects, etc.)."
  exit 1
}

action_app_create() {
  local domain="${1:-}" name="${2:-${domain}}"
  [[ -z "$domain" ]] && app_usage "Missing domain for 'create' action."
  setup_env
  require_env CF_ACCOUNT_ID CF_API_TOKEN

  step "Creating Access application for '$domain'..."
  local body
  body=$(jq -n \
    --arg name "$name" \
    --arg domain "$domain" \
    '{
      name: $name,
      domain: $domain,
      type: "self_hosted",
      auto_redirect_to_identity: false,
      enable_binding_cookie: false,
      service_auth_401_redirect: true,
      same_site_cookie_attribute: "lax"
    }')
  
  local result
  result=$(cf_post "${CF_ACCT_BASE}/access/apps" "$body")
  msg "✅ Success! App ID: $(echo "$result" | jq -r '.result.id')"
}

action_app_delete() {
  local domain="${1:-}"
  [[ -z "$domain" ]] && app_usage "Missing domain for 'delete' action."
  setup_env
  require_env CF_ACCOUNT_ID CF_API_TOKEN

  step "Deleting Access application for '$domain'..."
  local app_id
  app_id=$(cf_get "${CF_ACCT_BASE}/access/apps?per_page=1000" | jq -r --arg d "$domain" '.result[] | select(.domain==$d) | .id' | head -n1)

  if [[ -z "$app_id" ]]; then
    msg "ℹ️  No Access app found for '${domain}'."
    return
  fi

  cf_delete "${CF_ACCT_BASE}/access/apps/${app_id}"
  msg "🗑️  Deleted Access app: ${domain} (${app_id})"
}

action_app_list() {
  setup_env
  require_env CF_ACCOUNT_ID CF_API_TOKEN
  
  step "Listing Access applications..."
  cf_get "${CF_ACCT_BASE}/access/apps?per_page=1000" | jq -r '.result[] | [.id, .name, .domain, .type] | @tsv'
}

action_app_tune() {
    local domain="${1:-}"
    [[ -z "$domain" ]] && app_usage "Missing domain for 'tune' action."
    setup_env
    require_env CF_ACCOUNT_ID CF_API_TOKEN

    step "Tuning Access application for '$domain'..."
    local app_id
    app_id=$(cf_get "${CF_ACCT_BASE}/access/apps?per_page=1000" | jq -r --arg d "$domain" '.result[] | select(.domain==$d) | .id' | head -n1)

    if [[ -z "$app_id" ]]; then
        die "App not found for domain: $domain"
    fi

    local patch_body
    patch_body=$(jq -n '{auto_redirect_to_identity:false, allowed_idps:[]}')
    
    cf_patch "${CF_ACCT_BASE}/access/apps/${app_id}" "$patch_body" >/dev/null
    msg "✅ Tuned app settings for ${domain}."
}

# -----------------------------------------------------------------------------
# Policy Subcommand
# -----------------------------------------------------------------------------
cmd_policy() {
    local action="${1:-}"
    shift || true
    case "$action" in
        create) action_policy_create "$@" ;;
        delete) action_policy_delete "$@" ;;
        list) action_policy_list "$@" ;;
        --help|-h) policy_usage ;;
        *) policy_usage "Unknown action: $action" ;;
    esac
}

policy_usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: access.sh policy <action> [options]"
    msg ""
    msg "Actions:"
    msg "  list <domain>                           List policies for an application."
    msg "  create <domain> <name> [decision]       Create a new policy."
    msg "    --decision <allow|deny|bypass>        Set policy decision (default: allow)."
    msg "    --token-id <id>                       Include a service token rule."
    msg "    --ip <cidr>                           Include an IP range rule."
    msg "  delete <domain> <policy-id>             Delete a policy."
    exit 1
}

action_policy_list() {
    local domain="${1:-}"
    [[ -z "$domain" ]] && policy_usage "Missing domain for 'list' action."
    setup_env
    require_env CF_ACCOUNT_ID CF_API_TOKEN
    
    local app_id
    app_id=$(cf_get "${CF_ACCT_BASE}/access/apps?per_page=1000" | jq -r --arg d "$domain" '.result[] | select(.domain==$d) | .id' | head -n1)
    [[ -z "$app_id" ]] && die "App not found for domain: $domain"

    step "Listing policies for $domain (App ID: $app_id)..."
    cf_get "${CF_ACCT_BASE}/access/apps/${app_id}/policies?per_page=1000" | jq -r '.result[] | [.id, .name, .decision, (.precedence|tostring)] | @tsv'
}

action_policy_create() {
    local domain="${1:-}" name="${2:-}"
    shift 2 || true
    local decision="allow" include="[]"
    
    while (( "$#" )); do
        case "$1" in
            --decision) decision="$2"; shift 2 ;;
            --token-id) include=$(jq -c --arg id "$2" '. + [{service_token:{token_id:$id}}]' <<< "$include"); shift 2;;
            --ip) include=$(jq -c --arg ip "$2" '. + [{ip:{ip:$ip}}]' <<< "$include"); shift 2;;
            *) policy_usage "Unknown option: $1" ;;
        esac
    done

    [[ -z "$domain" || -z "$name" ]] && policy_usage "Missing required arguments for 'create' action."
    setup_env
    require_env CF_ACCOUNT_ID CF_API_TOKEN

    local app_id
    app_id=$(cf_get "${CF_ACCT_BASE}/access/apps?per_page=1000" | jq -r --arg d "$domain" '.result[] | select(.domain==$d) | .id' | head -n1)
    [[ -z "$app_id" ]] && die "App not found for domain: $domain"

    step "Creating policy '$name' for '$domain'..."
    local body
    body=$(jq -n \
        --arg name "$name" \
        --arg decision "$decision" \
        --argjson include "$include" \
        '{name:$name, decision:$decision, include:$include, precedence:1}')

    local result
    result=$(cf_post "${CF_ACCT_BASE}/access/apps/${app_id}/policies" "$body")
    msg "✅ Success! Policy ID: $(echo "$result" | jq -r '.result.id')"
}

action_policy_delete() {
    local domain="${1:-}" policy_id="${2:-}"
    [[ -z "$domain" || -z "$policy_id" ]] && policy_usage "Missing required arguments for 'delete' action."
    setup_env
    require_env CF_ACCOUNT_ID CF_API_TOKEN

    local app_id
    app_id=$(cf_get "${CF_ACCT_BASE}/access/apps?per_page=1000" | jq -r --arg d "$domain" '.result[] | select(.domain==$d) | .id' | head -n1)
    [[ -z "$app_id" ]] && die "App not found for domain: $domain"

    step "Deleting policy '$policy_id' from '$domain'..."
    cf_delete "${CF_ACCT_BASE}/access/apps/${app_id}/policies/${policy_id}"
    msg "🗑️  Deleted policy: ${policy_id}"
}


# -----------------------------------------------------------------------------
# Token Subcommand
# -----------------------------------------------------------------------------
cmd_token() {
    local action="${1:-}"
    shift || true
    case "$action" in
        create) action_token_create "$@" ;;
        delete) action_token_delete "$@" ;;
        list) action_token_list "$@" ;;
        --help|-h) token_usage ;;
        *) token_usage "Unknown action: $action" ;;
    esac
}

token_usage() {
    [[ -n "${1:-}" ]] && msg "${1}\n"
    msg "Usage: access.sh token <action> [options]"
    msg ""
    msg "Actions:"
    msg "  list              List all service tokens."
    msg "  create <name>     Create a new service token."
    msg "  delete <id>       Delete a service token by its ID."
    exit 1
}

action_token_list() {
    setup_env
    require_env CF_ACCOUNT_ID CF_API_TOKEN
    step "Listing service tokens..."
    cf_get "${CF_ACCT_BASE}/access/service_tokens?per_page=1000" | jq -r '.result[] | [.id, .name, .created_at, .expires_at] | @tsv'
}

action_token_create() {
    local name="${1:-}"
    [[ -z "$name" ]] && token_usage "Missing name for 'create' action."
    setup_env
    require_env CF_ACCOUNT_ID CF_API_TOKEN

    step "Creating service token '$name'..."
    local body
    body=$(jq -n --arg name "$name" '{name:$name}')
    
    local result
    result=$(cf_post "${CF_ACCT_BASE}/access/service_tokens" "$body")
    msg "✅ Success! Token created. IMPORTANT: The client_secret is only shown once."
    echo "$result" | jq '.result'
}

action_token_delete() {
    local token_id="${1:-}"
    [[ -z "$token_id" ]] && token_usage "Missing token ID for 'delete' action."
    setup_env
    require_env CF_ACCOUNT_ID CF_API_TOKEN

    step "Deleting service token '$token_id'..."
    cf_delete "${CF_ACCT_BASE}/access/service_tokens/${token_id}"
    msg "🗑️  Deleted token: ${token_id}"
}

main "$@"
