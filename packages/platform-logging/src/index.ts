/**
 * Generate a correlation ID (UUID v4)
 * Uses Web Crypto API for Cloudflare Workers compatibility
 */
function randomUUID(): string {
  // @ts-expect-error - crypto.randomUUID is available in Cloudflare Workers
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  context?: Record<string, unknown>;
}

/**
 * Generate a correlation ID (UUID v4)
 */
export function generateCorrelationId(): string {
  return randomUUID();
}

/**
 * Extract correlation ID from request headers
 */
export function getCorrelationId(request: Request): string {
  const header = request.headers.get('x-correlation-id') || 
                 request.headers.get('x-request-id') ||
                 generateCorrelationId();
  return header;
}

/**
 * Create a request-scoped logger that includes correlation ID
 */
export function createLogger(correlationId: string) {
  const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId,
      ...(context && { context }),
    };

    // Format for Cloudflare Workers (structured JSON)
    const json = JSON.stringify(entry);
    
    // Use console methods for different levels
    switch (level) {
      case 'debug':
        console.debug(json);
        break;
      case 'info':
        console.info(json);
        break;
      case 'warn':
        console.warn(json);
        break;
      case 'error':
        console.error(json);
        break;
    }
  };

  return {
    debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
    info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
    warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
    error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
    correlationId,
  };
}

/**
 * Create logger from request (extracts or generates correlation ID)
 */
export function createLoggerFromRequest(request: Request) {
  const correlationId = getCorrelationId(request);
  return createLogger(correlationId);
}

