# Local Development Guide

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

3. **Dependencies** installed:
   ```bash
   pnpm install
   ```

## Running Workers Locally

### APP Module

```bash
# From project root
pnpm dev:app

# Or from apps/app directory
cd apps/app
pnpm dev
```

This runs `wrangler dev --remote` which:
- Fetches secrets from Cloudflare Workers
- Runs locally on port 8789
- Hot-reloads on code changes

### ADMIN Module

```bash
# From project root
pnpm dev:admin

# Or from apps/admin directory
cd apps/admin
pnpm dev
```

Runs on port 8787 with remote bindings.

### APEX Module

For APEX (Astro Pages SSR):

**Static development** (no secrets needed):
```bash
cd apps/apex
pnpm dev  # Uses astro dev
```

**With secrets** (use Preview Deployments):
- Push to a branch
- Preview deployment is created automatically
- Access via Preview URL (protected by Access if configured)

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

You can create `.env.local` for local-only overrides (not committed):

```bash
# .env.local (optional, gitignored)
CF_ACCOUNT_ID=your_account_id
CF_ZONE_ID=your_zone_id
```

## Testing

### Unit Tests

```bash
# Run tests for a specific module
pnpm --filter @cloudcache/app test

# Run all tests
pnpm test
```

### Integration Tests

Use Miniflare for local integration testing (see `packages/test-utils`):

```typescript
import { createMiniflare, mockKV } from '@cloudcache/test-utils';

const mf = createMiniflare({
  script: '...',
  bindings: {
    MY_KV: mockKV({ key: 'value' }),
  },
});
```

### Manual Testing

1. Start local dev server: `pnpm dev:app`
2. Make requests: `curl http://localhost:8789/healthz`
3. Check logs in terminal

## Debugging

### View Logs

Logs appear in the terminal where `wrangler dev` is running. They include:
- Correlation IDs for request tracing
- Structured JSON format
- Request/response details

### Tailing Production Logs

```bash
# Tail logs for a Worker
wrangler tail --name app-worker

# Tail with filters
wrangler tail --name app-worker --format pretty
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

## Hot Reload

Wrangler dev automatically reloads on code changes. No need to restart manually.

## Port Configuration

Default ports (configured in `package.json`):
- APP: 8789
- ADMIN: 8787
- APEX: 8788 (if using Astro dev)

## Best Practices

1. **Use remote bindings** - Don't create `.dev.vars` files
2. **Test locally** before pushing
3. **Use Preview Deployments** for APEX when secrets are needed
4. **Check logs** for correlation IDs when debugging
5. **Verify secrets** with `scripts/cloudcache verify` if issues occur

