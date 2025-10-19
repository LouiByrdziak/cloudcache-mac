#!/usr/bin/env bash
set -euo pipefail

# Snapshot Cloudflare inventories to TSV files (read-only)
# Requires: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID

[[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] || { echo "❌ CLOUDFLARE_API_TOKEN required" >&2; exit 2; }
[[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || { echo "❌ CLOUDFLARE_ACCOUNT_ID required" >&2; exit 2; }
[[ -n "${CLOUDFLARE_ZONE_ID:-}" ]] || { echo "❌ CLOUDFLARE_ZONE_ID required" >&2; exit 2; }

command -v jq >/dev/null 2>&1 || { echo "❌ jq is required (brew install jq)" >&2; exit 3; }

auth=( -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" )
acct_base="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}"
zone_base="https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

snapshot_dns() {
  local out="$ROOT_DIR/dns_inventory.tsv"
  echo "📥 DNS → $out"
  curl -sS "${zone_base}/dns_records?per_page=1000" "${auth[@]}" \
    | jq -r '.result[] | [.id,.type,.name,.content,(.proxied|tostring),.created_on,.modified_on] | @tsv' \
    > "$out"
}

snapshot_workers_routes() {
  local out="$ROOT_DIR/workers_routes_inventory.tsv"
  echo "📥 Workers Routes → $out"
  curl -sS "${zone_base}/workers/routes" "${auth[@]}" \
    | jq -r '.result[] | [.id,.pattern,.script] | @tsv' \
    > "$out"
}

snapshot_access_apps() {
  local out="$ROOT_DIR/access_apps_inventory.tsv"
  echo "📥 Access Apps → $out"
  curl -sS "${acct_base}/access/apps?per_page=1000" "${auth[@]}" \
    | jq -r '.result[] | [.id,.domain,.domain,.type,.created_at] | @tsv' \
    > "$out"
}

snapshot_pages_projects() {
  # Pages disabled from workflow; keep file for historical reference but write a note
  local out="$ROOT_DIR/pages_inventory.tsv"
  echo -e "name\tsubdomain\turl\tcreated_on\tmodified_on" > "$out"
}

snapshot_dns
snapshot_workers_routes
snapshot_access_apps
# snapshot_pages_projects (disabled)

echo "✅ Snapshot complete"





