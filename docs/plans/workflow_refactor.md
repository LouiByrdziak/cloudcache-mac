# Workflow Refactor Plan (CTO/Lead Architect)

## Goals

- Shift-left: make checks visible and PR‑blocking instead of after‑the‑fact.
- Consistency: same Node/PNPM setup, triggers, and notifications across workflows.
- Safety toggles: per‑workflow off switch without deleting files.
- Minimal duplication: centralize common steps/versions.

## Current workflows (deep review)

- CI (.github/workflows/ci.yml)
- Runs on push + PR; typecheck/lint/format currently non‑blocking (|| true).
- Affects: developer feedback loop; does not prevent bad code from merging.
- Secrets Scan (.github/workflows/secrets-scan.yml)
- Runs on push to main + PR; blocks on leaked secrets via gitleaks.
- Affects: repository security posture; best as PR‑time check.
- Deploy (.github/workflows/deploy.yml)
- Runs on push to main; deploys changed workers based on src/ diff; uses account secrets.
- Affects: production release; should only run after PR checks are green.
- Policy guards
- pages-dev-ban.yml: scans code paths for `pages.dev`/`wrangler pages`.
- plan-location-guard.yml: blocks `one.plan.md` & plan files outside docs/plans/.
- Affects: policy compliance at PR‑time; can be merged into one workflow with two jobs.

## Design decisions

- Make CI PR‑only and blocking; remove “|| true” so errors fail checks.
- Secrets Scan PR‑only; not on push to main to reduce noise.
- Deploy main‑only; rely on branch protection to ensure deploy runs only after CI/guards/secrets are green.
- Combine the two policy guards into one workflow (two jobs) for simplicity; keep responsibilities separate via job names.
- Add per‑workflow off switches via repository variables (no code deletion):
- vars.ENABLE_CI, vars.ENABLE_SECRETS_SCAN, vars.ENABLE_POLICY_GUARDS, vars.ENABLE_DEPLOY
- Wrap each job with `if: ${{ vars.ENABLE_* != false }}`
- Add explicit notifications via GitHub check results (and optional step to print a short summary comment on PR).
- Centralize Node/PNPM versions via env and/or a shared composite action.

## Implementation steps

1) CI (blocking PR checks)

- Trigger: `on: [pull_request]`
- Setup Node/PNPM consistently; remove `|| true` from typecheck/lint/format.
- Optional: add a `format:check` script (prevents auto‑format on CI) and ensure `pnpm run format:check` exists.
- Add toggle: `if: ${{ vars.ENABLE_CI != false }}` on the job.

2) Secrets Scan (PR‑only)

- Trigger: `on: [pull_request]`
- Keep gitleaks action; ensure `.gitleaks.toml` tuned.
- Add toggle: `if: ${{ vars.ENABLE_SECRETS_SCAN != false }}`.

3) Policy guards (combine)

- New `.github/workflows/policy-guards.yml` with two jobs:
- ban-pages-dev (code paths: src, scripts, packages, .github)
- guard-plan-location (blocks `one.plan.md` and plan files outside docs/plans/)
- Trigger: `on: [pull_request]`
- Add toggle: `if: ${{ vars.ENABLE_POLICY_GUARDS != false }}`.
- Retire the two existing guard workflows after the new one is added (delete files in a follow‑up PR).

4) Deploy (main‑only)

- Trigger: `on: push: branches: [main]`
- Ensure it runs only after PR checks by using GitHub’s branch protection (required status checks: CI, Secrets Scan, Policy Guards).
- Add toggle: `if: ${{ vars.ENABLE_DEPLOY != false }}`.
- Keep diff‑based worker deployment.

5) Centralize environment versions

- Create `.github/workflows/_env.yml` (or a shared composite action) containing common env:
- `NODE_VERSION: 22`, `PNPM_VERSION: 9`.
- Reference these in CI and Deploy to avoid drift, or factor into a composite action under `.github/actions/setup-node-pnpm/`.

6) Local shift‑left (optional but recommended)

- Add `lefthook.yml` (or husky) with:
- pre‑commit: `pnpm run format:check`, `pnpm run lint:quick`
- pre‑push: `pnpm run typecheck`
- Document in README how to install the hook.

7) Visibility & notifications

- Keep checks PR‑blocking (branch protection rules).
- Optional: add a step to echo a summary of failures (type/lint/format) so the PR shows a clear reason.

8) Documentation

- Add `docs/plans/workflow_refactor.md` (this file) describing the operating model, toggles, and how to disable a workflow during incidents.
- Update README “Contributing” section with local hooks and how to read CI statuses.

## How to disable a workflow quickly

- Go to GitHub → Settings → Secrets and variables → Actions → Variables, set:
- `ENABLE_CI=false` to disable CI job
- `ENABLE_SECRETS_SCAN=false` to disable secrets job
- `ENABLE_POLICY_GUARDS=false` to disable guard jobs
- `ENABLE_DEPLOY=false` to disable deploy job
- Or temporarily rename the workflow file (last resort).

## Testing and rollout

- Create a PR with new/updated workflows in parallel (do not delete old guards until the new policy-guards passes).
- Validate:
- PR with a lint error fails CI.
- PR containing `pages.dev` in code fails policy guards.
- PR that passes all checks merges; deploy runs on merge to main when toggles are enabled.

## Rollback

- Revert the workflow changes via GitHub’s “Revert” or restore the previous YAMLs.
- Re-enable toggles by removing the `false` value from repo variables.

## Todos

- [ ] Implement CI changes (blocking PR checks + toggle)
- [ ] Move Secrets Scan to PR‑only + toggle
- [ ] Create policy-guards.yml (merge existing guards) + toggle; retire old guards
- [ ] Add toggles to Deploy; enforce required checks via branch protection
- [ ] Centralize Node/PNPM versions (env or composite action)
- [ ] Add local hooks (lefthook or husky) and README docs
- [ ] Update docs/plans/workflow_refactor.md with final state and links

### To-dos

- [ ] Make CI PR-only, blocking; add ENABLE_CI toggle
- [ ] Move secrets-scan to PR-only; add ENABLE_SECRETS_SCAN toggle
- [ ] Create policy-guards.yml with two jobs; add ENABLE_POLICY_GUARDS toggle; retire old guards
- [ ] Add ENABLE_DEPLOY toggle to deploy; rely on required checks
- [ ] Centralize Node/PNPM versions via shared env/composite action
- [ ] Add pre-commit/pre-push hooks and README docs
- [ ] Finalize docs/plans/workflow_refactor.md with operating model and toggles
