import { getEnv, AppEnvSchema, type AppEnv } from "@cloudcache/platform-env";
import { createLoggerFromRequest, getCorrelationId } from "@cloudcache/platform-logging";
import {
  createErrorResponse,
  handleCORS,
  canonicalizePath,
  shouldRedirect,
  createRedirectResponse,
  isMethodAllowed,
  createMethodNotAllowedResponse,
  addSecurityHeaders,
  createJSONResponse,
} from "@cloudcache/platform-http";
import { renderPage } from "./templates/page";
import {
  NAV_ITEMS,
  PAGE_CONFIGS,
  getPageConfig,
  getAllToggleConfigs,
  type ToggleConfig,
} from "./config/pages";

declare const __VERSION__: string;

const FAVICON_BASE64 =
  "AAABAAIAEBAAAAEAIADGAQAAJgAAACAgAAABACAAiwMAAOwBAACJUE5HDQoaCgAAAA1JSERSAAAAEAAAABAIBgAAAB/z/2EAAAABc1JHQgCuzhzpAAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAAQoAMABAAAAAEAAAAQAAAAADRVcfIAAAEwSURBVDgR7ZC/L0NRFMc/9762GIjGYhGmjn62EjFa+AvEIhKdJN1IRCLpIGIhsXXqJlY2C4MBbWKukJA0BqQWVNVr33GfvtfQ0L+gd7jfc8/9/jg50DqqcQWyOd5DOHBE0RlmJHhLp97CNqyiXuVd+ilYeyp+vOjrtF/UscKcEUe5qwbI2RGUpHFIg0QQ2sCZl92paZ8f8AsXZTm6gdIrvDi1dq4KuRL0WTDaDsoMLBiN7BtC2CX9nkB0wnyGeJWagXubTMZC3tv0XRMoe40GAyiZBBgKwqQnmjDY8TPHEDTJ/wySXgLcVw7oUpcMWI/Pn91Pa5n42/XhFYVMNq8SJ6k/DdR2NqXWL5RaOFNmiTc82DMqdto7e74zaIv+HrvyUc774qYoS7FYU0Lrs76BL/LgWyHfgEGBAAAAAElFTSuQmCCiVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAC9UlEQVRYCe1UTUhUURT+7hsdhzQhoUXUmEaLsEKNJswgLSgQghZhGzcp9EtQllCLIMJVEmVBPwTtrI1RtIigoCbaFCS0KAqslAyiJEsdf0Zn3u07d94bx9c8kXDXHOa+c8695+c7331vgJzkGMgx8L8zoOZLgL5Z0wRbncZvew3WB+MI4gtC6jGKrE5VHe2XOvr51nIkrGOYtHZiWpdiGnGMI4rJxFF18MW3bL3mBUBfYPNiqwsjNtCXBFYHgHV5QAHTF1tTsHCcjcCGnUiooLETPJvWwAR1Qt1TLU/3ZAPAKvMQjRPQLDZKACIfCUIyK/PFC0LjmhhQmfMw3vW1rjfnWR5Wlr2/txQqTLERFnXlA0G8TdDjntlmcwEpkm5sHHmU6BvbB/TFbXXiZIovA3pffQjh8aukuZEJIcQ5/VRmKu13BCDLlTCvJlIwAyiFjKfCjF5BYOdp1Ljhon0BoDh2BirQkg4eS1vZDfbFhmBqesMA2RBtSEnba73Jc1yB1WiS3SIx5/69FVx/ExGEnHLmKpzmMryI7Cnw3mbLHAB0WSrUjADEHD07P+WVk/pSLlcM49542VRRN8TV/legMEHEwqn5oYKhQdry6eVxReOpGiGqLQxz40xfyXEB0Daik0jqdsdJK38GNNFKDaEuXVSK0RnKYLKWzUNOkxTN6eIpwxQhINWm2p71eA7neAmh2jnULq6ADDfrExtIvOFOFcKWxirS4Xx20v/Jp0o79v77RO3g3UJJswqCWBRefrvobG+nt7n4vgyoK696OGyboVaGcF9Grc5hyF5CRINYae2gfsA1TIDD9380vL48dtK6VdpR+LJkt+lnx6cw2vu5zjhZHg53WU58tvShqjIE8vtg23vV9Z7uzLCGS/1NSvEvm7K/rxWbh4iNorX+uqwrGTaO5+HLgCduxrWsejrd3uYS8Ki17E7k18OO5v5TP2sympPJA3K+IKIPb+zQzdVLF6TYvxTRRyKRf8nL5eQYyDGQY8CPgT8p4ed9RS416QAAAABJRU5ErkJggg==";

