#!/usr/bin/env bash
set -euo pipefail

# Cloudflare cleanup utility
# - Deletes ALL Access Applications in the account
# - Deletes ALL Cloudflare Pages projects in the account
#
# Requirements:
#   - env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
#   - curl, jq

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "❌ CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set in the environment" >&2
  exit 2
fi

command -v jq >/dev/null 2>&1 || { echo "❌ jq is required (brew install jq)" >&2; exit 3; }

auth_header=( -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" )
acct_base="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}"

delete_access_apps() {
  echo "🔎 Listing Access applications…"
  apps_json=$(curl -sS "${acct_base}/access/apps?per_page=1000" "${auth_header[@]}")
  ids=( $(echo "$apps_json" | jq -r '.result[]?.id') )
  names=( $(echo "$apps_json" | jq -r '.result[]?.name') )
  domains=( $(echo "$apps_json" | jq -r '.result[]?.domain') )

  total=${#ids[@]}
  if (( total == 0 )); then
    echo "  • No Access apps found"
    return 0
  fi

  echo "🗑️  Deleting ${total} Access apps…"
  for i in "${!ids[@]}"; do
    id=${ids[$i]}
    name=${names[$i]:-}
    domain=${domains[$i]:-}
    printf "  - %-32s (%s)\n" "${name}" "${domain}"
    curl -sS -X DELETE "${acct_base}/access/apps/${id}" "${auth_header[@]}" >/dev/null || true
  done
  echo "✅ Access apps deleted"
}

delete_pages_projects() {
  echo "🔎 Listing Pages projects…"
  projs_json=$(curl -sS "${acct_base}/pages/projects?per_page=1000" "${auth_header[@]}")
  names=( $(echo "$projs_json" | jq -r '.result[]?.name') )
  total=${#names[@]}
  if (( total == 0 )); then
    echo "  • No Pages projects found"
    return 0
  fi

  echo "🗑️  Deleting ${total} Pages projects…"
  for name in "${names[@]}"; do
    printf "  - %s\n" "$name"
    curl -sS -X DELETE "${acct_base}/pages/projects/${name}" "${auth_header[@]}" >/dev/null || true
  done
  echo "✅ Pages projects deleted"
}

echo "♻️  Cloudflare cleanup starting"
delete_access_apps
delete_pages_projects
echo "✅ Cleanup complete"

















