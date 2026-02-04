import { RetryExhaustedError } from '../errors';
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
      const message = _error.message.toLowerCase();

      if (message.includes('circuit breaker is open')) {
        return false;
      }

      return true;
    };

    const retryFn = shouldRetry || defaultShouldRetry;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (circuitBreaker && attempt > 1) {
          const status = circuitBreaker.getStatus();
          if (status.state === CircuitBreakerState.OPEN) {
            const nextAttempt = status.nextAttemptTime;
            throw new Error(
              `Circuit breaker is OPEN for ${context || 'operation'}. Not accepting requests until ${nextAttempt || 'unknown'}`
            );
          }
        }
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt > maxRetries || !retryFn(lastError, attempt)) {
          const exhaustedError = new RetryExhaustedError(
            `Operation${context ? ` '${context}'` : ''} failed after ${attempt} attempts`,
            context || 'unknown',
            attempt,
            lastError
          );
          (exhaustedError as Error & { attemptCount?: number }).attemptCount =
            attempt;
          throw exhaustedError;
        }

        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
          maxDelay
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}
