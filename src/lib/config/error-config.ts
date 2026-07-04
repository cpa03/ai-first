/**
 * Error Configuration Module
 *
 * Error-related configuration extracted from constants.ts for better modularity.
 * Contains request ID generation and rate limit error response configuration.
 * Supports environment variable overrides via EnvLoader.
 */

import { EnvLoader } from './environment';

/**
 * Request ID generation configuration
 * SECURITY: Uses cryptographically secure ID generation via generateId()
 * These settings control the prefix and format of request IDs
 */
export const REQUEST_ID_CONFIG = {
  PREFIX: EnvLoader.string('ERROR_REQUEST_ID_PREFIX', 'req_'),
  RANDOM_LENGTH: EnvLoader.number('ERROR_REQUEST_ID_RANDOM_LENGTH', 9, 4, 32),
  RADIX: EnvLoader.number('ERROR_REQUEST_ID_RADIX', 36, 2, 36),
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
  REQUEST_ID: REQUEST_ID_CONFIG,
  RATE_LIMIT: RATE_LIMIT_ERROR_CONFIG,
} as const;

export type ErrorConfig = typeof ERROR_CONFIG;
