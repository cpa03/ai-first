/**
 * Error context and classification utilities
 */

import { redactPII } from '../pii-redaction';
import { ENV_ACCESSORS } from '../config/env-keys';
import { ERROR_CONTEXT_CONFIG } from '../config/modular-constants';
import {
  NETWORK_ERROR_PATTERNS,
  TIMEOUT_ERROR_PATTERNS,
  DATABASE_ERROR_PATTERNS,
  AUTH_ERROR_PATTERNS,
  RATE_LIMIT_ERROR_PATTERNS,
  VALIDATION_ERROR_PATTERNS,
  matchesPattern,
} from '../config/error-classification';
import {
  AppError,
  ValidationError,
  RateLimitError,
  ExternalServiceError,
  TimeoutError,
  CircuitBreakerError,
  RetryExhaustedError,
} from './classes';
import { ErrorCode } from './codes';
import { isRetryableError } from './utils';
import { API_ERROR_MESSAGES } from '../config/error-messages';

/**
 * Classification of error types for debugging and monitoring
 */
export type ErrorClassification =
  | 'app_error'
  | 'validation_error'
  | 'rate_limit_error'
  | 'external_service_error'
  | 'timeout_error'
  | 'network_error'
  | 'database_error'
  | 'auth_error'
  | 'unknown_error';

/**
 * Error context information extracted from an error
 * Used for structured logging and debugging
 */
export interface ErrorContext {
  /** Error name/type */
  name: string;
  /** Error message (redacted for PII) */
  message: string;
  /** Error code if available */
  code?: string;
  /** HTTP status code if available */
  statusCode?: number;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Error fingerprint for deduplication */
  fingerprint?: string;
  /** Stack trace (first 3 lines, redacted) */
  stackPreview?: string;
  /** Original error type classification */
  classification: ErrorClassification;
  /** Timestamp when context was extracted */
  timestamp: string;
}

/**
 * Extract structured context from any error for logging and debugging
 * Safely handles unknown error types and redacts PII
 *
 * @param error - The error to extract context from
 * @param includeStack - Whether to include stack trace preview (default: true in dev, false in prod)
 * @returns Structured error context safe for logging
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const context = extractErrorContext(error);
 *   logger.error('Operation failed', context);
 *   // Logs: { name: 'AppError', code: 'VALIDATION_ERROR', classification: 'app_error', ... }
 * }
 * ```
 */
export function extractErrorContext(
  error: unknown,
  includeStack?: boolean
): ErrorContext {
  const timestamp = new Date().toISOString();
  const shouldIncludeStack =
    includeStack ?? ENV_ACCESSORS.PLATFORM.NODE_ENV() !== 'production';

  // Handle AppError and subclasses
  if (error instanceof AppError) {
    const classification = classifyAppError(error);

    return {
      name: error.name,
      message: redactPII(error.message),
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      fingerprint: error.fingerprint,
      stackPreview: shouldIncludeStack
        ? getStackPreview(error.stack)
        : undefined,
      classification,
      timestamp,
    };
  }

  // Handle standard Error
  if (error instanceof Error) {
    const classification = classifyStandardError(error);

    return {
      name: error.name,
      message: redactPII(error.message),
      retryable: isRetryableError(error),
      stackPreview: shouldIncludeStack
        ? getStackPreview(error.stack)
        : undefined,
      classification,
      timestamp,
    };
  }

  // Handle unknown error types
  return {
    name: 'UnknownError',
    message: API_ERROR_MESSAGES.FALLBACK.INTERNAL_ERROR,
    retryable: false,
    classification: 'unknown_error',
    timestamp,
  };
}

/**
 * Classify an AppError into a specific category
 */
function classifyAppError(error: AppError): ErrorClassification {
  if (error instanceof ValidationError) return 'validation_error';
  if (error instanceof RateLimitError) return 'rate_limit_error';
  if (error instanceof ExternalServiceError) return 'external_service_error';
  if (error instanceof TimeoutError) return 'timeout_error';
  if (error instanceof CircuitBreakerError) return 'external_service_error';
  if (error instanceof RetryExhaustedError) return 'external_service_error';

  // Classify by error code
  switch (error.code) {
    case ErrorCode.VALIDATION_ERROR:
      return 'validation_error';
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return 'rate_limit_error';
    case ErrorCode.EXTERNAL_SERVICE_ERROR:
      return 'external_service_error';
    case ErrorCode.TIMEOUT_ERROR:
      return 'timeout_error';
    case ErrorCode.AUTHENTICATION_ERROR:
    case ErrorCode.AUTHORIZATION_ERROR:
      return 'auth_error';
    case ErrorCode.INTERNAL_ERROR:
      return 'app_error';
    default:
      return 'app_error';
  }
}

/**
 * Classify a standard Error by analyzing its properties
 */
