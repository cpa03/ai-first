/**
 * Cloudflare request correlation and tracing utilities
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/request/
 */

import { generateId } from '../security/crypto';
import { CLOUDFLARE_HEADERS, CORRELATION_HEADERS } from './headers';

/**
 * Generate a cryptographically secure request ID
 * Uses centralized generateId() which is Edge-compatible
 */
export function generateRequestId(): string {
  // SECURITY: Use centralized generateId() for cryptographically secure IDs
  return `req_${generateId()}`;
}

/**
 * Get existing request ID from headers or generate a new one
 */
export function getOrCreateRequestId(request: Request): string {
  const existingId = request.headers.get(CORRELATION_HEADERS.REQUEST_ID);
  if (existingId) {
    return existingId;
  }

  const cfRay = request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
  if (cfRay) {
    return `cf_${cfRay}`;
  }

  return generateRequestId();
}

/**
 * Get correlation ID for distributed tracing
 * Follows Cloudflare best practices for request correlation
 */
export function getCorrelationId(request: Request): string {
  const correlationId = request.headers.get(CORRELATION_HEADERS.CORRELATION_ID);
  if (correlationId) {
    return correlationId;
  }

  const traceId = request.headers.get(CORRELATION_HEADERS.TRACE_ID);
  if (traceId) {
    return traceId;
  }

  const cfRay = request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
  if (cfRay) {
    return cfRay;
  }

  return generateRequestId();
}

/**
 * Create correlation headers for downstream requests
 * Propagates tracing information to external services
 */
export function createCorrelationHeaders(
  request: Request,
  overrides?: Partial<Record<keyof typeof CORRELATION_HEADERS, string>>
): Record<string, string> {
  const requestId = overrides?.REQUEST_ID || getOrCreateRequestId(request);
  const correlationId = overrides?.CORRELATION_ID || getCorrelationId(request);

  const headers: Record<string, string> = {
    [CORRELATION_HEADERS.REQUEST_ID]: requestId,
    [CORRELATION_HEADERS.CORRELATION_ID]: correlationId,
  };

  const cfRay = request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
  if (cfRay) {
    headers['x-cf-ray'] = cfRay;
  }

  return headers;
}

/**
 * Create a response with correlation headers
 * Ensures every response includes tracing information
 */
export function addCorrelationHeaders(
  response: Response,
  request: Request
): Response {
  const requestId = getOrCreateRequestId(request);
  const correlationId = getCorrelationId(request);

  const newHeaders = new Headers();

  try {
    response.headers.forEach((value, key) => {
      newHeaders.set(key, value);
    });
  } catch {
    // In some environments (like jsdom), headers.forEach may not work
    // We'll just add the correlation headers in that case
  }

  newHeaders.set(CORRELATION_HEADERS.REQUEST_ID, requestId);
  newHeaders.set(CORRELATION_HEADERS.CORRELATION_ID, correlationId);

  const cfRay = request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
  if (cfRay) {
    newHeaders.set('x-cf-ray', cfRay);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
