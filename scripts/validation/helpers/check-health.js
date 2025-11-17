#!/usr/bin/env node

async function checkHealth(url, expectedVersion) {
  if (!url) {
    console.error("Please provide a URL as the first argument.");
    process.exit(1);
  }
  if (!expectedVersion) {
    console.error("Please provide the expected git commit hash as the second argument.");
    process.exit(1);
  }

  const healthUrl = new URL("/healthz", url).toString();
  const errors = [];

  try {
    const response = await fetch(healthUrl);

    if (!response.ok) {
      errors.push(`Health check failed with status ${response.status} at ${healthUrl}`);
    } else {
      const data = await response.json();

      if (data.status !== "ok") {
        errors.push(`Health check status was not 'ok'. Got: ${data.status}`);
      }

      if (data.version !== expectedVersion) {
        const isPreviewWorker = url.includes(".cloudcache.workers.dev");
        const isStagingDomain = url.includes("staging-") && url.includes("cloudcache.ai");
        const isProductionDomain =
          url.includes("cloudcache.ai") &&
          !url.includes("staging-") &&
          !url.includes(".workers.dev");
        const isLocalhost = url.includes("localhost");

        let suggestion = "";
        if (isPreviewWorker) {
          suggestion =
            " 🔧 FIX: Your Cloudflare preview deployment is stale. Run: pnpm deploy:preview";
        } else if (isStagingDomain) {
          suggestion =
            " 🔧 FIX: Your staging deployment is stale. Run: bash scripts/deploy-module.sh <module> staging";
        } else if (isProductionDomain) {
          suggestion =
            " ⚠️  CAUTION: Production deployment is out of sync. Verify before deploying to production.";
        } else if (isLocalhost) {
          suggestion = " 🔧 FIX: Your local dev server is stale. Restart: pnpm dev";
        }

        const errorMessage = `Version mismatch. Expected: ${expectedVersion}, Got: ${data.version}`;
        errors.push(suggestion ? `${errorMessage}.${suggestion}` : errorMessage);
      }
    }
  } catch (e) {
    errors.push(`Failed to fetch health check from ${healthUrl}: ${e.message}`);
  }

  if (errors.length > 0) {
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
  } else {
    console.log("Health and version check passed.");
    process.exit(0);
  }
}

checkHealth(process.argv[2], process.argv[3]);
