#!/usr/bin/env bash
set -euo pipefail

# Configure DNS (via API), Worker Routes and Access Apps for Workers-only architecture
# Module-scoped only (no generic token). Inputs (env): CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID, CF_MODULE, and module token via cf-env.

command -v jq >/dev/null 2>&1 || { echo "❌ jq is required (brew install jq)" >&2; exit 3; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh" # validates account/zone and selects module token → CF_AUTH, CF_ACCT_BASE, CF_ZONE_BASE

auth_header=( "${CF_AUTH[@]}" )
acct_base="${CF_ACCT_BASE}"
zone_base="${CF_ZONE_BASE}"

upsert_dns() {
  local type="$1" fqdn="$2" content="$3" proxied=true
  echo "🌐 DNS upsert: $type $fqdn => $content"
  # Lookup existing by FQDN
  existing=$(curl -sS "${zone_base}/dns_records?type=${type}&name=${fqdn}" "${auth_header[@]}")
  id=$(echo "$existing" | jq -r '.result[0]?.id // empty')
  body=$(jq -n --arg type "$type" --arg name "$fqdn" --arg content "$content" --argjson proxied true '{type:$type,name:$name,content:$content,proxied:$proxied,ttl:1}')
  if [[ -n "$id" ]]; then
    curl -sS -X PUT "${zone_base}/dns_records/${id}" "${auth_header[@]}" --data "$body" >/dev/null
  else
    curl -sS -X POST "${zone_base}/dns_records" "${auth_header[@]}" --data "$body" >/dev/null
  fi
}

create_route() {
  local pattern="$1" script_name="$2"
  echo "🔁 Route: ${pattern} -> ${script_name}"
  curl -sS -X POST "${zone_base}/workers/routes" "${auth_header[@]}" \
    --data "$(jq -n --arg pattern "$pattern" --arg script "$script_name" '{pattern:$pattern,script:$script}')" >/dev/null || true
}

create_access_app() {
  local domain="$1" name="$2"
  echo "🛡️  Access app: $name ($domain)"
  curl -sS -X POST "${acct_base}/access/apps" "${auth_header[@]}" \
    --data "$(jq -n --arg name "$name" --arg domain "$domain" '{name:$name, domain:$domain, type:"self_hosted"}')" >/dev/null || true
}

# Resolve domains by module
prod_domain=""; staging_domain=""; prod_script=""; staging_script=""
case "$CF_MODULE" in
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
  *) echo "❌ Unknown CF_MODULE: $CF_MODULE" >&2; exit 2 ;;
esac

# 1) DNS records (AAAA 100:: for workers-only)
upsert_dns AAAA "$prod_domain" 100::
upsert_dns AAAA "$staging_domain" 100::
if [[ "$CF_MODULE" == "apex" ]]; then
  upsert_dns CNAME "www.cloudcache.ai" cloudcache.ai
fi

# 2) Worker routes
create_route "${prod_domain}/*" "$prod_script"
create_route "${staging_domain}/*" "$staging_script"

# 3) Access applications (policies added separately by console or follow-up script)
create_access_app "$prod_domain" "$CF_MODULE"
create_access_app "$staging_domain" "staging-$CF_MODULE"

echo "✅ Configuration complete"










