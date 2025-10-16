#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
  exit $?
fi

# Husky shim: ensure PNPM and repo root are available for hooks
if command -v pnpm >/dev/null 2>&1; then
  :
else
  echo "pnpm not found; hooks may skip PNPM-based steps" >&2
fi

