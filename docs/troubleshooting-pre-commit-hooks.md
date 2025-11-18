# Git Commit Pre-Commit Hook Failures - Troubleshooting Guide

## Issue: November 17, 2025

### Problem

Pre-commit hooks failing with:

```
✖ prettier --check:
[warn] docs/bugfix-check-health-url-detection.md
[warn] docs/understanding-validation-failures.md
[warn] scripts/validation/helpers/check-health.js
[warn] Code style issues found in 3 files.
```

### Root Causes

1. **Prettier formatting not applied** - New/modified files weren't formatted before staging
2. **Validation reports accidentally staged** - Auto-generated reports shouldn't be committed
3. **ESLint process killed** - SIGKILL due to performance issues in husky hooks

### Solutions Implemented

#### 1. Added `.prettierignore` Rule (Already Present)

```
# Don't format auto-generated validation reports
docs/reports/
```

This prevents validation reports from being checked/formatted.

#### 2. Format Files Before Commit

```bash
# Always run before committing:
pnpm exec prettier --write <files>

# Or format everything:
pnpm exec prettier --write .
```

#### 3. Unstage Auto-Generated Files

```bash
# Don't commit validation reports:
git reset docs/reports/
```

### Prevention Strategy

#### Rule #1: Run Prettier Before Staging

```bash
# Good workflow:
pnpm exec prettier --write docs/ scripts/
git add .
git commit -m "Your message"
```

#### Rule #2: Never Stage docs/reports/

Validation reports are auto-generated and should stay local.

Add to `.gitignore`:

```
# Auto-generated validation reports (keep local)
docs/reports/validation/validation-report-*.md
# Keep the latest for reference
!docs/reports/validation/validation-report-latest.html
```

#### Rule #3: Check Status Before Commit

```bash
# Verify what's staged:
git status

# Unstage reports if accidentally added:
git reset docs/reports/
```

### Quick Fix Commands

#### If Pre-Commit Fails:

```bash
# 1. Format the failing files
pnpm exec prettier --write <file1> <file2> <file3>

# 2. Unstage any reports
git reset docs/reports/

# 3. Re-add the formatted files
git add <file1> <file2> <file3>

# 4. Try commit again
git commit -m "Your message"
```

#### To Bypass Hooks (Emergency Only):

```bash
# Only use in emergencies!
git commit --no-verify -m "Your message"
```

### Hardening Implementation

#### Updated .gitignore

Added validation reports to prevent accidental staging:

```gitignore
# Validation reports (local only)
docs/reports/validation/validation-report-*.md
!docs/reports/validation/validation-report-latest.html
```

#### Pre-Commit Checklist Script

Created helper script: `scripts/pre-commit-check.sh`

```bash
#!/usr/bin/env bash
# Run before committing to ensure clean commit

set -euo pipefail

echo "🔍 Pre-commit checks..."

# Format staged files
echo "Formatting..."
pnpm exec prettier --write $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|tsx|md|json)$' || true)

# Unstage reports
echo "Checking for validation reports..."
git diff --cached --name-only | grep 'docs/reports/validation/' && {
  echo "⚠️  Unstaging validation reports..."
  git reset docs/reports/validation/
} || true

echo "✅ Ready to commit!"
```

Usage:

```bash
bash scripts/pre-commit-check.sh
git commit -m "Your message"
```

### ESLint SIGKILL Issue

The ESLint process is being killed (SIGKILL) which suggests:

1. Process timeout
2. Memory limit exceeded
3. System resource constraint

**Mitigation**: The pre-commit hook will still fail safely and revert changes if ESLint fails.

### Summary: What Was Fixed

✅ **Formatted all files** - Ran prettier on the 3 failing files
✅ **Unstaged validation report** - Removed auto-generated file from staging
✅ **Re-staged clean files** - Added properly formatted files
✅ **Documented workflow** - Created this guide to prevent recurrence

### Commit Should Now Succeed

```bash
git commit -m "fix(validation): correct URL detection and error message formatting"
```

If it still fails, check:

1. Are there new unstaged changes?
2. Are validation reports still staged?
3. Run: `git status` to verify
