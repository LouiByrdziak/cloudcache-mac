# ADR 001: Build Strategy for Workspace Dependencies

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Canonical Source**: `docs/all-system-truth.md`

---

**Status:** Accepted  
**Date:** 2025-11-14  
**Deciders:** Lead Architect, CTO

## Context

Cloudcache uses a pnpm monorepo with workspace dependencies. The `app` and `admin` modules depend on shared packages (`@cloudcache/platform-*`), while the `apex` module uses a different deployment strategy (Cloudflare Pages).

When deploying Cloudflare Workers, we encountered issues with esbuild (used by wrangler) resolving workspace dependencies from pnpm's `.pnpm` structure. This led to deployment failures with errors like:

```
Could not resolve "@cloudcache/platform-env"
The Yarn Plug'n'Play manifest forbids importing...
```

## Decision

We will use different build strategies for different modules:

1. **App & Admin Modules (Workers):** Pre-bundle workspace dependencies using `tsup` with custom configuration
2. **Apex Module (Pages):** Use Astro's build system (no bundling needed)

## Rationale

### Why Bundle for App/Admin?

1. **pnpm Workspace Resolution:** esbuild (used by wrangler) doesn't natively understand pnpm's `.pnpm` structure. Pre-bundling resolves this at build time.

2. **Deployment Reliability:** Bundled artifacts are self-contained and don't depend on runtime module resolution, reducing deployment failures.

3. **Performance:** Bundled code is optimized and smaller, improving Worker cold start times.

4. **Consistency:** Both modules use the same workspace dependencies, so they benefit from the same bundling approach.

### Why Not Bundle for Apex?

1. **Different Deployment Target:** Apex uses Cloudflare Pages, which handles Astro builds differently.

2. **No Workspace Dependencies:** Apex doesn't import `@cloudcache/platform-*` packages, so bundling isn't needed.

3. **Astro Build System:** Astro's build system handles dependencies correctly without custom configuration.

## Implementation

### App & Admin Modules

**Build Configuration:**

- `tsup.config.ts` with custom esbuild options
- Resolves workspace packages from source (`packages/*/src/index.ts`)
- Resolves external dependencies (like `zod`) from pnpm's `.pnpm` structure
- Outputs bundled `dist/index.js`

**Wrangler Configuration:**

- `main = "dist/index.js"` (pre-built bundle)
- Deploy with `--no-bundle` flag to prevent wrangler from re-bundling

**CI/CD:**

- Build step: `pnpm --filter @cloudcache/<module> build:bundle`
- Verify artifact: `test -f apps/<module>/dist/index.js`
- Deploy: `wrangler deploy --no-bundle`

### Apex Module

**Build Configuration:**

- Uses Astro's default build system
- No custom bundling needed

**Deployment:**

- Uses `wrangler pages deploy` command
- Astro handles all bundling internally

## Consequences

### Positive

- ✅ Reliable deployments for Workers modules
- ✅ Faster Worker cold starts (smaller bundles)
- ✅ Consistent build process across app/admin
- ✅ Clear separation of concerns (Workers vs Pages)

### Negative

- ⚠️ Additional build step required for app/admin
- ⚠️ Slightly longer CI/CD pipeline
- ⚠️ Need to maintain `tsup.config.ts` for each Worker module

### Neutral

- Build artifacts (`dist/index.js`) are committed (or could be gitignored)
- Different deployment commands for different modules

## Alternatives Considered

### Alternative 1: Use wrangler's bundler for all modules

**Rejected because:**

- esbuild doesn't resolve pnpm workspace dependencies correctly
- Would require workarounds or patches
- Less control over build output

### Alternative 2: Don't bundle, use external dependencies

**Rejected because:**

- Cloudflare Workers don't support npm-style module resolution
- Would require publishing packages to npm registry
- Adds complexity and maintenance overhead

### Alternative 3: Bundle all modules uniformly

**Rejected because:**

- Apex doesn't need bundling (Astro handles it)
- Would add unnecessary complexity
- Different deployment targets have different requirements

## References

- [CTO Review](./cto-review-2025-11-14.md) - Initial findings
- [tsup Documentation](https://tsup.egoist.dev/)
- [Cloudflare Workers Bundling](https://developers.cloudflare.com/workers/wrangler/bundling/)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## Notes

- This decision may need revisiting if Cloudflare improves workspace dependency resolution
- Consider monitoring bundle sizes to ensure they stay within Worker limits
- Review build times periodically to ensure they remain acceptable
