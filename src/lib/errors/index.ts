/**
 * Error handling module
 *
 * This module provides a comprehensive error handling system including:
 * - Error codes and suggestions
 * - Error classes (AppError, ValidationError, etc.)
 * - Utility functions for error handling
 * - Error context extraction and classification
 *
 * @example
 * ```typescript
 * import { AppError, ErrorCode, ValidationError } from '@/lib/errors';
 *
 * // Throw a validation error
 * throw new ValidationError([
 *   { field: 'email', message: 'Invalid email format' }
 * ]);
 *
 * // Create an error with suggestions
 * const error = createErrorWithSuggestions(
 *   ErrorCode.INTERNAL_ERROR,
 *   'Something went wrong'
 * );
 * ```
 */

// Re-export all codes and suggestions
export { ErrorCode, ERROR_SUGGESTIONS } from './codes';

// Re-export all classes and interfaces
export {
  AppError,
  ValidationError,
  RateLimitError,
  ExternalServiceError,
  TimeoutError,
  CircuitBreakerError,
  RetryExhaustedError,
  type ErrorDetail,
  type ErrorResponse,
} from './classes';

// Re-export utility functions
export {
  toErrorResponse,
  generateRequestId,
  createErrorWithSuggestions,
  isRetryableError,
} from './utils';

// Re-export fingerprint generation
export { generateErrorFingerprint } from './fingerprint';

// Re-export context and classification
export {
  extractErrorContext,
  serializeError,
  summarizeError,
  type ErrorClassification,
  type ErrorContext,
} from './context';
