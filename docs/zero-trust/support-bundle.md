# Cloudflare Support Ticket: Service Auth JWT Endpoint (`/cdn-cgi/access/service/auth`) Consistently Returns 404

**Last Updated**: 2025-11-19
**Rule Reference**: `.cursor/rules/all-code-truth.mdc`
**Canonical Source**: `docs/all-system-truth.md`

---

## Summary

- **Goal**: Protect a Cloudflare Worker with a Zero Trust Access Application and authenticate using a Service Token exchanged for a JWT.
- **Blocking Issue**: The required JWT exchange endpoint at `https://<any-app-domain>/cdn-cgi/access/service/auth` consistently returns a `404 Not Found` error.
- **Impact**: This completely blocks all non-human/programmatic access to our workers, which is the core of our architecture.

---

## Account Details

- **Account ID**: `25ee8d3e1a867dcc2e777fd20073a0a4`
- **Zone ID**: `72aa78962e638f32e5e3ceadcb1ea435`

---

## Steps to Reproduce

This issue can be reproduced with a minimal test case on any application in our account, including one created manually in the UI.

1.  **Select a Target Application**: We will use the application named `manual-app-probe` which was created manually in the UI to protect the domain `staging-apex.cloudcache.ai`.
2.  **Create a Service Token**: Create a new service token via the API.
    - Example Token Name: `svc-debug-ticket-123`
3.  **Create an "Allow" Policy**: Create a policy on the `manual-app-probe` application to allow access for the service token created in the previous step.
4.  **Attempt JWT Exchange**: Execute the following `curl` command to attempt the JWT exchange (replace `${CLIENT_ID}` and `${CLIENT_SECRET}` with the credentials from step 2).

```bash
# This command fails with a 404 Not Found
curl -v -X POST \
  -H "CF-Access-Client-Id: ${CLIENT_ID}" \
  -H "CF-Access-Client-Secret: ${CLIENT_SECRET}" \
  "https://staging-apex.cloudcache.ai/cdn-cgi/access/service/auth"
```

### Example Failure Output

- **HTTP Status**: `404 Not Found`
- **CF-RAY from a recent attempt**: `98d4158b4f2c0b43-SJC` _(Please provide this to the support engineer)_

---

## Architectural Diagnostics Performed

We have exhaustively tested and ruled out all common configuration errors. The issue is not:

1.  **DNS or Policy Propagation**: We have tested with delays of up to 60 seconds for both DNS and policy changes with no effect. The target hostnames resolve correctly.
2.  **API vs. UI Configuration**: The issue occurs on applications created via the API **and** on applications created manually in the UI. We performed a `diff` on the JSON configurations and updated our API script to match the UI, which had no effect.
3.  **Missing Identity Provider**: The account has the default "One-time PIN" Identity Provider enabled, and we have explicitly associated it with our test applications. This did not resolve the `404` error.
4.  **Incorrect URL**: We have confirmed via documentation that `/cdn-cgi/access/service/auth` is the correct endpoint and have tried authenticating against both the application domain and the account's team domain. Both result in a `404`.
5.  **Binding Cookie Mismatch**: We identified documentation stating the `enable_binding_cookie` should be disabled for non-browser clients. We explicitly set `"enable_binding_cookie": false` when creating applications via the API. **This did not resolve the `404` error.**

Based on our extensive testing, we have high confidence that the service auth endpoint is not being provisioned correctly for our account under any circumstances. We kindly request that you investigate why this endpoint is unavailable.

## Replication Steps

1.  Create a Zero Trust Access application protecting `staging-apex.cloudcache.ai` in the UI (named `manual-app-probe`).
2.  Create a Service Token via the API; record the `client_id` and `client_secret` (e.g., `svc-debug-ticket-123`).
3.  Add an "Allow" policy on the application that permits the Service Token from step 2.
4.  Wait up to 60 seconds for policy/DNS propagation.
5.  Attempt a JWT exchange against the application domain using the Service Token headers.
6.  Repeat the same request against the team domain for the same application.
7.  Repeat tests on apps created both via API and via the UI; align configurations and set `"enable_binding_cookie": false`.
8.  Observe the response is consistently `404 Not Found` and capture the `CF-RAY` (e.g., `98d4158b4f2c0b43-SJC`).

