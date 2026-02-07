import {
  RetryExhaustedError,
  AppError,
  ErrorCode,
  isRetryableError,
} from '../errors';
import { RETRY_DELAY_CONFIG } from '../config/constants';
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
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
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
              503,
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
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
          maxDelay
        );

        // Use AbortController for cancellable delay
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), delay);

        try {
          await new Promise((resolve, reject) => {
            const checkAbort = () => {
              if (controller.signal.aborted) {
                reject(new Error('Retry delay aborted'));
              } else {
                setTimeout(resolve, RETRY_DELAY_CONFIG.POLLING_INTERVAL_MS);
              }
            };
            checkAbort();
          });
        } finally {
          clearTimeout(timeoutId);
        }
      }
    }

    throw lastError || new Error('Retry loop exhausted without error');
  }
}
