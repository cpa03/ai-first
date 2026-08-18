/**
 * Cloudflare header constants and definitions
 *
 * @see https://developers.cloudflare.com/fundamentals/reference/http-headers/
 */

import { PLATFORM_ENV_VARS } from '../config/constants';

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
 * Request correlation headers for distributed tracing
 */
export const CORRELATION_HEADERS = {
  REQUEST_ID: 'x-request-id',
  CORRELATION_ID: 'x-correlation-id',
  TRACE_ID: 'x-trace-id',
  SPAN_ID: 'x-span-id',
} as const;
