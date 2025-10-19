#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== DNS records =="
bash "$SCRIPT_DIR/cf-dns-show.sh"

echo
echo "== Worker routes =="
bash "$SCRIPT_DIR/cf-routes-list.sh"

echo
echo "== HTTP checks =="
bash "$SCRIPT_DIR/cf-http-check.sh"
