/**
 * Modular Hardcoded Constants
 *
 * Centralized configuration for magic numbers and constants that were previously
 * hardcoded throughout the codebase. This module follows the "Flexy" principle:
 * eliminate hardcoded values and make everything modular and configurable.
 *
 * All values support environment variable overrides via EnvLoader.
 * Default values are chosen to be sensible for most use cases.
 *
 * ## Migration Guide
 *
 * Replace hardcoded values with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * const max = 4294967295;
 * if (hash > max) { ... }
 *
 * // AFTER (modular)
 * import { HASH_CONFIG } from '@/lib/config/modular-constants';
 * if (hash > HASH_CONFIG.MAX_INT_32) { ... }
 * ```
 *
 * ## Adding New Constants
 *
 * 1. Add the constant with EnvLoader for environment variable support
 * 2. Export it as part of a related config group (e.g., HASH_CONFIG)
 * 3. Add documentation with default value and environment variable name
 * 4. Update this header with the new config group
 */

import { EnvLoader } from './environment';

/**
 * Hash and Numeric Constants
 * Used for hash functions, randomization, and numeric limits
 */
export const HASH_CONFIG = {
  /**
   * Maximum value for 32-bit unsigned integer (0xFFFFFFFF)
   * Used in hash normalization and deterministic random calculations
   * Env: HASH_MAX_INT_32 (default: 4294967295)
   */
  MAX_INT_32: EnvLoader.number('HASH_MAX_INT_32', 4294967295, 1, 4294967295),

  /**
   * Length of hash fingerprint (characters)
   * Env: HASH_FINGERPRINT_LENGTH (default: 8)
   */
  FINGERPRINT_LENGTH: EnvLoader.number('HASH_FINGERPRINT_LENGTH', 8, 4, 64),
} as const;

/**
 * Timestamp Constants
 * Unix timestamps and date-related magic numbers
 */
export const TIMESTAMP_CONFIG = {
  /**
   * Unix timestamp for January 1, 2020 00:00:00 UTC
   * Used to distinguish between Unix timestamps and relative time offsets
   * in rate limit header parsing
   * Env: TIMESTAMP_UNIX_2020 (default: 1577836800)
   */
  UNIX_2020: EnvLoader.number(
    'TIMESTAMP_UNIX_2020',
    1577836800,
    946684800,
    2000000000
  ),
} as const;

/**
 * Session Configuration
 * Session-related limits and timeouts
 */
export const SESSION_CONFIG = {
  /**
   * Default session timeout in milliseconds
   * Env: SESSION_TIMEOUT_MS (default: 3600000 = 1 hour)
   */
  TIMEOUT_MS: EnvLoader.number('SESSION_TIMEOUT_MS', 3600000, 60000, 86400000),

  /**
   * Session cleanup interval in milliseconds
   * Env: SESSION_CLEANUP_INTERVAL_MS (default: 60000 = 1 minute)
   */
  CLEANUP_INTERVAL_MS: EnvLoader.number(
    'SESSION_CLEANUP_INTERVAL_MS',
    60000,
    10000,
    300000
  ),
} as const;

/**
 * Rate Limit Store Configuration
 * Limits for the in-memory rate limit tracking store
 */
export const RATE_LIMIT_STORE_CONFIG = {
  /**
   * Maximum number of request entries per identifier
   * Prevents unbounded memory growth for a single client
   * Env: RATE_LIMIT_MAX_REQUESTS_PER_IDENTIFIER (default: 1000)
   */
  MAX_REQUESTS_PER_IDENTIFIER: EnvLoader.number(
    'RATE_LIMIT_MAX_REQUESTS_PER_IDENTIFIER',
    1000,
    100,
    10000
  ),

  /**
   * Maximum number of unique identifiers in the store
   * Prevents memory exhaustion from rate limiting
   * Env: RATE_LIMIT_MAX_STORE_SIZE (default: 10000)
   */
  MAX_STORE_SIZE: EnvLoader.number(
    'RATE_LIMIT_MAX_STORE_SIZE',
    10000,
    1000,
    100000
  ),

  /**
   * Percentage of store to clean when at capacity
   * Env: RATE_LIMIT_CLEANUP_PERCENTAGE (default: 20)
   */
  CLEANUP_PERCENTAGE:
    EnvLoader.number('RATE_LIMIT_CLEANUP_PERCENTAGE', 20, 5, 50) / 100,
} as const;

/**
 * External Rate Limit Configuration
 * Settings for tracking third-party API rate limits
 */
export const EXTERNAL_RATE_LIMIT_CONFIG = {
  /**
   * Maximum number of services to track
   * Env: EXTERNAL_RATE_LIMIT_MAX_SERVICES (default: 50)
   */
  MAX_SERVICES: EnvLoader.number(
    'EXTERNAL_RATE_LIMIT_MAX_SERVICES',
    50,
    10,
    200
  ),

  /**
   * Maximum age of rate limit info in milliseconds (1 hour default)
   * After this time, rate limit info is considered stale
   * Env: EXTERNAL_RATE_LIMIT_MAX_AGE_MS (default: 3600000)
   */
  MAX_AGE_MS: EnvLoader.number(
    'EXTERNAL_RATE_LIMIT_MAX_AGE_MS',
    3600000,
    60000,
    86400000
  ),

  /**
   * Default throttle threshold (0.0 - 1.0)
   * When remaining/limit ratio is below this, requests should be throttled
   * Env: EXTERNAL_RATE_LIMIT_THROTTLE_THRESHOLD (default: 0.2)
   */
  THROTTLE_THRESHOLD:
    EnvLoader.number('EXTERNAL_RATE_LIMIT_THROTTLE_THRESHOLD', 20, 5, 50) / 100,
} as const;

