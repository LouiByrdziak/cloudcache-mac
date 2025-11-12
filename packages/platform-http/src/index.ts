/**
 * Standard error envelope structure
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: unknown;
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  correlationId: string,
  status: number = 500,
  details?: unknown
): Response {
  const body: ErrorResponse = {
    error: {
      code,
      message,
      correlationId,
      ...(details && { details }),
    },
  };

  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    },
  });
}

/**
 * CORS headers for API responses
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID',
  'Access-Control-Max-Age': '86400',
} as const;

/**
 * Handle CORS preflight requests
 */
export function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
  return null;
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
export function handleOPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Add CORS headers to a response
 */
export function addCORSHeaders(response: Response): Response {
  const newResponse = response.clone();
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}

/**
 * Check if HTTP method is allowed
 */
export function isMethodAllowed(request: Request, allowedMethods: string[]): boolean {
  return allowedMethods.includes(request.method);
}

/**
 * Create 405 Method Not Allowed response
 */
export function createMethodNotAllowedResponse(
  request: Request,
  allowedMethods: string[],
  correlationId: string
): Response {
  return createErrorResponse(
    'METHOD_NOT_ALLOWED',
    `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
    correlationId,
    405
  );
}

/**
 * Canonicalize path (remove trailing slash, normalize)
 */
export function canonicalizePath(pathname: string): string {
  // Remove trailing slash except for root
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Check if path needs canonicalization and redirect
 */
export function shouldRedirect(pathname: string): string | null {
  const canonical = canonicalizePath(pathname);
  if (canonical !== pathname) {
    return canonical;
  }
  return null;
}

/**
 * Create redirect response
 */
export function createRedirectResponse(location: string, permanent: boolean = false): Response {
  return new Response(null, {
    status: permanent ? 301 : 302,
    headers: {
      Location: location,
    },
  });
}

/**
 * Check if path is versioned API route
 */
export function isVersionedAPIRoute(pathname: string): boolean {
  return /^\/api\/v\d+\//.test(pathname);
}

/**
 * Extract API version from path
 */
export function getAPIVersion(pathname: string): string | null {
  const match = pathname.match(/^\/api\/(v\d+)\//);
  return match ? match[1] : null;
}

/**
 * Security headers to add to all responses
 */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
} as const;

/**
 * Add security headers to a response
 */
export function addSecurityHeaders(response: Response, correlationId?: string): Response {
  const newResponse = response.clone();
  
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  if (correlationId) {
    newResponse.headers.set('X-Correlation-ID', correlationId);
  }
  
  return newResponse;
}

/**
 * Create JSON response with security headers
 */
export function createJSONResponse(
  data: unknown,
  status: number = 200,
  correlationId?: string
): Response {
  const response = Response.json(data, { status });
  return addSecurityHeaders(response, correlationId);
}