// KV key prefix for settings
const SETTINGS_KV_PREFIX = "settings:";

// Cloudflare API settings type mapping
interface CFSettingValue {
  value: string | number | boolean | { css?: string; html?: string; js?: string };
}

// Get setting state from KV or Cloudflare API
async function getSettingState(
  settingId: string,
  cfSettingName: string,
  env: AppEnv,
  kv: KVNamespace,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<boolean> {
  const kvKey = `${SETTINGS_KV_PREFIX}${settingId}`;

  // 1. Try to get from KV first
  try {
    const kvState = await kv.get(kvKey);
    if (kvState === "on" || kvState === "true") return true;
    if (kvState === "off" || kvState === "false") return false;
  } catch (kvError) {
    logger.error(`Failed to read ${settingId} state from KV`, { error: kvError });
  }

  // 2. If not in KV, fetch from Cloudflare API
  logger.info(`${settingId} state not in KV, fetching from API`);
  let apiStateEnabled = false;

  try {
    const cfApiUrl = `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/settings/${cfSettingName}`;
    const cfResponse = await fetch(cfApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (cfResponse.ok) {
      const data = (await cfResponse.json()) as { success: boolean; result: CFSettingValue };
      if (data.success && data.result) {
        const value = data.result.value;

        // Handle different value types
        if (typeof value === "string") {
          apiStateEnabled =
            value === "on" || value === "under_attack" || value === "aggressive" || value === "1.2";
        } else if (typeof value === "boolean") {
          apiStateEnabled = value;
        } else if (typeof value === "object" && value !== null) {
          // For minify settings which have {css, html, js}
          apiStateEnabled = Object.values(value).some((v) => v === "on");
        }

        logger.info(`Fetched ${settingId} state from API`, { enabled: apiStateEnabled });

        // 3. Store in KV for next time
        await kv.put(kvKey, apiStateEnabled ? "on" : "off");
      }
    } else {
      logger.error(`Failed to fetch ${settingId} state from Cloudflare API`, {
        status: cfResponse.status,
      });
    }
  } catch (apiError) {
    logger.error(`Error calling Cloudflare API for ${settingId} state`, { error: apiError });
  }

  return apiStateEnabled;
}

// Get all settings states for a page
async function getPageSettingsStates(
  pathname: string,
  env: AppEnv,
  kv: KVNamespace,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<Record<string, boolean>> {
  const pageConfig = getPageConfig(pathname);
  if (!pageConfig) return {};

  const states: Record<string, boolean> = {};

  // Fetch all toggle states in parallel
  const promises = pageConfig.toggles.map(async (toggle) => {
    const enabled = await getSettingState(toggle.id, toggle.cfSettingName, env, kv, logger);
    return { id: toggle.id, enabled };
  });

  const results = await Promise.all(promises);
  for (const result of results) {
    states[result.id] = result.enabled;
  }

  return states;
}

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    const correlationId = getCorrelationId(request);
    const url = new URL(request.url);
    const pathname = canonicalizePath(url.pathname);

    // Handle simple routes that don't require environment validation
    if (pathname === "/favicon.ico") {
      const faviconData = Uint8Array.from(atob(FAVICON_BASE64), (c) => c.charCodeAt(0));
      const response = new Response(faviconData.buffer, {
        headers: {
          "Content-Type": "image/x-icon",
          "Cache-Control": "public, max-age=31536000",
        },
      });
      return addSecurityHeaders(response, correlationId);
    }

    if (pathname === "/healthz") {
      return createJSONResponse(
        { status: "ok", service: "app", version: __VERSION__ },
        200,
        correlationId
      );
    }

    // From here on, routes require environment validation
    let appEnv: AppEnv;
    try {
      appEnv = getEnv(AppEnvSchema, env);
    } catch (error) {
      return createErrorResponse(
        "ENV_VALIDATION_ERROR",
        error instanceof Error ? error.message : "Environment validation failed",
        correlationId,
        500
      );
    }

    const logger = createLoggerFromRequest(request);

    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) {
      return addSecurityHeaders(corsResponse, correlationId);
    }

    // Handle trailing slash redirect
    const redirectPath = shouldRedirect(url.pathname);
    if (redirectPath) {
      return createRedirectResponse(redirectPath, false);
    }

    // Page routes - check if pathname matches a page config
    const pageConfig = getPageConfig(pathname);
    if (pageConfig) {
      const settingsStates = await getPageSettingsStates(
        pathname,
        appEnv,
        appEnv.APP_KV as KVNamespace,
        logger
      );

      // Build optimizations array with current states
      const optimizations = pageConfig.toggles.map((toggle) => ({
        id: toggle.id,
        title: toggle.title,
        description: toggle.description,
        enabled: settingsStates[toggle.id] || false,
      }));

      const html = renderPage({
        faviconBase64: FAVICON_BASE64,
        dashboardTitle: pageConfig.title,
        dashboardSubtitle: pageConfig.subtitle,
        activeNavItem: pageConfig.id,
        navItems: NAV_ITEMS,
        optimizations,
        footer: {
          copyright: `© ${new Date().getFullYear()} Cloudcache. All rights reserved.`,
        },
      });

      const response = new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      return addSecurityHeaders(response, correlationId);
    }

    if (pathname === "/readyz") {
      return createJSONResponse(
        {
          status: "ready",
          service: "app",
          env: {
            hasShopifyKey: !!appEnv.SHOPIFY_API_KEY,
            hasAccessCredentials: !!appEnv.CF_ACCESS_CLIENT_ID,
          },
        },
        200,
        correlationId
      );
    }

    // API routes
    if (pathname.startsWith("/api/v1/")) {
      return handleAPIRoute(request, pathname, appEnv, logger);
    }

    // Auth routes
    if (pathname.startsWith("/auth/")) {
      return handleAuthRoute(request, pathname, appEnv, logger);
    }

    // Webhook routes
    if (pathname.startsWith("/webhooks/")) {
      return handleWebhookRoute(request, pathname, appEnv, logger);
    }

    // 404 Not Found
    logger.warn("Route not found", { pathname, method: request.method });
    return createErrorResponse("NOT_FOUND", `Route ${pathname} not found`, correlationId, 404);
  },
};

