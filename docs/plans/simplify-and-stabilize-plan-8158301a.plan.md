<!-- 8158301a-3233-4a15-b8a9-72c0ae538a29 812136c6-8bf9-4b0c-9e71-e63fe4d5da0d -->

# Plan: Implement JWT Service Authentication Architecture

This plan rectifies our core authentication flaw. We will build tooling to support the correct JWT exchange flow and then apply this new, robust pattern to all hosts, ensuring a stable and secure Zero Trust foundation.

### Phase 1: Build Foundational JWT Tooling

The first step is to create reusable, reliable scripts that correctly implement the JWT exchange flow. This codifies the correct process and prevents future errors.

1.  **Create Master JWT Exchange Script (`scripts/access-exchange-service-jwt.sh`)**
    - **Purpose**: This script will be the single source of truth for converting a Service Token into a usable JWT.
    - **Inputs**: Application Domain, Client ID, Client Secret.
    - **Logic**:
      1.  **Resolve Access Team Domain**: Programmatically fetch the account's Access organization details from the Cloudflare API endpoint `accounts/{account_id}/access/organizations` to get the `auth_domain`.
      2.  **Resolve Application AUD**: Fetch the specific Access Application's details to get its unique Audience Tag (`aud`).
      3.  **Perform Token Exchange**: Send a `POST` request to the team's `auth_domain` at the `/cdn-cgi/access/service/auth` endpoint with the correct headers and a JSON body containing the `aud` tag.
      4.  **Output**: The script will parse the response and output only the raw JWT string.

### Phase 2: Pilot and Validate the New Architecture

We will test the new JWT flow on a single host (`cloudcache.ai`) to validate the architecture before a full rollout.

1.  **Reset `cloudcache.ai` Configuration**: Delete and re-create the `cloudcache.ai` Access Application to ensure a clean slate.
2.  **Create New Service Token**: Create a new, dedicated Service Token named `svc-apex-jwt-prod`.
3.  **Configure Policy**: Create a single "Allow" policy on the `cloudcache.ai` application for the new service token.
4.  **Execute and Verify**: Use the new exchange script to obtain a JWT and make a `curl` request with the `CF-access-jwt-assertion` header, expecting a `200 OK` status.

### Phase 3: System-Wide Rollout

Once proven, we will apply this identical, correct pattern to all six hosts (`app`, `admin`, `apex`, and their `staging-` counterparts).

### Phase 4: Final Cleanup

After all hosts are working, we will perform a final cleanup.

1.  **Remove IP Bypass**: The temporary IP Bypass policy on `admin.cloudcache.ai` will be removed.
2.  **Delete Old Tokens**: All old, unused service tokens will be deleted.
3.  **Update Documentation**: A `TOKENS.md` file will be created in `docs/zero-trust/` to document the JWT exchange flow as the required standard.

### To-dos

- [ ] Create the master JWT exchange script (`scripts/access-exchange-service-jwt.sh`).
- [ ] Pilot the new JWT architecture on the `cloudcache.ai` apex domain.
- [ ] Roll out the JWT authentication pattern to all six hosts.
- [ ] Perform final cleanup: remove IP bypass, delete old tokens, and document the new standard.

### To-dos

- [ ] Create the master JWT exchange script (`scripts/access-exchange-service-jwt.sh`).
- [ ] Pilot the new JWT architecture on the `cloudcache.ai` apex domain.
- [ ] Roll out the JWT authentication pattern to all six hosts.
- [ ] Perform final cleanup: remove IP bypass, delete old tokens, and document the new standard.
