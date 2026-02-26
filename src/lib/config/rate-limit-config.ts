import { EnvLoader } from './environment';

/**
 * Rate limiting configuration
 * Now supports environment variable overrides
 * Extracted from constants.ts for better modularity
 */
export const RATE_LIMIT_CONFIG = {
  /**
   * Default request rate (requests per window)
   * Env: RATE_LIMIT_DEFAULT_RATE (default: 100)
   */
  DEFAULT_RATE: EnvLoader.number('RATE_LIMIT_DEFAULT_RATE', 100, 1, 10000),

  /**
   * Default time window in milliseconds
   * Env: RATE_LIMIT_DEFAULT_WINDOW (default: 60000)
   */
  DEFAULT_WINDOW: EnvLoader.number(
    'RATE_LIMIT_DEFAULT_WINDOW',
    60000,
    1000,
    3600000
  ),

  /**
   * Rate limits for different service tiers
   */
  TIER: {
    FREE: {
      rate: EnvLoader.number('RATE_LIMIT_TIER_FREE_RATE', 10, 1, 1000),
      window: EnvLoader.number(
        'RATE_LIMIT_TIER_FREE_WINDOW',
        60000,
        1000,
        3600000
      ),
    },
    STANDARD: {
      rate: EnvLoader.number('RATE_LIMIT_TIER_STANDARD_RATE', 100, 1, 5000),
      window: EnvLoader.number(
        'RATE_LIMIT_TIER_STANDARD_WINDOW',
        60000,
        1000,
        3600000
      ),
    },
    PREMIUM: {
      rate: EnvLoader.number('RATE_LIMIT_TIER_PREMIUM_RATE', 1000, 1, 10000),
      window: EnvLoader.number(
        'RATE_LIMIT_TIER_PREMIUM_WINDOW',
        60000,
        1000,
        3600000
      ),
    },
  },

  /**
   * Maximum number of entries in rate limit store
   * Env: RATE_LIMIT_MAX_STORE_SIZE (default: 10000)
   */
  MAX_STORE_SIZE: EnvLoader.number(
    'RATE_LIMIT_MAX_STORE_SIZE',
    10000,
    100,
    100000
  ),

  /**
   * Cleanup interval in milliseconds
   * Env: RATE_LIMIT_CLEANUP_INTERVAL (default: 60000)
   */
  CLEANUP_INTERVAL_MS: EnvLoader.number(
    'RATE_LIMIT_CLEANUP_INTERVAL',
    60000,
    5000,
    300000
  ),

  /**
   * Cleanup window in milliseconds
   * Env: RATE_LIMIT_CLEANUP_WINDOW (default: 60000)
   */
  CLEANUP_WINDOW_MS: EnvLoader.number(
    'RATE_LIMIT_CLEANUP_WINDOW',
    60000,
    1000,
    3600000
  ),

  /**
   * API endpoint rate limit presets
   * Different endpoints have different rate limit requirements
   * Now supports environment variable overrides
   */
  ENDPOINT_PRESETS: {
    /** Strict limits for sensitive/admin endpoints - Default: 10 */
    STRICT: EnvLoader.number('RATE_LIMIT_ENDPOINT_STRICT', 10, 1, 100),
    /** Moderate limits for standard API endpoints - Default: 30 */
    MODERATE: EnvLoader.number('RATE_LIMIT_ENDPOINT_MODERATE', 30, 5, 200),
    /** Lenient limits for public/read-only endpoints - Default: 60 */
    LENIENT: EnvLoader.number('RATE_LIMIT_ENDPOINT_LENIENT', 60, 10, 500),
  },

  /**
   * User tier rate limit configurations
   * Different user roles have different rate limits
   * Now supports environment variable overrides
   */
  USER_TIER: {
    /** Anonymous/unauthenticated users - Default: 30 */
    ANONYMOUS: EnvLoader.number('RATE_LIMIT_TIER_ANONYMOUS_RATE', 30, 5, 200),
    /** Authenticated regular users - Default: 60 */
    AUTHENTICATED: EnvLoader.number(
      'RATE_LIMIT_TIER_AUTHENTICATED_RATE',
      60,
      10,
      500
    ),
    /** Premium users - Default: 120 */
    PREMIUM: EnvLoader.number('RATE_LIMIT_TIER_PREMIUM_RATE', 120, 20, 1000),
    /** Enterprise users - Default: 300 */
    ENTERPRISE: EnvLoader.number(
      'RATE_LIMIT_TIER_ENTERPRISE_RATE',
      300,
      50,
      2000
    ),
  },
} as const;
