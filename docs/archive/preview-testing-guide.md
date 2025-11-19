# Preview Testing Guide - Step-by-Step Instructions

**DEPRECATED**: This file has been consolidated.  
**See**: `docs/all-deployment-truth.md`

**Migration Date**: 2025-11-19
**Archived On**: 2025-11-19 13:50:00

---

## Quick Start: How to Test Preview Deployments

### Automated Testing (No Manual Clicks Required)

Run these commands to automatically test all preview deployments:

```bash
# Test APP module
scripts/cloudcache test-preview app

# Test ADMIN module
scripts/cloudcache test-preview admin

# Test APEX module (requires URL from deployment)
scripts/cloudcache test-preview apex https://{hash}-apex-cloudcache.pages.dev
```

**What this does automatically:**

- ✅ Verifies the preview URL is accessible
- ✅ Tests `/healthz` endpoint
- ✅ Tests `/readyz` endpoint
- ✅ Tests `/api/v1/ping` endpoint (app only)
- ✅ Verifies visual markers exist in HTML (if Playwright installed)

**No manual clicking required** - everything runs automatically!

### Manual Visual Verification (Requires Browser)

If you want to **visually see** the green markers in your browser:

#### Step 1: Get Preview URLs

**For APP:**

```bash
echo "https://app-worker-preview.workers.dev"
```

**For ADMIN:**

```bash
echo "https://admin-worker-preview.workers.dev"
```

**For APEX:**

- Check GitHub Actions workflow logs after PR deployment
- Or run: `wrangler pages deployment list --project-name=apex-cloudcache`

#### Step 2: Open URLs in Browser

**Option A: Use the script to auto-open:**

```bash
# Opens browser automatically
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev interactive
scripts/verify/preview-browser.sh admin https://admin-worker-preview.workers.dev interactive
scripts/verify/preview-browser.sh apex https://{hash}-apex-cloudcache.pages.dev interactive
```

**Option B: Manually copy-paste URLs:**

1. Copy the preview URL
2. Paste into your browser address bar
3. Press Enter

#### Step 3: Verify Visual Markers

For each module, you should see:

- **APEX**: Large green text "I love Cloudcache APEX" centered on page
- **APP**: Large green text "I love Cloudcache APP" centered on page
- **ADMIN**: Large green text "I love Cloudcache ADMIN" centered on page

**Visual Checklist:**

- [ ] Page loads without errors
- [ ] Green text is visible (bright green color)
- [ ] Text is centered horizontally
- [ ] Text is centered vertically (middle of screen)
- [ ] Text matches the module name

## Complete Testing Workflow

### Scenario 1: Testing After CI/CD Deployment (Pull Request)

**What happens automatically:**

1. PR is created → CI/CD deploys to preview
2. CI/CD runs verification automatically
3. Preview URL is shown in GitHub Actions logs

**What you need to do:**

1. Check GitHub Actions workflow for "Verify Preview Deployment" step
2. Look for the preview URL in the logs
3. (Optional) Click the URL to visually verify

**No manual commands needed** - CI/CD handles everything!

### Scenario 2: Testing Local Changes Before PR

**Step 1: Build and Deploy**

```bash
# For APP
cd apps/app
pnpm build:bundle
wrangler deploy --env preview --no-bundle

# For ADMIN
cd apps/admin
pnpm build:bundle
wrangler deploy --env preview --no-bundle

# For APEX
cd apps/apex
pnpm build
wrangler pages deploy .output --project-name=apex-cloudcache --branch=test-branch
```

**Step 2: Run Automated Tests**

```bash
# From project root
scripts/cloudcache test-preview app
scripts/cloudcache test-preview admin
# For apex, use the URL from deployment output
scripts/cloudcache test-preview apex https://{url-from-output}
```

**Step 3: (Optional) Visual Verification**

```bash
# Auto-open browser
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev interactive
```

Or manually:

1. Copy URL: `https://app-worker-preview.workers.dev`
2. Paste in browser
3. Verify green text is visible and centered

## Testing All Three Modules

### Quick Test Script

Create a test script to test all modules at once:

```bash
#!/bin/bash
# test-all-preview.sh

echo "Testing APP module..."
scripts/cloudcache test-preview app || echo "APP test failed"

echo ""
echo "Testing ADMIN module..."
scripts/cloudcache test-preview admin || echo "ADMIN test failed"

echo ""
echo "Testing APEX module..."
echo "Note: APEX requires manual URL. Get it from deployment output."
# scripts/cloudcache test-preview apex <URL>
```

### Individual Module Testing

**APP Module:**

```bash
# Automated
scripts/cloudcache test-preview app

# Visual (auto-open browser)
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev interactive

# Visual (manual)
# Open: https://app-worker-preview.workers.dev
```

**ADMIN Module:**

```bash
# Automated
scripts/cloudcache test-preview admin

# Visual (auto-open browser)
scripts/verify/preview-browser.sh admin https://admin-worker-preview.workers.dev interactive

# Visual (manual)
# Open: https://admin-worker-preview.workers.dev
```

**APEX Module:**

```bash
# Get URL first (from deployment or CI/CD logs)
APEX_URL="https://{hash}-apex-cloudcache.pages.dev"

# Automated
scripts/cloudcache test-preview apex "$APEX_URL"

# Visual (auto-open browser)
scripts/verify/preview-browser.sh apex "$APEX_URL" interactive

# Visual (manual)
# Open: $APEX_URL
```

## Troubleshooting

### "Preview URL not found"

**For Workers (app/admin):**

- URL is always: `https://{module}-worker-preview.workers.dev`
- Verify deployment succeeded: `wrangler deployments list --env preview`

**For Pages (apex):**

- Check deployment output for the URL
- Or check Cloudflare dashboard → Pages → apex-cloudcache → Deployments

### "Health check failed"

1. Verify deployment completed: `scripts/cloudcache status {module} preview`
2. Check secrets are set: `scripts/cloudcache verify {module} preview`
3. Check Worker logs: `wrangler tail --env preview`

### "Visual marker not visible"

1. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
2. Verify deployment includes latest code
3. Check HTML source for `.validation-marker` class
4. Verify CSS is loading (check browser DevTools)

## Summary: What Requires Manual Action?

| Action                  | Manual Required? | Command/Script                                                 |
| ----------------------- | ---------------- | -------------------------------------------------------------- |
| Run automated tests     | ❌ No            | `scripts/cloudcache test-preview {module}`                     |
| Verify health endpoints | ❌ No            | Included in test-preview                                       |
| See visual markers      | ✅ Yes (browser) | `scripts/verify/preview-browser.sh {module} {url} interactive` |
| Get preview URL         | ⚠️ Sometimes     | Workers: auto, Pages: from deployment                          |
| Deploy to preview       | ⚠️ If not CI/CD  | `wrangler deploy --env preview`                                |

## Next Steps

1. **For automated testing**: Use `scripts/cloudcache test-preview {module}`
2. **For visual verification**: Use `scripts/verify/preview-browser.sh {module} {url} interactive`
3. **For CI/CD**: Everything runs automatically on PR creation

No manual clicking required for automated tests - everything runs in the terminal!
