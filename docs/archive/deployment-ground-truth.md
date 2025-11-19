# Deployment Ground Truth

**DEPRECATED**: This file has been consolidated.
**See**: `docs/all-deployment-truth.md` for current documentation.

**Migration Date**: 2025-11-19
**Archived On**: 2025-11-19 13:44:00

---

This document contains the verified, correct URLs and status for our Cloudflare Preview deployments. It serves as the single source of truth for all subsequent reporting and validation scripts.

This document was generated and verified on **November 16, 2025**.

## Functional Deployment Script

The primary, functional script for deploying all modules to the Preview environment is:
`bash scripts/deploy-preview.sh`

## Verified Preview URLs

The following URLs have been manually verified to be correct and functional after a successful deployment:

| Module | Verified Preview URL                                     | Status      | Notes                                    |
| :----- | :------------------------------------------------------- | :---------- | :--------------------------------------- |
| `app`  | `https://app-worker-preview.cloudcache.workers.dev`      | ✅ Verified | Displays "I love Cloudcache APP" message and validation badge. |
| `admin`| `https://admin-worker-preview.cloudcache.workers.dev`    | ✅ Verified | Displays "I love Cloudcache ADMIN" message and validation badge. |
| `apex` | `https://apex-worker-preview.cloudcache.workers.dev`     | ✅ Verified | Displays the main dashboard and validation badge. |

## Known Issues

- All three preview environments return a `500` error when the browser requests `/favicon.ico`. This is a non-critical issue and does not affect the functionality of the applications themselves.
