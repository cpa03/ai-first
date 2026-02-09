/**
 * Cache Configuration
 * Centralizes all cache TTL (Time To Live) and size settings
 * Eliminates hardcoded cache values scattered throughout the codebase
 */

export const CACHE_CONFIG = {
  /**
   * Default cache TTL values in milliseconds
   */
  TTL: {
    /**
     * Short-lived cache entries (1 minute)
     * Use for: volatile data, frequent updates
     */
    SHORT: 60 * 1000,

    /**
     * Standard cache entries (5 minutes)
     * Use for: agent configurations, moderately changing data
     */
    STANDARD: 5 * 60 * 1000,

    /**
     * Medium-lived cache entries (10 minutes)
     * Use for: prompt templates, semi-static content
     */
    MEDIUM: 10 * 60 * 1000,

    /**
     * Long-lived cache entries (1 hour)
     * Use for: static content, reference data
     */
    LONG: 60 * 60 * 1000,

    /**
     * AI response cache (5 minutes)
     * Balances performance with cost tracking accuracy
     */
    AI_RESPONSE: 5 * 60 * 1000,

    /**
     * Cost tracking cache (1 minute)
     * Short TTL to ensure accurate daily cost monitoring
     */
    COST_TRACKING: 60 * 1000,
  } as const,

  /**
   * Default cache size limits
   */
  SIZE: {
    /**
     * Small cache (50 entries)
     * Use for: specialized services with limited data
     */
    SMALL: 50,

    /**
     * Standard cache (100 entries)
     * Use for: general purpose caching
     */
    STANDARD: 100,

    /**
     * Medium cache (200 entries)
     * Use for: prompt templates, configuration data
     */
    MEDIUM: 200,

    /**
     * Large cache (1000 entries)
     * Use for: high-volume data, API responses
     */
    LARGE: 1000,

    /**
     * Maximum cache size to prevent memory leaks
     */
    MAXIMUM: 10000,
  } as const,

  /**
   * Service-specific cache configurations
   */
  SERVICES: {
    /**
     * Prompt service cache configuration
     * Caches loaded prompt templates
     */
    PROMPT: {
      TTL_MS: 10 * 60 * 1000, // 10 minutes
      MAX_SIZE: 200,
    } as const,

    /**
     * Configuration service cache
     * Caches agent configuration files
     */
    CONFIG: {
      TTL_MS: 5 * 60 * 1000, // 5 minutes
      MAX_SIZE: 100,
    } as const,

    /**
     * AI response cache
     * Caches AI model responses to reduce API calls
     */
    AI_RESPONSE: {
      TTL_MS: 5 * 60 * 1000, // 5 minutes
      MAX_SIZE: 100,
    } as const,

    /**
     * Cost tracking cache
     * Tracks daily AI usage costs
     */
    COST: {
      TTL_MS: 60 * 1000, // 1 minute
      MAX_SIZE: 1,
    } as const,
  } as const,

  /**
   * Cache cleanup configuration
   */
  CLEANUP: {
    /**
     * Interval for periodic cache cleanup (1 minute)
     */
    INTERVAL_MS: 60 * 1000,

    /**
     * Percentage of entries to remove when cache reaches capacity
     */
    TRIM_PERCENTAGE: 0.2,
  } as const,
} as const;

export type CacheConfig = typeof CACHE_CONFIG;
