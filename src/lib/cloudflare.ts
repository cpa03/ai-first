/**
 * Cloudflare-specific utilities and helpers
 *
 * This module provides utilities for detecting and working with Cloudflare
 * Workers environment, including platform detection, header extraction,
 * and edge-specific operations.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/
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
 * Detect if running in a Cloudflare Workers environment
 *
 * This checks multiple indicators to reliably detect Cloudflare:
 * 1. Environment variables set by Workers runtime
 * 2. Presence of CF-Ray header (indicates request passed through Cloudflare)
 * 3. Global Cloudflare-specific APIs
 *
 * @returns True if running in Cloudflare Workers environment
 */
export function isCloudflareWorker(): boolean {
  // Check environment variables
  if (
    process.env[CLOUDFLARE_ENV_VARS.CF_WORKER] ||
    process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE] ||
    process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE_WORKERS]
  ) {
    return true;
  }

  // Check for Cloudflare-specific global (available in Workers runtime)
  if (typeof globalThis !== 'undefined') {
    // @ts-expect-error - Cloudflare Workers-specific global
    if (typeof globalThis.caches !== 'undefined' && globalThis.caches.default) {
      return true;
    }
  }

  return false;
}

/**
 * Detect if a request has passed through Cloudflare's network
 *
 * This is useful for detecting Cloudflare even when not running in a Worker
 * (e.g., running on another platform behind Cloudflare proxy)
 *
 * @param request - The incoming request
 * @returns True if the request has Cloudflare headers
 */
export function isCloudflareRequest(request: Request): boolean {
  return !!request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
}

/**
 * Extract Cloudflare-specific information from a request
 *
 * This function extracts all relevant Cloudflare headers and environment
 * information for observability and debugging purposes.
 *
 * @param request - The incoming request
 * @returns Cloudflare request information
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
 * Get the client IP address from a request
 *
 * This function tries multiple sources to get the real client IP:
 * 1. Cloudflare's CF-Connecting-IP header (most reliable when behind Cloudflare)
 * 2. X-Forwarded-For header (standard proxy header)
 * 3. X-Real-IP header (alternative proxy header)
 *
 * @param request - The incoming request
 * @returns The client IP address or null if not available
 */
export function getClientIp(request: Request): string | null {
  // Cloudflare's CF-Connecting-IP is the most reliable when behind Cloudflare
  const cfIp = request.headers.get(CLOUDFLARE_HEADERS.CF_CONNECTING_IP);
  if (cfIp) {
    return cfIp.trim();
  }

  // X-Forwarded-For: client, proxy1, proxy2
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // X-Real-IP (used by some proxies)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return null;
}

/**
 * Create Cloudflare-specific response headers for debugging
 *
 * These headers can be added to responses for observability in production.
 * Note: Only add these in non-production or when debugging.
 *
 * @param request - The incoming request
 * @returns Headers object with Cloudflare debug info
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
 * Detect the hosting platform
 *
 * @returns The detected platform
 */
export function detectPlatform(): 'cloudflare' | 'vercel' | 'unknown' {
  if (isCloudflareWorker()) {
    return 'cloudflare';
  }

  if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_URL) {
    return 'vercel';
  }

  return 'unknown';
}
