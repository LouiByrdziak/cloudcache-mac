#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

# Normalize DNS to workers-only (AAAA 100::, proxied)
# Requires: CLOUDFLARE_API_TOKEN_*, CLOUDFLARE_ZONE_ID, CF_MODULE

auth=( "${CF_AUTH[@]}" ) # Use the resolved auth headers from cf-env.sh
zone_base="${CF_ZONE_BASE}"

get_id() { # name type
  curl -sS "${zone_base}/dns_records?type=$2&name=$1" "${auth[@]}" | jq -r '.result[0]?.id // empty'
}

delete_if_exists() { # name type
  local id
  id=$(get_id "$1" "$2")
  if [[ -n "$id" ]]; then
    echo "🗑️  Delete $2 $1"
    curl -sS -X DELETE "${zone_base}/dns_records/${id}" "${auth[@]}" >/dev/null || true
  fi
}

upsert_aaaa() { # name
  local id body
  id=$(get_id "$1" AAAA)
  body=$(jq -n --arg name "$1" --arg content "100::" '{type:"AAAA",name:$name,content:$content,proxied:true,ttl:1}')
  if [[ -n "$id" ]]; then
    echo "🔁 Update AAAA $1 -> 100:: (proxied)"
    curl -sS -X PUT "${zone_base}/dns_records/${id}" "${auth[@]}" --data "$body" >/dev/null
  else
    echo "➕ Create AAAA $1 -> 100:: (proxied)"
    curl -sS -X POST "${zone_base}/dns_records" "${auth[@]}" --data "$body" >/dev/null
  fi
}

# Remove bad/legacy records
delete_if_exists cloudcache.ai.cloudcache.ai AAAA
delete_if_exists cloudcache.ai CNAME
delete_if_exists apex-staging.cloudcache.ai CNAME
delete_if_exists apex-staging.cloudcache.ai AAAA
delete_if_exists app-staging.cloudcache.ai CNAME
delete_if_exists app-staging.cloudcache.ai AAAA
delete_if_exists admin-staging.cloudcache.ai CNAME
delete_if_exists admin-staging.cloudcache.ai AAAA
delete_if_exists staging.cloudcache.ai CNAME
delete_if_exists staging.cloudcache.ai AAAA
delete_if_exists staging.app.cloudcache.ai CNAME
delete_if_exists staging.app.cloudcache.ai AAAA
delete_if_exists staging.admin.cloudcache.ai CNAME
delete_if_exists staging.admin.cloudcache.ai AAAA

# Ensure workers AAAA records exist
upsert_aaaa cloudcache.ai
upsert_aaaa staging-apex.cloudcache.ai
upsert_aaaa app.cloudcache.ai
upsert_aaaa admin.cloudcache.ai
upsert_aaaa staging-app.cloudcache.ai
upsert_aaaa staging-admin.cloudcache.ai

echo "✅ DNS normalized to workers-only"



