import { EnvLoader } from './environment';

/**
 * Cache TTL Configuration
 * Time-to-live settings for different cache types
 * Now supports environment variable overrides
 * Extracted from constants.ts for better modularity
 */

export const CACHE_TTL_CONFIG = {
  /**
   * Default cache TTL in milliseconds
   * Env: CACHE_TTL_STANDARD (default: 300000 = 5 minutes)
   */
  DEFAULT_CACHE_TTL_MS: EnvLoader.number(
    'CACHE_TTL_STANDARD',
    5 * 60 * 1000,
    1000,
    3600000
  ),

  /**
   * Whether to serve stale content while revalidating
   * Env: CACHE_STALE_WHILE_REVALIDATE (default: true)
   */
  DEFAULT_STALE_WHILE_REVALIDATE: EnvLoader.boolean(
    'CACHE_STALE_WHILE_REVALIDATE',
    true
  ),
} as const;
