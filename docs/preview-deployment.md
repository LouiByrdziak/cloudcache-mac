# Preview Deployment Guide

## Overview

Preview deployments allow you to test changes in a production-like environment before merging to main. Each module (app, admin, apex) can be deployed to preview mode, which uses Cloudflare Workers.dev subdomains for Workers and Pages preview URLs for Pages projects.

## Preview URLs

### Workers (app, admin)

- **Pattern**: `https://{module}-worker-preview.workers.dev`
- **Examples**:
  - App: `https://app-worker-preview.workers.dev`
  - Admin: `https://admin-worker-preview.workers.dev`

### Pages (apex)

- **Pattern**: `https://{hash}-apex-cloudcache.pages.dev`
- **Note**: Preview URLs are generated dynamically per branch/deployment

## Manual Deployment

### Prerequisites

1. Ensure you have the required environment variables set:

   ```bash
   export CF_API_TOKEN="your-token"
   export CF_ACCOUNT_ID="your-account-id"
   ```

2. Build the module:

   ```bash
   # For Workers (app, admin)
   pnpm --filter @cloudcache/{module} build:bundle

   # For Pages (apex)
   pnpm --filter @cloudcache/apex build
   ```

### Deploy to Preview

#### Workers (app, admin)

```bash
cd apps/{module}
wrangler deploy --env preview --no-bundle
```

#### Pages (apex)

```bash
cd apps/apex
wrangler pages deploy .output --project-name=apex-cloudcache --branch={branch-name}
```

The deployment output will include the preview URL.

## Verification and Testing

### Step-by-Step Testing Guide

#### Option 1: Automated Testing (Recommended)

The easiest way to verify preview deployments is using the `cloudcache` script:

```bash
# For Workers (app, admin) - automatically constructs URL
scripts/cloudcache test-preview app
scripts/cloudcache test-preview admin

# For Pages (apex) - URL must be provided
scripts/cloudcache test-preview apex https://{hash}-apex-cloudcache.pages.dev
```

This command will:

1. Verify the preview URL is accessible
2. Test health endpoints (`/healthz`, `/readyz`, `/api/v1/ping` for app)
3. Run browser tests to verify visual markers (if Playwright is installed)

#### Option 2: Manual Visual Testing

**Step 1: Deploy to Preview**

If not already deployed via CI/CD, deploy manually:

```bash
# For Workers (app, admin)
cd apps/app  # or apps/admin
pnpm build:bundle
wrangler deploy --env preview --no-bundle

# For Pages (apex)
cd apps/apex
pnpm build
wrangler pages deploy .output --project-name=apex-cloudcache --branch=your-branch-name
```

**Step 2: Get Preview URL**

- **Workers**: The URL is `https://{module}-worker-preview.workers.dev`
  - App: `https://app-worker-preview.workers.dev`
  - Admin: `https://admin-worker-preview.workers.dev`
- **Pages**: The URL is shown in the deployment output (e.g., `https://{hash}-apex-cloudcache.pages.dev`)

**Step 3: Open in Browser**

Click or copy-paste the preview URL into your browser. You should see:

- **APEX**: Green text "I love Cloudcache APEX" centered on the page
- **APP**: Green text "I love Cloudcache APP" centered on the page
- **ADMIN**: Green text "I love Cloudcache ADMIN" centered on the page

**Step 4: Verify Visual Markers**

For each module, verify:

