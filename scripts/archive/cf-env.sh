#!/usr/bin/env bash
set -euo pipefail

# Minimal env check + helpers for Cloudflare API calls

[[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || { echo "❌ CLOUDFLARE_ACCOUNT_ID not set" >&2; exit 2; }
[[ -n "${CLOUDFLARE_ZONE_ID:-}" ]] || { echo "❌ CLOUDFLARE_ZONE_ID not set" >&2; exit 2; }

# Enforce module-scoped API tokens only; ignore generic token
# Module resolution: CF_MODULE (app|admin|apex) or CF_DOMAIN mapping
#
# Canonical domains policy:
#   Production: app.cloudcache.ai, admin.cloudcache.ai, cloudcache.ai (+ www.cloudcache.ai)
#   Staging:    staging-app.cloudcache.ai, staging-admin.cloudcache.ai, staging-apex.cloudcache.ai
#   Preview:    use staging subdomains (no Pages)

resolve_module_from_domain() {
  case "$1" in
    app.cloudcache.ai|staging-app.cloudcache.ai) echo app ;;
    admin.cloudcache.ai|staging-admin.cloudcache.ai) echo admin ;;
    cloudcache.ai|staging-apex.cloudcache.ai|www.cloudcache.ai) echo apex ;;
    *) echo "" ;;
  esac
}

MODULE="${CF_MODULE:-}"
if [[ -z "$MODULE" && -n "${CF_DOMAIN:-}" ]]; then
  MODULE=$(resolve_module_from_domain "$CF_DOMAIN")
fi

[[ -n "$MODULE" ]] || { echo "❌ CF_MODULE not set (expected: app|admin|apex), or CF_DOMAIN unmapped" >&2; exit 2; }

case "$MODULE" in
  app)   SELECTED_TOKEN="${CLOUDFLARE_API_TOKEN_APP:-}" ;;
  admin) SELECTED_TOKEN="${CLOUDFLARE_API_TOKEN_ADMIN:-}" ;;
  apex)  SELECTED_TOKEN="${CLOUDFLARE_API_TOKEN_APEX:-}" ;;
  *) echo "❌ Unknown CF_MODULE: $MODULE" >&2; exit 2 ;;
esac

[[ -n "$SELECTED_TOKEN" ]] || { echo "❌ Missing module token for $MODULE (e.g., CLOUDFLARE_API_TOKEN_APP)" >&2; exit 2; }

CF_AUTH=(-H "Authorization: Bearer ${SELECTED_TOKEN}" -H "Content-Type: application/json")
CF_ACCT_BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}"
CF_ZONE_BASE="https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}"



