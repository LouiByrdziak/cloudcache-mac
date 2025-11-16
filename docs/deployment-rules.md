# Cloudflare Deployment Guide and Rules

## Overview

This document provides standardized procedures and rules for deploying Cloudflare Workers and Pages across all environments. All agents must follow these rules when deploying.

## Project Structure

### Modules

- **APEX** - Cloudflare Worker
- **ADMIN** - Cloudflare Worker
- **APP** - Cloudflare Worker

### Deployment Modes

Each module can be deployed in three modes:

- **preview** - Preview environment for testing
- **staging** - Staging environment for pre-production testing
- **production** - Production environment (requires confirmation)

### Deployment Platforms

Each deployment targets two platforms:

- **Cloudflare (cloud)** - Deployed to Cloudflare Workers.dev or custom domains
- **Localhost (developer machine)** - Local development server

## Detecting Deployment Requests

### When to Treat a Message as a Deployment

Treat a message as a deployment request when:

1. It starts with `/deploy`, OR
2. It clearly describes changes and explicitly mentions:
   - A module (APEX, ADMIN, or APP), AND
   - One or more modes (preview, staging, production)

### Preferred Convention

The user will start deployment messages with `/deploy`, for example:

- `/deploy APP preview ...`
- `/deploy ADMIN staging ...`
- `/deploy APEX production ...`
- `/deploy APP preview + staging ...`

### Assumptions

- **By default**: Assume one module per deployment
- **Multiple modules**: If the user explicitly names multiple modules in the same `/deploy` command, you may include them, but this is the exception, not the norm

## Deployment Process

When you detect a deployment request, do all of the following:

1. **Identify the target module(s)** - APEX, ADMIN, or APP
2. **Identify the target mode(s)** - preview, staging, production
3. **Identify the exact instructions/changes requested** - What code changes are being deployed
4. **Inject secrets and tokens** - Load required environment variables (CF_API_TOKEN, CF_ACCOUNT_ID) for deployment

## Deployment Rules Document Structure

### Module Information

- Three modules: `app` (APP), `admin` (ADMIN), `apex` (APEX)
- All are Cloudflare Workers
- Preview URLs: `https://{module}-worker-preview.cloudcache.workers.dev`
- Staging URLs: `https://staging-{module}.cloudcache.ai`
- Production URLs: `https://{module}.cloudcache.ai` (APP/ADMIN) or `https://cloudcache.ai` (APEX)

### Build Requirements

- **APP/ADMIN**: Use `pnpm build:bundle` (creates `dist/index.js`)
- **APEX**: Use `pnpm exec tsup src/index.ts --format esm` (creates `dist/index.mjs`)
- Always build before deploying
- Use `--no-bundle` flag with wrangler deploy (pre-built)

### Environment Variables

- Required: `CF_API_TOKEN`, `CF_ACCOUNT_ID`
- Wrangler uses: `CLOUDFLARE_API_TOKEN` (mapped from `CF_API_TOKEN`)
- Load from: `.env`, `.env.local` files
- Must be injected automatically when deployment is detected

### Deployment Commands

**Cloudflare (cloud) deployments:**

- Preview: `wrangler deploy --env preview --no-bundle`
- Staging: `wrangler deploy --env staging --no-bundle`
- Production: `wrangler deploy --env prod --no-bundle` (with confirmation)

**Localhost deployments:**

- **Single Command**: To start a local development server for all modules, run `pnpm dev` from the project root.
- **Individual Modules**: To start a single module, use its specific `pnpm dev` command (e.g., `pnpm --filter ./apps/admin dev`).
- Content must match preview URLs exactly

### Verification Requirements

- Test health endpoints: `/healthz`, `/readyz`, `/api/v1/ping` (app only)
- Verify visual markers: Green text "I love Cloudcache {MODULE}"
- Use: `bash scripts/cloudcache test-preview {module}`

### Post-Deployment Checklist

- Verify deployment URL is accessible
- Test all health endpoints
- Verify visual content matches expected markers
- **Generate deployment summary** - Only show module(s) and links relevant to the specific deployment
- Provide clickable links for verification (preview URLs and localhost URLs)

## Deployment Summary Format

When generating deployment summaries:

- **Only include the module(s) that were deployed**
- **Only include the mode(s) that were targeted**
- **Provide clickable links** for:
  - Preview URLs (if preview mode)
  - Staging URLs (if staging mode)
  - Production URLs (if production mode)
  - Localhost URLs (if localhost deployment)
- **Include quick test commands** for the deployed module(s)
- **Show expected visual content** for verification

Example format:

````
## Deployment Summary

**Module:** APP
**Mode:** preview
**Platform:** Cloudflare

### Clickable Preview Links
- Main: https://app-worker-preview.cloudcache.workers.dev
- Health: https://app-worker-preview.cloudcache.workers.dev/healthz
- Ready: https://app-worker-preview.cloudcache.workers.dev/readyz
- Ping: https://app-worker-preview.cloudcache.workers.dev/api/v1/ping

### Quick Test Commands
```bash
bash scripts/cloudcache test-preview app
````

### Expected Visual Content

- Green text (#00FF00): "I love Cloudcache APP" (centered)

```

## Standardized Deployment Script

The script will:

1. Parse deployment command (module, mode, instructions)
2. Validate module name (app/admin/apex)
3. Load environment variables and inject secrets
4. Build module with correct command
5. Deploy to specified environment(s)
6. Verify deployment
7. Output deployment URLs with clickable links
8. Run test commands
9. Generate deployment summary

## Rules Enforcement

### Pre-Deployment Checklist

- Always build before deploying (use correct build command per module)
- Always verify secrets are bound (`scripts/cloudcache verify <module> <env>`)
- Never skip environment variable checks (`CF_API_TOKEN`, `CF_ACCOUNT_ID`)
- Always stop stale processes before local development (`bash scripts/dev-stop.sh`)

### Deployment Rules

- Always use `--no-bundle` flag (pre-built artifacts)
- Never deploy to production without explicit confirmation
- Always verify deployment using health endpoints (not visual content)
- Always generate deployment summary with only relevant module(s) and mode(s)
- Always inject secrets/tokens automatically when deployment is detected

### Post-Deployment Checklist

- Always verify deployment using health endpoints
- Always provide clickable deployment URLs
- Always run test commands (`bash scripts/cloudcache test-preview <module>`)
- Always verify health endpoint JSON responses match expected format

### Secret Management Rules

- Never commit secrets to git (use `.gitignore` for `.env` files)
- Always use `scripts/cloudcache bind` for setting secrets (interactive prompts)
- Never use `.dev.vars` files (use remote bindings for local dev)
- Always verify secrets after binding (`scripts/cloudcache verify`)
- Separate secrets per environment (prod/staging/preview have different values)

### When Multiple Modules Specified

- Deploy each module separately
- Provide separate summaries for each module
- Each module maintains its own secrets and configuration

### Module Code Isolation

- **No Direct Imports**: Modules are self-contained and must not have direct source code dependencies on each other (e.g., no `import ../../apps/admin/...`).
- **Shared Code**: All shared functionality must be encapsulated in a dedicated package within the `packages/` directory and consumed as a versioned dependency.

```
