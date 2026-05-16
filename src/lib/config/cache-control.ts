/**
 * Edge Cache Control Configuration
 *
 * Centralizes HTTP cache-control header configuration for edge deployments.
 * Values can be overridden via environment variables for different deployment scenarios.
 *
 * @see https://developers.cloudflare.com/cache/about/cache-control/
 */

import { EnvLoader } from './environment';

/**
 * Cache-Control header configuration for API routes
 * These values control how content is cached at the edge
 */
export const EDGE_CACHE_CONFIG = {
  /** Browser cache max-age in seconds (5 minutes default) */
  BROWSER_MAX_AGE: EnvLoader.number('EDGE_CACHE_BROWSER_MAX_AGE', 300),

  /** CDN cache max-age in seconds (10 minutes default) */
  CDN_MAX_AGE: EnvLoader.number('EDGE_CACHE_CDN_MAX_AGE', 600),

  /** Stale-while-revalidate duration in seconds (1 minute default) */
  STALE_WHILE_REVALIDATE: EnvLoader.number(
    'EDGE_CACHE_STALE_WHILE_REVALIDATE',
    60
  ),
} as const;

/**
 * Generate Cache-Control header string for API routes
 *
 * @example
 * ```typescript
 * const headerValue = generateApiCacheControl();
 * // Returns: 'public, max-age=300, s-maxage=600, stale-while-revalidate=60'
 * ```
 */
export function generateApiCacheControl(): string {
  const { BROWSER_MAX_AGE, CDN_MAX_AGE, STALE_WHILE_REVALIDATE } =
    EDGE_CACHE_CONFIG;
  return `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${CDN_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`;
}

/**
 * Cache-Control header for no-store (never cache)
 */
export const NO_STORE_CACHE_CONTROL = 'no-store, no-cache, must-revalidate';

/**
 * Cache-Control header for static assets (long cache)
 */
export function generateStaticAssetCacheControl(
  maxAgeSeconds: number = 31536000
): string {
  return `public, max-age=${maxAgeSeconds}, immutable`;
}

/**
 * Combined cache control configuration for easy importing
 */
export const CACHE_CONTROL_CONFIG = {
  EDGE_CACHE: EDGE_CACHE_CONFIG,
  NO_STORE: NO_STORE_CACHE_CONTROL,
  generateApiCacheControl,
  generateStaticAssetCacheControl,
} as const;

export type EdgeCacheConfig = typeof EDGE_CACHE_CONFIG;
