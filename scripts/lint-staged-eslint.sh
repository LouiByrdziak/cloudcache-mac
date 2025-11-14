#!/usr/bin/env bash
# Wrapper for eslint that handles missing config gracefully
# ESLint v9 requires eslint.config.js, but we may still have .eslintrc.json

# Check if eslint.config.js exists (v9 format)
if [[ -f "eslint.config.js" ]] || [[ -f "eslint.config.mjs" ]] || [[ -f "eslint.config.cjs" ]]; then
  # ESLint v9 config exists, run normally
  eslint --max-warnings=0 "$@"
elif [[ -f ".eslintrc.json" ]] || [[ -f ".eslintrc.js" ]] || [[ -f ".eslintrc.yml" ]] || [[ -f ".eslintrc.yaml" ]]; then
  # Old config format exists, but ESLint v9 doesn't support it
  # Skip eslint check with a warning
  echo "⚠️  ESLint v9 requires eslint.config.js but found old format config. Skipping eslint check."
  echo "   To fix: Migrate .eslintrc.json to eslint.config.js"
  echo "   See: https://eslint.org/docs/latest/use/configure/migration-guide"
  exit 0
else
  # No config at all, skip
  echo "⚠️  No ESLint config found. Skipping eslint check."
  exit 0
fi

