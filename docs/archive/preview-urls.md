# Preview Deployment URLs

**DEPRECATED**: This file has been consolidated.  
**See**: `docs/all-deployment-truth.md`

**Migration Date**: 2025-11-19
**Archived On**: 2025-11-19 13:50:00

---

## Clickable Preview URLs

### APP Module

**URL:** [https://app-worker-preview.cloudcache.workers.dev](https://app-worker-preview.cloudcache.workers.dev)

**Status:** ✅ **DEPLOYED AND WORKING** - Visual marker "I love Cloudcache APP" is live!

**Expected Content:**

- Green text "I love Cloudcache APP" centered on page
- Health endpoints: `/healthz`, `/readyz`, `/api/v1/ping`

**To Make Accessible:**

```bash
cd apps/app
pnpm build:bundle
wrangler deploy --env preview --no-bundle
```

---

### ADMIN Module

**URL:** [https://admin-worker-preview.cloudcache.workers.dev](https://admin-worker-preview.cloudcache.workers.dev)

**Status:** ⚠️ **DEPLOYED BUT NEEDS SECRETS** - Deployed but missing CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET. Run `scripts/cloudcache bind admin preview` to configure.

**Expected Content:**

- Green text "I love Cloudcache ADMIN" centered on page
- Health endpoints: `/healthz`, `/readyz`

**To Make Accessible:**

```bash
# Bootstrap and configure
scripts/cloudcache bootstrap admin preview
scripts/cloudcache bind admin preview

# Deploy
cd apps/admin
pnpm build:bundle
wrangler deploy --env preview --no-bundle
```

---

### APEX Module

**URL:** [https://apex-worker-preview.cloudcache.workers.dev](https://apex-worker-preview.cloudcache.workers.dev)

**Status:** ✅ **DEPLOYED AND WORKING** - Visual marker "I love Cloudcache APEX" is live!

**Expected Content:**

- Green text "I love Cloudcache APEX" centered on page
- Health endpoints: `/healthz`, `/readyz`

---

## Quick Access Summary

| Module    | Preview URL                                                                                                | Status           |
| --------- | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| **APP**   | [https://app-worker-preview.cloudcache.workers.dev](https://app-worker-preview.cloudcache.workers.dev)     | ✅ **WORKING**   |
| **ADMIN** | [https://admin-worker-preview.cloudcache.workers.dev](https://admin-worker-preview.cloudcache.workers.dev) | ⚠️ Needs Secrets |
| **APEX**  | [https://apex-worker-preview.cloudcache.workers.dev](https://apex-worker-preview.cloudcache.workers.dev)   | ✅ **WORKING**   |

## Visual Verification Checklist

When you click each URL, verify:

- [ ] Page loads without errors
- [ ] Green text is visible (bright green #00FF00)
- [ ] Text is centered horizontally
- [ ] Text is centered vertically (middle of screen)
- [ ] Text matches module name:
  - APP: "I love Cloudcache APP"
  - ADMIN: "I love Cloudcache ADMIN"
  - APEX: "I love Cloudcache APEX"

## Health Endpoint URLs

### APP Module

- Health: [https://app-worker-preview.workers.dev/healthz](https://app-worker-preview.workers.dev/healthz)
- Ready: [https://app-worker-preview.workers.dev/readyz](https://app-worker-preview.workers.dev/readyz)
- Ping: [https://app-worker-preview.workers.dev/api/v1/ping](https://app-worker-preview.workers.dev/api/v1/ping)

### ADMIN Module

- Health: [https://admin-worker-preview.workers.dev/healthz](https://admin-worker-preview.workers.dev/healthz)
- Ready: [https://admin-worker-preview.workers.dev/readyz](https://admin-worker-preview.workers.dev/readyz)

### APEX Module

- Health: `https://apex-worker-preview.cloudcache.workers.dev/healthz`
- Ready: `https://apex-worker-preview.cloudcache.workers.dev/readyz`

---

**Note:** These URLs will be fully functional once the modules are deployed with the latest code that includes the visual validation markers.
