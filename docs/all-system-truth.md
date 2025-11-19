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

This is the definitive list of primary scripts that power our pipeline.

- **`scripts/deploy-module.sh`**: The master script for all deployments. Contains all build and `wrangler` logic. **This is the source of truth for deployment.**
- **`scripts/deploy-preview.sh`**: A simple wrapper that calls `deploy-module.sh` for all three modules to the preview environment.
- **`scripts/validation/run-validation.sh`**: The master script for our automated validation suite. It iterates through all modules and environments, running our two-factor checks.
- **`scripts/lib/core.sh`**: A shared library of shell functions used by our primary scripts.
- **`scripts/all-git-truth.sh`**: The unified script for all git operations, pre-commit checks, and validation.

---

## Hierarchy of Truth

1.  **This Document (`docs/all-system-truth.md`)**: Defines the process and points to the correct tools.
2.  **Git Truth (`docs/all-git-truth.md`)**: The canonical source for git operations, pre-commit hooks, and documentation standards.
3.  **Core Scripts (listed above)**: Contain the implementation of the process.
4.  **Supporting Documentation (`docs/deployment-ground-truth.md`, etc.)**: Provide supplementary, verified information.
5.  **Archived Files (`archive/`)**: Are for historical reference only and **must not** be used for current operations.

By adhering to this structure, we will prevent architectural drift and ensure a stable, predictable, and reliable system for all developers.
