import { AppError, isRetryableError, ErrorCode } from '../errors';

/**
 * Default predicate to determine if an error should trigger a retry.
 * Encapsulates the logic for identifying retryable vs non-retryable errors.
 *
 * @param error - The error that occurred during operation execution
 * @param _attempt - The current attempt number (1-indexed)
 * @returns true if the operation should be retried, false otherwise
 */
export function defaultShouldRetry(error: Error, _attempt: number): boolean {
  // Use centralized retryable error logic
  if (!isRetryableError(error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  // Don't retry circuit breaker errors
  if (message.includes('circuit breaker') && message.includes('is open')) {
    return false;
  }

  // Don't retry validation errors
  if (error instanceof AppError) {
    return error.retryable;
  }

  // Retry all other retryable errors
  return true;
}

/**
 * Creates a custom retry predicate that only retries on specific error codes.
 *
 * @param retryableCodes - Array of error codes that should trigger a retry
 * @returns A retry predicate function
 */
export function createErrorCodeRetryPredicate(
  retryableCodes: ErrorCode[]
): (error: Error, _attempt: number) => boolean {
  const codeSet = new Set(retryableCodes);
  return (error: Error): boolean => {
    if (error instanceof AppError && codeSet.has(error.code)) {
      return true;
    }
    return defaultShouldRetry(error, 1);
  };
}

/**
 * Creates a retry predicate that never retries (for non-idempotent operations).
 *
 * @returns A retry predicate that always returns false
 */
export function createNeverRetryPredicate(): (error: Error, _attempt: number) => boolean {
  return () => false;
}

/**
 * Creates a retry predicate that retries on any error (for idempotent operations).
 *
 * @returns A retry predicate that always returns true
 */
export function createAlwaysRetryPredicate(): (error: Error, _attempt: number) => boolean {
  return () => true;
}