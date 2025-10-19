#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

DOMAIN="${1:-}"
NAME="${2:-admin}"
if [[ -z "$DOMAIN" ]]; then
  echo "Usage: $0 <domain> [name]" >&2
  exit 1
fi

# Default settings based on our research
AUTO_REDIRECT=${AUTO_REDIRECT:-false}
ENABLE_BINDING_COOKIE=${ENABLE_BINDING_COOKIE:-false}

BODY=$(jq -n \
  --arg name "$NAME" \
  --arg domain "$DOMAIN" \
  --argjson redirect "$AUTO_REDIRECT" \
  --argjson binding "$ENABLE_BINDING_COOKIE" \
  '{
    name: $name,
    domain: $domain,
    type: "self_hosted",
    auto_redirect_to_identity: $redirect,
    enable_binding_cookie: $binding,
    service_auth_401_redirect: true,
    same_site_cookie_attribute: "lax",
    allowed_idps: []
  }')

resp=$(curl -sS -X POST "${CF_ACCT_BASE}/access/apps" "${CF_AUTH[@]}" --data "$BODY")
id=$(echo "$resp" | jq -r '.result.id')
echo "$id"


