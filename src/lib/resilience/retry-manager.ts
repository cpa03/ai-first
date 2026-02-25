import {
  RetryExhaustedError,
  AppError,
  ErrorCode,
  isRetryableError,
} from '../errors';
import {
  RESILIENCE_CONFIG,
  STATUS_CODES,
  RETRY_VALUES,
} from '../config/constants';
import { RetryOptions } from './types';
import { CircuitBreaker } from './circuit-breaker';
import { CircuitBreakerState } from './types';

export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    context?: string,
    circuitBreaker?: CircuitBreaker
  ): Promise<T> {
    const {
      maxRetries = RESILIENCE_CONFIG.RETRY.DEFAULT_MAX_RETRIES,
      baseDelay = RESILIENCE_CONFIG.RETRY.DEFAULT_BASE_DELAY_MS,
      maxDelay = RESILIENCE_CONFIG.RETRY.DEFAULT_MAX_DELAY_MS,
      shouldRetry,
    } = options;

    const defaultShouldRetry = (_error: Error, _attempt: number): boolean => {
      // Use centralized retryable error logic
      if (!isRetryableError(_error)) {
        return false;
      }

      const message = _error.message.toLowerCase();

      // Don't retry circuit breaker errors
      if (message.includes('circuit breaker') && message.includes('is open')) {
        return false;
      }

      // Don't retry validation errors
      if (_error instanceof AppError) {
        return _error.retryable;
      }

      return true;
    };

    const retryFn = shouldRetry || defaultShouldRetry;

    let lastError: Error | undefined;
    const errors: Error[] = [];

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (circuitBreaker && attempt > 1) {
          const status = circuitBreaker.getStatus();
          if (status.state === CircuitBreakerState.OPEN) {
            const nextAttempt = status.nextAttemptTime;
            throw new AppError(
              `Circuit breaker is OPEN for ${context || 'operation'}. Not accepting requests until ${nextAttempt || 'unknown'}`,
              ErrorCode.CIRCUIT_BREAKER_OPEN,
              STATUS_CODES.SERVICE_UNAVAILABLE,
              undefined,
              true
            );
          }
        }
        return await operation();
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        lastError = normalizedError;
        errors.push(normalizedError);

        if (attempt > maxRetries || !retryFn(normalizedError, attempt)) {
          const exhaustedError = new RetryExhaustedError(
            `Operation${context ? ` '${context}'` : ''} failed`,
            context || 'unknown',
            attempt,
            normalizedError
          );
          (exhaustedError as Error & { attemptCount?: number }).attemptCount =
            attempt;
          throw exhaustedError;
        }

        // Exponential backoff with jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1) +
            Math.random() * RETRY_VALUES.JITTER_MULTIPLIER_MS,
          maxDelay
        );

        // Wait for the calculated delay before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Retry loop exhausted without error');
  }
}
