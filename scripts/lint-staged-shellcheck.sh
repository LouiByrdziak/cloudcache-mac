#!/usr/bin/env bash
# Wrapper for shellcheck that skips if not installed
# Skip husky internal files
for file in "$@"; do
  if [[ "$file" == *".husky/_/"* ]]; then
    echo "Skipping husky internal file: $file"
    continue
  fi
  if command -v shellcheck >/dev/null 2>&1; then
    shellcheck -S warning "$file" || exit 1
  else
    echo "shellcheck not installed, skipping shell lint check for $file"
  fi
done

