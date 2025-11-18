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

declare const __VERSION__: string;

const FAVICON_BASE64 =
  "AAABAAIAEBAAAAEAIADGAQAAJgAAACAgAAABACAAiwMAAOwBAACJUE5HDQoaCgAAAA1JSERSAAAAEAAAABAIBgAAAB/z/2EAAAABc1JHQgCuzhzpAAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAAQoAMABAAAAAEAAAAQAAAAADRVcfIAAAEwSURBVDgR7ZC/L0NRFMc/9762GIjGYhGmjn62EjFa+AvEIhKdJN1IRCLpIGIhsXXqJlY2C4MBbWKukJA0BqQWVNVr33GfvtfQ0L+gd7jfc8/9/jg50DqqcQWyOd5DOHBE0RlmJHhLp97CNqyiXuVd+ilYeyp+vOjrtF/UscKcEUe5qwbI2RGUpHFIg0QQ2sCZl92paZ8f8AsXZTm6gdIrvDi1dq4KuRL0WTDaDsoMLBiN7BtC2CX9nkB0wnyGeJWagXubTMZC3tv0XRMoe40GAyiZBBgKwqQnmjDY8TPHEDTJ/wySXgLcVw7oUpcMWI/Pn91Pa5n42/XhFYVMNq8SJ6k/DdR2NqXWL5RaOFNmiTc82DMqdto7e74zaIv+HrvyUc774qYoS7FYU0Lrs76BL/LgWyHfgEGBAAAAAElFTSuQmCCiVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAC9UlEQVRYCe1UTUhUURT+7hsdhzQhoUXUmEaLsEKNJswgLSgQghZhGzcp9EtQllCLIMJVEmVBPwTtrI1RtIigoCbaFCS0KAqslAyiJEsdf0Zn3u07d94bx9c8kXDXHOa+c8695+c7331vgJzkGMgx8L8zoOZLgL5Z0wRbncZvew3WB+MI4gtC6jGKrE5VHe2XOvr51nIkrGOYtHZiWpdiGnGMI4rJxFF18MW3bL3mBUBfYPNiqwsjNtCXBFYHgHV5QAHTF1tTsHCcjcCGnUiooLETPJvWwAR1Qt1TLU/3ZAPAKvMQjRPQLDZKACIfCUIyK/PFC0LjmhhQmfMw3vW1rjfnWR5Wlr2/txQqTLERFnXlA0G8TdDjntlmcwEpkm5sHHmU6BvbB/TFbXXiZIovA3pffQjh8aukuZEJIcQ5/VRmKu13BCDLlTCvJlIwAyiFjKfCjF5BYOdp1Ljhon0BoDh2BirQkg4eS1vZDfbFhmBqesMA2RBtSEnba73Jc1yB1WiS3SIx5/69FVx/ExGEnHLmKpzmMryI7Cnw3mbLHAB0WSrUjADEHD07P+WVk/pSLlcM49542VRRN8TV/legMEHEwqn5oYKhQdry6eVxReOpGiGqLQxz40xfyXEB0Daik0jqdsdJK38GNNFKDaEuXVSK0RnKYLKWzUNOkxTN6eIpwxQhINWm2p71eA7neAmh2jnULq6ADDfrExtIvOFOFcKWxirS4Xx20v/Jp0o79v77RO3g3UJJswqCWBRefrvobG+nt7n4vgyoK696OGyboVaGcF9Grc5hyF5CRINYae2gfsA1TIDD9380vL48dtK6VdpR+LJkt+lnx6cw2vu5zjhZHg53WU58tvShqjIE8vtg23vV9Z7uzLCGS/1NSvEvm7K/rxWbh4iNorX+uqwrGTaO5+HLgCduxrWsejrd3uYS8Ki17E7k18OO5v5TP2sympPJA3K+IKIPb+zQzdVLF6TYvxTRRyKRf8nL5eQYyDGQY8CPgT8p4ed9RS416QAAAABJRU5ErkJggg==";

const ROCKET_LOADER_KV_KEY = "settings:rocket_loader";

