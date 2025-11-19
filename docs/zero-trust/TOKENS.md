# Zero Trust Tokens

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Canonical Source**: `docs/all-system-truth.md`

---

## Purpose

Zero Trust tokens provide service-to-service authentication for:

- Cloudflare Access service tokens (used by Workers, automation, and CI)
- API tokens used by the deployment/validation scripts (`scripts/cloudcache`, `scripts/configure-access.sh`, etc.)

All tokens live in Cloudflare and are managed remotely—no secrets are checked into the repo or stored in `.dev.vars`.

## Token Types & Owners

| Token                  | Scope                              | Owner        | Notes                                                         |
| ---------------------- | ---------------------------------- | ------------ | ------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | Workers + KV + Routes (deployment) | Platform Eng | Stored in Wrangler secrets and `.env` for CLI auth.           |
| Access Service Tokens  | Protect Workers/preview domains    | Security Eng | Rotated every 90 days; pair of `CLIENT_ID` / `CLIENT_SECRET`. |
| Shopify App Secret     | App OAuth + webhook validation     | App Eng      | Stored per environment via `wrangler secret put`.             |

## Creation Workflow

1. **Create token in Cloudflare Dashboard** (Zero Trust → Access → Service Tokens or My Profile → API Tokens).
2. **Record metadata** in the internal vault (token name, purpose, owner, expiration).
3. **Bind to environments** via Wrangler:
   ```bash
   # example: update preview token
   cd apps/app
   wrangler secret put CF_ACCESS_CLIENT_SECRET --env preview
   ```
4. **Update documentation** (this file + the relevant truth doc) if scopes or usage change.

## Rotation Procedure

1. Announce rotation in Slack/#cloudcache with the affected services and timeline.
2. Generate a new token (do **not** delete the old one until the rollout is verified).
3. Update Wrangler secrets for every environment (`preview`, `staging`, `production`) and run `scripts/cloudcache verify <module> <env>` to ensure bindings resolve.
4. Deploy the module to preview (`pnpm deploy:preview`) and run validation (`pnpm test:validation`).
5. Once preview passes, promote to staging/production using `scripts/deploy-module.sh`.
6. Revoke the old token and update the vault entry with the new expiration.

## Auditing

- Quarterly: run `scripts/cf/inventory-snapshot.sh` and confirm the token list matches the vault.
- After every incident: capture token usage/export logs and attach them to `docs/zero-trust/support-bundle.md`.

## References

- Canonical process: `docs/all-system-truth.md`
- Access troubleshooting & ticket template: `docs/zero-trust/support-bundle.md`
- Secrets storage model: `docs/secrets-management.md`
