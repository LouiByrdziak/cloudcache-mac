# Action Items: Post-Review Implementation Plan

**Date:** 2025-11-14  
**Priority:** High  
**Status:** Ready for Implementation

---

## 🔴 Critical Priority (Block Production Deployment)

### 1. Fix CI/CD Build Process

**File:** `.github/workflows/deploy-app.yml`  
**Issue:** Missing `--no-bundle` flag and build verification  
**Fix:**

```yaml
- name: Build
  run: pnpm --filter @cloudcache/app build:bundle

- name: Verify Build Artifact
  run: test -f apps/app/dist/index.js || (echo "Build failed - dist/index.js not found" && exit 1)

- name: Deploy to Preview
  command: deploy --env preview --no-bundle
```

**Estimated Time:** 15 minutes

### 2. Standardize Build Configuration

**Decision Required:** Do admin/apex modules need workspace dependency bundling?

**Option A:** If they use workspace dependencies:

- Create `apps/admin/tsup.config.ts` (copy from app)
- Create `apps/apex/tsup.config.ts` (copy from app)
- Update `package.json` build scripts
- Update `wrangler.toml` to use `dist/index.js`

**Option B:** If they don't use workspace dependencies:

- Document why app bundles but admin/apex don't
- Add comments in `wrangler.toml` explaining the difference

**Estimated Time:** 30-60 minutes

---

## 🟡 High Priority (Before Next Sprint)

### 3. Document Shopify OAuth Setup

**File:** `docs/shopify-oauth-setup.md` (new)  
**Content:**

- Required redirect URIs:
  - Production: `https://app.cloudcache.ai/auth/callback`
  - Staging: `https://staging-app.cloudcache.ai/auth/callback`
  - Preview: `https://app-worker-preview.<account>.workers.dev/auth/callback`
- Shopify Partners dashboard setup steps
- Testing checklist
- Troubleshooting guide

**Estimated Time:** 45 minutes

### 4. Add Production Deployment Gate

**File:** `.github/workflows/deploy-app.yml`  
**Action:**

- Configure GitHub Environments
- Add `environment: production` to production deployment step
- Require manual approval

**Estimated Time:** 20 minutes

### 5. Add Build Verification to All CI Workflows

**Files:**

- `.github/workflows/deploy-admin.yml`
- `.github/workflows/deploy-apex.yml`

**Action:** Add build verification steps similar to app workflow

**Estimated Time:** 15 minutes

---

## 🟢 Medium Priority (Nice to Have)

### 6. Create Deployment Runbook

**File:** `docs/deployment-runbook.md` (new)  
**Content:**

- Pre-deployment checklist
- Deployment steps per environment
- Rollback procedures
- Emergency contacts

**Estimated Time:** 1 hour

### 7. Add Status Command to cloudcache Script

**File:** `scripts/cloudcache`  
**New Command:** `status <module> <env>`

- Show deployment status
- Show secret status
- Show route status
- Show health check results

**Estimated Time:** 1 hour

### 8. Add Pre-flight Validation Script

**File:** `scripts/lib/preflight.sh` (new)  
**Checks:**

- Required tools installed (jq, wrangler, curl)
- Environment variables set
- Build artifacts exist
- KV namespaces exist
- Access policies configured

**Estimated Time:** 45 minutes

---

## 📋 Documentation Tasks

### 9. Update README.md

**File:** `README.md`  
**Add:**

- Quick start guide
- Setup instructions
- Link to detailed docs

**Estimated Time:** 30 minutes

### 10. Create Architecture Decision Records

**File:** `docs/adr/` (new directory)  
**ADRs to Create:**

- `001-why-app-bundles-but-admin-apex-dont.md`
- `002-kv-namespace-strategy.md`
- `003-build-system-choice.md`

**Estimated Time:** 1.5 hours

---

## 🧪 Testing Tasks

### 11. Add Integration Tests

**Files:** `tests/integration/` (new)  
**Tests:**

- OAuth flow end-to-end
- Access policy enforcement
- KV operations
- Health check endpoints

**Estimated Time:** 3-4 hours

### 12. Add Deployment Verification

**File:** `.github/workflows/deploy-app.yml`  
**Action:** Add smoke tests after deployment:

```yaml
- name: Verify Deployment
  run: |
    curl -f https://staging-app.cloudcache.ai/healthz || exit 1
    curl -f https://staging-app.cloudcache.ai/readyz || exit 1
```

**Estimated Time:** 15 minutes

---

## 🔧 Code Quality Improvements

### 13. Add KV Namespace Configuration for Admin/Apex (If Needed)

**Decision Required:** Do admin/apex modules need KV storage?

**If Yes:**

- Create KV namespaces via `wrangler kv namespace create`
- Add bindings to `wrangler.toml`
- Update `scripts/cloudcache` to handle KV for all modules

**Estimated Time:** 30 minutes

### 14. Standardize Package.json Scripts

**Files:**

- `apps/admin/package.json`
- `apps/apex/package.json`

**Action:** Ensure consistent script naming and structure

**Estimated Time:** 15 minutes

---

## 📊 Monitoring & Observability

### 15. Add Health Check Monitoring

**Action:**

- Configure monitoring for `/healthz` endpoints
- Set up alerts for failures
- Add dashboard

**Estimated Time:** 1 hour

### 16. Add Deployment Metrics

**Action:**

- Track deployment success/failure rates
- Track deployment times
- Track rollback frequency

**Estimated Time:** 1 hour

---

## Summary

**Total Estimated Time:**

- Critical: 45-75 minutes
- High Priority: 1.5-2 hours
- Medium Priority: 5-7 hours
- **Grand Total:** ~7-10 hours

**Recommended Sprint Plan:**

- **Sprint 1 (This Week):** Critical + High Priority items (2-3 hours)
- **Sprint 2 (Next Week):** Medium Priority items (5-7 hours)

---

## Quick Wins (Can Do Today)

1. ✅ Fix CI/CD build process (15 min)
2. ✅ Add build verification (15 min)
3. ✅ Document Shopify OAuth redirect URIs (30 min)
4. ✅ Add production deployment gate (20 min)

**Total:** ~1.5 hours for immediate improvements
