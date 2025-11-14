#!/usr/bin/env bash
# Wrapper for shfmt that skips if not installed
# Skip husky internal files
for file in "$@"; do
  if [[ "$file" == *".husky/_/"* ]]; then
    echo "Skipping husky internal file: $file"
    continue
  fi
  if command -v shfmt >/dev/null 2>&1; then
    shfmt -d "$file" || exit 1
  else
    echo "shfmt not installed, skipping shell format check for $file"
  fi
done

