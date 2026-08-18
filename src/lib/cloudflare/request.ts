/**
 * Cloudflare request info extraction utilities
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/request/
 */

import { CLOUDFLARE_HEADERS } from './headers';
import { isCloudflareWorker, isCloudflareRequest } from './platform';
import type {
  CloudflareRequestInfo,
  CloudflareGeoInfo,
  RequestContext,
  CfCacheStatusType,
  NextRequestExtension,
} from './types';
import { CF_CACHE_STATUS } from './types';
import { getOrCreateRequestId, getCorrelationId } from './correlation';

/**
 * Extract Cloudflare-specific information from request headers
 */
export function getCloudflareRequestInfo(
  request: Request
): CloudflareRequestInfo {
  const headers = request.headers;

  const rayId = headers.get(CLOUDFLARE_HEADERS.CF_RAY);
  const cacheStatus = headers.get(
    CLOUDFLARE_HEADERS.CF_CACHE_STATUS
  ) as CfCacheStatusType | null;
  const clientIp = headers.get(CLOUDFLARE_HEADERS.CF_CONNECTING_IP);
  const country = headers.get(CLOUDFLARE_HEADERS.CF_IPCOUNTRY);
  const city = headers.get(CLOUDFLARE_HEADERS.CF_IPCITY);

  return {
    isCloudflare: !!rayId,
    rayId,
    cacheStatus:
      cacheStatus && Object.values(CF_CACHE_STATUS).includes(cacheStatus)
        ? cacheStatus
        : null,
    clientIp,
    country,
    city,
    isWorker: isCloudflareWorker(),
  };
}

/**
 * Extract geographic information from Cloudflare headers
 */
export function getCloudflareGeoInfo(request: Request): CloudflareGeoInfo {
  const headers = request.headers;

  const country = headers.get(CLOUDFLARE_HEADERS.CF_IPCOUNTRY);
  const city = headers.get(CLOUDFLARE_HEADERS.CF_IPCITY);
  const region = headers.get(CLOUDFLARE_HEADERS.CF_REGION);
  const postalCode = headers.get(CLOUDFLARE_HEADERS.CF_POSTAL_CODE);
  const timezone = headers.get(CLOUDFLARE_HEADERS.CF_TIMEZONE);
  const asn = headers.get(CLOUDFLARE_HEADERS.CF_ASN);
  const isp = headers.get(CLOUDFLARE_HEADERS.CF_IPORG);

  const hasGeoData = !!(country || city || region || timezone);

  return {
    country,
    city,
    region,
    postalCode,
    timezone,
    asn,
    isp,
    hasGeoData,
  };
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string | null {
  const cfIp = request.headers.get(CLOUDFLARE_HEADERS.CF_CONNECTING_IP);
  if (cfIp) {
    return cfIp.trim();
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return null;
}

/**
 * Get client Round Trip Time (RTT) from Cloudflare header
 * Returns the TCP RTT in milliseconds between the client and Cloudflare's edge
 *
 * This is useful for:
 * - Performance monitoring and adaptive content delivery
 * - Detecting slow connections for optimization
 * - Geographic latency analysis
 *
 * @param request - The incoming request
 * @returns RTT in milliseconds or null if not available
 *
 * @see https://developers.cloudflare.com/fundamentals/reference/http-headers/
 *
 * @example
 * ```ts
 * const rtt = getRequestLatency(request);
 * if (rtt && rtt > 500) {
 *   // Client has high latency, consider serving lighter content
 * }
 * ```
 */
export function getRequestLatency(request: Request): number | null {
  const rtt = request.headers.get(CLOUDFLARE_HEADERS.CF_RTT_MS);
  if (!rtt) return null;

  const parsed = parseInt(rtt, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Get visitor scheme from Cloudflare CF-Visitor header
 * Returns the original scheme (http/https) used by the visitor
 *
 * This is useful for:
 * - Detecting if the original request was HTTP or HTTPS
 * - Building correct URLs for redirects
 * - Security checks for mixed content
 *
 * @param request - The incoming request
 * @returns 'http', 'https', or null if not available/parseable
 *
 * @see https://developers.cloudflare.com/fundamentals/reference/http-headers/
 *
 * @example
 * ```ts
 * const scheme = getVisitorScheme(request);
 * const originalUrl = `${scheme}://${host}${path}`;
 * ```
 */
export function getVisitorScheme(request: Request): 'http' | 'https' | null {
  const visitor = request.headers.get(CLOUDFLARE_HEADERS.CF_VISITOR);
  if (!visitor) return null;

  try {
    const parsed = JSON.parse(visitor);
    if (parsed.scheme === 'http' || parsed.scheme === 'https') {
      return parsed.scheme;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create debug headers for Cloudflare requests
 */
export function createCloudflareDebugHeaders(
  request: Request
): Record<string, string> {
  const info = getCloudflareRequestInfo(request);
  const headers: Record<string, string> = {};

  if (info.rayId) {
    headers['X-CF-Ray'] = info.rayId;
  }

  if (info.cacheStatus) {
    headers['X-CF-Cache-Status'] = info.cacheStatus;
  }

  if (info.country) {
    headers['X-CF-Country'] = info.country;
  }

  headers['X-CF-Worker'] = String(info.isWorker);

  return headers;
}

/**
 * Extract comprehensive request context for logging
 * Useful for structured logging in Cloudflare Workers
 */
export function getRequestContext(request: Request): RequestContext {
  const cfInfo = getCloudflareRequestInfo(request);

  // PERFORMANCE: Use pre-parsed nextUrl if available (from NextRequest)
  // nextUrl is 15-20x faster than new URL(request.url)
  const nextUrl = (request as NextRequestExtension).nextUrl;
  let pathname = nextUrl?.pathname;

  if (!pathname) {
    try {
      const url = new URL(request.url);
      pathname = url.pathname;
    } catch {
      pathname = '/unknown';
    }
  }

  return {
    requestId: getOrCreateRequestId(request),
    correlationId: getCorrelationId(request),
    cfRay: cfInfo.rayId,
    clientIp: cfInfo.clientIp,
    country: cfInfo.country,
    path: pathname,
    method: request.method,
    timestamp: new Date().toISOString(),
  };
}
