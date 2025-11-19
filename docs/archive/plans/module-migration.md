## Introduction & Execution Protocol

Checksum: **8855Rlb#**

- **Checksum confirmation**
  - At the beginning of **every new session**, the AI agent must confirm this plan’s checksum (`8855Rlb#`).
  - If the checksum does not match, the agent must **stop immediately** and reload the canonical plan before continuing.

- **Execution discipline**
  - The AI agent must execute **only the code blocks exactly as written** in this plan.
  - No modifications, substitutions, or re-ordering of steps are permitted.
  - The agent must not prompt the user to run code manually; execution must be applied directly as specified.
  - If any dependency or context is missing, the agent must stop and escalate, not improvise.

- **Step addressing**
  - Each step and sub-step is uniquely numbered (e.g., `Run Step 3.2`, `Run Step 6.3`).
  - The agent must execute **only** the explicitly requested sub-step when requested to `Run Step *.*`.
  - The agent must never “auto-advance” to another step.

- **Mandatory verification after every sub-step**

  After executing **each sub-step**, the agent must immediately:
  1. Execute the sub-step number & title, the checksum, and date timestamp.
  2. Display the resulting file diff (for edits) or console output (for commands).
  3. Confirm that expected files, directories, or outputs now exist in the correct place.
  4. Report any errors, warnings, or deviations right away.
  5. Pause and wait for explicit user confirmation before moving on.

- **Scope of plan**
  - This plan contains only runnable code for the defined steps.
  - The agent must not invent or infer additional steps beyond what is written.
  - If a step cannot be executed as written, the agent must stop, report the issue, and wait for instructions.

- **Idempotency & re-runs**
  - All steps are designed to run safely even if re-executed.
  - The agent must acknowledge when a sub-step was already satisfied (e.g., directory exists) and avoid duplicating work.

- **Audit trail**
  - Each executed sub-step must be logged with its number, the checksum, and date timestamp.
  - The agent must include this information in its output for verification.

🔑 **Key change from your draft:**
Agent understands **verification mandatory after every sub-step** (not just steps in general), so there’s no ambiguity: nothing proceeds without verification + confirmation at the most granular level.

---

# Cloudcache Module Migration Plan (Executable, History-Preserving)

> **⚠️ DISCLAIMER: FUTURE PLAN**
> This document outlines a proposed migration to a modular architecture.
> It does **NOT** reflect the current state of the codebase (`apps/` vs `modules/`).
> Do not execute these steps unless explicitly authorized to begin the migration.

Checksum: 8855Rlb#

## 1.0 — Scaffold Modules

### 1.1 — Create module and rules directories

```bash
mkdir -p modules/app modules/admin modules/apex shared
mkdir -p modules/app/src modules/admin/src modules/apex/src shared/src
mkdir -p modules/app/.cursor/rules modules/admin/.cursor/rules modules/apex/.cursor/rules
```

### 1.2 — Ensure build artifacts are gitignored (root)

```bash
grep -qxF '.open-next/' .gitignore || echo '.open-next/' >> .gitignore
grep -qxF 'dist/' .gitignore || echo 'dist/' >> .gitignore
grep -qxF 'node_modules/' .gitignore || echo 'node_modules/' >> .gitignore
```

### 1.3 — Create `open-next.config.ts` (per module)

```ts
// modules/<mod>/open-next.config.ts
import { defineConfig } from "open-next/config";
export default defineConfig({
  output: ".open-next",
  adapter: { name: "@opennextjs/cloudflare" },
});
```

### 1.4 — Create `wrangler.toml` with env routes (per module)

```toml
# modules/<mod>/wrangler.toml
name = "cloudcache-<mod>"
main = ".open-next/cloudflare/worker.js"
compatibility_date = "2025-09-01"

[assets]
directory = ".open-next/assets"

# Production (default)
# Replace with the module's prod route, e.g., app.cloudcache.ai/*
# routes = ["<prod-route>/*"]

# Example binding (rename per module and set real IDs)
[[d1_databases]]
binding = "<MOD>_D1"
database_name = "cloudcache_<mod>_prod"
database_id = "00000000-0000-0000-0000-000000000000"

[env.staging]
# routes = ["<staging-route>/*"]

[env.preview]
# Typically dev/preview via wrangler dev
```

### 1.5 — Create `package.json` scripts with unique ports (per module)

```json
{
  "name": "@cloudcache/<mod>",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p <PORT>", // app=3001, admin=3002, apex=3003
    "dev:port": "PORT=${PORT:-<PORT>} next dev -p $PORT",
    "build": "next build && open-next build",
    "preview": "wrangler dev --local",
    "deploy:workers": "pnpm run build && wrangler deploy",
    // Pages deploy removed: use staging hosts for previews
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "eslint .",
    "test": "vitest run --silent"
  },
  "devDependencies": {
    "open-next": "^latest",
    "@opennextjs/cloudflare": "^latest",
    "wrangler": "^3",
    "@cloudflare/workers-types": "^4",
    "typescript": "^5",
    "eslint": "^9",
    "prettier": "^3",
    "vitest": "^2"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18"
  }
}
```

### 1.6 — Create `tsconfig.json` (per module)

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "app", "pages", "open-next.config.ts"]
}
```

### 1.7 — Create module `.cursor/rules/ARCHITECTURE.mdc`

```md
---
scope: ["modules/<mod>/**"]
enforce: true
extends: "../../../ARCHITECTURE.mdc"
---

