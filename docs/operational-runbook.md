# Operational Runbook

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Canonical Source**: `docs/all-deployment-truth.md`

---

This runbook provides procedures for on-call operations, monitoring, and incident response.

## Monitoring

### Health Checks

Each module exposes health endpoints:

- **Shallow check**: `GET /healthz` - Quick availability check
- **Deep check**: `GET /readyz` - Verifies environment and dependencies

**Endpoints**:

- APP: `https://app.cloudcache.ai/healthz`
- ADMIN: `https://admin.cloudcache.ai/healthz`
- APEX: `https://cloudcache.ai/healthz`

### Structured Logging

All modules use structured logging with correlation IDs:

- Format: JSON with `timestamp`, `level`, `message`, `correlationId`, `context`
- Logs are available via `wrangler tail` or Cloudflare dashboard
- Correlation IDs propagate via `X-Correlation-ID` header

### Tailing Logs

```bash
# Tail logs for a Worker
wrangler tail --name <worker-name>

# Tail with pretty format
wrangler tail --name app-worker --format pretty

# Tail with filters
wrangler tail --name app-worker --status error
```

## Incident Response

### Service Down

1. **Check health endpoints**:

   ```bash
   curl https://app.cloudcache.ai/healthz
   curl https://app.cloudcache.ai/readyz
   ```

2. **Check logs**:

   ```bash
   wrangler tail --name app-worker --status error
   ```

3. **Verify secrets**:

   ```bash
   scripts/cloudcache verify app prod
   ```

4. **Check Cloudflare status**: https://www.cloudflarestatus.com/

### High Error Rate

1. **Tail error logs**:

   ```bash
   wrangler tail --name app-worker --status error --format pretty
   ```

2. **Look for correlation IDs** in error responses

3. **Check for missing secrets**:

   ```bash
   scripts/cloudcache verify app prod
   ```

4. **Review recent deployments**:
   ```bash
   wrangler deployments list --name app-worker
   ```

### Authentication Issues

1. **Verify Access credentials**:

   ```bash
   scripts/cloudcache verify <module> <env>
   ```

2. **Check Access policies** in Cloudflare dashboard

3. **Verify paths are allowlisted** (`/healthz`, `/readyz`, `/webhooks/*`, `/auth/*`)

### Webhook Failures

1. **Check webhook logs**:

   ```bash
   wrangler tail --name app-worker | grep webhook
   ```

2. **Verify HMAC verification** (check logs for HMAC errors)

3. **Check idempotency** (duplicate webhook handling)

4. **Verify Queue processing** (if using Cloudflare Queues)

## Common Operations

### View Deployments

```bash
# List deployments for a Worker
wrangler deployments list --name app-worker

# View specific deployment
wrangler deployments view <deployment-id> --name app-worker
```

### Rollback Deployment

```bash
# Rollback to previous deployment
wrangler deployments rollback <deployment-id> --name app-worker
```

### Verify Secrets

```bash
# Verify all secrets for a module/environment
scripts/cloudcache verify app prod

# List secret names (not values)
wrangler secret list --name app-worker --env prod
```

### Update Secrets

```bash
# Interactive secret update
scripts/cloudcache bind app prod

# Manual secret update
wrangler secret put SECRET_NAME --name app-worker --env prod
```

## Debugging

### Request Tracing

1. **Extract correlation ID** from response header `X-Correlation-ID`
2. **Search logs** for that correlation ID:
   ```bash
   wrangler tail --name app-worker | grep <correlation-id>
   ```

### Local Testing

```bash
# Run locally with remote bindings
cd apps/app
pnpm dev

# Test endpoints
curl http://localhost:8789/healthz
curl http://localhost:8789/readyz
```

### Check Environment

```bash
# Verify environment variables are set
scripts/cloudcache verify <module> <env>
```

## Performance Monitoring

### Response Times

Check Cloudflare Analytics dashboard for:

- Request latency
- Error rates
- Request volume

### Worker Metrics

Available in Cloudflare dashboard:

- CPU time
- Request count
- Error count
- Subrequest count

## Security

### Access Control

- Verify Access policies exclude health/webhook/auth endpoints
- Check Access logs for blocked requests
- Review Access policies regularly

### Secret Rotation

1. Generate new secrets
2. Update in Cloudflare: `scripts/cloudcache bind <module> <env>`
3. Verify: `scripts/cloudcache verify <module> <env>`
4. Monitor for errors

### Audit Logs

- Cloudflare Access logs: Dashboard → Zero Trust → Access → Logs
- Worker logs: `wrangler tail` or Dashboard → Workers → Logs

## Escalation

### When to Escalate

- Service down for >5 minutes
- Data loss or corruption suspected
- Security incident
- Unable to resolve via runbook

### Contact Information

- **On-call**: [Configure in your system]
- **Slack**: [Configure in your system]
- **PagerDuty**: [Configure in your system]

## Maintenance Windows

### Scheduled Deployments

- Staging: Auto-deploy on `main` branch push
- Production: Manual approval gate (configure in GitHub Actions)

### Zero-Downtime Deployments

Workers support zero-downtime deployments:

- New deployment is created
- Traffic gradually shifts to new version
- Old version remains available for rollback

## Recovery Procedures

### Complete Service Failure

1. Check Cloudflare status
2. Verify Worker deployments exist
3. Check secrets are set
4. Review recent changes
5. Rollback if needed

### Data Loss

1. Check backup/restore procedures
2. Review deployment history
3. Check KV/D1 backups (if applicable)

### Security Breach

1. Rotate all secrets immediately
2. Review Access logs
3. Check for unauthorized access
4. Follow security incident response plan
