# Cloudcache Architecture - General Guidelines

- Modules are isolated: no cross-imports between `src/app`, `src/admin`, and `src/apex`.
- Public APIs are defined and re-exported from each module's `index.ts`.
- Prefer pure, side-effect-free modules; avoid top-level I/O and global state.
- Encapsulate environment-specific code (Cloudflare, Node, browser) behind interfaces.
- Follow strict typing; avoid `any`. Keep types near their domains.
- Errors are explicit; do not swallow. Use result types or typed errors.
- Testing: unit tests mock external I/O and network. Keep deterministic.
- Performance: avoid unnecessary allocations; cache with clear invalidation strategies.
- Security: validate inputs, least-privilege for tokens/keys, avoid secrets in code.
- Documentation: keep `.cursor/rules/ARCHITECTURE.mdc` per module aligned with this file.
- The End!!

## Domain Policy

- Production: `app.cloudcache.ai`, `admin.cloudcache.ai`, `cloudcache.ai` (plus `www.cloudcache.ai`)
- Staging: `staging-app.cloudcache.ai`, `staging-admin.cloudcache.ai`, `staging-apex.cloudcache.ai`
- Preview (Pages): `[hash].app-cloudcache.pages.dev`, `[hash].admin-cloudcache.pages.dev`, `[hash].apex-cloudcache.pages.dev`
