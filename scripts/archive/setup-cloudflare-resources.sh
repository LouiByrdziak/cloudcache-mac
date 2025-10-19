#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

MODULE="${1:-}"
if [[ -z "$MODULE" || ! "$MODULE" =~ ^(apex|app|admin)$ ]]; then
  echo "Usage: $0 [apex|app|admin]"
  exit 1
fi

MODULE_DIR="$ROOT_DIR/src/$MODULE"
[ -d "$MODULE_DIR" ] || { echo "Module dir not found: $MODULE_DIR"; exit 2; }
cd "$MODULE_DIR"

select_module_token "$MODULE"

# Fallback for CI variable names
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -n "${CF_API_TOKEN:-}" ]]; then
  export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-${CF_ACCOUNT_ID:-}}" ]]; then
  echo "❌ Missing Cloudflare token or account id in environment."
  exit 3
fi

LOCAL_TOML="wrangler.toml.local"
if [[ -f "wrangler.local.toml" && ! -f "$LOCAL_TOML" ]]; then
  echo "⚠️  Legacy local config 'wrangler.local.toml' detected; please rename to 'wrangler.toml.local'"
  LOCAL_TOML="wrangler.local.toml"
fi
[ -f "$LOCAL_TOML" ] || echo "# auto-generated (gitignored)" > "$LOCAL_TOML"
ensure_local_toml_account_id "$LOCAL_TOML"

lower_module="$(echo "$MODULE" | tr '[:upper:]' '[:lower:]')"
MODULE_UPPER="$(echo "$MODULE" | tr '[:lower:]' '[:upper:]')"
ENVS=("production" "staging" "preview")

# Account id for API calls
ACCOUNT_ID="$(get_account_id)"

echo "🔧 Setting up CF resources for $MODULE (idempotent)"

# D1
for env in "${ENVS[@]}"; do
  suffix=""; [ "$env" != "production" ] && suffix="-$env"
  DB_NAME="${lower_module}${suffix}-db"

  if grep -q "database_name = \"$DB_NAME\"" "$LOCAL_TOML" 2>/dev/null; then
    echo "  • D1 already in local toml: $DB_NAME"
    continue
  fi

  if resource_exists d1 "$DB_NAME"; then
    echo "  ✓ D1 exists: $DB_NAME"
    # Write stub entry so wrangler can merge (ID can be added manually if required)
    :
  else
    echo "  + Creating D1: $DB_NAME"
    pnpm exec wrangler d1 create "$DB_NAME" >/dev/null 2>&1 || true
    :
  fi

  # Lookup database_id via REST API and write env-specific binding
  D1_JSON=$(curl -sS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database?per_page=100")
  DB_ID=$(echo "$D1_JSON" | jq -r --arg n "$DB_NAME" '.result[] | select(.name==$n) | (.uuid // .id) | values' | head -n1 || true)
  if ! grep -q "\[\[env\.$env\.d1_databases\]\]" "$LOCAL_TOML" 2>/dev/null || ! grep -q "database_name = \"$DB_NAME\"" "$LOCAL_TOML" 2>/dev/null; then
    cat >> "$LOCAL_TOML" <<EOF

[[env.$env.d1_databases]]
binding = "${MODULE_UPPER}_D1"
database_name = "$DB_NAME"
$( [ -n "$DB_ID" ] && echo "database_id = \"$DB_ID\"" )
EOF
  fi
done

# KV per env (IDs required)
for env in "${ENVS[@]}"; do
  if ! resource_exists kv "${MODULE_UPPER}_KV"; then
    echo "  + Creating KV: ${MODULE_UPPER}_KV"
    pnpm exec wrangler kv:namespace create "${MODULE_UPPER}_KV" >/dev/null 2>&1 || true
  fi
  KV_JSON=$(curl -sS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces?per_page=100")
  KV_ID=$(echo "$KV_JSON" | jq -r --arg t "${MODULE_UPPER}_KV" '.result[] | select(.title==$t) | .id' | head -n1 || true)
  if ! grep -q "\[\[env\.$env\.kv_namespaces\]\]" "$LOCAL_TOML" 2>/dev/null || ! grep -q "binding = \"${MODULE_UPPER}_KV\"" "$LOCAL_TOML" 2>/dev/null; then
    cat >> "$LOCAL_TOML" <<EOF

[[env.$env.kv_namespaces]]
binding = "${MODULE_UPPER}_KV"
$( [ -n "$KV_ID" ] && echo "id = \"$KV_ID\"" )
EOF
  fi
done

# R2
for env in "${ENVS[@]}"; do
  suffix=""; [ "$env" != "production" ] && suffix="-$env"
  BUCKET="${lower_module}${suffix}-bucket"

  if grep -q "bucket_name = \"$BUCKET\"" "$LOCAL_TOML" 2>/dev/null; then
    echo "  • R2 already in local toml: $BUCKET"
    continue
  fi

  if resource_exists r2 "$BUCKET"; then
    echo "  ✓ R2 bucket exists: $BUCKET"
  else
    echo "  + Creating R2 bucket: $BUCKET"
    pnpm exec wrangler r2 bucket create "$BUCKET" 2>/dev/null || true
  fi

  if ! grep -q "\[\[env\.$env\.r2_buckets\]\]" "$LOCAL_TOML" 2>/dev/null || ! grep -q "bucket_name = \"$BUCKET\"" "$LOCAL_TOML" 2>/dev/null; then
    cat >> "$LOCAL_TOML" <<EOF

[[env.$env.r2_buckets]]
binding = "${MODULE_UPPER}_R2"
bucket_name = "$BUCKET"
EOF
  fi
done

echo "✅ Resource setup complete — updated $LOCAL_TOML"
echo "8855RROKK-ACK"