async function getRocketLoaderState(
  env: AppEnv,
  kv: KVNamespace,
  logger: ReturnType<typeof createLoggerFromRequest>
): Promise<boolean> {
  // 1. Try to get from KV first
  try {
    const kvState = await kv.get(ROCKET_LOADER_KV_KEY);
    if (kvState === "on") return true;
    if (kvState === "off") return false;
  } catch (kvError) {
    logger.error("Failed to read Rocket Loader state from KV", { error: kvError });
  }

  // 2. If not in KV, fetch from Cloudflare API
  logger.info("Rocket Loader state not in KV, fetching from API");
  let apiStateEnabled = false; // Default to off
  try {
    const cfApiUrl = `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/settings/rocket_loader`;
    const cfResponse = await fetch(cfApiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (cfResponse.ok) {
      const data: any = await cfResponse.json();
      if (data.success && data.result) {
        apiStateEnabled = data.result.value === "on";
        logger.info("Fetched Rocket Loader state from API", { enabled: apiStateEnabled });
        
        // 3. Store in KV for next time (don't block response for this)
        await kv.put(ROCKET_LOADER_KV_KEY, apiStateEnabled ? "on" : "off");
      }
    } else {
      logger.error("Failed to fetch Rocket Loader state from Cloudflare API", { status: cfResponse.status });
    }
  } catch (apiError) {
    logger.error("Error calling Cloudflare API for Rocket Loader state", { error: apiError });
  }

  return apiStateEnabled;
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

    // Handle root route with new page template
    if (pathname === "/") {
      const rocketLoaderEnabled = await getRocketLoaderState(
        appEnv,
        appEnv.APP_KV as KVNamespace,
        logger
      );

      const html = renderPage({
        faviconBase64: FAVICON_BASE64,
        dashboardTitle: "Cloudcache Dashboard",
        storeName: "Your Store",
        planName: "Free Plan",
        optimizations: [
          {
            id: "rocket-loader",
            title: "Rocket Loader™",
            description: "Improve paint times for pages that include JavaScript.",
            enabled: rocketLoaderEnabled,
          },
        ],
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

    if (pathname === "/readyz") {
      // Deep health check
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

  // API v1 optimizations endpoints
  if (pathname === "/api/v1/optimizations/rocket-loader") {
    if (!isMethodAllowed(request, ["POST", "OPTIONS"])) {
      return createMethodNotAllowedResponse(request, ["POST", "OPTIONS"], correlationId);
    }

    // Check if Cloudflare API credentials are available
    const missingCreds: string[] = [];
    if (!env.CF_API_TOKEN) missingCreds.push("CF_API_TOKEN");
    if (!env.CF_ACCOUNT_ID) missingCreds.push("CF_ACCOUNT_ID");
    if (!env.CF_ZONE_ID) missingCreds.push("CF_ZONE_ID");

    if (missingCreds.length > 0) {
      logger.warn("Cloudflare API credentials not configured", {
        missing: missingCreds,
      });
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

      // Toggle Rocket Loader via Cloudflare API
      const cfApiUrl = `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/settings/rocket_loader`;
      
      logger.info("Calling Cloudflare API", { url: cfApiUrl, enabled });
      
      const cfResponse = await fetch(cfApiUrl, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: enabled ? "on" : "off",
        }),
      });

      const responseText = await cfResponse.text();
      let cfData: any;
      try {
        cfData = JSON.parse(responseText);
      } catch {
        cfData = { raw: responseText };
      }

      if (!cfResponse.ok) {
        logger.error("Cloudflare API error", {
          status: cfResponse.status,
          statusText: cfResponse.statusText,
          error: cfData,
        });
        
        const errorMessage = cfData.errors && Array.isArray(cfData.errors) && cfData.errors.length > 0
          ? cfData.errors.map((e: any) => e.message || e.code).join("; ")
          : cfData.message || `Cloudflare API returned ${cfResponse.status}`;

        return createErrorResponse(
          "CLOUDFLARE_API_ERROR",
          `Failed to toggle Rocket Loader: ${errorMessage}`,
          correlationId,
          cfResponse.status >= 400 && cfResponse.status < 500 ? cfResponse.status : 500
        );
      }

      logger.info("Rocket Loader toggled successfully", { enabled, success: cfData.success });

      // Update state in KV
      try {
        await env.APP_KV.put(ROCKET_LOADER_KV_KEY, enabled ? "on" : "off");
        logger.info("Updated Rocket Loader state in KV", { enabled });
      } catch (kvError) {
        logger.error("Failed to update Rocket Loader state in KV", { error: kvError });
        // Don't fail the request, just log the error
      }

      return createJSONResponse(
        {
          success: true,
          optimization: "rocket-loader",
          enabled,
          timestamp: Date.now(),
        },
        200,
        correlationId
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Error toggling Rocket Loader", { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return createErrorResponse(
        "INTERNAL_ERROR",
        `Failed to toggle Rocket Loader: ${errorMessage}`,
        correlationId,
        500
      );
    }
  }

  // Add more API routes here
  logger.warn("API route not found", { pathname });
  return createErrorResponse("NOT_FOUND", `API route ${pathname} not found`, correlationId, 404);
}

async function handleAuthRoute(
  request: Request,
  pathname: string,
  env: AppEnv,
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
  env: AppEnv,
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
