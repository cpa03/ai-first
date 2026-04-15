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

import { PLATFORM_ENV_VARS } from './config/constants';
import { generateSecureId } from './id-generator';

/**
 * Cloudflare-specific headers that are added to requests
 * @see https://developers.cloudflare.com/fundamentals/reference/http-headers/
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
  /**
   * Indicates if request came through Cloudflare WARP
   * @see https://developers.cloudflare.com/warp-client/
   */
  CF_WARP: 'cf-warp',
  /**
   * Early Hints verification token for 103 responses
   * @see https://developers.cloudflare.com/cache/about/early-hints/
   */
  CF_EW_VTT: 'cf-ew-vtt',
  /**
   * Client TCP RTT (Round Trip Time) in milliseconds
   * Useful for performance monitoring and adaptive content
   */
  CF_RTT_MS: 'cf-rtt-ms',
  /**
   * TLS fingerprint for bot detection
   * @see https://developers.cloudflare.com/bots/concepts/bot-score/
   */
  CF_TLS_FINGERPRINT: 'cf-tls-fingerprint',
  /**
   * Bot management score (1-99, lower = more likely bot)
   * @see https://developers.cloudflare.com/bots/concepts/bot-score/
   */
  CF_BOT_SCORE: 'cf-bot-score',
  /**
   * Threat score (0-100, higher = more threatening)
   * @see https://developers.cloudflare.com/waf/
   */
  CF_THREAT_SCORE: 'cf-threat-score',
} as const;

/**
 * Cloudflare environment variables that indicate a Workers or Pages environment
 * @see https://developers.cloudflare.com/pages/platform/build-configuration/
 * @deprecated Use PLATFORM_ENV_VARS.CLOUDFLARE from config/constants instead
 */
