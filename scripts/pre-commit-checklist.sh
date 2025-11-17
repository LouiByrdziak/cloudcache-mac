#!/usr/bin/env bash
#
# Pre-commit Checklist
#
# Run this before committing to catch and fix common issues
# Usage: bash scripts/pre-commit-checklist.sh

set -euo pipefail

echo "🔍 Pre-commit checklist..."
echo ""

# Get root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# 1. Format all staged files
echo "1️⃣  Formatting staged files..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|tsx|json|md|yml|yaml)$' || true)

if [ -n "$STAGED_FILES" ]; then
  echo "$STAGED_FILES" | xargs pnpm exec prettier --write
  echo "   ✅ Files formatted"
else
  echo "   ℹ️  No files to format"
fi
echo ""

# 2. Run validation
echo "2️⃣  Running validation..."
if bash scripts/lib/validate-no-duplication.sh; then
  echo "   ✅ Validation passed"
else
  echo "   ❌ Validation failed - fix issues above"
  exit 1
fi
echo ""

# 3. Re-stage formatted files
echo "3️⃣  Re-staging formatted files..."
if [ -n "$STAGED_FILES" ]; then
  echo "$STAGED_FILES" | xargs git add
  echo "   ✅ Files re-staged"
else
  echo "   ℹ️  No files to re-stage"
fi
echo ""

echo "✅ Ready to commit!"
echo ""
echo "Now run: git commit -m \"your message\""

