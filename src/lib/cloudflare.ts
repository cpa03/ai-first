/**
 * Cloudflare-specific utilities and helpers
 *
 * This module provides utilities for detecting and working with Cloudflare
 * Workers environment, including platform detection, header extraction,
 * geo information, cache control, and edge-specific operations.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/
 * @see https://developers.cloudflare.com/workers/runtime-apis/request/
 */

/**
 * Cloudflare-specific headers that are added to requests
 */
export const CLOUDFLARE_HEADERS = {
  /** Unique request ID assigned by Cloudflare (e.g., "7c1c2c3d4e5f6g7h") */
  CF_RAY: 'cf-ray',
  /** Cache status (HIT, MISS, BYPASS, EXPIRED, STALE, UPDATING, REVALIDATED) */
  CF_CACHE_STATUS: 'cf-cache-status',
  /** Client IP address as seen by Cloudflare */
  CF_CONNECTING_IP: 'cf-connecting-ip',
  /** Client IP protocol version (v4 or v6) */
  CF_IPCOM: 'cf-ipcom',
  /** Visitor country code */
  CF_IPCOUNTRY: 'cf-ipcountry',
  /** Request priority (e.g., "weight=256;exclusive=0") */
  CF_PRIORITY: 'cf-priority',
  /** Visitor city (if available) */
  CF_IPCITY: 'cf-ipcity',
  /** TLS/SSL version used */
  CF_VISITOR: 'cf-visitor',
  /** Worker trace ID for debugging */
  CF_TRACE_ID: 'cf-trace-id',
  /** Postal code (if available) */
  CF_POSTAL_CODE: 'cf-postal-code',
  /** Region/subdivision code (e.g., "CA" for California) */
  CF_REGION: 'cf-region',
  /** Timezone of the client */
  CF_TIMEZONE: 'cf-timezone',
  /** ASN (Autonomous System Number) of the client's ISP */
  CF_ASN: 'cf-asn',
  /** Name of the ISP */
  CF_IPORG: 'cf-iporg',
} as const;

/**
 * Cloudflare environment variables that indicate a Workers environment
 */
export const CLOUDFLARE_ENV_VARS = {
  /** Set automatically by Cloudflare Workers runtime */
  CF_WORKER: 'CF_WORKER',
  /** Alternative indicator for Cloudflare environment */
  CLOUDFLARE: 'CLOUDFLARE',
  /** Set by Cloudflare Workers for the request context */
  CLOUDFLARE_WORKERS: 'CLOUDFLARE_WORKERS',
} as const;

/**
 * Cache status values returned by CF-Cache-Status header
 */
export const CF_CACHE_STATUS = {
  /** Resource found in cache */
  HIT: 'HIT',
  /** Resource not found in cache */
  MISS: 'MISS',
  /** Cache bypassed (e.g., no-cache directive) */
  BYPASS: 'BYPASS',
  /** Cached resource expired */
  EXPIRED: 'EXPIRED',
  /** Stale resource served while revalidating */
  STALE: 'STALE',
  /** Stale resource being updated */
  UPDATING: 'UPDATING',
  /** Resource revalidated successfully */
  REVALIDATED: 'REVALIDATED',
} as const;

export type CfCacheStatusType =
  (typeof CF_CACHE_STATUS)[keyof typeof CF_CACHE_STATUS];

/**
 * Cloudflare cache TTL presets for common use cases
 * @see https://developers.cloudflare.com/cache/about/cache-control/
 */
export const CF_CACHE_TTL = {
  /** No caching */
  NO_STORE: 0,
  /** Short cache for frequently changing content (API responses) */
  SHORT: 60,
  /** Medium cache for semi-static content */
  MEDIUM: 3600,
  /** Long cache for static assets */
  LONG: 86400,
  /** Very long cache for immutable assets (with versioned URLs) */
  IMMUTABLE: 31536000,
} as const;

/**
 * Cloudflare platform limits and constraints
 * @see https://developers.cloudflare.com/workers/platform/limits/
 */
export const CF_LIMITS = {
  /** Free tier CPU time limit (milliseconds) */
  CPU_MS_FREE: 10,
  /** Paid tier CPU time limit (milliseconds) */
  CPU_MS_PAID: 50,
  /** Unbound worker CPU limit (milliseconds) */
  CPU_MS_UNBOUND: 900000,
  /** Maximum request body size (bytes) - 100MB */
  MAX_BODY_SIZE: 100 * 1024 * 1024,
  /** Maximum KV value size (bytes) - 25MB */
  MAX_KV_VALUE_SIZE: 25 * 1024 * 1024,
  /** Maximum D1 database size */
  MAX_D1_SIZE: '500MB',
} as const;

/**
 * Information extracted from Cloudflare headers
 */
export interface CloudflareRequestInfo {
  /** Whether the request is coming through Cloudflare */
  isCloudflare: boolean;
  /** Cloudflare Ray ID for request tracing */
  rayId: string | null;
  /** Cache status of the response */
  cacheStatus: CfCacheStatusType | null;
  /** Client IP address from Cloudflare */
  clientIp: string | null;
  /** Client country code */
  country: string | null;
  /** Client city (if available) */
  city: string | null;
  /** Whether running in a Cloudflare Worker */
  isWorker: boolean;
}

/**
 * Geographic information extracted from Cloudflare headers
 */
