/**
 * Cloudflare type definitions
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/
 */

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
 * NextRequest extension type for nextUrl optimization
 */
export interface NextRequestExtension extends Request {
  nextUrl?: { pathname: string };
}
