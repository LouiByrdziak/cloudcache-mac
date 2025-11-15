# Deploy Preview Modules Now

## Quick Deploy Script

Run this single command to deploy all modules to preview with the latest code:

```bash
scripts/deploy-preview.sh
```

This will:

1. ✅ Build all three modules
2. ✅ Deploy APP to preview
3. ✅ Deploy ADMIN to preview
4. ✅ Deploy APEX to preview
5. ✅ Display all preview URLs

## Manual Deployment (If Script Fails)

### APP Module

```bash
cd apps/app
pnpm build:bundle
wrangler deploy --env preview --no-bundle
```

**Preview URL:** https://app-worker-preview.workers.dev

### ADMIN Module

```bash
cd apps/admin
pnpm build:bundle
wrangler deploy --env preview --no-bundle
```

**Preview URL:** https://admin-worker-preview.workers.dev

### APEX Module

```bash
cd apps/apex
pnpm build
wrangler pages deploy .output --project-name=apex-cloudcache --branch=$(git branch --show-current)
```

**Preview URL:** Check deployment output or Cloudflare dashboard

## Prerequisites

Ensure you have:

- `CF_API_TOKEN` environment variable set
- `CF_ACCOUNT_ID` environment variable set
- `wrangler` CLI installed and authenticated

## Verify After Deployment

After deployment, click each URL and verify:

- ✅ Green text "I love Cloudcache {MODULE}" is visible
- ✅ Text is centered both horizontally and vertically
- ✅ Text color is bright green (#00FF00)
- ✅ Page loads without errors

## Troubleshooting

If deployment fails:

1. Check environment variables: `echo $CF_API_TOKEN`
2. Verify wrangler authentication: `wrangler whoami`
3. Check build output: Ensure `dist/index.js` exists for Workers
4. Check APEX build: Ensure `.output` directory exists
