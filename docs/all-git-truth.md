# Git Operations Truth

**Last Updated**: 2025-11-19  
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`  
**Script Reference**: `scripts/all-git-truth.sh`

## Core Principles

1. **Credential Hygiene**: Never use `git-credential-osxkeychain` in scripts. It causes hangs in non-interactive environments.
   - **Rule**: Always use `git -c credential.helper=''` for automated git commands.
   - **Helper**: Use `git_safe()` function in scripts.

2. **Pre-Commit Standards**:
   - All files must be formatted (Prettier)
   - Shell scripts must be linted (ShellCheck) and formatted (shfmt)
   - Documentation must follow naming conventions (lowercase-hyphen-only)
   - No "WIP" or broken code in main branch

3. **Naming Convention**:
   - **Files**: Lowercase only, hyphen-separated (e.g., `all-git-truth.md`)
   - **Truth Files**: Prefix with `all-` (e.g., `all-deployment-truth.md`)
   - **Banned**: Uppercase, underscores (except DB migrations), `one.plan.md`

## Pre-Commit Operations

### Automated Checks

The pre-commit hook (`scripts/all-git-truth.sh --pre-commit`) automatically:

1. **Unstages** validation reports (prevents clutter)
2. **Formats** staged files (Prettier)
3. **Validates** shell scripts (ShellCheck)
4. **Re-stages** fixed files

### Manual Checklist

Before committing complex changes run:

```bash
# Format & lint staged changes (same as hook)
bash scripts/all-git-truth.sh --pre-commit

# Validate documentation headers/naming
bash scripts/all-git-truth.sh --validate-md docs/my-new-file.md

# Run targeted git commands without credential helper issues
bash scripts/all-git-truth.sh --git-safe status
```

## Troubleshooting

### Common Errors

**Error**: `prettier --check [FAILED]`  
**Fix**: Run `pnpm exec prettier --write .` and re-stage.

**Error**: `eslint --max-warnings=0 [SIGKILL]`  
**Cause**: Sandbox memory/process limits.  
**Fix**: Use `scripts/all-git-truth.sh --pre-commit` which handles this gracefully.

**Error**: `git: 'credential-osxkeychain' is not a git command`  
**Fix**: You are running a script that forgot `git -c credential.helper=''`. Use `git_safe` wrapper.

### Emergency Bypass

If hooks are failing and you must commit (e.g., to save work):

```bash
git commit --no-verify -m "wip: saving work, hooks bypassed"
```

_Note: CI will still fail if issues persist._

### EPERM Errors on macOS

**Error**: `Error: EPERM: operation not permitted` during pre-commit.

**Cause**: macOS file system security + pnpm nested node_modules + ESLint cache.

**Fix**:

1. The pre-commit hook automatically handles this by retrying ESLint with `--no-cache`.
2. If it still fails, run: `pnpm install` to fix permissions.
3. Use `bash scripts/all-git-truth.sh --pre-commit` for a manual check.

## Rules for MD File Creation

All markdown files in this repository must follow these standards to ensure consistency, discoverability, and maintainability.

### Naming Convention

**Rule**: Lowercase letters only, hyphen-separated words, no underscores.

Examples:

- ✅ `all-git-truth.md`
- ✅ `deployment-procedures.md`
- ✅ `api-integration-guide.md`
- ❌ `Deployment_Procedures.md`
- ❌ `API-Integration-Guide.md`

**Exception**: Database migration files in `apps/*/migrations/` may use underscores per SQL conventions.

### File Placement

**Rule**: Documentation lives in `docs/` or domain-specific subdirectories.

Structure:

```
docs/
  all-<domain>-truth.md    (canonical truth files)
  <topic>.md               (specific documentation)
  archive/                 (deprecated files with redirects)
  reports/                 (auto-generated, gitignored)
```

### Required Headers

Every MD file must include:

```markdown
# <Title> Truth

**Last Updated**: YYYY-MM-DD  
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`  
**Related**: `docs/all-<domain>-truth.md` (if applicable)
```

### Header Hierarchy

- **H1 (`#`)**: Title only (one per file)
- **H2 (`##`)**: Major sections (Principles, Practices, Troubleshooting, etc.)
- **H3 (`###`)**: Subsections
- **H4-H6**: Rarely needed; prefer lists

### Truth File Responsibilities

**"all-" Prefix Files** (e.g., `all-git-truth.md`):

- Are the canonical source for their domain
- Must contain "Rules for MD Creation" or reference this section
- Must list all related files in the domain
- Must be referenced in `.cursor/rules/all-code-truth.mdc`

**Domain-Specific Files**:

- Must reference their `all-<domain>-truth.md`
- Must not duplicate content from truth files
- Should link to truth files for canonical answers

### Linking Requirements

Every MD file must:

1. Reference `.cursor/rules/all-code-truth.mdc` in header
2. Reference its domain's `all-<domain>-truth.md` (if not a truth file itself)
3. Use relative paths for internal links
4. Update the parent truth file when created

Example:

```markdown
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`  
**Canonical Source**: `docs/all-git-truth.md`
```

### Update Protocol

When creating a new MD file:

1. Follow naming convention (lowercase, hyphen-only)
2. Add required headers with references
3. Update parent `all-<domain>-truth.md` to list the new file
4. Validate structure: `bash scripts/all-git-truth.sh --validate-md <file>`

When deprecating an MD file:

1. Move to `docs/archive/`
2. Add redirect header pointing to replacement
3. Remove from parent truth file's index
4. Update any external references

### Validation

Run automated checks:

```bash
# Validate one file
bash scripts/all-git-truth.sh --validate-md docs/your-file.md

# Validate all docs (skips archives/reports)
bash scripts/all-git-truth.sh --validate-md
```

Validator checks:

- ✅ Filename is lowercase, hyphen-only
- ✅ Required headers present
- ✅ References to all-code-truth.mdc exist
- ✅ Title format correct (H1 only once)
- ✅ No banned patterns (underscores in name, etc.)

### Enforcement

- **Pre-commit**: MD validator runs automatically via `all-git-truth.sh`
- **CI/CD**: Full validation on all non-archived MD files
- **Code review**: Check for truth file updates when new MDs added
- **.cursor/rules**: `all-code-truth.mdc` enforces naming conventions
