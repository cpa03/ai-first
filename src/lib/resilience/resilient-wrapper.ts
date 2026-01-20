import { TimeoutManager } from './timeout-manager';
import { RetryManager } from './retry-manager';
import { CircuitBreaker } from './circuit-breaker';
import { RetryConfig } from './types';

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
        return TimeoutManager.withTimeout(operation, { timeoutMs });
      }
      return operation();
    };

    if (retryConfig) {
      return RetryManager.withRetry(
        operationWithTimeout,
        retryConfig,
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
