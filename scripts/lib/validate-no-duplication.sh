#!/usr/bin/env bash
#
# Validation Script: Detect Duplicate Function Definitions
#
# This script checks for duplicate function definitions across shell scripts
# to prevent code drift and regressions.
#
# Exit code:
#   0 - No duplicates found
#   1 - Duplicates detected or error

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# List of functions that should ONLY exist in core.sh
CORE_ONLY_FUNCTIONS=(
  "kill_port"
  "kill_ports"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for duplicate function definitions..."

duplicates_found=0

for func in "${CORE_ONLY_FUNCTIONS[@]}"; do
  echo -n "  Checking $func... "
  
  # Find all shell scripts except core.sh
  files=$(find "$ROOT_DIR/scripts" -type f -name "*.sh" ! -name "core.sh" ! -path "*/archive/*")
  
  # Search for function definitions
  matches=$(echo "$files" | xargs grep -l "^${func}()" 2>/dev/null || true)
  
  if [[ -n "$matches" ]]; then
    echo -e "${RED}DUPLICATE FOUND${NC}"
    echo -e "    ${YELLOW}Function '$func' should only be defined in scripts/lib/core.sh${NC}"
    echo -e "    ${YELLOW}But found in:${NC}"
    echo "$matches" | sed 's/^/      /'
    duplicates_found=1
  else
    echo -e "${GREEN}OK${NC}"
  fi
done

echo ""

if [[ $duplicates_found -eq 1 ]]; then
  echo -e "${RED}❌ Duplicate function definitions detected!${NC}"
  echo ""
  echo "To fix this issue:"
  echo "  1. Remove the duplicate function definitions from the files listed above"
  echo "  2. Ensure those scripts source scripts/lib/core.sh"
  echo "  3. Use the centralized function from core.sh"
  exit 1
else
  echo -e "${GREEN}✅ No duplicate function definitions found${NC}"
  exit 0
fi

