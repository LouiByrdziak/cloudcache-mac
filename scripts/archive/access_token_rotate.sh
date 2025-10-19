#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/access_lib.sh"

# Usage: access_token_rotate.sh <name> [tag_json_array]
# Example: access_token_rotate.sh monitor-readyz-app-prod '["monitoring","readyz","app","prod"]'

NAME="${1:-}"
TAGS_JSON="${2:-[\"monitoring\",\"readyz\"]}"
if [[ -z "$NAME" ]]; then
  echo "usage: $0 <name> [json_tags]" 1>&2; exit 2;
fi

# Create new token
create_res=$(cf_post "${BASE}/service_tokens" "{\"name\":\"${NAME}-v$(ts_suffix)\",\"tags\":${TAGS_JSON}}")
cid=$(echo "$create_res" | jq -r '.result.client_id')
csec=$(echo "$create_res" | jq -r '.result.client_secret')
tid=$(echo "$create_res" | jq -r '.result.id')

echo "NEW_TOKEN_NAME=${NAME}-v$(ts_suffix)"
echo "CLIENT_ID=${cid}"
echo "CLIENT_SECRET=${csec}"
echo "TOKEN_ID=${tid}"

# Note: caller should add TOKEN_ID to Access policy include, update monitor headers, then delete old token.










