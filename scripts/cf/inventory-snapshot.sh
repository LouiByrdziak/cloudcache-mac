#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$ROOT_DIR/scripts/lib/core.sh"

setup_cf_env

ts="$(date +%Y%m%dT%H%M%S)"
out_dir="$ROOT_DIR/dist/inventory"
mkdir -p "$out_dir"

log "Snapshotting Cloudflare inventory..."

# Example inventory endpoints; expand as needed
accounts_json="$(cf_get "$API_ROOT/user" | jq '.')"
zones_json="$(cf_get "$API_ROOT/zones" | jq '.')"

printf "%s" "$accounts_json" > "$out_dir/accounts-$ts.json"
printf "%s" "$zones_json" > "$out_dir/zones-$ts.json"

log "Inventory snapshot written to $out_dir (ts=$ts)"


