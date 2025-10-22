#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$ROOT_DIR/scripts/lib/core.sh"

# Canonical scopes for Cloudcache O2O (edit as needed)
CANONICAL="read_products,write_products,read_script_tags,write_script_tags,read_themes,read_orders"
CURRENT="${SHOPIFY_SCOPES:-}"

[[ -n "$CURRENT" ]] || abort "SHOPIFY_SCOPES is empty"

want="$(echo "$CANONICAL" | tr ',' '\n' | sort)"
have="$(echo "$CURRENT"   | tr ',' '\n' | sort)"

missing="$(comm -23 <(echo "$want") <(echo "$have") || true)"
extra="$(comm -13 <(echo "$want") <(echo "$have") || true)"

if [[ -n "$missing" || -n "$extra" ]]; then
  [[ -n "$missing" ]] && log "Missing: $(echo "$missing" | tr '\n' ',' | sed 's/,$//')"
  [[ -n "$extra"   ]] && log "Extra:   $(echo "$extra" | tr '\n' ',' | sed 's/,$//')"
  abort "Refuse to proceed; update SHOPIFY_SCOPES or canonical list."
fi

log "SHOPIFY_SCOPES match canonical set"
