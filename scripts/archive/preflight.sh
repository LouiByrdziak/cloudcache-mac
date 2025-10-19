#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

echo "Preflight: checking pnpm/jq"
command -v pnpm >/dev/null || { echo "pnpm missing"; exit 1; }
pnpm -v
command -v jq >/dev/null || { echo "jq missing"; exit 1; }
jq --version
echo "8855RROKK-ACK"

