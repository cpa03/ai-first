/**
 * HTTP Constants Module
 *
 * Centralized HTTP-related constants including status codes, headers, and auth config.
 * Extracted from constants.ts to improve modularity (addresses Issue #443).
 *
 * @module lib/config/http
 */

import { EnvLoader } from './environment';

/**
 * HTTP Status Codes
 * Centralized status codes for API responses
 */
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * HTTP Headers
 * Centralized header constants for API responses
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
  JSON_CONTENT_TYPE: { 'Content-Type': 'application/json' },
  X_REQUEST_ID: 'X-Request-ID',
  X_ERROR_CODE: 'X-Error-Code',
  X_RETRYABLE: 'X-Retryable',
  RETRY_AFTER: 'Retry-After',
  X_RATELIMIT_LIMIT: 'X-RateLimit-Limit',
  X_RATELIMIT_REMAINING: 'X-RateLimit-Remaining',
  X_RATELIMIT_RESET: 'X-RateLimit-Reset',
  X_API_VERSION: 'X-API-Version',
} as const;

/**
 * Authentication Configuration
 * Security-related constants for authentication
 */
export const AUTH_CONFIG = {
  /**
   * Maximum length for API credentials/tokens
   * Prevents DoS attacks during credential validation
   */
  MAX_CREDENTIAL_LENGTH: EnvLoader.number(
    'AUTH_MAX_CREDENTIAL_LENGTH',
    512,
    64,
    2048
  ),

  /**
   * Token hash algorithm for secure comparison
   */
  HASH_ALGORITHM: 'SHA-256',

  /**
   * Authorization header scheme
   */
  BEARER_SCHEME: 'bearer',
} as const;

// Type exports
export type StatusCodes = typeof STATUS_CODES;
export type HttpHeaders = typeof HTTP_HEADERS;
export type AuthConfig = typeof AUTH_CONFIG;
