import { RATE_LIMIT_CONFIG } from './rate-limit-config';
import { EnvLoader } from './environment';

/**
 * Rate limit cleanup configuration
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_CLEANUP_CONFIG = {
  CLEANUP_INTERVAL_MS: RATE_LIMIT_CONFIG.CLEANUP_INTERVAL_MS,
  CLEANUP_WINDOW_MS: RATE_LIMIT_CONFIG.CLEANUP_WINDOW_MS,
} as const;

/**
 * Rate limiting store configuration
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_STORE_CONFIG = {
  MAX_STORE_SIZE: RATE_LIMIT_CONFIG.MAX_STORE_SIZE,
  CLEANUP_PERCENTAGE:
    EnvLoader.number('CACHE_TRIM_PERCENTAGE', 20, 5, 50) / 100,
  DEFAULT_WINDOW_MS: RATE_LIMIT_CONFIG.DEFAULT_WINDOW,
} as const;

/**
 * Rate limit statistics configuration
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_STATS_CONFIG = {
  DEFAULT_STATS_WINDOW_MS: RATE_LIMIT_CONFIG.DEFAULT_WINDOW,
  TOP_USERS_LIMIT: EnvLoader.number('RATE_LIMIT_TOP_USERS_LIMIT', 10, 1, 100),
} as const;

/**
 * Rate Limiting - Additional Config
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_VALUES = {
  MAX_REQUESTS_PER_IDENTIFIER: EnvLoader.number(
    'RATE_LIMIT_MAX_REQUESTS_PER_IDENTIFIER',
    1000,
    100,
    10000
  ),

  /**
   * Aggressive cleanup percentage when store is near capacity
   * Used when store exceeds warning threshold
   * Env: RATE_LIMIT_AGGRESSIVE_CLEANUP_PERCENTAGE (default: 30)
   */
  AGGRESSIVE_CLEANUP_PERCENTAGE:
    EnvLoader.number('RATE_LIMIT_AGGRESSIVE_CLEANUP_PERCENTAGE', 30, 10, 50) /
    100,

  /**
   * Warning threshold percentage for store capacity
   * When store size exceeds this percentage, aggressive cleanup is triggered
   * Env: RATE_LIMIT_WARNING_THRESHOLD_PERCENTAGE (default: 80)
   */
  WARNING_THRESHOLD_PERCENTAGE:
    EnvLoader.number('RATE_LIMIT_WARNING_THRESHOLD_PERCENTAGE', 80, 50, 95) /
    100,

  /**
   * Maximum number of orphaned locks before cleanup
   * Prevents memory leaks from abandoned lock promises
   * Env: RATE_LIMIT_MAX_ORPHANED_LOCKS (default: 1000)
   */
  MAX_ORPHANED_LOCKS: EnvLoader.number(
    'RATE_LIMIT_MAX_ORPHANED_LOCKS',
    1000,
    100,
    10000
  ),
} as const;
