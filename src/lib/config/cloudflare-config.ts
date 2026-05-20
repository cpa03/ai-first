/**
 * Cloudflare Platform Configuration
 *
 * Centralizes Cloudflare-specific configuration including:
 * - Cache TTL presets
 * - Platform limits and constraints
 * - CPU time limits for different tiers
 *
 * Supports environment variable overrides for flexible deployment.
 */

import { EnvLoader } from './environment';

/**
 * Cloudflare cache TTL presets for common use cases
 * @see https://developers.cloudflare.com/cache/about/cache-control/
 */
export const CF_CACHE_TTL = {
  /** No caching */
  NO_STORE: EnvLoader.number('CF_CACHE_TTL_NO_STORE', 0),

  /** Short cache for frequently changing content (API responses) in seconds */
  SHORT: EnvLoader.number('CF_CACHE_TTL_SHORT', 60),

  /** Medium cache for semi-static content in seconds */
  MEDIUM: EnvLoader.number('CF_CACHE_TTL_MEDIUM', 3600),

  /** Long cache for static assets in seconds */
  LONG: EnvLoader.number('CF_CACHE_TTL_LONG', 86400),

  /** Very long cache for immutable assets (with versioned URLs) in seconds */
  IMMUTABLE: EnvLoader.number('CF_CACHE_TTL_IMMUTABLE', 31536000),
} as const;

/**
 * Cloudflare platform limits and constraints
 * @see https://developers.cloudflare.com/workers/platform/limits/
 */
export const CF_LIMITS = {
  /** Free tier CPU time limit (milliseconds) */
  CPU_MS_FREE: EnvLoader.number('CF_CPU_MS_FREE', 10, 1, 100),

  /** Paid tier CPU time limit (milliseconds) */
  CPU_MS_PAID: EnvLoader.number('CF_CPU_MS_PAID', 50, 10, 100),

  /** Unbound worker CPU limit (milliseconds) */
  CPU_MS_UNBOUND: EnvLoader.number('CF_CPU_MS_UNBOUND', 900000, 1000, 900000),

  /** Maximum request body size (bytes) - default 100MB */
  MAX_BODY_SIZE: EnvLoader.number(
    'CF_MAX_BODY_SIZE',
    100 * 1024 * 1024,
    1024,
    100 * 1024 * 1024
  ),

  /** Maximum KV value size (bytes) - default 25MB */
  MAX_KV_VALUE_SIZE: EnvLoader.number(
    'CF_MAX_KV_VALUE_SIZE',
    25 * 1024 * 1024,
    1024,
    25 * 1024 * 1024
  ),

  /** Maximum D1 database size */
  MAX_D1_SIZE: EnvLoader.string('CF_MAX_D1_SIZE', '500MB'),

  /**
   * Maximum number of keys to list in a single KV list operation
   * Env: CF_KV_LIST_MAX_KEYS (default: 1000)
   */
  KV_LIST_MAX_KEYS: EnvLoader.number('CF_KV_LIST_MAX_KEYS', 1000, 1, 10000),
} as const;

/**
 * Combined Cloudflare configuration for easy importing
 */
export const CLOUDFLARE_CONFIG = {
  CACHE_TTL: CF_CACHE_TTL,
  LIMITS: CF_LIMITS,
} as const;

export type CfCacheStatusType =
  (typeof CF_CACHE_TTL)[keyof typeof CF_CACHE_TTL];
