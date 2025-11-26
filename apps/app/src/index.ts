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
import { NAV_ITEMS, getPageConfig, getAllToggleConfigs } from "./config/pages";

declare const __VERSION__: string;

const FAVICON_BASE64 =
  "AAABAAIAEBAAAAEAIADGAQAAJgAAACAgAAABACAAiwMAAOwBAACJUE5HDQoaCgAAAA1JSERSAAAAEAAAABAIBgAAAB/z/2EAAAABc1JHQgCuzhzpAAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAAQoAMABAAAAAEAAAAQAAAAADRVcfIAAAEwSURBVDgR7ZC/L0NRFMc/9762GIjGYhGmjn62EjFa+AvEIhKdJN1IRCLpIGIhsXXqJlY2C4MBbWKukJA0BqQWVNVr33GfvtfQ0L+gd7jfc8/9/jg50DqqcQWyOd5DOHBE0RlmJHhLp97CNqyiXuVd+ilYeyp+vOjrtF/UscKcEUe5qwbI2RGUpHFIg0QQ2sCZl92paZ8f8AsXZTm6gdIrvDi1dq4KuRL0WTDaDsoMLBiN7BtC2CX9nkB0wnyGeJWagXubTMZC3tv0XRMoe40GAyiZBBgKwqQnmjDY8TPHEDTJ/wySXgLcVw7oUpcMWI/Pn91Pa5n42/XhFYVMNq8SJ6k/DdR2NqXWL5RaOFNmiTc82DMqdto7e74zaIv+HrvyUc774qYoS7FYU0Lrs76BL/LgWyHfgEGBAAAAAElFTSuQmCCiVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAC9UlEQVRYCe1UTUhUURT+7hsdhzQhoUXUmEaLsEKNJswgLSgQghZhGzcp9EtQllCLIMJVEmVBPwTtrI1RtIigoCbaFCS0KAqslAyiJEsdf0Zn3u07d94bx9c8kXDXHOa+c8695+c7331vgJzkGMgx8L8zoOZLgL5Z0wRbncZvew3WB+MI4gtC6jGKrE5VHe2XOvr51nIkrGOYtHZiWpdiGnGMI4rJxFF18MW3bL3mBUBfYPNiqwsjNtCXBFYHgHV5QAHTF1tTsHCcjcCGnUiooLETPJvWwAR1Qt1TLU/3ZAPAKvMQjRPQLDZKACIfCUIyK/PFC0LjmhhQmfMw3vW1rjfnWR5Wlr2/txQqTLERFnXlA0G8TdDjntlmcwEpkm5sHHmU6BvbB/TFbXXiZIovA3pffQjh8aukuZEJIcQ5/VRmKu13BCDLlTCvJlIwAyiFjKfCjF5BYOdp1Ljhon0BoDh2BirQkg4eS1vZDfbFhmBqesMA2RBtSEnba73Jc1yB1WiS3SIx5/69FVx/ExGEnHLmKpzmMryI7Cnw3mbLHAB0WSrUjADEHD07P+WVk/pSLlcM49542VRRN8TV/legMEHEwqn5oYKhQdry6eVxReOpGiGqLQxz40xfyXEB0Daik0jqdsdJK38GNNFKDaEuXVSK0RnKYLKWzUNOkxTN6eIpwxQhINWm2p71eA7neAmh2jnULq6ADDfrExtIvOFOFcKWxirS4Xx20v/Jp0o79v77RO3g3UJJswqCWBRefrvobG+nt7n4vgyoK696OGyboVaGcF9Grc5hyF5CRINYae2gfsA1TIDD9380vL48dtK6VdpR+LJkt+lnx6cw2vu5zjhZHg53WU58tvShqjIE8vtg23vV9Z7uzLCGS/1NSvEvm7K/rxWbh4iNorX+uqwrGTaO5+HLgCduxrWsejrd3uYS8Ki17E7k18OO5v5TP2sympPJA3K+IKIPb+zQzdVLF6TYvxTRRyKRf8nL5eQYyDGQY8CPgT8p4ed9RS416QAAAABJRU5ErkJggg==";

