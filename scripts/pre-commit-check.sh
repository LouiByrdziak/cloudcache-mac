#!/usr/bin/env bash
#
# Pre-Commit Helper
# Run this before committing to avoid pre-commit hook failures
#
# Usage: bash scripts/pre-commit-check.sh

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo ""
echo -e "${BLUE}🔍 Pre-commit checks...${RESET}"
echo ""

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM || echo "")

if [[ -z "$STAGED_FILES" ]]; then
  echo -e "${YELLOW}⚠️  No files staged for commit.${RESET}"
  exit 0
fi

# Check for validation reports
echo -e "${BLUE}Checking for validation reports...${RESET}"
if echo "$STAGED_FILES" | grep -q 'docs/reports/validation/'; then
  echo -e "${YELLOW}⚠️  Validation reports found in staging area.${RESET}"
  echo "   Unstaging them (they should not be committed)..."
  git reset docs/reports/validation/ 2>/dev/null || true
  echo -e "${GREEN}✅ Validation reports unstaged.${RESET}"
fi

# Format staged files
echo -e "${BLUE}Formatting staged files...${RESET}"
FORMATTABLE_FILES=$(echo "$STAGED_FILES" | grep -E '\.(js|ts|tsx|json|md|yml|yaml)$' || echo "")

if [[ -n "$FORMATTABLE_FILES" ]]; then
  echo "$FORMATTABLE_FILES" | xargs pnpm exec prettier --write 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Some files could not be formatted (may already be formatted).${RESET}"
  }
  echo -e "${GREEN}✅ Files formatted.${RESET}"
else
  echo "   No formattable files found."
fi

# Re-stage formatted files
if [[ -n "$FORMATTABLE_FILES" ]]; then
  echo "$FORMATTABLE_FILES" | xargs git add 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ Pre-commit checks complete!${RESET}"
echo ""
echo "You can now commit:"
echo -e "${BLUE}  git commit -m \"Your commit message\"${RESET}"
echo ""






