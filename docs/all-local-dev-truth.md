# Local Development Truth

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Related**: `docs/all-system-truth.md`

This guide explains how to develop locally using Cloudcache's **local-first** approach with `.dev.vars`.

## Overview

Local development uses **local bindings** configured via `.dev.vars` files to simulate runtime environment variables. This ensures fast, offline-capable development loops without requiring `wrangler login` for every session.

## Prerequisites

1. **Wrangler CLI** installed:
   ```bash
   npm install -g wrangler
   # No login required for local-only dev
   ```
2. **pnpm** installed (see root `package.json`)
3. **Dependencies** installed: `pnpm install`

## Running Workers Locally

| Module | Root Command     | Module Command              | Port |
| ------ | ---------------- | --------------------------- | ---- |
| APP    | `pnpm dev:app`   | `cd apps/app && pnpm dev`   | 8789 |
| ADMIN  | `pnpm dev:admin` | `cd apps/admin && pnpm dev` | 8787 |
| APEX   | `pnpm dev:apex`  | `cd apps/apex && pnpm dev`  | 8788 |

> **Start/stop helpers**
>
> - `bash scripts/dev-local.sh` builds all modules, clears stale ports, and starts servers sequentially with health checks.
> - `bash scripts/dev-stop.sh` stops every dev server (or press `Ctrl+C` inside the `dev-local.sh` terminal).

## Local Bindings Configuration

Local bindings are configured implicitly by Wrangler when not using the `--remote` flag.

The `wrangler.toml` should **NOT** have `remote = true` in the `[dev]` section (or it should be set to false/removed).

This tells Wrangler to:

- Use local resources
- Use `.dev.vars` for secrets
- Avoid remote authentication checks during startup

## Environment Variables

### Required for Local Dev

**Runtime secrets** (e.g., `SHOPIFY_API_KEY`, `CF_ACCESS_CLIENT_ID`) are required for the worker to start correctly.

1. **Create `.dev.vars`** in the module directory (e.g., `apps/app/.dev.vars`).
2. **Populate with dummy values** for local testing (or real dev keys if needed):

   ```bash
   # Core secrets (required for worker startup)
   SHOPIFY_API_KEY="dummy_key"
   SHOPIFY_API_SECRET="dummy_secret"
   CF_ACCESS_CLIENT_ID="dummy_id"
   CF_ACCESS_CLIENT_SECRET="dummy_secret"
   
   # Cloudflare Zone API secrets (required for toggle sync functionality)
   # These are needed to call the Cloudflare Zone Settings API at runtime
   CF_API_TOKEN="your_cloudflare_api_token"
   CF_ACCOUNT_ID="your_cloudflare_account_id"
   CF_ZONE_ID="your_cloudflare_zone_id"
   ```

### Toggle Sync Feature

The APP module includes a toggle synchronization feature that calls the Cloudflare Zone Settings API to enable/disable settings like Rocket Loader, Brotli compression, etc. This requires:

- `CF_API_TOKEN`: Cloudflare API token with Zone:Edit permissions
- `CF_ACCOUNT_ID`: Your Cloudflare account ID (found in dashboard sidebar)
- `CF_ZONE_ID`: The zone ID for cloudcache.ai (found in domain overview)

**For local testing with real Cloudflare sync:**
```bash
# Option 1: Use remote bindings (fetches secrets from preview Worker)
cd apps/app && wrangler dev --remote --port 8789

# Option 2: Use .dev.vars with real credentials
# Update apps/app/.dev.vars with real CF_API_TOKEN, CF_ACCOUNT_ID, CF_ZONE_ID
```

### Optional Local Config

- `.env`: Can be used for build-time variables or CLI tokens (`CF_API_TOKEN`), but `.dev.vars` is preferred for Worker runtime secrets.

## Testing

### Unit Tests

```bash
# Run tests for a specific module
pnpm --filter @cloudcache/app test

# Run all tests
pnpm test
```

### Integration Tests

Use Miniflare for local integration testing (see `packages/test-utils`).

### Manual Testing

1. Start local dev server: `pnpm dev:app`
2. Make requests: `curl http://localhost:8789/healthz`
3. Check logs in terminal

## Troubleshooting & Quick Edits

### Updating Worker HTML Content

When editing HTML content in Cloudflare Workers (wrangler dev), changes may not appear immediately due to caching.

**Solution Process:**

1. **Verify File Change**: Check `src/index.ts`.
2. **Clear Cache**: `rm -rf .wrangler` in the module directory.
3. **Restart Dev Server**:
   ```bash
   bash scripts/dev-stop.sh
   pnpm dev
   ```
4. **Hard Refresh**: Cmd+Shift+R in browser.

**Prevention**: Add cache-control headers to responses.

```typescript
return new Response(html, {
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  },
});
```

### Common Issues

**"Missing environment variable"**

- Run `scripts/cloudcache verify` to check secrets
- Ensure you're authenticated: `wrangler login`
- Check `wrangler.toml` has `[dev] remote = true`

**"Worker not found"**

- Run `scripts/cloudcache bootstrap` to create infrastructure
- Verify Worker name matches `wrangler.toml`

**"Authentication failed"**

- Run `wrangler login` to re-authenticate
- Check `CF_API_TOKEN` is set (for CLI operations)

## Best Practices

1. **Use `.dev.vars`** for local secrets - Ensure it is git-ignored.
2. **Test locally** before pushing.
3. **Use Preview Deployments** for testing in a cloud environment with real remote secrets.
4. **Check logs** for correlation IDs when debugging.
