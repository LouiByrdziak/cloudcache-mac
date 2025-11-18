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

declare const __VERSION__: string;

const FAVICON_BASE64 =
  "AAABAAIAEBAAAAEAIADGAQAAJgAAACAgAAABACAAiwMAAOwBAACJUE5HDQoaCgAAAA1JSERSAAAAEAAAABAIBgAAAB/z/2EAAAABc1JHQgCuzhzpAAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAAQoAMABAAAAAEAAAAQAAAAADRVcfIAAAEwSURBVDgR7ZC/L0NRFMc/9762GIjGYhGmjn62EjFa+AvEIhKdJN1IRCLpIGIhsXXqJlY2C4MBbWKukJA0BqQWVNVr33GfvtfQ0L+gd7jfc8/9/jg50DqqcQWyOd5DOHBE0RlmJHhLp97CNqyiXuVd+ilYeyp+vOjrtF/UscKcEUe5qwbI2RGUpHFIg0QQ2sCZl92paZ8f8AsXZTm6gdIrvDi1dq4KuRL0WTDaDsoMLBiN7BtC2CX9nkB0wnyGeJWagXubTMZC3tv0XRMoe40GAyiZBBgKwqQnmjDY8TPHEDTJ/wySXgLcVw7oUpcMWI/Pn91Pa5n42/XhFYVMNq8SJ6k/DdR2NqXWL5RaOFNmiTc82DMqdto7e74zaIv+HrvyUc774qYoS7FYU0Lrs76BL/LgWyHfgEGBAAAAAElFTSuQmCCiVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAC9UlEQVRYCe1UTUhUURT+7hsdhzQhoUXUmEaLsEKNJswgLSgQghZhGzcp9EtQllCLIMJVEmVBPwTtrI1RtIigoCbaFCS0KAqslAyiJEsdf0Zn3u07d94bx9c8kXDXHOa+c8695+c7331vgJzkGMgx8L8zoOZLgL5Z0wRbncZvew3WB+MI4gtC6jGKrE5VHe2XOvr51nIkrGOYtHZiWpdiGnGMI4rJxFF18MW3bL3mBUBfYPNiqwsjNtCXBFYHgHV5QAHTF1tTsHCcjcCGnUiooLETPJvWwAR1Qt1TLU/3ZAPAKvMQjRPQLDZKACIfCUIyK/PFC0LjmhhQmfMw3vW1rjfnWR5Wlr2/txQqTLERFnXlA0G8TdDjntlmcwEpkm5sHHmU6BvbB/TFbXXiZIovA3pffQjh8aukuZEJIcQ5/VRmKu13BCDLlTCvJlIwAyiFjKfCjF5BYOdp1Ljhon0BoDh2BirQkg4eS1vZDfbFhmBqesMA2RBtSEnba73Jc1yB1WiS3SIx5/69FVx/ExGEnHLmKpzmMryI7Cnw3mbLHAB0WSrUjADEHD07P+WVk/pSLlcM49542VRRN8TV/legMEHEwqn5oYKhQdry6eVxReOpGiGqLQxz40xfyXEB0Daik0jqdsdJK38GNNFKDaEuXVSK0RnKYLKWzUNOkxTN6eIpwxQhINWm2p71eA7neAmh2jnULq6ADDfrExtIvOFOFcKWxirS4Xx20v/Jp0o79v77RO3g3UJJswqCWBRefrvobG+nt7n4vgyoK696OGyboVaGcF9Grc5hyF5CRINYae2gfsA1TIDD9380vL48dtK6VdpR+LJkt+lnx6cw2vu5zjhZHg53WU58tvShqjIE8vtg23vV9Z7uzLCGS/1NSvEvm7K/rxWbh4iNorX+uqwrGTaO5+HLgCduxrWsejrd3uYS8Ki17E7k18OO5v5TP2sympPJA3K+IKIPb+zQzdVLF6TYvxTRRyKRf8nL5eQYyDGQY8CPgT8p4ed9RS416QAAAABJRU5ErkJggg==";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    const correlationId = getCorrelationId(request);
    const url = new URL(request.url);
    const pathname = canonicalizePath(url.pathname);

    // Handle simple routes that don't require environment validation
    // These routes should work even in local dev without secrets

    // Serve favicon
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

    // Health check endpoints (simple version, no env validation)
    if (pathname === "/healthz") {
      const response = createJSONResponse(
        { status: "ok", service: "app", version: __VERSION__ },
        200,
        correlationId
      );
      return response;
    }

    // Root route - show validation marker (no env validation needed)
    if (pathname === "/") {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudcache APP</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: white;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    h1 {
      color: red;
    }
  </style>
</head>
<body>
  <h1>Hello World I am Cloudcache App.</h1>
</body>
</html>
      `.trim();
      const response = new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      return addSecurityHeaders(response, correlationId);
    }

    // From here on, routes require environment validation
    // Validate environment variables (fail fast)
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

    // Create logger with correlation ID
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

    if (pathname === "/readyz") {
      // Deep health check - verify environment is valid
      const response = createJSONResponse(
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
      return response;
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