export interface CloudflareGeoInfo {
  /** Country code (ISO 3166-1 Alpha-2, e.g., "US", "GB") */
  country: string | null;
  /** City name */
  city: string | null;
  /** Region/subdivision code (e.g., "CA" for California) */
  region: string | null;
  /** Postal/ZIP code */
  postalCode: string | null;
  /** Timezone (e.g., "America/Los_Angeles") */
  timezone: string | null;
  /** ASN of the client's ISP */
  asn: string | null;
  /** ISP name */
  isp: string | null;
  /** Whether geo information is available */
  hasGeoData: boolean;
}

/**
 * Execution context information for the current runtime
 */
export interface ExecutionContext {
  /** Detected platform */
  platform: 'cloudflare' | 'vercel' | 'node' | 'unknown';
  /** Whether running in edge runtime */
  isEdge: boolean;
  /** Whether running in Node.js runtime */
  isNode: boolean;
  /** Whether running in development mode */
  isDevelopment: boolean;
  /** Whether running in production mode */
  isProduction: boolean;
  /** Node.js version if available */
  nodeVersion: string | null;
  /** Region hint if available (e.g., "auto" for smart placement) */
  region: string | null;
}

/**
 * Cache control options for Cloudflare
 */
export interface CacheControlOptions {
  /** Max age in seconds */
  maxAge?: number;
  /** Shared max age for CDN caching */
  sMaxAge?: number;
  /** Whether the response can be cached by browser */
  public?: boolean;
  /** Whether the response is private to the user */
  private?: boolean;
  /** Whether to always revalidate with origin */
  noCache?: boolean;
  /** Whether to not cache at all */
  noStore?: boolean;
  /** Whether to allow stale content while revalidating */
  staleWhileRevalidate?: number;
  /** Whether to serve stale content on error */
  staleIfError?: number;
  /** Whether the resource is immutable (never changes) */
  immutable?: boolean;
}

export function isCloudflareWorker(): boolean {
  if (
    process.env[CLOUDFLARE_ENV_VARS.CF_WORKER] ||
    process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE] ||
    process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE_WORKERS]
  ) {
    return true;
  }

  if (typeof globalThis !== 'undefined') {
    // @ts-expect-error - Cloudflare Workers-specific global
    if (typeof globalThis.caches !== 'undefined' && globalThis.caches.default) {
      return true;
    }
  }

  return false;
}

export function isCloudflareRequest(request: Request): boolean {
  return !!request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
}

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

export function createCacheControlHeaders(
  options: CacheControlOptions
): string {
  const directives: string[] = [];

  if (options.noStore) {
    directives.push('no-store');
    return directives.join(', ');
  }

  if (options.public) {
    directives.push('public');
  } else if (options.private) {
    directives.push('private');
  }

  if (options.noCache) {
    directives.push('no-cache');
  }

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }

  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError !== undefined) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  if (options.immutable) {
    directives.push('immutable');
  }

  if (directives.length === 0) {
    directives.push('no-store');
  }

  return directives.join(', ');
}

export function detectPlatform(): 'cloudflare' | 'vercel' | 'unknown' {
  if (isCloudflareWorker()) {
    return 'cloudflare';
  }

  if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_URL) {
    return 'vercel';
  }

  return 'unknown';
}

export function getExecutionContext(): ExecutionContext {
  const platform = detectPlatform();
  const isEdge = platform === 'cloudflare';
  const isNode =
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.node !== 'undefined';

  const nodeEnv = process.env.NODE_ENV;
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  const nodeVersion = isNode ? process.versions.node : null;
  const region = process.env.VERCEL_REGION || process.env.CF_REGION || null;

  return {
    platform: isNode && platform === 'unknown' ? 'node' : platform,
    isEdge,
    isNode,
    isDevelopment,
    isProduction,
    nodeVersion,
    region,
  };
}

export function isEdgeRequest(request: Request): boolean {
  return isCloudflareRequest(request);
}

export function getCacheKey(
  url: string,
  variants?: Record<string, string>
): string {
  try {
    const urlObj = new URL(url);
    const baseKey = `cache:${urlObj.hostname}${urlObj.pathname}`;

    if (!variants || Object.keys(variants).length === 0) {
      return baseKey;
    }

    const variantParts = Object.entries(variants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(':');

    return `${baseKey}:${variantParts}`;
  } catch {
    return `cache:${url}`;
  }
}

/**
 * Request correlation headers for distributed tracing
 */
export const CORRELATION_HEADERS = {
  REQUEST_ID: 'x-request-id',
  CORRELATION_ID: 'x-correlation-id',
  TRACE_ID: 'x-trace-id',
  SPAN_ID: 'x-span-id',
} as const;

/**
 * Generate a cryptographically secure request ID
 * Uses crypto.randomUUID() when available, falls back to timestamp + random
 */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `req_${timestamp}_${randomPart}`;
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

/**
 * Request context for logging and debugging
 */
export interface RequestContext {
  requestId: string;
  correlationId: string;
  cfRay: string | null;
  clientIp: string | null;
  country: string | null;
  path: string;
  method: string;
  timestamp: string;
}

/**
 * Extract comprehensive request context for logging
 * Useful for structured logging in Cloudflare Workers
 */
export function getRequestContext(request: Request): RequestContext {
  const cfInfo = getCloudflareRequestInfo(request);
  const url = new URL(request.url);

  return {
    requestId: getOrCreateRequestId(request),
    correlationId: getCorrelationId(request),
    cfRay: cfInfo.rayId,
    clientIp: cfInfo.clientIp,
    country: cfInfo.country,
    path: url.pathname,
    method: request.method,
    timestamp: new Date().toISOString(),
  };
}
