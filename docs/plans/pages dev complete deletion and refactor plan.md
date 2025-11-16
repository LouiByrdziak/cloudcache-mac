# Pages.dev Complete Deletion and Refactor Plan

## Purpose (CTO brief)

Fully remove Cloudflare Pages (pages.dev) from Cloudcache. All preview and non‑production access will be served via our canonical TLD modules and staging subdomains (`staging-apex|app|admin.cloudcache.ai`). Delete Pages projects and scrub all `.pages.dev` references from Cloudflare and the repo; add guardrails to prevent reintroduction.

## Scope

- Cloudflare: Pages projects, any Access apps bound to `.pages.dev`, DNS pointing to `.pages.dev`.
- Repository: scripts, configs, CI, docs, inventories referencing Pages or `pages.dev`.
- Replacement: staging subdomains for previews; no Pages in workflow.

## Steps (high level)

1. Inventory & backup current state (Pages projects, Access apps with `.pages.dev`, DNS records that point to `.pages.dev`, repo hits).
2. Delete Pages projects; verify removal via list.
3. Delete Access apps that reference `.pages.dev`; verify via list.
4. Delete DNS records that point to `.pages.dev`; verify via zone list and curl.
5. Repo refactor: remove `pages.dev` references and `wrangler pages`; delete `pages_inventory.tsv`; update docs to staging-based previews.
6. Guardrails: CI job to fail on `pages.dev` or `wrangler pages`; optional pre-commit; CODEOWNERS; `.cursor/rules/pages_ban.mdc`.
7. Verify and record: repo grep 0 hits; Cloudflare lists clean; write migration note.
8. Marker/resume: update one.plan marker and resume primary plan.

## Tokens/permissions

- Cloudflare: Pages RW, Access RW, DNS RW; account/zone IDs.
- Repo write for scripts/CI/docs.

## Rollback

- Recreate Pages projects (if explicitly re‑approved) and restore DNS/Access entries as needed using inventories.

---

## Accomplishments (completed)

- Cloudflare inventories (all zero results):
  - Pages projects: saved JSON with count 0 → `docs/zero-trust/archive/pages_projects-20251014T143634Z.json`
  - Access apps on `.pages.dev`: saved JSON with count 0 → `docs/zero-trust/archive/access_apps_pagesdev-20251014T143645Z.json`
  - DNS records pointing to `.pages.dev`: saved JSON with count 0 → `docs/zero-trust/archive/dns_pagesdev-20251014T143703Z.json`
- Repository changes:
  - Deleted `pages_inventory.tsv`.
  - Removed pages.dev preview comments in `src/apex|admin|app/wrangler.toml` (now state “use staging ... (no Pages)”).
  - Updated `scripts/snapshot-cloudflare-inventory.sh` to stop exporting Pages projects.
  - Added `docs/zero-trust/PREVIEW_POLICY.md` (staging-only previews).
  - Added CI guard `.github/workflows/pages-dev-ban.yml` (scans code paths only).
  - Added `.cursor/rules/pages_ban.mdc` to discourage future pages.dev usage.

## Validation / Testing

- Cloudflare API checks:
  - Pages projects list returned 0; Access apps with `.pages.dev` returned 0; DNS records ending in `.pages.dev` returned 0 (see inventory files above).
- Repo scan (code paths only: src/, scripts/, packages/, .github/):
  - No matches for `pages.dev` or `wrangler pages` (plan/docs may still reference these terms for audit, which is intended).
- CI guard:
  - Enforces the ban on introducing `pages.dev`/`wrangler pages` in code paths going forward.

## Status

- All `.pages.dev` artifacts are removed from Cloudflare and the repository.
- Guardrails are in place to prevent reintroduction.
- Previews are documented as staging-only (`staging-apex|app|admin.cloudcache.ai`).
