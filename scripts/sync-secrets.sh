#!/usr/bin/env bash

#
# Syncs secrets from an environment-specific .env file to all modules in Cloudflare.
#
# This script provides a centralized and automated way to manage secrets for different
# environments (preview, staging, production), preventing manual, error-prone updates.
#
# Usage:
#   bash scripts/sync-secrets.sh <environment>
#
# Example:
#   bash scripts/sync-secrets.sh preview
#
# Prerequisites:
#   - `wrangler` CLI must be installed and authenticated.
#   - An environment file (e.g., `.env.preview`) must exist with the secrets.
#
# The script will:
#   1. Validate the environment argument and the existence of the corresponding .env file.
#   2. Read each KEY=VALUE pair from the .env file.
#   3. For each module (app, admin, apex), it runs `wrangler secret put` to upload
#      the secret to the correct worker for the specified environment.
#

# ---
# Setup and Configuration
# ---
set -euo pipefail # Exit on error, undefined variable, or pipe failure
source "scripts/lib/core.sh" # Source shared functions and variables

# ---
# Main Logic
# ---

# 1. Validate Arguments
# ------------------------------------------------------------------------------
if [[ $# -eq 0 ]]; then
  log_error "Missing required argument: environment (e.g., preview, staging, production)"
  exit 1
fi

ENVIRONMENT="$1"
ENV_FILE=".env.${ENVIRONMENT}"
MODULES=("app" "admin" "apex")

if [[ ! -f "$ENV_FILE" ]]; then
  log_error "Environment file not found: ${ENV_FILE}"
  log_info "Please create it with the necessary secrets before running this script."
  exit 1
fi

log_info "▶ Syncing secrets from '${ENV_FILE}' to '${ENVIRONMENT}' environment for all modules..."

# 2. Sync secrets for each module
# ------------------------------------------------------------------------------
for module in "${MODULES[@]}"; do
  log_info "  - Syncing secrets for module: '${module}'"
  
  # Read the .env file line by line, skipping comments and empty lines
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^\s*# || -z "$line" ]]; then
      continue
    fi
    
    # Extract key and value
    key=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2-)

    # Upload the secret using wrangler
    # Note: We pipe the value to stdin to avoid it appearing in process lists.
    printf "%s" "$value" | wrangler secret put "$key" --name "${module}-worker-${ENVIRONMENT}" --env "${ENVIRONMENT}"
    log_success "    - Synced secret: ${key}"

  done < "$ENV_FILE"
done

log_success "🎉 All secrets synced successfully for environment: '${ENVIRONMENT}'"
