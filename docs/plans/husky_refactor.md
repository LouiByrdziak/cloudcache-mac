<!-- e893d855-7664-4263-9b6d-5804c4c08e2c 044b9a43-8473-4975-ab35-9fba3f1f8b9c -->

# Minimal Husky Guardrails for Cloudcache

## Goal

Add fast, local guardrails that run automatically from Cursor’s Sidebar Commit/Push, catch issues before they leave your laptop, and reduce CI/IDE noise. No changes to your Git flow; no extra branches.

## Scope (minimal, fast)

- Pre-commit: staged-file formatting and linting only (≤3–5s)
- Pre-push: structural checks (actionlint, TS typecheck), optional secrets scan
- Degrade gracefully if optional tools are not installed (no hard failures for missing extras)

## Assumptions

- Package manager: PNPM (monorepo)
- Node project with TypeScript, shell scripts, markdown, workflows
- macOS is primary dev OS

## Implementation Steps

1. Dev dependencies (repo)
   - Ensure these exist at root (skip if already present):
     - husky, lint-staged, prettier, eslint
   - Optional local tools (per-machine, not in package.json):
     - actionlint (brew install actionlint) for workflow lint
     - shellcheck, shfmt (brew install shellcheck shfmt) for shell sanity
     - gitleaks (brew install gitleaks) for optional secrets scan

2. Initialize Husky
   - Run: pnpm dlx husky init
   - This creates `.husky/` and wires Git hooks.

3. lint-staged configuration (package.json)
   - Add minimal, fast rules (staged files only):

```json
{
  "lint-staged": {
    "*.{js,ts,tsx,json,md,yml,yaml}": ["prettier --check"],
    "*.{js,ts,tsx}": ["eslint --max-warnings=0"],
    "*.sh": ["shfmt -d", "shellcheck -S warning"]
  }
}
```

4. .husky/pre-commit (fast)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Staged-only, fast (<5s) — blocks obvious issues
pnpm dlx lint-staged
```

5. .husky/pre-push (structural; still quick)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint GitHub workflows if actionlint is available
if command -v actionlint >/dev/null 2>&1; then
  actionlint || { echo "actionlint failed"; exit 1; }
else
  echo "actionlint not installed; skipping"
fi

# TypeScript sanity (no emit; monorepo root tsconfig)
if pnpm -v >/dev/null 2>&1; then
  pnpm -w tsc -p tsconfig.base.json --noEmit || {
    echo "Typecheck failed"; exit 1;
  }
fi

# Optional secrets scan (skip if not installed)
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --no-banner --staged --redact || {
    echo "Secrets scan failed"; exit 1;
  }
else
  echo "gitleaks not installed; skipping"
fi
```

6. Scripts (optional quality-of-life in package.json)

- Add if missing:

```json
{
  "scripts": {
    "format": "prettier -w .",
    "format:check": "prettier -c .",
    "lint": "eslint .",
    "lint:quick": "eslint --max-warnings=0 .",
    "typecheck": "tsc -p tsconfig.base.json --noEmit"
  }
}
```

7. Documentation (1 paragraph in README.md)

- Document that Husky runs automatically from the Sidebar Commit/Push.
- Note: set HUSKY=0 to bypass in emergencies; keep pre-commit fast; heavy checks belong in pre-push/CI.

8. Verify locally

- Make a small change, Commit in Sidebar: pre-commit should format/lint staged files quickly.
- Push in Sidebar: pre-push should run actionlint + typecheck; see helpful messages if something fails.

## What this catches (before CI)

- Misformatted code, basic lint issues
- Broken/invalid GitHub workflow YAML (via actionlint)
- Type errors that would fail CI
- Optional: accidental secrets in staged changes

## What stays in GitHub Actions

- Full test/build/deploy workflows and artifacts (no repo logging, no extra branches)

## Rollback

- Delete `.husky/` directory and the `lint-staged` block in package.json to disable hooks.

## Notes

- Keep pre-commit under ~5 seconds by design; move anything heavy to pre-push/CI.
- Tools like actionlint/shellcheck/shfmt/gitleaks are optional; when missing, hooks skip them with a clear message.

### To-dos

- [ ] Add dev deps: husky, lint-staged, prettier, eslint
- [ ] Initialize Husky at repo root with pnpm dlx husky init
- [ ] Add lint-staged block to package.json
- [ ] Create .husky/pre-commit running pnpm dlx lint-staged
- [ ] Create .husky/pre-push with actionlint/typecheck/gitleaks (optional)
- [ ] Add format, format:check, lint, lint:quick, typecheck scripts
- [ ] Document Husky behavior and bypass in README
- [ ] Test commit/push in Sidebar; confirm hooks run and are fast
