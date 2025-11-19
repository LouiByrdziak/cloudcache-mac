# System Truth

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Related**: `docs/all-git-truth.md`

This document is the **single source of truth** for all deployment and validation procedures for the Cloudcache project. It is the definitive entry point for any developer, new or experienced, and its guidance trumps any conflicting information found in archived files or legacy documentation.

Our primary goal is to maintain a clean, simple, and reliable pipeline. To that end, all core logic has been consolidated into a small number of master scripts.

---

## The Golden Path

Follow these procedures for all standard operations.

### To Deploy a Module

We use a single, master script for all deployments. It is parameterized to target any module and environment.

**Command:**
`bash scripts/deploy-module.sh <module> <environment>`

**Usage Examples:**

- Deploy `app` to preview: `bash scripts/deploy-module.sh app preview`
- Deploy `apex` to staging: `bash scripts/deploy-module.sh apex staging`

### To Deploy All Modules to Preview

A simple wrapper script exists for this common task.

**Command:**
`pnpm deploy:preview` (This is a shortcut for `bash scripts/deploy-preview.sh`)

### To Validate Deployments

We use a single, master script for validating all environments.

**Command:**
`pnpm test:validation` (This is a shortcut for `bash scripts/cloudcache test deployments`)

---

## Manifest of Core Scripts

| Script                                                    | Purpose                                                                                       | Canonical Doc(s)                       |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| `scripts/all-git-truth.sh`                                | Single entry point for `--pre-commit`, `--validate-md`, and credential-safe git operations.   | `docs/all-git-truth.md`                |
| `scripts/deploy-module.sh`                                | Builds & deploys one module (app/admin/apex) to any environment with retry + health checks.   | `docs/all-deployment-truth.md`         |
| `scripts/deploy-preview.sh`                               | Wrapper that deploys all modules to preview environment sequentially.                         | `docs/all-deployment-truth.md`         |
| `scripts/validation/run-validation.sh`                    | Automated validation suite (local + remote) used by `pnpm test:validation`.                   | `docs/all-deployment-truth.md`         |
| `scripts/dev-local.sh` / `scripts/dev-stop.sh`            | Sequential local server startup with health checks and cleanup.                               | `docs/all-local-dev-truth.md`          |
| `scripts/lib/core.sh`                                     | Shared shell helpers (logging, kill_port, env loading). Imported by every operational script. | `docs/all-system-truth.md` (this file) |
| `scripts/configure-access.sh`, `scripts/access/verify.sh` | Zero Trust helpers for managing Access policies and verifying bindings.                       | `docs/zero-trust/support-bundle.md`    |
| `scripts/shopify/scopes-assert.sh`                        | Verifies Shopify OAuth scopes before deployment.                                              | `docs/shopify-oauth-setup.md`          |
| `scripts/cf/inventory-snapshot.sh`                        | Audits Cloudflare resources for compliance/incident response.                                 | `docs/operational-runbook.md`          |

> **Reminder:** When a script changes, update both the table above and the relevant truth document. If a script becomes obsolete, move it to `scripts/archive/` and add the archive header.

---

## Document & Archive Hierarchy

1. **System Truth (this file)** – Golden Path, ownership, and script manifest.
2. **Git Truth (`docs/all-git-truth.md`)** – Hook policies, EPERM troubleshooting, and documentation enforcement.
3. **Deployment Truth (`docs/all-deployment-truth.md`)** – Preview/staging URLs, validation commands, and health endpoints.
4. **Local Dev Truth (`docs/all-local-dev-truth.md`)** – Remote bindings, port map, and troubleshooting for Wrangler dev.
5. **Supporting Guides** – Operational Runbook, Secrets Management, Shopify OAuth, Zero Trust support bundle/tokens. Each guide links back to its canonical truth doc.
6. **Archives (`docs/archive/**`)\*\* – Historical reference only. Every archived file must include the archive header and a pointer back to the active truth doc.
7. **Auto-generated Reports (`docs/reports/validation/**`)\*\* – CI artifacts; never commit manually. Pre-commit checks unstaged copies automatically.

Generated content and archives should never drift from the truth docs. If a process changes, update the truth file first, then regenerate or retire the derived documents.

By adhering to this structure, we will prevent architectural drift and ensure a stable, predictable, and reliable system for all developers.
