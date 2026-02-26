/**
 * Error Configuration Module
 *
 * Error-related configuration extracted from constants.ts for better modularity.
 * Contains request ID generation and rate limit error response configuration.
 */

/**
 * Request ID generation configuration
 */
export const REQUEST_ID_CONFIG = {
  PREFIX: 'req_',
  RANDOM_LENGTH: 9,
  RADIX: 36,
} as const;

/**
 * Rate limit error response configuration
 */
export const RATE_LIMIT_ERROR_CONFIG = {
  ERROR_CODE: 'RATE_LIMIT_EXCEEDED',
  STATUS_CODE: 429,
} as const;

/**
 * Error configuration combining request ID and rate limit settings
 */
export const ERROR_CONFIG = {
  /**
   * Request ID generation configuration
   */
  REQUEST_ID: REQUEST_ID_CONFIG,

  /**
   * Rate limit response configuration
   */
  RATE_LIMIT: RATE_LIMIT_ERROR_CONFIG,
} as const;

/**
 * Type export for ERROR_CONFIG
 */
export type ErrorConfig = typeof ERROR_CONFIG;
