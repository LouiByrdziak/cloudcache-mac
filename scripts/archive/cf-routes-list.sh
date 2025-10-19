#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

curl -sS "${CF_ZONE_BASE}/workers/routes" "${CF_AUTH[@]}" | jq -r '.result[] | [.pattern,.script] | @tsv' | sort

















