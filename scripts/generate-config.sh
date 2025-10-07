#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

MODULE="${1:-}"
ENV_NAME="${2:-production}"

[[ -z "$MODULE" || ! "$MODULE" =~ ^(apex|app|admin)$ ]] && { echo "Usage: $0 [apex|app|admin] [production|staging|preview]"; exit 1; }
[[ ! "$ENV_NAME" =~ ^(production|staging|preview)$ ]] && { echo "Invalid env: $ENV_NAME"; exit 1; }

select_module_token "$MODULE"
ACCOUNT_ID="$(get_account_id)"
if [[ -z "$ACCOUNT_ID" ]]; then
  echo "❌ Missing CLOUDFLARE_ACCOUNT_ID/CF_ACCOUNT_ID"
  exit 2
fi

MODULE_DIR="$ROOT_DIR/src/$MODULE"
OUT_CONFIG="$MODULE_DIR/.wrangler.generated.toml"

lower_module="$MODULE"
upper_module="$(printf '%s' "$MODULE" | tr '[:lower:]' '[:upper:]')"
suffix=""
[[ "$ENV_NAME" != "production" ]] && suffix="-$ENV_NAME"

# Emit minimal config without resource bindings (deploys a simple worker)
{
  echo "name = \"${lower_module}-worker\""
  echo "main = \"index.ts\""
  echo "compatibility_date = \"2025-10-07\""
  echo "compatibility_flags = [\"nodejs_compat\"]"
  echo ""
  echo "[env.staging]"
  echo "name = \"${lower_module}-worker-staging\""
  echo ""
  echo "[env.preview]"
  echo "name = \"${lower_module}-worker-preview\""
} > "$OUT_CONFIG"

echo "$OUT_CONFIG"