/**
 * A/B Testing Configuration
 * Settings for A/B test experiments and variant assignment
 * NOTE: AB_TEST_CONFIG is defined in ab-test.ts with custom environment logic
 */
export const AB_TEST = {
  /**
   * Default variant ID for disabled experiments
   * Env: AB_TEST_DEFAULT_VARIANT (default: 'control')
   */
  DEFAULT_VARIANT: EnvLoader.string('AB_TEST_DEFAULT_VARIANT', 'control'),

  /**
   * Maximum number of assignments to cache in localStorage
   * Env: AB_TEST_MAX_ASSIGNMENTS (default: 20)
   */
  MAX_ASSIGNMENTS: EnvLoader.number('AB_TEST_MAX_ASSIGNMENTS', 20, 5, 100),
} as const;

/**
 * Analytics Configuration
 * Settings for client-side analytics and event tracking
 */
export const ANALYTICS_CONFIG = {
  /**
   * Maximum queue size before flushing to server
   * Env: ANALYTICS_MAX_QUEUE_SIZE (default: 10)
   */
  MAX_QUEUE_SIZE: EnvLoader.number('ANALYTICS_MAX_QUEUE_SIZE', 10, 1, 50),

  /**
   * Flush interval in milliseconds
   * How often to flush queued events when queue is not full
   * Env: ANALYTICS_FLUSH_INTERVAL_MS (default: 5000)
   */
  FLUSH_INTERVAL_MS: EnvLoader.number(
    'ANALYTICS_FLUSH_INTERVAL_MS',
    5000,
    1000,
    60000
  ),

  /**
   * Maximum events to retain in history
   * Env: ANALYTICS_MAX_HISTORY (default: 100)
   */
  MAX_HISTORY: EnvLoader.number('ANALYTICS_MAX_HISTORY', 100, 10, 1000),
} as const;

/**
 * Cost Tracking Configuration
 * Settings for AI cost monitoring and limits
 */
export const COST_TRACKING_CONFIG = {
  /**
   * Maximum number of cost trackers to prevent memory leaks
   * Env: COST_TRACKING_MAX_TRACKERS (default: 100)
   */
  MAX_TRACKERS: EnvLoader.number('COST_TRACKING_MAX_TRACKERS', 100, 10, 1000),

  /**
   * Maximum age of cost tracker entries in milliseconds (24 hours default)
   * Env: COST_TRACKING_MAX_AGE_MS (default: 86400000)
   */
  MAX_AGE_MS: EnvLoader.number(
    'COST_TRACKING_MAX_AGE_MS',
    86400000,
    3600000,
    604800000
  ),

  /**
   * Cleanup interval for cost trackers in milliseconds
   * Env: COST_TRACKING_CLEANUP_INTERVAL_MS (default: 300000 = 5 minutes)
   */
  CLEANUP_INTERVAL_MS: EnvLoader.number(
    'COST_TRACKING_CLEANUP_INTERVAL_MS',
    300000,
    60000,
    3600000
  ),
} as const;

/**
 * AI Model Configuration
 * Settings for AI model defaults and limits
 */
export const AI_MODEL_CONFIG = {
  /**
   * Default model for health checks
   * Env: AI_MODEL_HEALTH_CHECK (default: 'claude-3-haiku-20240307')
   */
  HEALTH_CHECK_MODEL: EnvLoader.string(
    'AI_MODEL_HEALTH_CHECK',
    'claude-3-haiku-20240307'
  ),

  /**
   * Maximum context window iterations to prevent infinite loops
   * Env: AI_MAX_CONTEXT_ITERATIONS (default: 1000)
   */
  MAX_CONTEXT_ITERATIONS: EnvLoader.number(
    'AI_MAX_CONTEXT_ITERATIONS',
    1000,
    100,
    10000
  ),
} as const;

/**
 * Database Configuration
 * Settings for database operations and health checks
 */
export const DATABASE_CONFIG = {
  /**
   * Default search result limit
   * Env: DATABASE_DEFAULT_SEARCH_LIMIT (default: 10)
   */
  DEFAULT_SEARCH_LIMIT: EnvLoader.number(
    'DATABASE_DEFAULT_SEARCH_LIMIT',
    10,
    1,
    100
  ),

  /**
   * Vector similarity threshold (0.0 - 1.0)
   * Env: DATABASE_VECTOR_SIMILARITY_THRESHOLD (default: 0.78)
   */
  VECTOR_SIMILARITY_THRESHOLD:
    EnvLoader.number('DATABASE_VECTOR_SIMILARITY_THRESHOLD', 78, 0, 100) / 100,
} as const;

/**
 * Export all configurations as a combined object for convenience
 */
export const MODULAR_CONSTANTS = {
  HASH: HASH_CONFIG,
  TIMESTAMP: TIMESTAMP_CONFIG,
  SESSION: SESSION_CONFIG,
  RATE_LIMIT_STORE: RATE_LIMIT_STORE_CONFIG,
  EXTERNAL_RATE_LIMIT: EXTERNAL_RATE_LIMIT_CONFIG,
  AB_TEST,
  ANALYTICS: ANALYTICS_CONFIG,
  COST_TRACKING: COST_TRACKING_CONFIG,
  AI_MODEL: AI_MODEL_CONFIG,
  DATABASE: DATABASE_CONFIG,
} as const;

export type ModularConstants = typeof MODULAR_CONSTANTS;