// KV key prefix for settings
const SETTINGS_KV_PREFIX = "settings:";

// Cloudflare API settings type mapping
interface CFSettingValue {
  value: string | number | boolean | { css?: string; html?: string; js?: string };
}

// Get setting state from Cloudflare API (with KV as fallback)
async function getSettingState(
  settingId: string,
  cfSettingName: string,
  env: AppEnv,
  kv: KVNamespace,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<boolean> {
  const kvKey = `${SETTINGS_KV_PREFIX}${settingId}`;
  let apiStateEnabled = false;
  let fetchedFromApi = false;

  // 1. Always try to fetch from Cloudflare API first (for bidirectional sync)
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

        fetchedFromApi = true;
        logger.info(`Fetched ${settingId} state from API`, {
          enabled: apiStateEnabled,
          rawValue: value,
        });

        // Update KV cache with latest value
        try {
          await kv.put(kvKey, apiStateEnabled ? "on" : "off");
        } catch (kvWriteError) {
          logger.error(`Failed to update ${settingId} in KV`, { error: kvWriteError });
        }
      }
    } else {
      const errorText = await cfResponse.text();
      logger.error(`Failed to fetch ${settingId} state from Cloudflare API`, {
        status: cfResponse.status,
        error: errorText,
      });
    }
  } catch (apiError) {
    logger.error(`Error calling Cloudflare API for ${settingId} state`, { error: apiError });
  }

  // 2. Fallback to KV if API failed
  if (!fetchedFromApi) {
    try {
      const kvState = await kv.get(kvKey);
      if (kvState === "on" || kvState === "true") {
        apiStateEnabled = true;
        logger.info(`Using ${settingId} state from KV fallback`, { enabled: true });
      } else if (kvState === "off" || kvState === "false") {
        apiStateEnabled = false;
        logger.info(`Using ${settingId} state from KV fallback`, { enabled: false });
      }
    } catch (kvError) {
      logger.error(`Failed to read ${settingId} state from KV fallback`, { error: kvError });
    }
  }

  return apiStateEnabled;
}

// Get raw setting value from Cloudflare API (for TTL and other numeric values)
async function getSettingRawValue(
  settingId: string,
  cfSettingName: string,
  env: AppEnv,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<number | string | null> {
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
        logger.info(`Fetched ${settingId} raw value from API`, { value });
        if (typeof value === "number" || typeof value === "string") {
          return value;
        }
      }
    }
  } catch (apiError) {
    logger.error(`Error calling Cloudflare API for ${settingId} raw value`, { error: apiError });
  }
  return null;
}

// Result type for page settings
interface PageSettingsResult {
  states: Record<string, boolean>;
  rawValues: Record<string, number | string | null>;
}