function classifyStandardError(error: Error): ErrorClassification {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network errors
  if (
    matchesPattern(message, NETWORK_ERROR_PATTERNS.ECONNRESET) ||
    matchesPattern(message, NETWORK_ERROR_PATTERNS.ECONNREFUSED) ||
    matchesPattern(message, NETWORK_ERROR_PATTERNS.ENOTFOUND) ||
    matchesPattern(message, NETWORK_ERROR_PATTERNS.NETWORK)
  ) {
    return 'network_error';
  }

  // Timeout errors
  if (
    matchesPattern(message, TIMEOUT_ERROR_PATTERNS.MESSAGE_TIMEOUT) ||
    matchesPattern(name, TIMEOUT_ERROR_PATTERNS.NAME_TIMEOUT)
  ) {
    return 'timeout_error';
  }

  // Database errors (PostgreSQL/Supabase patterns)
  if (
    matchesPattern(message, DATABASE_ERROR_PATTERNS.MESSAGE_DATABASE) ||
    matchesPattern(message, DATABASE_ERROR_PATTERNS.MESSAGE_SQL) ||
    matchesPattern(message, DATABASE_ERROR_PATTERNS.MESSAGE_RELATION) ||
    matchesPattern(message, DATABASE_ERROR_PATTERNS.MESSAGE_COLUMN) ||
    matchesPattern(name, DATABASE_ERROR_PATTERNS.NAME_DATABASE) ||
    matchesPattern(name, DATABASE_ERROR_PATTERNS.NAME_POSTGRES)
  ) {
    return 'database_error';
  }

  // Auth errors
  if (
    matchesPattern(message, AUTH_ERROR_PATTERNS.UNAUTHORIZED) ||
    matchesPattern(message, AUTH_ERROR_PATTERNS.UNAUTHENTICATED) ||
    matchesPattern(message, AUTH_ERROR_PATTERNS.FORBIDDEN) ||
    matchesPattern(message, AUTH_ERROR_PATTERNS.INVALID_TOKEN) ||
    matchesPattern(message, AUTH_ERROR_PATTERNS.JWT)
  ) {
    return 'auth_error';
  }

  // Rate limit errors
  if (
    matchesPattern(message, RATE_LIMIT_ERROR_PATTERNS.MESSAGE_RATE_LIMIT) ||
    matchesPattern(message, RATE_LIMIT_ERROR_PATTERNS.TOO_MANY_REQUESTS)
  ) {
    return 'rate_limit_error';
  }

  // Validation errors
  if (
    matchesPattern(message, VALIDATION_ERROR_PATTERNS.MESSAGE_VALIDATION) ||
    matchesPattern(message, VALIDATION_ERROR_PATTERNS.MESSAGE_INVALID) ||
    matchesPattern(message, VALIDATION_ERROR_PATTERNS.MESSAGE_REQUIRED) ||
    matchesPattern(name, VALIDATION_ERROR_PATTERNS.NAME_VALIDATION)
  ) {
    return 'validation_error';
  }

  return 'unknown_error';
}

function getStackPreview(stack?: string): string | undefined {
  if (!stack) return undefined;

  const lines = stack
    .split('\n')
    .slice(0, ERROR_CONTEXT_CONFIG.STACK_PREVIEW_LINES);
  return lines.map((line) => redactPII(line.trim())).join('\n');
}

/**
 * Safely serialize an error for logging or API responses
 * Handles circular references and redacts PII
 *
 * @param error - The error to serialize
 * @returns A safe, serializable error object
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   // Safe to log or send to monitoring service
 *   console.log(JSON.stringify(serializeError(error)));
 * }
 * ```
 */
export function serializeError(error: unknown): Record<string, unknown> {
  const context = extractErrorContext(error, false);

  const serialized: Record<string, unknown> = {
    name: context.name,
    message: context.message,
    classification: context.classification,
    retryable: context.retryable,
    timestamp: context.timestamp,
  };

  if (context.code) serialized.code = context.code;
  if (context.statusCode) serialized.statusCode = context.statusCode;
  if (context.fingerprint) serialized.fingerprint = context.fingerprint;

  return serialized;
}

/**
 * Create a summary string from an error for quick logging
 *
 * @param error - The error to summarize
 * @returns A concise error summary string
 *
 * @example
 * ```typescript
 * logger.error(summarizeError(error));
 * // Output: "[AppError:VALIDATION_ERROR] Request validation failed (retryable: false)"
 * ```
 */
export function summarizeError(error: unknown): string {
  const context = extractErrorContext(error, false);

  const parts = [`${context.name}`];

  if (context.code) {
    parts.push(`:${context.code}`);
  }

  parts.push(`] ${context.message}`);

  if (context.statusCode) {
    parts.push(` (status: ${context.statusCode})`);
  }

  parts.push(` (retryable: ${context.retryable})`);

  return `[${parts.join('')}]`;
}
