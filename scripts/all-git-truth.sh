#!/usr/bin/env bash
# Git Operations Truth Script
# Reference: docs/all-git-truth.md
# Reference: .cursor/rules/all-code-truth.mdc

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
RESET='\033[0m'

# Get root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# --- Core Functions ---

# Core git operations with credential bypass
# Usage: git_safe <command> [args...]
git_safe() {
  git -c credential.helper='' "$@"
}

# Show usage information
show_usage() {
  echo "Usage: bash scripts/all-git-truth.sh [OPTION] [ARGS]"
  echo ""
  echo "Options:"
  echo "  --pre-commit        Run pre-commit checks (format, validate, unstage reports)"
  echo "  --validate-md FILE  Validate markdown file structure and naming"
  echo "  --git-safe CMD...   Run git command with credential helper bypass"
  echo "  --help              Show this help message"
  exit 1
}

# --- Pre-Commit Operations ---

pre_commit_check() {
  echo ""
  echo -e "${BLUE}🔍 Pre-commit checks...${RESET}"
  echo ""

  # Get staged files
  STAGED_FILES=$(git_safe diff --cached --name-only --diff-filter=ACM || echo "")

  if [[ -z "$STAGED_FILES" ]]; then
    echo -e "${YELLOW}⚠️  No files staged for commit.${RESET}"
    exit 0
  fi

  # 1. Check for validation reports
  echo -e "${BLUE}Checking for validation reports...${RESET}"
  if echo "$STAGED_FILES" | grep -q 'docs/reports/validation/'; then
    echo -e "${YELLOW}⚠️  Validation reports found in staging area.${RESET}"
    echo "   Unstaging them (they should not be committed)..."
    git_safe reset docs/reports/validation/ 2>/dev/null || true
    echo -e "${GREEN}✅ Validation reports unstaged.${RESET}"
    
    # Refresh staged files list
    STAGED_FILES=$(git_safe diff --cached --name-only --diff-filter=ACM || echo "")
  fi

  # 2. Format staged files
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

  # 3. Run validation
  echo -e "${BLUE}Running validation...${RESET}"
  if bash scripts/lib/validate-no-duplication.sh; then
    echo -e "${GREEN}✅ Validation passed.${RESET}"
  else
    echo -e "${RED}❌ Validation failed - fix issues above.${RESET}"
    exit 1
  fi

  # 4. Re-stage formatted files
  echo -e "${BLUE}Re-staging formatted files...${RESET}"
  if [[ -n "$FORMATTABLE_FILES" ]]; then
    echo "$FORMATTABLE_FILES" | xargs git_safe add 2>/dev/null || true
    echo -e "${GREEN}✅ Files re-staged.${RESET}"
  fi

  echo ""
  echo -e "${GREEN}✅ Pre-commit checks complete!${RESET}"
  echo ""
  echo "You can now commit:"
  echo -e "${BLUE}  git commit -m \"Your commit message\"${RESET}"
  echo ""
}

# --- Validation Operations ---

validate_md_structure() {
  local file="$1"
  
  if [[ -z "$file" ]]; then
    echo -e "${RED}❌ Error: No file specified.${RESET}"
    return 1
  fi

  if [[ ! -f "$file" ]]; then
    echo -e "${RED}❌ Error: File not found: $file${RESET}"
    return 1
  fi

  local basename=$(basename "$file")
  local errors=0

  echo "Validating $file..."

  # Check 1: Lowercase, hyphen-only filename
  if [[ ! "$basename" =~ ^[a-z0-9-]+\.md$ ]]; then
    echo -e "${RED}❌ Invalid filename: $basename${RESET}"
    echo "   Must be lowercase letters, numbers, and hyphens only."
    errors=$((errors + 1))
  else
    echo -e "${GREEN}✅ Filename format OK${RESET}"
  fi

  # Check 2: Required headers
  if ! grep -q "Last Updated" "$file"; then
    echo -e "${RED}❌ Missing 'Last Updated' date${RESET}"
    errors=$((errors + 1))
  fi

  if ! grep -q "Rule Reference.*all-code-truth.mdc" "$file"; then
    echo -e "${RED}❌ Missing reference to .cursor/rules/all-code-truth.mdc${RESET}"
    errors=$((errors + 1))
  fi

  # Check 3: Title format (H1)
  # Count H1 headers, ignoring those inside code blocks
  local h1_count=$(awk '
    /^```/ { in_code = !in_code; next }
    !in_code && /^# / { count++ }
    END { print count }
  ' "$file")
  
  if [[ "$h1_count" -ne 1 ]]; then
    echo -e "${RED}❌ Incorrect title format${RESET}"
    echo "   Found $h1_count H1 headers (should be exactly 1)."
    errors=$((errors + 1))
  fi

  if [[ $errors -gt 0 ]]; then
    echo -e "${RED}Validation failed with $errors errors.${RESET}"
    return 1
  else
    echo -e "${GREEN}✅ MD structure valid.${RESET}"
    return 0
  fi
}

# --- Main Dispatcher ---

case "${1:-}" in
  --pre-commit)
    pre_commit_check
    ;;
  --validate-md)
    if [[ -z "${2:-}" ]]; then
      echo "Validating all markdown files..."
      find docs -name "*.md" -not -path "*/archive/*" -not -path "*/reports/*" -print0 | xargs -0 -n1 bash "$0" --validate-md
    else
      validate_md_structure "$2"
    fi
    ;;
  --git-safe)
    shift
    git_safe "$@"
    ;;
  --help)
    show_usage
    ;;
  *)
    if [[ -z "${1:-}" ]]; then
      show_usage
    else
      echo -e "${RED}Unknown option: $1${RESET}"
      show_usage
    fi
    ;;
esac

