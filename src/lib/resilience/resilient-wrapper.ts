import { TimeoutManager } from './timeout-manager';
import { RetryManager } from './retry-manager';
import { CircuitBreaker } from './circuit-breaker';
import { RetryConfig, RetryOptions } from './types';

/**
 * Converts RetryConfig to RetryOptions for RetryManager.withRetry
 */
function toRetryOptions(config: RetryConfig): RetryOptions {
  return {
    maxRetries: config.maxRetries,
    baseDelay: config.initialDelayMs,
    maxDelay: config.maxDelayMs,
    // Note: backoffMultiplier is handled internally by RetryManager
  };
}

/**
 * Creates a resilient wrapper that combines timeout, retry, and circuit breaker.
 *
 * The wrapper applies policies in this order:
 * 1. Timeout (outermost) - limits total execution time
 * 2. Retry - retries failed operations with exponential backoff
 * 3. Circuit Breaker (innermost) - prevents cascading failures
 *
 * @param operation - Base async operation to wrap
 * @param options - Configuration for timeout, retry, and circuit breaker
 * @returns A function that executes the operation with all configured policies
 */
export function createResilientWrapper<T>(
  operation: () => Promise<T>,
  options: {
    circuitBreaker?: CircuitBreaker;
    timeoutMs?: number;
    retryConfig?: RetryConfig;
  } = {}
): () => Promise<T> {
  return async () => {
    const { circuitBreaker, timeoutMs, retryConfig } = options;

    const operationWithTimeout = async (): Promise<T> => {
      if (timeoutMs) {
        // Use withTimeout which internally handles both AbortSignal-aware and legacy operations
        return TimeoutManager.withTimeout(operation, { timeoutMs });
      }
      return operation();
    };

    if (retryConfig) {
      return RetryManager.withRetry(
        operationWithTimeout,
        toRetryOptions(retryConfig),
        undefined,
        circuitBreaker
      );
    }

    if (circuitBreaker) {
      return await circuitBreaker.execute(operationWithTimeout);
    }

    return await operationWithTimeout();
  };
}