1. ✅ Page loads successfully (no errors)
2. ✅ Green text is visible (color: #00FF00)
3. ✅ Text is centered both vertically and horizontally
4. ✅ Text matches expected module name (APEX/APP/ADMIN)

**Step 5: Test Health Endpoints**

Open these URLs in your browser or use curl:

```bash
# Test health endpoints
curl https://app-worker-preview.workers.dev/healthz
curl https://app-worker-preview.workers.dev/readyz
curl https://app-worker-preview.workers.dev/api/v1/ping  # app only
```

Expected response: JSON with `{"status":"ok"}` or similar

#### Option 3: Interactive Browser Testing

Use the browser script to automatically open the preview URL:

```bash
# Open browser interactively
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev interactive
scripts/verify/preview-browser.sh admin https://admin-worker-preview.workers.dev interactive
scripts/verify/preview-browser.sh apex https://{hash}-apex-cloudcache.pages.dev interactive
```

This will:

1. Open Chrome browser automatically
2. Navigate to the preview URL
3. Display the page for manual visual inspection
4. You verify the green marker is visible and centered

### Manual Verification

#### Health Endpoints

```bash
# Test health endpoints
curl https://app-worker-preview.workers.dev/healthz
curl https://app-worker-preview.workers.dev/readyz
curl https://app-worker-preview.workers.dev/api/v1/ping  # app only
```

#### Visual Validation

Each module displays a green, centered validation marker on the root route:

- **APEX**: "I love Cloudcache APEX"
- **APP**: "I love Cloudcache APP"
- **ADMIN**: "I love Cloudcache ADMIN"

Open the preview URL in your browser and verify:

1. The page loads successfully
2. The green validation marker text is visible
3. The text is centered both vertically and horizontally

### Browser Testing

#### Interactive Testing

Open the preview URL in your browser:

```bash
# Open browser interactively
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev interactive
```

#### Automated Testing (with Playwright)

```bash
# Run headless browser tests
scripts/verify/preview-browser.sh app https://app-worker-preview.workers.dev headless
```

**Note**: Playwright must be installed for automated browser testing. Install it with:

```bash
pnpm add -D playwright
npx playwright install chromium
```

## CI/CD Integration

Preview deployments are automatically triggered on pull requests:

1. **Deployment**: Each module is automatically deployed to preview when a PR is opened
2. **Verification**: Health endpoints are automatically tested
3. **Output**: Preview URLs are displayed in the GitHub Actions logs

### Viewing Preview URLs in CI/CD

Preview URLs are output in the GitHub Actions workflow logs. Look for:

```
✅ Preview verification passed
Preview URL: https://...
```

## Troubleshooting

### Preview URL Not Accessible

1. **Check deployment status**:

   ```bash
   scripts/cloudcache status {module} preview
   ```

2. **Verify secrets are set**:

   ```bash
   scripts/cloudcache verify {module} preview
   ```

3. **Check Cloudflare dashboard**: Verify the Worker/Pages deployment exists

### Health Checks Failing

1. **Verify the deployment completed successfully**
2. **Check Cloudflare Worker logs**:

   ```bash
   wrangler tail --env preview
   ```

3. **Verify secrets are configured correctly**

### Visual Marker Not Visible

1. **Clear browser cache** and reload
2. **Check the HTML source** to verify the marker is present
3. **Verify the deployment includes the latest code changes**

### Pages Preview URL Not Found

For Pages deployments, the preview URL is generated dynamically. If you can't find it:

1. Check the GitHub Actions workflow logs for the deployment output
2. Use the Cloudflare dashboard to view Pages deployments
3. The URL pattern is: `https://{hash}-apex-cloudcache.pages.dev`

## Best Practices

1. **Always verify preview deployments** before requesting reviews
2. **Test all three modules** if changes affect shared packages
3. **Use browser testing** to verify visual changes
4. **Check health endpoints** to ensure functionality works
5. **Document any preview-specific issues** in PR comments

## Related Commands

- `scripts/cloudcache bootstrap {module} preview` - Bootstrap preview infrastructure
- `scripts/cloudcache bind {module} preview` - Set preview secrets
- `scripts/cloudcache verify {module} preview` - Verify preview configuration
- `scripts/cloudcache status {module} preview` - Show preview deployment status
- `scripts/cloudcache test-preview {module} [url]` - Test preview deployment

## See Also

- [Secrets Management](./secrets-management.md) - How to manage secrets for preview
- [Local Development](./local-development.md) - Local development setup
- [Architecture General](../ARCHITECTURE-GENERAL.md) - Architecture overview
