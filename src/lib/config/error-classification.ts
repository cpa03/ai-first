/**
 * Error Classification Patterns Configuration
 *
 * Centralizes all error classification patterns that were previously hardcoded
 * in errors.ts. This follows the Flexy principle: eliminate hardcoded values
 * and make everything modular and configurable.
 *
 * ## Migration Guide
 *
 * Replace hardcoded patterns with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * if (message.includes('timeout') || message.includes('rate limit')) { ... }
 *
 * // AFTER (modular)
 * import { ERROR_CLASSIFICATION_PATTERNS } from '@/lib/config/error-classification';
 * if (matchesAnyPattern(message, ERROR_CLASSIFICATION_PATTERNS.RETRYABLE)) { ... }
 * ```
 *
 * ## Adding New Patterns
 *
 * 1. Add the pattern string to the appropriate category
 * 2. Document the pattern with a comment
 * 3. Update this header with the new pattern category
 */

import { EnvLoader } from './environment';

/**
 * Retryable Error Patterns
 * Patterns that indicate an error is retryable
 * Used by isRetryableError() to determine if a failed operation should be retried
 */
export const RETRYABLE_PATTERNS = {
  /** Network timeout patterns */
  TIMEOUT: EnvLoader.string('ERROR_PATTERN_TIMEOUT', 'timeout'),

  /** Rate limiting patterns */
  RATE_LIMIT: EnvLoader.string('ERROR_PATTERN_RATE_LIMIT', 'rate limit'),

  /** Connection reset patterns */
  ECONNRESET: EnvLoader.string('ERROR_PATTERN_ECONNRESET', 'econnreset'),

  /** Connection refused patterns */
  ECONNREFUSED: EnvLoader.string('ERROR_PATTERN_ECONNREFUSED', 'econnrefused'),

  /** Connection timed out patterns */
  ETIMEDOUT: EnvLoader.string('ERROR_PATTERN_ETIMEDOUT', 'etimedout'),

  /** Host not found patterns */
  ENOTFOUND: EnvLoader.string('ERROR_PATTERN_ENOTFOUND', 'enotfound'),
} as const;

/**
 * Network Error Patterns
 * Patterns that indicate a network-related error
 * Used by classifyStandardError() to classify errors
 */
export const NETWORK_ERROR_PATTERNS = {
  /** Connection reset */
  ECONNRESET: EnvLoader.string('ERROR_NETWORK_ECONNRESET', 'econnreset'),

  /** Connection refused */
  ECONNREFUSED: EnvLoader.string('ERROR_NETWORK_ECONNREFUSED', 'econnrefused'),

  /** Host not found */
  ENOTFOUND: EnvLoader.string('ERROR_NETWORK_ENOTFOUND', 'enotfound'),

  /** General network error */
  NETWORK: EnvLoader.string('ERROR_NETWORK_GENERAL', 'network'),
} as const;

/**
 * Timeout Error Patterns
 * Patterns that indicate a timeout error
 * Used by classifyStandardError() to classify errors
 */
export const TIMEOUT_ERROR_PATTERNS = {
  /** Timeout in message */
  MESSAGE_TIMEOUT: EnvLoader.string('ERROR_TIMEOUT_MESSAGE', 'timeout'),

  /** Timeout in error name */
  NAME_TIMEOUT: EnvLoader.string('ERROR_TIMEOUT_NAME', 'timeout'),
} as const;

/**
 * Database Error Patterns
 * Patterns that indicate a database-related error (PostgreSQL/Supabase)
 * Used by classifyStandardError() to classify errors
 */
export const DATABASE_ERROR_PATTERNS = {
  /** Database in message */
  MESSAGE_DATABASE: EnvLoader.string('ERROR_DATABASE_MESSAGE', 'database'),

  /** SQL in message */
  MESSAGE_SQL: EnvLoader.string('ERROR_DATABASE_SQL', 'sql'),

  /** Relation in message */
  MESSAGE_RELATION: EnvLoader.string('ERROR_DATABASE_RELATION', 'relation'),

  /** Column in message */
  MESSAGE_COLUMN: EnvLoader.string('ERROR_DATABASE_COLUMN', 'column'),

  /** Database in error name */
  NAME_DATABASE: EnvLoader.string('ERROR_DATABASE_NAME', 'database'),

  /** Postgres in error name */
  NAME_POSTGRES: EnvLoader.string('ERROR_DATABASE_POSTGRES', 'postgres'),
} as const;

/**
 * Authentication Error Patterns
 * Patterns that indicate an authentication/authorization error
 * Used by classifyStandardError() to classify errors
 */
