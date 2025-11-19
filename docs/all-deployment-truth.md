# Deployment Truth

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Related**: `docs/all-system-truth.md`

This document is the canonical source for all deployment, preview, and verification procedures.

## Core Principles

1. **Golden Path**: Use `bash scripts/deploy-preview.sh` for all preview deployments.
2. **No Pages**: We do not use Cloudflare Pages. All modules (App, Admin, Apex) are Workers.
3. **Staging Previews**: We use `staging-*.cloudcache.ai` or `*-worker-preview.cloudcache.workers.dev`.

## Deployment Procedures

### Deploy All to Preview

The primary, functional script for deploying all modules to the Preview environment is:

```bash
pnpm deploy:preview
# or
bash scripts/deploy-preview.sh
```

### Deploy Single Module

```bash
bash scripts/deploy-module.sh <module> <environment>
# Example: bash scripts/deploy-module.sh app preview
```

## Verified URLs

The following URLs have been manually verified to be correct and functional after a successful deployment:

| Module | Verified Preview URL | Status | Notes |
| :--- | :--- | :--- | :--- |
| `app` | `https://app-worker-preview.cloudcache.workers.dev` | ✅ Verified | Displays "I love Cloudcache APP" message and validation badge. |
| `admin` | `https://admin-worker-preview.cloudcache.workers.dev` | ✅ Verified | Displays "I love Cloudcache ADMIN" message and validation badge. |
| `apex` | `https://apex-worker-preview.cloudcache.workers.dev` | ✅ Verified | Displays the main dashboard and validation badge. |

### Health Endpoints

**APP Module**
- Health: `https://app-worker-preview.cloudcache.workers.dev/healthz`
- Ready: `https://app-worker-preview.cloudcache.workers.dev/readyz`
- Ping: `https://app-worker-preview.cloudcache.workers.dev/api/v1/ping`

**ADMIN Module**
- Health: `https://admin-worker-preview.cloudcache.workers.dev/healthz`
- Ready: `https://admin-worker-preview.cloudcache.workers.dev/readyz`

**APEX Module**
- Health: `https://apex-worker-preview.cloudcache.workers.dev/healthz`
- Ready: `https://apex-worker-preview.cloudcache.workers.dev/readyz`

## Testing & Verification

### Automated Testing (Recommended)

Run these commands to automatically test all preview deployments:

```bash
# Test all deployments
pnpm test:validation

# Test specific module
scripts/cloudcache test-preview app
scripts/cloudcache test-preview admin
scripts/cloudcache test-preview apex
```

**What this does automatically:**
- ✅ Verifies the preview URL is accessible
- ✅ Tests `/healthz` endpoint
- ✅ Tests `/readyz` endpoint
- ✅ Tests `/api/v1/ping` endpoint (app only)
- ✅ Verifies visual markers exist in HTML (if Playwright installed)

### Visual Verification

If you want to **visually see** the green markers in your browser:

1. Open the verified URL (see above).
2. Verify:
   - [ ] Page loads without errors
   - [ ] Green text is visible (bright green #00FF00)
   - [ ] Text is centered horizontally and vertically
   - [ ] Text matches module name (e.g., "I love Cloudcache APP")

## Preview Policy

- **Staging-Only**: Cloudcache uses staging subdomains for previews (no Cloudflare Pages).
- **Guidelines**:
  - Do not create or reference `*.pages.dev` or `wrangler pages` in this repo.
  - Protect staging with Access policies (SSO or IP allowlist) per security posture.
  - Use the lockdown scripts to gate staging as needed.
- **Verification**:
  - From allowed IPs/users: previews return 200.
  - From others: previews return 403 at the edge.

## Troubleshooting

### "Preview URL not found"
- **Verify deployment**: `wrangler deployments list --env preview`
- **Check URL**: Ensure you are using the `*-worker-preview.cloudcache.workers.dev` format.

### "Health check failed"
1. Verify deployment completed: `scripts/cloudcache status {module} preview`
2. Check secrets are set: `scripts/cloudcache verify {module} preview`
3. Check Worker logs: `wrangler tail --env preview`

### "Visual marker not visible"
1. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
2. Verify deployment includes latest code
3. Check HTML source for `.validation-marker` class
4. Verify CSS is loading (check browser DevTools)

