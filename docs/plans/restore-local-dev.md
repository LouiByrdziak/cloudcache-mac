# Restore Local Development Configuration

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Canonical Source**: `docs/all-system-truth.md`

## Review of Technical Opinion

**Verdict:** The opinion is **Correct**.

-   **Root Cause:** The introduction of the `--remote` flag in `package.json` scripts forced `wrangler` to attempt a remote connection, triggering authentication requirements and the need for `cloudflared`.
-   **Resolution:** We **do not** need to install or update Cloudflare tools. The correct fix is to revert the uncommitted changes (removing `--remote`) and ensure local environment variables are present to handle the "intermittent" 500 errors (which are actually due to missing configuration).

## Implementation Plan

1.  **Enforce Local Dev Mode (Code Changes)**

    -   **Action**: Verify and ensure the `--remote` flag is removed from the `dev` scripts in:
        -   `apps/admin/package.json`
        -   `apps/apex/package.json`
        -   `apps/app/package.json`
    -   **Action**: Create `apps/app/.dev.vars` with dummy credentials to satisfy startup requirements and prevent 500 errors.

2.  **Update Documentation (Truth)**

    -   **Action**: Update `docs/all-local-dev-truth.md` to reflect the **Local-First** strategy.
        -   Replace "remote bindings" overview with "local bindings".
        -   Update "Environment Variables" section to require `.dev.vars` for local development secrets.
        -   Remove "Best Practice" about avoiding `.dev.vars`.

3.  **Create Implementation Plan Record**

    -   **Action**: Create `docs/plans/restore-local-dev.md` capturing this plan and the rationale, following the naming convention.

4.  **Verification**

    -   **Action**: Run `pnpm test:validation` to confirm the system is stable, fast, and passes all checks without external dependencies.

