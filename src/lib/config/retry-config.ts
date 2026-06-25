import { EnvLoader } from './environment';

/**
 * Retry configuration
 * Now supports environment variable overrides
 */
export const RETRY_CONFIG = {
  /**
   * Default number of retry attempts
   * Env: RETRY_DEFAULT_MAX_RETRIES (default: 3)
   */
  DEFAULT_MAX_RETRIES: EnvLoader.number('RETRY_DEFAULT_MAX_RETRIES', 3, 0, 10),

  /**
   * Initial delay between retries (in milliseconds)
   * Env: RETRY_INITIAL_DELAY (default: 1000)
   */
  INITIAL_DELAY: EnvLoader.number('RETRY_INITIAL_DELAY', 1000, 100, 60000),

  /**
   * Maximum delay between retries (in milliseconds)
   * Env: RETRY_MAX_DELAY (default: 10000)
   */
  MAX_DELAY: EnvLoader.number('RETRY_MAX_DELAY', 10000, 1000, 300000),

  /**
   * Multiplier for exponential backoff
   * Env: RETRY_BACKOFF_MULTIPLIER (default: 2)
   */
  BACKOFF_MULTIPLIER: EnvLoader.number('RETRY_BACKOFF_MULTIPLIER', 2, 1, 10),

  /**
   * Whether to add jitter to retry delays
   * Env: RETRY_ENABLE_JITTER (default: true)
   */
  ENABLE_JITTER: EnvLoader.boolean('RETRY_ENABLE_JITTER', true),

  /**
   * Jitter factor for retry delays (0-1)
   * Maximum percentage of delay to add as random jitter
   * Env: RETRY_JITTER_FACTOR (default: 0.3)
   */
  JITTER_FACTOR: EnvLoader.number('RETRY_JITTER_FACTOR', 0.3, 0, 1),
} as const;

/**
 * Optimistic mutation configuration
 */
export const OPTIMISTIC_MUTATION_CONFIG = {
  DEFAULT_MAX_RETRIES: EnvLoader.number(
    'OPTIMISTIC_MUTATION_MAX_RETRIES',
    2,
    0,
    10
  ),
  DEFAULT_RETRY_DELAY_MS: EnvLoader.number(
    'OPTIMISTIC_MUTATION_RETRY_DELAY_MS',
    1000,
    100,
    60000
  ),
} as const;

/**
 * Retry delay polling configuration
 * Now supports environment variable overrides
 */
export const RETRY_DELAY_CONFIG = {
  /**
   * Polling interval for checking if retry delay should be aborted (in milliseconds)
   * Lower values provide more responsive cancellation but use more CPU
   * Env: RETRY_POLLING_INTERVAL_MS (default: 100)
   */
  POLLING_INTERVAL_MS: EnvLoader.number(
    'RETRY_POLLING_INTERVAL_MS',
    100,
    10,
    1000
  ),
} as const;

/**
 * Retry Configuration - Additional
 * Now supports environment variable overrides
 */
export const RETRY_VALUES = {
  JITTER_MULTIPLIER_MS: RETRY_CONFIG.INITIAL_DELAY,
} as const;