// Get all settings states for a page
async function getPageSettingsStates(
  pathname: string,
  env: AppEnv,
  kv: KVNamespace,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<PageSettingsResult> {
  const pageConfig = getPageConfig(pathname);
  if (!pageConfig) return { states: {}, rawValues: {} };

  const states: Record<string, boolean> = {};
  const rawValues: Record<string, number | string | null> = {};

  // Fetch all toggle states in parallel
  const promises = pageConfig.toggles.map(async (toggle) => {
    if (toggle.valueType === "ttl") {
      // For TTL settings, get the raw value
      const rawValue = await getSettingRawValue(toggle.id, toggle.cfSettingName, env, logger);
      return { id: toggle.id, enabled: rawValue !== null && rawValue !== 0, rawValue };
    } else {
      // For toggle settings, get the boolean state
      const enabled = await getSettingState(toggle.id, toggle.cfSettingName, env, kv, logger);
      return { id: toggle.id, enabled, rawValue: null };
    }
  });

  const results = await Promise.all(promises);
  for (const result of results) {
    states[result.id] = result.enabled;
    rawValues[result.id] = result.rawValue;
  }

  return { states, rawValues };
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
      const { states: settingsStates, rawValues } = await getPageSettingsStates(
        pathname,
        appEnv,
        appEnv.APP_KV as KVNamespace,
        logger
      );

      // Build optimizations array with current states and slider options
      const optimizations = pageConfig.toggles.map((toggle) => {
        const opt: {
          id: string;
          title: string;
          description: string;
          enabled: boolean;
          controlType?: "toggle" | "slider";
          options?: { value: number | string; label: string }[];
          currentValue?: number | string | null;
          currentLabel?: string | null;
        } = {
          id: toggle.id,
          title: toggle.title,
          description: toggle.description,
          enabled: settingsStates[toggle.id] || false,
        };

        // Add slider-specific properties
        if (toggle.controlType === "slider" && toggle.options) {
          opt.controlType = "slider";
          opt.options = toggle.options;
          opt.currentValue = rawValues[toggle.id];
          // Find the label for the current value
          const currentOption = toggle.options.find((o) => o.value === rawValues[toggle.id]);
          opt.currentLabel = currentOption?.label || null;
        }

        return opt;
      });

      const html = renderPage({
        faviconBase64: FAVICON_BASE64,
        dashboardTitle: pageConfig.title,
        dashboardSubtitle: pageConfig.subtitle,
        activeNavItem: pageConfig.id,
        pageId: pageConfig.id,
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
    let body: { enabled?: boolean; value?: number };
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

    // For TTL settings, expect a numeric value
    if (toggleConfig.valueType === "ttl") {
      if (typeof body.value !== "number") {
        return createErrorResponse(
          "INVALID_REQUEST",
          "Request body must include 'value' as a number for TTL settings",
          correlationId,
          400
        );
      }
    } else if (typeof body.enabled !== "boolean") {
      return createErrorResponse(
        "INVALID_REQUEST",
        "Request body must include 'enabled' as a boolean",
        correlationId,
        400
      );
    }

    const enabled = body.enabled;
    const ttlValue = body.value;

    // Build the API value based on toggle config
    let apiValue: string | number | boolean | object;

    switch (toggleConfig.valueType) {
      case "on_off":
        apiValue = enabled ? "on" : "off";
        break;
      case "boolean":
        apiValue = enabled ?? false;
        break;
      case "ttl":
        // TTL value is passed directly as a number
        apiValue = ttlValue ?? 0;
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

    // Verify the setting was actually changed by checking the response
    const cfDataWithResult = cfData as { success?: boolean; result?: { value?: unknown } };
    const actualValue = cfDataWithResult.result?.value;
    logger.info(`${settingId} API response`, {
      enabled,
      success: cfData.success,
      actualValue,
      expectedValue: apiValue,
    });

    // Check if the actual value matches what we requested
    let valueMatches = false;
    if (typeof apiValue === "string") {
      valueMatches = actualValue === apiValue;
    } else if (typeof apiValue === "boolean") {
      valueMatches = actualValue === apiValue;
    } else if (typeof apiValue === "object") {
      // For complex objects like minify, just check success
      valueMatches = cfData.success === true;
    }

    if (!valueMatches && cfData.success !== true) {
      logger.warn(`${settingId} value mismatch after toggle`, {
        expected: apiValue,
        actual: actualValue,
      });
    }

    // Update state in KV (for toggle settings only)
    if (toggleConfig.valueType !== "ttl") {
      const kvKey = `${SETTINGS_KV_PREFIX}${settingId}`;
      try {
        await env.APP_KV.put(kvKey, enabled ? "on" : "off");
        logger.info(`Updated ${settingId} state in KV`, { enabled });
      } catch (kvError) {
        logger.error(`Failed to update ${settingId} state in KV`, { error: kvError });
      }
    }

    return createJSONResponse(
      {
        success: true,
        setting: settingId,
        enabled: toggleConfig.valueType === "ttl" ? undefined : enabled,
        value: toggleConfig.valueType === "ttl" ? ttlValue : undefined,
        cfResponse: {
          success: cfData.success,
          actualValue: cfDataWithResult.result?.value,
        },
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
