# Secrets Management Guide

This document explains how secrets are managed in Cloudcache using a **no-local-secrets** approach.

## Overview

All runtime secrets are stored in Cloudflare (Workers secrets or Pages environment variables). Local development uses remote bindings, so no `.env` or `.dev.vars` files are needed for runtime secrets.

## Secret Placement

### Workers (APP & ADMIN modules)

Secrets are stored per Worker and per environment using `wrangler secret put`:

- **app-worker** (production): `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`
- **app-worker-staging**: Same secrets, different values
- **app-worker-preview**: Same secrets, different values
- **admin-worker** (production): `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`
- **admin-worker-staging**: Same secrets, different values
- **admin-worker-preview**: Same secrets, different values

### Pages (APEX module)

Environment variables are stored per environment via Cloudflare API:

- **apex-cloudcache** (production): `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`
- **apex-cloudcache** (staging): Same vars, different values
- **apex-cloudcache** (preview): Same vars, different values

### CI/CD

- `CF_API_TOKEN`: Stored in GitHub Secrets (deploy-only token, least privilege)
- `CF_ACCOUNT_ID`: Can be in GitHub Secrets or workflow file (not a secret)

## Commands

### Bootstrap Infrastructure

```bash
# Bootstrap a module for an environment
scripts/cloudcache bootstrap <module> <env>

# Examples:
scripts/cloudcache bootstrap app prod
scripts/cloudcache bootstrap admin staging
scripts/cloudcache bootstrap apex preview
```

### Bind Secrets

```bash
# Bind secrets interactively for a module/environment
scripts/cloudcache bind <module> <env>

# Examples:
scripts/cloudcache bind app prod
scripts/cloudcache bind admin staging
scripts/cloudcache bind apex preview
```

### Verify Setup

```bash
# Verify infrastructure and secrets
scripts/cloudcache verify <module> <env>

# Examples:
scripts/cloudcache verify app prod
scripts/cloudcache verify admin staging
scripts/cloudcache verify apex preview
```

### Manual Secret Management

#### Workers

```bash
# Set a secret for a Worker
wrangler secret put SECRET_NAME --name <worker-name> --env <env>

# List secrets for a Worker
wrangler secret list --name <worker-name> --env <env>

# Examples:
wrangler secret put SHOPIFY_API_KEY --name app-worker --env staging
wrangler secret list --name app-worker --env staging
```

#### Pages

Pages environment variables are managed via Cloudflare dashboard or API. Use `scripts/cloudcache bind` for interactive setup.

## Local Development

### Workers

Use `wrangler dev --remote` to run locally with remote bindings:

```bash
cd apps/app
pnpm dev  # Uses wrangler dev --remote automatically
```

No `.dev.vars` file needed - secrets are fetched from Cloudflare.

### Pages

For APEX (Astro Pages), use Preview Deployments when features need secrets. For static work, use `astro dev` locally.

## Break-Glass Procedures

### Lost Access to Secrets

1. **Rotate secrets** in the source system (Shopify, Cloudflare Access, etc.)
2. **Update secrets** in Cloudflare using `scripts/cloudcache bind` or manual `wrangler secret put`
3. **Verify** using `scripts/cloudcache verify`

### Secret Rotation

1. Generate new secret values
2. Update secrets in Cloudflare (old and new can coexist briefly)
3. Verify application works with new secrets
4. Remove old secrets if needed

### Emergency Access

If you need to access secrets for debugging:

```bash
# View secret names (not values) for a Worker
wrangler secret list --name <worker-name> --env <env>

# For Pages, check environment variables in Cloudflare dashboard
```

**Note**: Secret values cannot be retrieved once set. You must rotate if lost.

## Security Best Practices

1. **Never commit** `.env`, `.dev.vars`, or actual secret values
2. **Use least-privilege** tokens for CI/CD
3. **Rotate secrets** regularly
4. **Separate environments** - never share secrets between preview/staging/production
5. **Use remote bindings** for local dev - never create local secret files

## Troubleshooting

### "Environment validation failed"

This means required secrets are missing. Run `scripts/cloudcache verify` to check which secrets are missing, then use `scripts/cloudcache bind` to set them.

### "Worker not found"

Run `scripts/cloudcache bootstrap` to create the Worker infrastructure.

### Local dev not working

Ensure `[dev] remote = true` is set in `wrangler.toml` and you're authenticated with `wrangler login`.
