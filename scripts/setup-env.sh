#!/usr/bin/env bash
#
# Interactively sets up the .env file for the project.
#

set -euo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

echo "Cloudcache Environment Setup"
echo "============================"
echo "This script will help you configure your .env file."
echo ""

if [ -f "$ENV_FILE" ]; then
  echo "An .env file already exists."
  read -p "Do you want to overwrite it? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

echo "Please enter your Cloudflare details:"
echo ""

read -p "Enter your CF_API_TOKEN: " CF_API_TOKEN
read -p "Enter your CF_ACCOUNT_ID: " CF_ACCOUNT_ID
read -p "Enter your CF_ZONE_ID: " CF_ZONE_ID
echo ""
echo "Please enter your Cloudflare Access details (leave blank if not needed):"
echo ""
read -p "Enter your CF_ACCESS_CLIENT_ID: " CF_ACCESS_CLIENT_ID
read -p "Enter your CF_ACCESS_CLIENT_SECRET: " CF_ACCESS_CLIENT_SECRET

echo "Creating .env file..."

cat > "$ENV_FILE" << EOL
# Cloudflare API Token and Account Details
# A single token with permissions for all modules
CF_API_TOKEN="$CF_API_TOKEN"
CF_ACCOUNT_ID="$CF_ACCOUNT_ID"
CF_ZONE_ID="$CF_ZONE_ID"

# Cloudflare Access Credentials
# If needed by other scripts
CF_ACCESS_CLIENT_ID="$CF_ACCESS_CLIENT_ID"
CF_ACCESS_CLIENT_SECRET="$CF_ACCESS_CLIENT_SECRET"
EOL

echo ""
echo ".env file created successfully!"
echo "You can now run the deployment scripts."




