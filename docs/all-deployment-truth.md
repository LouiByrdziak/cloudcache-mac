# Deployment Truth

**Last Updated**: 2025-11-21
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Related**: `docs/all-system-truth.md`

This document is the canonical source for all deployment, preview, and verification procedures.

## Core Principles

1. **Golden Path**: Use `bash scripts/deploy-preview.sh` for all preview deployments.
2. **No Pages**: We do not use Cloudflare Pages. All modules (App, Admin, Apex) are Workers.
3. **Staging Previews**: We use `staging-*.cloudcache.ai` or `*-worker-preview.cloudcache.workers.dev`.
4. **Resilience First**: All deployments use 5-attempt retry with exponential backoff. Transient "fetch failed" errors are automatically recovered.
5. **Sequential with Pauses**: Multi-module deployments pause 5 seconds between modules to allow Cloudflare API settling.

## Script Reference

| Script                                                          | Purpose                                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scripts/deploy-module.sh <module> <env>`                       | Builds and deploys one module with 5-attempt retry logic and exponential backoff (5s, 10s, 20s, 40s). Handles transient Cloudflare API failures. |
| `scripts/deploy-preview.sh` / `pnpm deploy:preview`             | Deploys all modules to preview sequentially with 5-second pauses between deployments for API settling.                                           |
| `scripts/validation/run-validation.sh` / `pnpm test:validation` | Automated validation suite testing 12 deployment targets (3 modules × preview+localhost × 2 checks = 24 assertions).                             |
| `scripts/cloudcache test-preview <module>`                      | Targeted preview validation for a module.                                                                                                        |
| `scripts/lib/preview-urls.sh`                                   | Helper used by automation to print the current preview endpoints.                                                                                |

## Deployment Procedures

### Deploy All to Preview

The primary, functional script for deploying all modules to the Preview environment is:

```bash
pnpm deploy:preview
# or
bash scripts/deploy-preview.sh
```

**Expected Behavior:**

- APP module deploys first (~137 KB bundled, ~26 KB gzipped)
- 5-second pause for API settling
- ADMIN module deploys second (~120 KB bundled, ~22 KB gzipped)
- 5-second pause for API settling
- APEX module deploys third (~11 KB bundled, ~4 KB gzipped)
- Success message: "🎉 All modules successfully deployed to preview!"

**Non-Interactive Mode:**

- `CI=true` environment variable disables all interactive prompts
- `WRANGLER_SEND_METRICS=false` disables telemetry prompts
- No user interaction required even on transient failures

**Resilience:**

- Each module deployment retries up to 5 times on failure
- Exponential backoff: 5s, 10s, 20s, 40s between attempts
- Common transient errors (e.g., "fetch failed") are automatically recovered
- **No blocking prompts**: Errors are logged and retried automatically

### Deploy Single Module

```bash
bash scripts/deploy-module.sh <module> <environment>
# Example: bash scripts/deploy-module.sh app preview
```

**Build Commands:**

- APP/ADMIN: `pnpm build:bundle` (creates `dist/index.js`)
- APEX: `pnpm exec tsup src/index.ts --format esm` (creates `dist/index.mjs`)

**Current Bundle Sizes (as of 2025-11-21):**

- APP: 137.45 KB (26.56 KB gzipped) - includes component architecture
- ADMIN: 119.96 KB (22.56 KB gzipped)
- APEX: 11.16 KB (3.90 KB gzipped)

## Verified URLs

The following URLs have been manually verified to be correct and functional after a successful deployment:

| Module  | Verified Preview URL                                  | Status      | Worker Startup | Notes                                                                                            |
| :------ | :---------------------------------------------------- | :---------- | :------------- | :----------------------------------------------------------------------------------------------- |
| `app`   | `https://app-worker-preview.cloudcache.workers.dev`   | ✅ Verified | 1ms            | Displays CloudCache Dashboard with component architecture, navigation, and optimization toggles. |
| `admin` | `https://admin-worker-preview.cloudcache.workers.dev` | ✅ Verified | 2-3ms          | Displays "Hello World I am Cloudcache ADMIN" with navigation sidebar.                            |
| `apex`  | `https://apex-worker-preview.cloudcache.workers.dev`  | ✅ Verified | N/A            | Displays the main dashboard and validation badge.                                                |

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
# Test all deployments (24 total checks)
pnpm test:validation

# Test specific module
scripts/cloudcache test-preview app
scripts/cloudcache test-preview admin
scripts/cloudcache test-preview apex
```

**What this does automatically:**

- ✅ Syncs with remote repository (`git fetch origin --prune`)
- ✅ Stops lingering development servers (ports 8787, 8788, 8789, 9229, 9230, 9231)
- ✅ Builds all modules for local development
- ✅ Starts local servers sequentially with health checks
- ✅ Validates 12 deployment targets:
  - 3 modules (app, admin, apex)
  - 2 environments (localhost, cloudflare preview)
  - 2 checks per target: Health & Version Check, Badge Verification
- ✅ Generates timestamped validation report in `docs/reports/validation/`
- ✅ Cleans up background processes on completion

**Expected Output:**

```
✅ All local servers are ready.
  - Health & Version Check...✅ PASSED
  - Badge Verification...✅ PASSED
  [... 24 total checks ...]
Validation complete. Report generated at: docs/reports/validation/validation-report-YYYYMMDD-HHMMSS.md
✅ Deployment validation suite finished.
```

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

### "fetch failed" during deployment

**Status:** ✅ Expected and automatically recovered

This is a transient Cloudflare API error. The deployment script automatically retries with exponential backoff:

- Attempt 1: immediate
- Attempt 2: after 5 seconds
- Attempt 3: after 10 seconds
- Attempt 4: after 20 seconds
- Attempt 5: after 40 seconds

**If all 5 attempts fail:**

1. Check Cloudflare API status: https://www.cloudflarestatus.com/
2. Verify `CLOUDFLARE_API_TOKEN` is set correctly
3. Wait 60 seconds and retry: `pnpm deploy:preview`

### "Preview URL not found"

- **Verify deployment**: `wrangler deployments list --env preview`
- **Check URL**: Ensure you are using the `*-worker-preview.cloudcache.workers.dev` format.

### "Health check failed"

1. Verify deployment completed: `scripts/cloudcache status {module} preview`
2. Check secrets are set: `scripts/cloudcache verify {module} preview`
3. Check Worker logs: `wrangler tail --env preview`

### "Validation suite shows SKIPPED checks"

This is normal for:

- Production endpoints (protected by Cloudflare Access)
- Staging endpoints (when `origin/staging` branch doesn't exist)
- Localhost endpoints (when servers fail to start)

Only fail the validation if preview environment checks are skipped.

### "Local servers failed to start"

1. Check for port conflicts: `lsof -i :8787,8788,8789`
2. Stop conflicting processes: `bash scripts/dev-stop.sh`
3. Clear wrangler cache: `rm -rf apps/*/.wrangler`
4. Rebuild modules: `pnpm build:dev`
5. Start manually: `bash scripts/dev-local.sh`
