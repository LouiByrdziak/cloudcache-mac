#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚨 This script will DELETE all Access Apps and Pages projects in your account."
read -r -p "Type 'RESET' to continue: " CONFIRM
[[ "$CONFIRM" == "RESET" ]] || { echo "Aborted"; exit 1; }

# Ensure env is present
for v in CLOUDFLARE_API_TOKEN_APP CLOUDFLARE_API_TOKEN_ADMIN CLOUDFLARE_API_TOKEN_APEX CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID; do
  [[ -n "${!v:-}" ]] || { echo "❌ Missing env: $v"; exit 2; }
done

# Step 1: Cleanup CF resources (use the APEX token which should be full-scope)
env CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN_APEX"  bash "$SCRIPT_DIR/cleanup-cloudflare-resources.sh"

# Step 2: Configure DNS, routes, and apps
bash "$SCRIPT_DIR/configure-workers-zero-trust.sh"

# Step 3: Deploy workers (prod + staging)
bash "$SCRIPT_DIR/deploy.sh" app production
bash "$SCRIPT_DIR/deploy.sh" app staging
bash "$SCRIPT_DIR/deploy.sh" admin production
bash "$SCRIPT_DIR/deploy.sh" admin staging
bash "$SCRIPT_DIR/deploy.sh" apex production
bash "$SCRIPT_DIR/deploy.sh" apex staging

echo "✅ Orchestration done"