---

## Expected Behavior (per Cloudflare documentation)

- Programmatic clients using a Service Token should be able to exchange for a short-lived JWT by POSTing to one of:
  - Team Domain: `https://<team-domain>/cdn-cgi/access/service/auth?aud=<APPLICATION_AUD>`
  - Application Domain: `https://<app-domain>/cdn-cgi/access/service/auth` with JSON body `{ "aud": "<APPLICATION_AUD>" }`
- When the Access app is of type `self_hosted`, has an allow policy for the Service Token, and `enable_binding_cookie` is disabled, the endpoint should return `200 OK` with a JSON body containing a JWT token field (e.g., `token`).
- Subsequent requests to the protected application with header `CF-Access-Jwt-Assertion: <JWT>` should return `200 OK`. Without the header, `403` is expected.

---

## Latest Evidence (2025-10-13)

- Naming/routes/DNS normalized to canonical hosts; AAAA 100:: present; Workers routes resolved; Access apps exist for all canonical hosts.
- App-domain service auth continues to return `404` with empty body on `staging-apex.cloudcache.ai` after fresh token and allow policy.
- Please see CF-RAY from the latest 404 attempt (to be provided below by running the minimal curl):

### Minimal commands to capture AUD and CF-RAY

1. Discover application ID and AUD:

```bash
ACC=<account_id>
TOKEN=<module_scoped_token>
DOMAIN=<app-domain>
ACCT_BASE="https://api.cloudflare.com/client/v4/accounts/$ACC"

APP_ID=$(curl -sS -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$ACCT_BASE/access/apps?per_page=1000" | jq -r --arg d "$DOMAIN" '.result[] | select(.domain==$d) | .id' | head -n1)

AUD=$(curl -sS -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$ACCT_BASE/access/apps/$APP_ID" | jq -r '.result.aud')
```

2. Get team auth domain:

```bash
AUTH_DOMAIN=$(curl -sS -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$ACCT_BASE/access/organizations" | jq -r '.result[0].auth_domain // .result.auth_domain')
```

3. Attempt service auth on Team Domain, capture CF-RAY:

```bash
CLIENT_ID=<service_token_client_id>
CLIENT_SECRET=<service_token_client_secret>
HDR=$(mktemp); BODY=$(mktemp)
curl -s -D "$HDR" -o "$BODY" -X POST \
  -H "CF-Access-Client-Id: $CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CLIENT_SECRET" \
  "https://$AUTH_DOMAIN/cdn-cgi/access/service/auth?aud=$AUD"

STATUS=$(awk 'NR==1{print $2}' "$HDR"); CFRAY=$(grep -i '^cf-ray:' "$HDR" | awk '{print $2}')
echo "TEAM_STATUS=$STATUS CF_RAY=$CFRAY"
cat "$BODY"
```

4. Optional: Attempt on Application Domain:

```bash
curl -s -D "$HDR" -o "$BODY" -X POST \
  -H "CF-Access-Client-Id: $CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CLIENT_SECRET" \
  -H "Content-Type: application/json" --data "$(jq -n --arg aud "$AUD" '{aud:$aud}')" \
  "https://$DOMAIN/cdn-cgi/access/service/auth"

STATUS=$(awk 'NR==1{print $2}' "$HDR"); CFRAY=$(grep -i '^cf-ray:' "$HDR" | awk '{print $2}')
echo "APP_STATUS=$STATUS CF_RAY=$CFRAY"
cat "$BODY"
```

---

## Account/Zone Reference

- Account ID: `25ee8d3e1a867dcc2e777fd20073a0a4`
- Zone ID: `72aa78962e638f32e5e3ceadcb1ea435`

## Current App Settings (representative)

- Type: `self_hosted`
- `enable_binding_cookie`: false
- `auto_redirect_to_identity`: false
- `service_auth_401_redirect`: true

If additional JSON exports or CF-RAYs are needed, we can supply promptly.
