# Preview Test Execution Plan

## 🎯 Objective

Test and verify preview deployments for all three modules (APP, ADMIN, APEX) with visual validation markers.

---

## 📋 Test Modules Overview

| Module    | Type              | Preview URL                                                                                                | Status         |
| --------- | ----------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| **APP**   | Cloudflare Worker | [https://app-worker-preview.cloudcache.workers.dev](https://app-worker-preview.cloudcache.workers.dev)     | ✅ **PASSING** |
| **ADMIN** | Cloudflare Worker | [https://admin-worker-preview.cloudcache.workers.dev](https://admin-worker-preview.cloudcache.workers.dev) | ✅ **PASSING** |
| **APEX**  | Cloudflare Worker | [https://apex-worker-preview.cloudcache.workers.dev](https://apex-worker-preview.cloudcache.workers.dev)   | ✅ **PASSING** |

---

## 🔗 Physical Test URLs

### APP Module (Worker)

**Main Page:**

- [https://app-worker-preview.cloudcache.workers.dev](https://app-worker-preview.cloudcache.workers.dev)

**Health Endpoints:**

- [Health Check](https://app-worker-preview.cloudcache.workers.dev/healthz)
- [Ready Check](https://app-worker-preview.cloudcache.workers.dev/readyz)
- [Ping API](https://app-worker-preview.cloudcache.workers.dev/api/v1/ping)

**Expected Visual Content:**

- ✅ Large green text: **"I love Cloudcache APP"**
- ✅ Centered horizontally and vertically
- ✅ Bright green color (#00FF00)
- ✅ Clean, minimal page design

---

### ADMIN Module (Worker)

**Main Page:**

- [https://admin-worker-preview.cloudcache.workers.dev](https://admin-worker-preview.cloudcache.workers.dev)

**Health Endpoints:**

- [Health Check](https://admin-worker-preview.cloudcache.workers.dev/healthz)
- [Ready Check](https://admin-worker-preview.cloudcache.workers.dev/readyz)

**Expected Visual Content:**

- ✅ Large green text: **"I love Cloudcache ADMIN"**
- ✅ Centered horizontally and vertically
- ✅ Bright green color (#00FF00)
- ✅ Clean, minimal page design

---

### APEX Module (Worker)

**Main Page:**

- [https://apex-worker-preview.cloudcache.workers.dev](https://apex-worker-preview.cloudcache.workers.dev)

**Health Endpoints:**

- [Health Check](https://apex-worker-preview.cloudcache.workers.dev/healthz)
- [Ready Check](https://apex-worker-preview.cloudcache.workers.dev/readyz)

**Expected Visual Content:**

- ✅ Large green text: **"I love Cloudcache APEX"**
- ✅ Centered horizontally and vertically
- ✅ Bright green color (#00FF00)
- ✅ Includes welcome message: "Welcome to Cloudcache" and "I love Cloudcache"

---

## 📝 Step-by-Step Testing Instructions

### Phase 1: Automated Testing (No Browser Required)

Run these commands to automatically verify all endpoints:

```bash
# Test APP module
scripts/cloudcache test-preview app

# Test ADMIN module
scripts/cloudcache test-preview admin

# Test APEX module
scripts/cloudcache test-preview apex
```

**What This Tests:**

- ✅ Root endpoint accessibility (200 OK)
- ✅ `/healthz` endpoint (200 OK)
- ✅ `/readyz` endpoint (200 OK)
- ✅ `/api/v1/ping` endpoint (APP only, 200 OK)
- ✅ HTML content contains visual markers

---

### Phase 2: Visual Verification (Browser Required)

#### Step 1: Open Preview URLs

**Option A: External Chrome Browser**

- Click the links below, or copy/paste URLs into Chrome

**Option B: Cursor Integrated Browser**

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type `Simple Browser: Show`
3. Enter the preview URL when prompted

**APP Module:**

1. URL: `https://app-worker-preview.cloudcache.workers.dev`
2. Verify you see: **"I love Cloudcache APP"** in bright green, centered on page

**ADMIN Module:**

1. URL: `https://admin-worker-preview.cloudcache.workers.dev`
2. Verify you see: **"I love Cloudcache ADMIN"** in bright green, centered on page

**APEX Module:**

1. URL: `https://apex-worker-preview.cloudcache.workers.dev`
2. Verify you see:
   - "Welcome to Cloudcache" (orange header)
   - "I love Cloudcache" (orange subheader)
   - **"I love Cloudcache APEX"** (bright green, centered)

---

### Phase 3: Local Development Testing (Same Content as Preview)

**Prerequisites:**

```bash
# Build and start local dev servers
bash scripts/dev-local.sh
pnpm dev
```

#### Step 1: Open Local Development URLs

**Option A: External Chrome Browser**

```bash
bash scripts/open-local-chrome.sh
```

This opens all three local URLs in external Chrome.

**Option B: Cursor Integrated Browser**

**Click these links in Cursor (they will open automatically):**

- [http://localhost:8789](http://localhost:8789) - APP Module
- [http://localhost:8787](http://localhost:8787) - ADMIN Module
- [http://localhost:8788](http://localhost:8788) - APEX Module

**Or use the script:**

```bash
bash scripts/open-local-cursor.sh
```

This automatically opens all three URLs in Cursor's integrated browser.

**Manual method (if links don't work):**

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type `Simple Browser: Show`
3. Enter the URL: `http://localhost:8789` (or 8787, 8788)

#### Step 2: Verify Local Content (Same as Preview)

**APP Module (localhost:8789):**

- Verify you see: **"I love Cloudcache APP"** in bright green, centered on page
- **Same content as preview URL**

**ADMIN Module (localhost:8787):**

- Verify you see: **"I love Cloudcache ADMIN"** in bright green, centered on page
- **Same content as preview URL**

**APEX Module (localhost:8788):**

- Verify you see:
  - "Welcome to Cloudcache" (orange header)
  - "I love Cloudcache" (orange subheader)
  - **"I love Cloudcache APEX"** (bright green, centered)
- **Same content as preview URL**

#### Step 3: Visual Checklist (Applies to Both Preview and Local)

For each module, verify:

- [ ] **Page loads** without errors (no 404, 500, or timeout)
- [ ] **Green text is visible** (bright green color #00FF00)
- [ ] **Text is centered horizontally** (middle of screen left-to-right)
- [ ] **Text is centered vertically** (middle of screen top-to-bottom)
- [ ] **Text matches module name**:
  - APP: "I love Cloudcache APP"
  - ADMIN: "I love Cloudcache ADMIN"
  - APEX: "I love Cloudcache APEX"
- [ ] **No console errors** (check browser DevTools Console)
- [ ] **Page is responsive** (try resizing browser window)

#### Step 3: Test Health Endpoints

Click each health endpoint URL above and verify:

- [ ] `/healthz` returns `200 OK` with JSON response
- [ ] `/readyz` returns `200 OK` with JSON response
- [ ] `/api/v1/ping` (APP only) returns `200 OK` with JSON response

---

### Phase 3: Automated Browser Testing (Optional)

If you have Playwright installed, run automated browser tests:

```bash
# Interactive mode (opens browser)
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev interactive
scripts/verify/preview-browser.sh admin https://admin-worker-preview.workers.dev interactive
scripts/verify/preview-browser.sh apex https://apex-worker-preview.workers.dev interactive

# Headless mode (no browser window)
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev headless
scripts/verify/preview-browser.sh admin https://admin-worker-preview.workers.dev headless
scripts/verify/preview-browser.sh apex https://apex-worker-preview.workers.dev headless
```

---

## 🚀 Deployment Instructions

### Deploy All Modules to Preview

To deploy all three modules with the latest code:

```bash
scripts/deploy-preview.sh
```

This will:

1. Build APP module
2. Deploy APP to preview
3. Build ADMIN module
4. Deploy ADMIN to preview
5. Build APEX module
6. Deploy APEX to preview

### Deploy Individual Modules

**APP Module:**

```bash
cd apps/app
pnpm build:bundle
wrangler deploy --env preview --no-bundle
```

**ADMIN Module:**

```bash
cd apps/admin
pnpm build:bundle
wrangler deploy --env preview --no-bundle
```

**APEX Module:**

```bash
cd apps/apex
pnpm exec tsup src/index.ts --format esm
wrangler deploy --env preview --no-bundle
```

---

## 🔧 Troubleshooting

### Issue: Page shows blank or 404

**Solution:**

1. Verify deployment completed: `scripts/cloudcache status {module} preview`
2. Deploy latest code: `scripts/deploy-preview.sh`
3. Wait 30-60 seconds for Cloudflare propagation
4. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Green text not visible

**Solution:**

1. Check HTML source (View Page Source) for `.validation-marker` class
2. Verify CSS is loading (check browser DevTools → Network tab)
3. Ensure latest code is deployed with visual markers
4. Try incognito/private browsing mode

### Issue: Health endpoints return errors

**Solution:**

1. Check secrets are configured: `scripts/cloudcache verify {module} preview`
2. Set secrets if missing: `scripts/cloudcache bind {module} preview`
3. Check Worker logs: `wrangler tail --env preview --name {module}-worker-preview`
4. Verify deployment status: `wrangler deployments list --env preview`

### Issue: Secrets not working (ADMIN module)

**Solution:**

```bash
# Configure secrets for ADMIN preview
scripts/cloudcache bind admin preview

# Enter when prompted:
# - CF_ACCESS_CLIENT_ID: (your client ID)
# - CF_ACCESS_CLIENT_SECRET: (your client secret)
```

---

## ✅ Success Criteria

All tests pass when:

- [x] **Automated tests** complete without errors
- [x] **Visual markers** are visible on all three modules
- [x] **Health endpoints** return 200 OK
- [x] **Text is centered** both horizontally and vertically
- [x] **Green color** matches specification (#00FF00)
- [x] **No console errors** in browser DevTools
- [x] **Page loads** within 2 seconds

---

## 📊 Test Results Template

Use this template to record test results:

```markdown
## Test Execution Date: [DATE]

### APP Module

- [ ] Automated tests: PASS / FAIL
- [ ] Visual marker visible: YES / NO
- [ ] Health endpoints: PASS / FAIL
- [ ] Notes: [any issues or observations]

### ADMIN Module

- [ ] Automated tests: PASS / FAIL
- [ ] Visual marker visible: YES / NO
- [ ] Health endpoints: PASS / FAIL
- [ ] Notes: [any issues or observations]

### APEX Module

- [ ] Automated tests: PASS / FAIL
- [ ] Visual marker visible: YES / NO
- [ ] Health endpoints: PASS / FAIL
- [ ] Notes: [any issues or observations]
```

---

## 🎯 Quick Reference

**All Preview URLs:**

- APP: [https://app-worker-preview.cloudcache.workers.dev](https://app-worker-preview.cloudcache.workers.dev)
- ADMIN: [https://admin-worker-preview.cloudcache.workers.dev](https://admin-worker-preview.cloudcache.workers.dev)
- APEX: [https://apex-worker-preview.cloudcache.workers.dev](https://apex-worker-preview.cloudcache.workers.dev)

**Quick Test Command:**

```bash
scripts/cloudcache test-preview app && \
scripts/cloudcache test-preview admin && \
scripts/cloudcache test-preview apex
```

**Quick Deploy Command:**

```bash
scripts/deploy-preview.sh
```

---

**Last Updated:** 2025-11-15
**Status:** ✅ All modules ready for testing
