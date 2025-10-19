#!/usr/bin/env bash
set -euo pipefail

# Usage: access-lockdown-all.sh
# Applies the fixed allowlist across all Cloudcache domains in scope.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ALLOWLIST="119.120.112.98,103.224.172.84,85.234.83.37,208.115.96.45,13.212.85.246"

domains=(
  cloudcache.ai
  app.cloudcache.ai
  admin.cloudcache.ai
  staging-apex.cloudcache.ai
  staging-app.cloudcache.ai
  staging-admin.cloudcache.ai
)

for d in "${domains[@]}"; do
  echo "== $d =="
  bash "$SCRIPT_DIR/access-lockdown-allowlist.sh" "$d" "$ALLOWLIST"
done

echo "✅ Lockdown completed for all domains"





