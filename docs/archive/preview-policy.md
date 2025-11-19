# Preview Policy (Staging-Only)

**DEPRECATED**: This file has been consolidated.
**See**: `docs/all-deployment-truth.md` for current documentation.

**Migration Date**: 2025-11-19
**Archived On**: 2025-11-19 13:44:00

---

Cloudcache uses staging subdomains for previews (no Cloudflare Pages):

- `staging-apex.cloudcache.ai`
- `staging-app.cloudcache.ai`
- `staging-admin.cloudcache.ai`

## Guidelines

- Do not create or reference `*.pages.dev` or `wrangler pages` in this repo.
- Protect staging with Access policies (SSO or IP allowlist) per security posture.
- Use the lockdown scripts to gate staging as needed.

## Verification

- From allowed IPs/users: previews return 200.
- From others: previews return 403 at the edge.
