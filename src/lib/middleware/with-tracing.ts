/**
 * Request Tracing Middleware
 * Wraps API routes with distributed tracing
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  extractOrGenerateRequestId,
  requestContextStore,
  logWithContext,
  createTraceHeaders,
} from '@/lib/tracing/request-context';

/**
 * Wrap an API route handler with request tracing
 */
export function withTracing<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  options?: {
    logRequest?: boolean;
    logResponse?: boolean;
  }
): T {
  const { logRequest = true, logResponse = true } = options || {};

  return (async (request: NextRequest, ...args: any[]) => {
    // Extract or generate request ID
    const requestId = extractOrGenerateRequestId(request.headers);

    // Create request context
    const context = requestContextStore.create(
      requestId,
      request.method,
      new URL(request.url).pathname
    );

    // Log incoming request
    if (logRequest) {
      logWithContext(
        requestId,
        'info',
        'Incoming request',
        {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
        }
      );
    }

    try {
      // Call the original handler
      const response = await handler(request, ...args);

      // Calculate duration
      const duration = Date.now() - context.startTime;

      // Add trace headers to response
      const traceHeaders = createTraceHeaders(requestId);
      Object.entries(traceHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add duration header
      response.headers.set('X-Response-Time', `${duration}ms`);

      // Log response
      if (logResponse) {
        logWithContext(
          requestId,
          'info',
          'Response sent',
          {
            status: response.status,
            duration: `${duration}ms`,
          }
        );
      }

      // Clean up context
      setTimeout(() => {
        requestContextStore.remove(requestId);
      }, 1000);

      return response;
    } catch (error) {
      // Calculate duration
      const duration = Date.now() - context.startTime;

      // Log error
      logWithContext(
        requestId,
        'error',
        'Request failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: `${duration}ms`,
        }
      );

      // Clean up context
      setTimeout(() => {
        requestContextStore.remove(requestId);
      }, 1000);

      throw error;
    }
  }) as T;
}

/**
 * Combine multiple middleware functions
 */
export function compose<T extends (...args: any[]) => Promise<Response>>(
  ...middlewares: Array<(handler: T) => T>
): (handler: T) => T {
  return (handler: T) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