async function handleAPIRoute(
  request: Request,
  pathname: string,
  env: AppEnv,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<Response> {
  const correlationId = logger.correlationId;

  // API v1 ping endpoint
  if (pathname === "/api/v1/ping") {
    if (!isMethodAllowed(request, ["GET", "OPTIONS"])) {
      return createMethodNotAllowedResponse(request, ["GET", "OPTIONS"], correlationId);
    }
    return createJSONResponse({ pong: true, timestamp: Date.now() }, 200, correlationId);
  }

  // Generic settings toggle endpoint
  // POST /api/v1/settings/{setting_id}
  const settingsMatch = pathname.match(/^\/api\/v1\/settings\/([a-z0-9_]+)$/);
  if (settingsMatch) {
    const settingId = settingsMatch[1];
    return handleSettingToggle(request, settingId, env, logger);
  }

  // Legacy endpoint for backward compatibility
  if (pathname === "/api/v1/optimizations/rocket-loader") {
    return handleSettingToggle(request, "rocket_loader", env, logger);
  }

  // Add more API routes here
  logger.warn("API route not found", { pathname });
  return createErrorResponse("NOT_FOUND", `API route ${pathname} not found`, correlationId, 404);
}

async function handleSettingToggle(
  request: Request,
  settingId: string,
  env: AppEnv,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<Response> {
  const correlationId = logger.correlationId;

  if (!isMethodAllowed(request, ["POST", "OPTIONS"])) {
    return createMethodNotAllowedResponse(request, ["POST", "OPTIONS"], correlationId);
  }

  // Find the toggle config
  const allConfigs = getAllToggleConfigs();
  const toggleConfig = allConfigs.get(settingId);

  if (!toggleConfig) {
    return createErrorResponse(
      "INVALID_SETTING",
      `Unknown setting: ${settingId}`,
      correlationId,
      400
    );
  }

  // Check if Cloudflare API credentials are available
  const missingCreds: string[] = [];
  if (!env.CF_API_TOKEN) missingCreds.push("CF_API_TOKEN");
  if (!env.CF_ACCOUNT_ID) missingCreds.push("CF_ACCOUNT_ID");
  if (!env.CF_ZONE_ID) missingCreds.push("CF_ZONE_ID");

  if (missingCreds.length > 0) {
    logger.warn("Cloudflare API credentials not configured", { missing: missingCreds });
    return createErrorResponse(
      "CONFIGURATION_ERROR",
      `Missing required Cloudflare API credentials: ${missingCreds.join(", ")}. Please configure these secrets in your Cloudflare Workers environment.`,
      correlationId,
      500
    );
  }

  try {
    // Validate request body
    let body: { enabled?: boolean };
    try {
      body = await request.json();
    } catch (parseError) {
      logger.warn("Invalid JSON in request body", { error: parseError });
      return createErrorResponse(
        "INVALID_REQUEST",
        "Invalid JSON in request body",
        correlationId,
        400
      );
    }

    if (typeof body.enabled !== "boolean") {
      return createErrorResponse(
        "INVALID_REQUEST",
        "Request body must include 'enabled' as a boolean",
        correlationId,
        400
      );
    }

    const enabled = body.enabled;

    // Build the API value based on toggle config
    let apiValue: string | number | boolean | object;

    switch (toggleConfig.valueType) {
      case "on_off":
        apiValue = enabled ? "on" : "off";
        break;
      case "boolean":
        apiValue = enabled;
        break;
      case "string":
        // Handle special cases
        if (toggleConfig.cfSettingName === "security_level") {
          apiValue = enabled ? "under_attack" : "medium";
        } else if (toggleConfig.cfSettingName === "cache_level") {
          apiValue = enabled ? "aggressive" : "basic";
        } else if (toggleConfig.cfSettingName === "min_tls_version") {
          apiValue = enabled ? "1.2" : "1.0";
        } else {
          apiValue = enabled ? "on" : "off";
        }
        break;
      default:
        apiValue = enabled ? "on" : "off";
    }

    // Special handling for minify settings (they affect the same CF setting)
    let cfSettingName = toggleConfig.cfSettingName;
    if (settingId === "minify_js" || settingId === "minify_css") {
      cfSettingName = "minify";
      // For minify, we need to set individual properties
      if (settingId === "minify_js") {
        apiValue = { js: enabled ? "on" : "off" };
      } else {
        apiValue = { css: enabled ? "on" : "off" };
      }
    }

    // Toggle setting via Cloudflare API
    const cfApiUrl = `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/settings/${cfSettingName}`;

    logger.info("Calling Cloudflare API", { url: cfApiUrl, settingId, enabled, apiValue });

    const cfResponse = await fetch(cfApiUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: apiValue }),
    });

    const responseText = await cfResponse.text();
    let cfData: {
      success?: boolean;
      errors?: Array<{ message?: string; code?: string }>;
      message?: string;
    };
    try {
      cfData = JSON.parse(responseText);
    } catch {
      cfData = { message: responseText };
    }

    if (!cfResponse.ok) {
      logger.error("Cloudflare API error", {
        status: cfResponse.status,
        statusText: cfResponse.statusText,
        error: cfData,
      });

      const errorMessage =
        cfData.errors && Array.isArray(cfData.errors) && cfData.errors.length > 0
          ? cfData.errors.map((e) => e.message || e.code).join("; ")
          : cfData.message || `Cloudflare API returned ${cfResponse.status}`;

      return createErrorResponse(
        "CLOUDFLARE_API_ERROR",
        `Failed to toggle ${settingId}: ${errorMessage}`,
        correlationId,
        cfResponse.status >= 400 && cfResponse.status < 500 ? cfResponse.status : 500
      );
    }

    logger.info(`${settingId} toggled successfully`, { enabled, success: cfData.success });

    // Update state in KV
    const kvKey = `${SETTINGS_KV_PREFIX}${settingId}`;
    try {
      await env.APP_KV.put(kvKey, enabled ? "on" : "off");
      logger.info(`Updated ${settingId} state in KV`, { enabled });
    } catch (kvError) {
      logger.error(`Failed to update ${settingId} state in KV`, { error: kvError });
    }

    return createJSONResponse(
      {
        success: true,
        setting: settingId,
        enabled,
        timestamp: Date.now(),
      },
      200,
      correlationId
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error toggling ${settingId}`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return createErrorResponse(
      "INTERNAL_ERROR",
      `Failed to toggle ${settingId}: ${errorMessage}`,
      correlationId,
      500
    );
  }
}

async function handleAuthRoute(
  request: Request,
  pathname: string,
  _env: AppEnv,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<Response> {
  const correlationId = logger.correlationId;

  // OAuth routes will be implemented here
  logger.info("Auth route accessed", { pathname });
  return createErrorResponse(
    "NOT_IMPLEMENTED",
    `Auth route ${pathname} not yet implemented`,
    correlationId,
    501
  );
}

async function handleWebhookRoute(
  request: Request,
  pathname: string,
  _env: AppEnv,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<Response> {
  const correlationId = logger.correlationId;

  // Webhook routes will be implemented here
  logger.info("Webhook route accessed", { pathname });
  return createErrorResponse(
    "NOT_IMPLEMENTED",
    `Webhook route ${pathname} not yet implemented`,
    correlationId,
    501
  );
}
