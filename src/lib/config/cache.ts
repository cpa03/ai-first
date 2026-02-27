/**
 * Cache Configuration
 * Centralizes all cache TTL (Time To Live) and size settings
 * Eliminates hardcoded cache values scattered throughout the codebase
 * Now supports environment variable overrides via EnvLoader
 */
import { EnvLoader } from './environment';

export const CACHE_CONFIG = {
  /**
   * Default cache TTL values in milliseconds
   * All values support environment variable overrides
   */
  TTL: {
    /**
     * Short-lived cache entries (ms)
     * Use for: volatile data, frequent updates
     * Env: CACHE_TTL_SHORT (default: 60000 = 1 minute)
     */
    SHORT: EnvLoader.number('CACHE_TTL_SHORT', 60 * 1000, 1000, 600000),

    /**
     * Standard cache entries (ms)
     * Use for: agent configurations, moderately changing data
     * Env: CACHE_TTL_STANDARD (default: 300000 = 5 minutes)
     */
    STANDARD: EnvLoader.number(
      'CACHE_TTL_STANDARD',
      5 * 60 * 1000,
      1000,
      3600000
    ),

    /**
     * Medium-lived cache entries (ms)
     * Use for: prompt templates, semi-static content
     * Env: CACHE_TTL_MEDIUM (default: 600000 = 10 minutes)
     */
    MEDIUM: EnvLoader.number('CACHE_TTL_MEDIUM', 10 * 60 * 1000, 1000, 7200000),

    /**
     * Long-lived cache entries (ms)
     * Use for: static content, reference data
     * Env: CACHE_TTL_LONG (default: 3600000 = 1 hour)
     */
    LONG: EnvLoader.number('CACHE_TTL_LONG', 60 * 60 * 1000, 1000, 86400000),

    /**
     * AI response cache (ms)
     * Balances performance with cost tracking accuracy
     * Env: CACHE_TTL_AI_RESPONSE (default: 300000 = 5 minutes)
     */
    AI_RESPONSE: EnvLoader.number(
      'CACHE_TTL_AI_RESPONSE',
      5 * 60 * 1000,
      1000,
      3600000
    ),

    /**
     * Cost tracking cache (ms)
     * Short TTL to ensure accurate daily cost monitoring
     * Env: CACHE_TTL_COST_TRACKING (default: 60000 = 1 minute)
     */
    COST_TRACKING: EnvLoader.number(
      'CACHE_TTL_COST_TRACKING',
      60 * 1000,
      1000,
      600000
    ),
  } as const,

  /**
   * Default cache size limits
   * All values support environment variable overrides
   */
  SIZE: {
    /**
     * Small cache size
     * Use for: specialized services with limited data
     * Env: CACHE_SIZE_SMALL (default: 50)
     */
    SMALL: EnvLoader.number('CACHE_SIZE_SMALL', 50, 10, 1000),

    /**
     * Standard cache size
     * Use for: general purpose caching
     * Env: CACHE_SIZE_STANDARD (default: 100)
     */
    STANDARD: EnvLoader.number('CACHE_SIZE_STANDARD', 100, 10, 1000),

    /**
     * Medium cache size
     * Use for: prompt templates, configuration data
     * Env: CACHE_SIZE_MEDIUM (default: 200)
     */
    MEDIUM: EnvLoader.number('CACHE_SIZE_MEDIUM', 200, 10, 2000),

    /**
     * Large cache size
     * Use for: high-volume data, API responses
     * Env: CACHE_SIZE_LARGE (default: 1000)
     */
    MAXIMUM: EnvLoader.number('CACHE_SIZE_MAXIMUM', 10000, 1000, 100000),
  } as const,

  /**
   * Default maximum cache size
   * @deprecated Use SIZE.LARGE or SIZE.MAXIMUM instead for more specific sizing
   * Env: CACHE_SIZE_MAXIMUM (default: 1000)
   */
  DEFAULT_MAX_SIZE: EnvLoader.number('CACHE_SIZE_MAXIMUM', 1000, 100, 10000),

  /**
   * Service-specific cache configurations
   * All values support environment variable overrides
   */
  SERVICES: {
    /**
     * Prompt service cache configuration
     * Caches loaded prompt templates
     */
    PROMPT: {
      /** Env: CACHE_SERVICE_PROMPT_TTL_MS (default: 600000 = 10 minutes) */
      TTL_MS: EnvLoader.number(
        'CACHE_SERVICE_PROMPT_TTL_MS',
        10 * 60 * 1000,
        1000,
        7200000
      ),
      /** Env: CACHE_SERVICE_PROMPT_MAX_SIZE (default: 200) */
      MAX_SIZE: EnvLoader.number(
        'CACHE_SERVICE_PROMPT_MAX_SIZE',
        200,
        10,
        2000
      ),
    } as const,

    /**
     * Configuration service cache
     * Caches agent configuration files
     */
    CONFIG: {
      /** Env: CACHE_SERVICE_CONFIG_TTL_MS (default: 300000 = 5 minutes) */
      TTL_MS: EnvLoader.number(
        'CACHE_SERVICE_CONFIG_TTL_MS',
        5 * 60 * 1000,
        1000,
        3600000
      ),
      /** Env: CACHE_SERVICE_CONFIG_MAX_SIZE (default: 100) */
      MAX_SIZE: EnvLoader.number(
        'CACHE_SERVICE_CONFIG_MAX_SIZE',
        100,
        10,
        1000
      ),
    } as const,

    /**
     * AI response cache
     * Caches AI model responses to reduce API calls
     */
    AI_RESPONSE: {
      /** Env: CACHE_SERVICE_AI_RESPONSE_TTL_MS (default: 300000 = 5 minutes) */
      TTL_MS: EnvLoader.number(
        'CACHE_SERVICE_AI_RESPONSE_TTL_MS',
        5 * 60 * 1000,
        1000,
        3600000
      ),
      /** Env: CACHE_SERVICE_AI_RESPONSE_MAX_SIZE (default: 100) */
      MAX_SIZE: EnvLoader.number(
        'CACHE_SERVICE_AI_RESPONSE_MAX_SIZE',
        100,
        10,
        1000
      ),
    } as const,

    /**
     * Cost tracking cache
     * Tracks daily AI usage costs
     */
    COST: {
      /** Env: CACHE_SERVICE_COST_TTL_MS (default: 60000 = 1 minute) */
      TTL_MS: EnvLoader.number(
        'CACHE_SERVICE_COST_TTL_MS',
        60 * 1000,
        1000,
        600000
      ),
      /** Env: CACHE_SERVICE_COST_MAX_SIZE (default: 1) */
      MAX_SIZE: EnvLoader.number('CACHE_SERVICE_COST_MAX_SIZE', 1, 1, 100),
    } as const,
  } as const,

  /**
   * Cache cleanup configuration
   * All values support environment variable overrides
   */
  CLEANUP: {
    /**
     * Interval for periodic cache cleanup (ms)
     * Env: CACHE_CLEANUP_INTERVAL_MS (default: 60000 = 1 minute)
     */
    INTERVAL_MS: EnvLoader.number(
      'CACHE_CLEANUP_INTERVAL_MS',
      60 * 1000,
      5000,
      300000
    ),

    /**
     * Percentage of entries to remove when cache reaches capacity
     * Env: CACHE_TRIM_PERCENTAGE (default: 20, converted to 0.2)
     */
    TRIM_PERCENTAGE: EnvLoader.number('CACHE_TRIM_PERCENTAGE', 20, 5, 50) / 100,
  } as const,
} as const;

export type CacheConfig = typeof CACHE_CONFIG;
