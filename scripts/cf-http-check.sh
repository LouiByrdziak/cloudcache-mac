#!/usr/bin/env bash
set -euo pipefail

hosts=( "$@" )
if (( ${#hosts[@]} == 0 )); then
  hosts=( app.cloudcache.ai admin.cloudcache.ai cloudcache.ai staging-app.cloudcache.ai staging-admin.cloudcache.ai staging-apex.cloudcache.ai )
fi

for h in "${hosts[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" https://$h/)
  echo "$h $code"
done














