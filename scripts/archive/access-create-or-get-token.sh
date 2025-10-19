#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cf-env.sh"

NAME="${1:-}"
if [[ -z "$NAME" ]]; then
  echo "Usage: $0 <token-name>" >&2
  exit 1
fi

# Check existing
existing=$(curl -sS "${CF_ACCT_BASE}/access/service_tokens?per_page=1000" "${CF_AUTH[@]}")
id=$(echo "$existing" | jq -r --arg n "$NAME" '.result[] | select(.name==$n) | .id' | head -n1)
client_id=$(echo "$existing" | jq -r --arg n "$NAME" '.result[] | select(.name==$n) | .client_id' | head -n1)

if [[ -n "$id" && -n "$client_id" ]]; then
  jq -n --arg id "$id" --arg client_id "$client_id" '{created:false,id:$id,client_id:$client_id,client_secret:null}'
  exit 0
fi

# Create new token (returns client_secret only once)
resp=$(curl -sS -X POST "${CF_ACCT_BASE}/access/service_tokens" "${CF_AUTH[@]}" \
  --data "$(jq -n --arg name "$NAME" '{name:$name}')")
id=$(echo "$resp" | jq -r '.result.id')
client_id=$(echo "$resp" | jq -r '.result.client_id')
client_secret=$(echo "$resp" | jq -r '.result.client_secret')

jq -n --arg id "$id" --arg client_id "$client_id" --arg client_secret "$client_secret" '{created:true,id:$id,client_id:$client_id,client_secret:$client_secret}'

