# <MOD> Module Rules

- Only use bindings prefixed `<MOD>_`.
- No imports from other modules; only from `shared/`.
```

### 1.8 — Create module `.cursorignore`

```txt
../apex/**
../admin/**
../app/**
.open-next/**
dist/**
node_modules/**
```

---

## 2.0 — Move Code Into Modules (History-Preserving)

### 2.1 — Move APP code into `modules/app/src/`

```bash
git mv src/app/* modules/app/src/ 2>/dev/null || true
find src/app -type d -empty -delete 2>/dev/null || true
```

### 2.2 — Move ADMIN code into `modules/admin/src/`

```bash
git mv src/admin/* modules/admin/src/ 2>/dev/null || true
find src/admin -type d -empty -delete 2>/dev/null || true
```

### 2.3 — Move APEX code into `modules/apex/src/`

```bash
git mv src/apex/* modules/apex/src/ 2>/dev/null || true
find src/apex -type d -empty -delete 2>/dev/null || true
```

### 2.4 — Remove any now-empty legacy directories

```bash
find src -type d -empty -delete 2>/dev/null || true
```

---

## 3.0 — Normalize Root

### 3.1 — Create `pnpm-workspace.yaml`

```yaml
packages:
  - "modules/*"
  - "shared"
```

### 3.2 — Create minimal root `package.json` (with overrides)

```json
{
  "name": "cloudcache",
  "private": true,
  "packageManager": "pnpm@9",
  "volta": { "node": "20.x", "pnpm": "9.x" },
  "scripts": {
    "dev:app": "pnpm --filter ./modules/app dev",
    "dev:admin": "pnpm --filter ./modules/admin dev",
    "dev:apex": "pnpm --filter ./modules/apex dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "verify": "echo VERIFY && node -v && pnpm -v && pnpm -r exec wrangler --version"
  },
  "devDependencies": {
    "typescript": "^5",
    "eslint": "^9",
    "prettier": "^3"
  },
  "pnpm": {
    "overrides": {
      "@cloudflare/next-on-pages": "0.0.0-invalid"
    }
  }
}
```

### 3.3 — Create `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

### 3.4 — Create root `ARCHITECTURE.mdc`

```md
---
scope: ["modules/**", "shared/**"]
enforce: true
---

# Cloudcache Global Architecture

- OpenNext + @opennextjs/cloudflare only.
- Per-module isolation: own package.json, wrangler, secrets, bindings.
- No cross-module imports; reuse only via `shared/`.
- Local secrets in `modules/<mod>/.env.local`; deploy secrets via `wrangler secret put`.
- All bindings must be `<MODULE>_*` and never reused across modules.
```

### 3.5 — Create global boundaries rule `.cursor/rules/boundaries.mdc`

```md
---
scope: ["modules/**"]
enforce: true
---

## Import Boundaries

- Forbid imports from sibling modules:
  - Patterns: "modules/_", "../../modules/_"

## Banned Dependencies

- "@cloudflare/next-on-pages" is disallowed.
```

---

## 4.0 — Wire Next / OpenNext / Wrangler

### 4.1 — Add `next.config.js` (per Next module)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { instrumentationHook: false },
};
module.exports = nextConfig;
```

### 4.2 — Set unique dev ports in each module (app/admin/apex)

```bash
jq '.scripts.dev="next dev -p 3001" | .scripts["dev:port"]="PORT=${PORT:-3001} next dev -p $PORT"' modules/app/package.json | sponge modules/app/package.json
jq '.scripts.dev="next dev -p 3002" | .scripts["dev:port"]="PORT=${PORT:-3002} next dev -p $PORT"' modules/admin/package.json | sponge modules/admin/package.json
jq '.scripts.dev="next dev -p 3003" | .scripts["dev:port"]="PORT=${PORT:-3003} next dev -p $PORT"' modules/apex/package.json | sponge modules/apex/package.json
```

> If `jq`/`sponge` aren’t available, edit the scripts by hand using the JSON shown in **1.5**.

---

## 5.0 — Clean Up

### 5.1 — Remove obsolete outputs and configs at root

```bash
rm -rf .cloudflare .vercel dist 2>/dev/null || true
git add -A
git status
```

---

## 6.0 — Verify End-to-End

### 6.1 — Install workspace and verify toolchain

```bash
pnpm install
pnpm run verify
```

### 6.2 — Typecheck and lint all packages

```bash
pnpm typecheck
pnpm lint
```

### 6.3 — Build each module (ensure `.open-next/` per module)

```bash
pnpm --filter ./modules/app build
pnpm --filter ./modules/admin build
pnpm --filter ./modules/apex build
```

### 6.4 — Local preview (one module at a time)

```bash
pnpm --filter ./modules/app preview
```

### 6.5 — Set module secrets (example for APP)

```bash
cd modules/app
npx wrangler secret put SHOPIFY_API_KEY
npx wrangler secret put SHOPIFY_API_SECRET
```

### 6.6 — Start tunnel for Shopify OAuth (APP)

```bash
cloudflared tunnel --url http://localhost:3001
```

---

That’s it—**six steps**, only the sub-steps we provided runnable code for, using **history-preserving moves**.o