export const CLOUDFLARE_ENV_VARS = PLATFORM_ENV_VARS.CLOUDFLARE;

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

  if (
    process.env[CLOUDFLARE_ENV_VARS.CF_PAGES] ||
    process.env[CLOUDFLARE_ENV_VARS.CF_PAGES_BRANCH] ||
    process.env[CLOUDFLARE_ENV_VARS.CF_PAGES_URL]
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

  const { VERCEL, NEXT_PUBLIC_VERCEL_URL } = PLATFORM_ENV_VARS.VERCEL;
  if (process.env[VERCEL] || process.env[NEXT_PUBLIC_VERCEL_URL]) {
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
  const region =
    process.env[PLATFORM_ENV_VARS.VERCEL.VERCEL_REGION] ||
    process.env[PLATFORM_ENV_VARS.CLOUDFLARE.CF_REGION] ||
    null;

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
 * Uses generateSecureId() for cross-environment compatibility
 */
export function generateRequestId(): string {
  return generateSecureId('req_');
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

/**
 * Early Hints configuration for 103 responses
 * @see https://developers.cloudflare.com/cache/about/early-hints/
 */
export interface EarlyHintsOptions {
  /** Resources to preload (scripts, styles, fonts) */
  preload?: string[];
  /** Resources to preconnect to (origins) */
  preconnect?: string[];
}

/**
 * Create Early Hints headers for 103 response
 *
 * Early Hints allow browsers to start loading critical resources
 * before the main response arrives, improving page load performance.
 *
 * @example
 * ```ts
 * const hints = createEarlyHintsHeaders({
 *   preload: ['/styles.css', '/script.js'],
 *   preconnect: ['https://api.example.com']
 * });
 * // Returns: { 'link': '</styles.css>; rel=preload; as=style, </script.js>; rel=preload; as=script, <https://api.example.com>; rel=preconnect' }
 * ```
 */
export function createEarlyHintsHeaders(
  options: EarlyHintsOptions
): Record<string, string> {
  const links: string[] = [];

  if (options.preload) {
    for (const resource of options.preload) {
      const asType = getResourceType(resource);
      links.push(`<${resource}>; rel=preload${asType ? `; as=${asType}` : ''}`);
    }
  }

  if (options.preconnect) {
    for (const origin of options.preconnect) {
      links.push(`<${origin}>; rel=preconnect`);
    }
  }

  if (links.length === 0) {
    return {};
  }

  return {
    link: links.join(', '),
  };
}

/**
 * Determine the 'as' attribute for preload based on file extension
 */
function getResourceType(resource: string): string | null {
  const ext = resource.split('?')[0].split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    css: 'style',
    js: 'script',
    woff: 'font',
    woff2: 'font',
    ttf: 'font',
    otf: 'font',
    eot: 'font',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    mp4: 'video',
    webm: 'video',
  };
  return ext ? typeMap[ext] || null : null;
}

/**
 * Check if Early Hints are supported and should be sent
 * Early Hints work best when Cloudflare can cache the Link header
 */
export function shouldSendEarlyHints(request: Request): boolean {
  const cfRay = request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
  const cacheStatus = request.headers.get(CLOUDFLARE_HEADERS.CF_CACHE_STATUS);

  // Only send Early Hints through Cloudflare with valid caching
  return !!cfRay && cacheStatus !== 'BYPASS';
}

/**
 * Cloudflare Bot Detection result
 */
export interface BotDetectionResult {
  /** Whether the request is likely from a bot */
  isBot: boolean;
  /** Bot score from Cloudflare (1-99, lower = more likely bot) */
  botScore: number | null;
  /** Threat score from Cloudflare (0-100, higher = more threatening) */
  threatScore: number | null;
  /** Client is using Cloudflare WARP */
  isWarp: boolean;
  /** TLS fingerprint hash */
  tlsFingerprint: string | null;
}

/**
 * Detect bot and threat information from Cloudflare headers
 * Useful for rate limiting and security decisions
 *
 * @example
 * ```ts
 * const botInfo = detectBot(request);
 * if (botInfo.isBot || (botInfo.threatScore && botInfo.threatScore > 50)) {
 *   // Apply stricter rate limiting
 * }
 * ```
 */
export function detectBot(request: Request): BotDetectionResult {
  const headers = request.headers;

  const botScoreStr = headers.get(CLOUDFLARE_HEADERS.CF_BOT_SCORE);
  const threatScoreStr = headers.get(CLOUDFLARE_HEADERS.CF_THREAT_SCORE);
  const warpStatus = headers.get(CLOUDFLARE_HEADERS.CF_WARP);
  const tlsFingerprint = headers.get(CLOUDFLARE_HEADERS.CF_TLS_FINGERPRINT);

  const botScore = botScoreStr ? parseInt(botScoreStr, 10) : null;
  const threatScore = threatScoreStr ? parseInt(threatScoreStr, 10) : null;

  // Bot score < 30 is highly likely a bot, 30-50 is uncertain, > 50 is likely human
  const isLikelyBot =
    botScore !== null
      ? botScore < 30
      : threatScore !== null && threatScore > 50;

  return {
    isBot: isLikelyBot,
    botScore: isNaN(botScore as number) ? null : botScore,
    threatScore: isNaN(threatScore as number) ? null : threatScore,
    isWarp: warpStatus === '1' || warpStatus === 'true',
    tlsFingerprint,
  };
}

// ============================================================
// Cloudflare KV Cache Helper
// ============================================================

/**
 * Cloudflare KV Cache Helper
 *
 * Provides a simple, typed API for Cloudflare KV namespace operations.
 * Follows Cloudflare best practices for edge caching with proper TTL
 * management and error handling.
 *
 * @see https://developers.cloudflare.com/kv/
 *
 * @example
 * ```ts
 * // Initialize with KV namespace binding
 * const cache = new CloudflareKV(env.CACHE_KV);
 *
 * // Get/Set with automatic JSON serialization
 * const data = await cache.get<MyData>('key');
 * await cache.set('key', data, { ttl: CF_CACHE_TTL.MEDIUM });
 *
 * // Cache-aside pattern
 * const result = await cache.getOrSet('key', async () => {
 *   return await fetchExpensiveData();
 * }, { ttl: CF_CACHE_TTL.LONG });
 * ```
 */
export class CloudflareKV {
  private kv: KVNamespace | null;
  private prefix: string;
  private onError?: (error: Error, operation: string, key: string) => void;

  /**
   * Create a new CloudflareKV instance
   * @param kv - KV namespace binding (can be null in non-edge environments)
   * @param options - Configuration options
   * @param options.prefix - Optional key prefix for namespace isolation
   * @param options.onError - Optional callback for logging KV operation errors.
   *   Useful for production debugging and observability. Errors are caught and logged,
   *   but do not break the application (graceful degradation).
   */
  constructor(
    kv: KVNamespace | undefined | null,
    options?: { prefix?: string; onError?: (error: Error, operation: string, key: string) => void }
  ) {
    this.kv = kv ?? null;
    this.prefix = options?.prefix ?? '';
    this.onError = options?.onError;
  }

  /**
   * Check if KV namespace is available
   * Returns false in non-edge environments or when KV is not configured
   */
  get isAvailable(): boolean {
    return this.kv !== null;
  }

  /**
   * Build a prefixed key
   */
  private buildKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  /**
   * Get a value from KV with automatic JSON deserialization
   * @param key - Cache key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.kv) {
      return null;
    }

    try {
      const value = await this.kv.get(this.buildKey(key), 'json');
      return value as T | null;
    } catch (error) {
      // KV errors should not break the application
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'get', key);
      return null;
    }
  }

  /**
   * Get a value as text (no JSON parsing)
   * @param key - Cache key
   * @returns Raw string value or null if not found
   */
  async getText(key: string): Promise<string | null> {
    if (!this.kv) {
      return null;
    }

    try {
      return await this.kv.get(this.buildKey(key), 'text');
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'getText', key);
      return null;
    }
  }

  /**
   * Get a value as ArrayBuffer (for binary data)
   * @param key - Cache key
   * @returns ArrayBuffer or null if not found
   */
  async getArrayBuffer(key: string): Promise<ArrayBuffer | null> {
    if (!this.kv) {
      return null;
    }

    try {
      return await this.kv.get(this.buildKey(key), 'arrayBuffer');
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'getArrayBuffer', key);
      return null;
    }
  }

  /**
   * Set a value in KV with automatic JSON serialization
   * @param key - Cache key
   * @param value - Value to cache (will be JSON serialized)
   * @param options - Cache options including TTL
   */
  async set<T>(
    key: string,
    value: T,
    options?: {
      /** Time-to-live in seconds */
      ttl?: number;
      /** Absolute expiration Unix timestamp */
      expiration?: number;
      /** Content type hint */
      contentType?: string;
    }
  ): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      const kvOptions: KVNamespacePutOptions = {};

      if (options?.ttl !== undefined) {
        kvOptions.expirationTtl = options.ttl;
      }

      if (options?.expiration !== undefined) {
        kvOptions.expiration = options.expiration;
      }

      if (options?.contentType !== undefined) {
        kvOptions.contentType = options.contentType;
      }

      await this.kv.put(this.buildKey(key), JSON.stringify(value), kvOptions);
      return true;
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'set', key);
      return false;
    }
  }

  /**
   * Set a text value in KV (no JSON serialization)
   * @param key - Cache key
   * @param value - Text value to cache
   * @param options - Cache options
   */
  async setText(
    key: string,
    value: string,
    options?: { ttl?: number; expiration?: number; contentType?: string }
  ): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      const kvOptions: KVNamespacePutOptions = {};

      if (options?.ttl !== undefined) {
        kvOptions.expirationTtl = options.ttl;
      }

      if (options?.expiration !== undefined) {
        kvOptions.expiration = options.expiration;
      }

      if (options?.contentType !== undefined) {
        kvOptions.contentType = options.contentType;
      }

      await this.kv.put(this.buildKey(key), value, kvOptions);
      return true;
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'setText', key);
      return false;
    }
  }

  /**
   * Delete a key from KV
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      await this.kv.delete(this.buildKey(key));
      return true;
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'delete', key);
      return false;
    }
  }

  /**
   * Check if a key exists in KV
   * @param key - Cache key to check
   */
  async exists(key: string): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      const metadata = await this.kv.getWithMetadata(this.buildKey(key));
      return metadata.value !== null;
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'exists', key);
      return false;
    }
  }

  /**
   * Get a value along with its metadata from KV
   * Useful for storing and retrieving additional context with cached data
   *
   * @param key - Cache key
   * @returns Object with value and metadata, or nulls if not found
   *
   * @example
   * ```ts
   * const { value, metadata } = await cache.getWithMetadata<UserData>('user:123');
   * if (value && metadata?.cachedAt) {
   *   const age = Date.now() - metadata.cachedAt;
   * }
   * ```
   */
  async getWithMetadata<T = unknown>(
    key: string
  ): Promise<{ value: T | null; metadata: unknown | null }> {
    if (!this.kv) {
      return { value: null, metadata: null };
    }

    try {
      const result = await this.kv.getWithMetadata<T>(
        this.buildKey(key),
        'json'
      );
      return {
        value: result.value,
        metadata: result.metadata,
      };
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'getWithMetadata', key);
      return { value: null, metadata: null };
    }
  }

  /**
   * Get or set pattern - implements cache-aside
   * Returns cached value if exists, otherwise fetches, caches, and returns
   *
   * @param key - Cache key
   * @param fetcher - Function to fetch value if not cached
   * @param options - Cache options
   * @returns Cached or fetched value
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; expiration?: number }
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const value = await fetcher();

    // Cache the result (fire and forget - don't await)
    this.set(key, value, options).catch(() => {
      // Ignore cache write errors
    });

    return value;
  }

  /**
   * List keys in KV namespace
   * @param options - List options
   * @returns List of keys and metadata
   */
  async list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    keys: Array<{ name: string; expiration?: number }>;
    cursor?: string;
  } | null> {
    if (!this.kv) {
      return null;
    }

    try {
      const result = await this.kv.list({
        prefix: options?.prefix,
        limit: options?.limit ?? 1000,
        cursor: options?.cursor,
      });

      return {
        keys: result.keys.map((k) => ({
          name: k.name,
          expiration: k.expiration,
        })),
        cursor: result.list_complete ? undefined : result.cursor,
      };
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)), 'list', options?.prefix ?? '');
      return null;
    }
  }
}

