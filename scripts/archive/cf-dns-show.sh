#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

names=( "$@" )
if (( ${#names[@]} == 0 )); then
  names=( app.cloudcache.ai admin.cloudcache.ai cloudcache.ai www.cloudcache.ai staging-app.cloudcache.ai staging-admin.cloudcache.ai staging-apex.cloudcache.ai )
fi

for n in "${names[@]}"; do
  echo "-- $n"
  curl -sS "${CF_ZONE_BASE}/dns_records?name=$n" "${CF_AUTH[@]}" | jq -r '.result[] | [.type,.name,.content,(.proxied|tostring)] | @tsv'
done

















