# Local Development Truth

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Related**: `docs/all-system-truth.md`

This guide explains how to develop locally using Cloudcache's **no-local-secrets** approach with remote bindings.

## Overview

Local development uses **remote bindings** to fetch secrets from Cloudflare, eliminating the need for `.env` or `.dev.vars` files for runtime secrets.

## Prerequisites

1. **Wrangler CLI** installed and authenticated:
   ```bash
   npm install -g wrangler
   wrangler login
   ```
2. **pnpm** installed (see root `package.json`)
3. **Dependencies** installed: `pnpm install`

## Running Workers Locally

### APP Module
```bash
pnpm dev:app
# or
cd apps/app && pnpm dev
```
Runs on port **8789**.

### ADMIN Module
```bash
pnpm dev:admin
# or
cd apps/admin && pnpm dev
```
Runs on port **8787**.

### APEX Module
```bash
pnpm dev:apex
# or
cd apps/apex && pnpm dev
```
Runs on port **8788**.

## Remote Bindings Configuration

Remote bindings are configured in `wrangler.toml`:

```toml
[dev]
remote = true
```

This tells Wrangler to:
- Fetch secrets from Cloudflare (not local files)
- Use remote Workers runtime for accurate testing
- Avoid exposing secrets locally

## Environment Variables

### Required for Local Dev
Only these config values are needed locally (can be in `.env`):
- `CF_API_TOKEN`: For Wrangler CLI operations
- `CF_ACCOUNT_ID`: For Wrangler CLI operations
- `CF_ZONE_ID`: For DNS/routing operations (if needed)

**Note**: Runtime secrets (`SHOPIFY_API_KEY`, `CF_ACCESS_CLIENT_ID`, etc.) are **not** needed locally - they're fetched from Cloudflare.

### Optional Local Config
You can create `.env.local` for local-only overrides (not committed).

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

1. **Use remote bindings** - Don't create `.dev.vars` files
2. **Test locally** before pushing
3. **Use Preview Deployments** for testing in a cloud environment
4. **Check logs** for correlation IDs when debugging
5. **Verify secrets** with `scripts/cloudcache verify` if issues occur