/**
 * Create a CloudflareKV instance from environment
 * Convenience function for use in Workers
 *
 * @param env - Environment object containing KV binding
 * @param bindingName - Name of the KV binding (default: 'CACHE_KV')
 * @param options - KV options
 */
export function createKVCache(
  env: Record<string, unknown> | undefined,
  bindingName: string = 'CACHE_KV',
  options?: { prefix?: string; onError?: (error: Error, operation: string, key: string) => void }
): CloudflareKV {
  const kv = env?.[bindingName] as KVNamespace | undefined;
  return new CloudflareKV(kv, options);
}

/**
 * KV cache options for common use cases
 * Pre-configured TTL values matching CF_CACHE_TTL
 */
export const KV_CACHE_OPTIONS = {
  /** No caching (utility for conditional logic) */
  NO_STORE: { ttl: CF_CACHE_TTL.NO_STORE },
  /** Short TTL for frequently changing content */
  SHORT: { ttl: CF_CACHE_TTL.SHORT },
  /** Medium TTL for semi-static content */
  MEDIUM: { ttl: CF_CACHE_TTL.MEDIUM },
  /** Long TTL for static content */
  LONG: { ttl: CF_CACHE_TTL.LONG },
  /** Immutable TTL for versioned assets */
  IMMUTABLE: { ttl: CF_CACHE_TTL.IMMUTABLE },
} as const;