export const AUTH_ERROR_PATTERNS = {
  /** Unauthorized access */
  UNAUTHORIZED: EnvLoader.string('ERROR_AUTH_UNAUTHORIZED', 'unauthorized'),

  /** Unauthenticated access */
  UNAUTHENTICATED: EnvLoader.string(
    'ERROR_AUTH_UNAUTHENTICATED',
    'unauthenticated'
  ),

  /** Forbidden access */
  FORBIDDEN: EnvLoader.string('ERROR_AUTH_FORBIDDEN', 'forbidden'),

  /** Invalid token */
  INVALID_TOKEN: EnvLoader.string('ERROR_AUTH_INVALID_TOKEN', 'invalid token'),

  /** JWT error */
  JWT: EnvLoader.string('ERROR_AUTH_JWT', 'jwt'),
} as const;

/**
 * Rate Limit Error Patterns
 * Patterns that indicate a rate limit error
 * Used by classifyStandardError() to classify errors
 */
export const RATE_LIMIT_ERROR_PATTERNS = {
  /** Rate limit in message */
  MESSAGE_RATE_LIMIT: EnvLoader.string(
    'ERROR_RATE_LIMIT_MESSAGE',
    'rate limit'
  ),

  /** Too many requests */
  TOO_MANY_REQUESTS: EnvLoader.string(
    'ERROR_RATE_LIMIT_TOO_MANY',
    'too many requests'
  ),
} as const;

/**
 * Validation Error Patterns
 * Patterns that indicate a validation error
 * Used by classifyStandardError() to classify errors
 */
export const VALIDATION_ERROR_PATTERNS = {
  /** Validation in message */
  MESSAGE_VALIDATION: EnvLoader.string(
    'ERROR_VALIDATION_MESSAGE',
    'validation'
  ),

  /** Invalid in message */
  MESSAGE_INVALID: EnvLoader.string('ERROR_VALIDATION_INVALID', 'invalid'),

  /** Required in message */
  MESSAGE_REQUIRED: EnvLoader.string('ERROR_VALIDATION_REQUIRED', 'required'),

  /** Validation in error name */
  NAME_VALIDATION: EnvLoader.string('ERROR_VALIDATION_NAME', 'validation'),
} as const;

/**
 * Login Error Patterns
 * Patterns that indicate a login/authentication error
 * Used by login page to determine error messaging
 */
export const LOGIN_ERROR_PATTERNS = {
  /** Invalid credentials */
  INVALID: EnvLoader.string('ERROR_LOGIN_INVALID', 'invalid'),
} as const;

/**
 * Combined Error Classification Patterns
 * All patterns organized by error classification category
 */
export const ERROR_CLASSIFICATION_PATTERNS = {
  /** Patterns for retryable errors */
  RETRYABLE: RETRYABLE_PATTERNS,

  /** Patterns for network errors */
  NETWORK: NETWORK_ERROR_PATTERNS,

  /** Patterns for timeout errors */
  TIMEOUT: TIMEOUT_ERROR_PATTERNS,

  /** Patterns for database errors */
  DATABASE: DATABASE_ERROR_PATTERNS,

  /** Patterns for authentication errors */
  AUTH: AUTH_ERROR_PATTERNS,

  /** Patterns for rate limit errors */
  RATE_LIMIT: RATE_LIMIT_ERROR_PATTERNS,

  /** Patterns for validation errors */
  VALIDATION: VALIDATION_ERROR_PATTERNS,

  /** Patterns for login errors */
  LOGIN: LOGIN_ERROR_PATTERNS,
} as const;

/**
 * Helper function to check if a string matches any pattern in a category
 *
 * @param text - The text to check against patterns
 * @param patterns - Object containing pattern strings
 * @returns true if the text matches any pattern
 *
 * @example
 * ```typescript
 * if (matchesAnyPattern(errorMessage, NETWORK_ERROR_PATTERNS)) {
 *   // Handle network error
 * }
 * ```
 */
export function matchesAnyPattern(
  text: string,
  patterns: Record<string, string>
): boolean {
  const lowerText = text.toLowerCase();
  return Object.values(patterns).some((pattern) =>
    lowerText.includes(pattern.toLowerCase())
  );
}

/**
 * Helper function to check if a string matches a pattern in a specific category
 *
 * @param text - The text to check against patterns
 * @param pattern - The pattern string to match
 * @returns true if the text matches the pattern
 *
 * @example
 * ```typescript
 * if (matchesPattern(errorMessage, TIMEOUT_ERROR_PATTERNS.MESSAGE_TIMEOUT)) {
 *   // Handle timeout error
 * }
 * ```
 */
export function matchesPattern(text: string, pattern: string): boolean {
  return text.toLowerCase().includes(pattern.toLowerCase());
}

export type ErrorClassificationPatterns = typeof ERROR_CLASSIFICATION_PATTERNS;
