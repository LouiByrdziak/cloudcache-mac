#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

MODULE="${1:-}"
ENV="${2:-production}"

[[ -z "$MODULE" || ! "$MODULE" =~ ^(apex|app|admin)$ ]] && { echo "Usage: $0 [apex|app|admin] [production|staging|preview]"; exit 1; }
[[ ! "$ENV" =~ ^(production|staging|preview)$ ]] && { echo "Invalid env: $ENV"; exit 1; }

MODULE_DIR="$ROOT_DIR/apps/$MODULE"
cd "$MODULE_DIR"

select_module_token "$MODULE"

# Fallback: allow CF_API_TOKEN to satisfy scripts without exposing CLOUDFLARE_ names in CI
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -n "${CF_API_TOKEN:-}" ]]; then
  export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "❌ Missing token in environment for $MODULE"
  exit 2
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-${CF_ACCOUNT_ID:-}}" ]]; then
  echo "❌ Missing CLOUDFLARE_ACCOUNT_ID in environment"
  exit 2
fi

# Prefer new local config naming; warn if legacy exists
if [[ -f "wrangler.toml.local" ]]; then
  ensure_local_toml_account_id "wrangler.toml.local"
elif [[ -f "wrangler.local.toml" ]]; then
  echo "⚠️  Legacy local config 'wrangler.local.toml' detected; please rename to 'wrangler.toml.local'"
  ensure_local_toml_account_id "wrangler.local.toml"
fi

echo "🚀 Deploying $MODULE → $ENV"
CONFIG_PATH="$MODULE_DIR/wrangler.toml"
# Prefer prebuilt ESM to bypass Wrangler bundler (avoids Yarn PnP/esbuild issues)
ENTRY_PATH="$ROOT_DIR/dist/$MODULE/index.mjs"

# Fallback: build if missing
if [[ ! -f "$ENTRY_PATH" ]]; then
  echo "ℹ️  Prebuilt artifact missing, building $MODULE…"
  mkdir -p "$ROOT_DIR/dist/$MODULE"
  pnpm dlx tsup "$ROOT_DIR/apps/$MODULE/index.ts" \
    --format esm --target es2022 --dts=false --sourcemap=false \
    --out-dir "$ROOT_DIR/dist/$MODULE" --clean || {
      echo "❌ Build failed"; exit 4; }
fi

# Generate env-specific config with IDs
GEN_CONFIG=$(bash "$SCRIPT_DIR/generate-config.sh" "$MODULE" "$ENV")

if [[ "$ENV" == "production" ]]; then
  # Explicitly target the top-level env to avoid Wrangler warning
  env -u NODE_OPTIONS pnpm exec wrangler deploy "$ENTRY_PATH" --no-bundle --config "$GEN_CONFIG" --env ""
else
  env -u NODE_OPTIONS pnpm exec wrangler deploy "$ENTRY_PATH" --no-bundle --config "$GEN_CONFIG" --env "$ENV"
fi
echo "✅ Deployment complete — $MODULE/$ENV"
echo "8855RROKK-ACK"

