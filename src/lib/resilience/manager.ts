import { ResilienceConfig } from './types';
import { CircuitBreakerManager } from './circuit-breaker-manager';
import { CircuitBreaker } from './circuit-breaker';
import { createResilientWrapper } from './resilient-wrapper';
import { DEFAULT_CIRCUIT_BREAKER_CONFIG, DEFAULT_RETRIES } from './config';

const cbManager = CircuitBreakerManager.getInstance();

export const resilienceManager = {
  async execute<T>(
    operation: () => Promise<T>,
    config: ResilienceConfig = {},
    context?: string
  ): Promise<T> {
    const circuitBreaker = config.failureThreshold
      ? cbManager.getOrCreate(context || 'default', {
          failureThreshold: config.failureThreshold,
          resetTimeoutMs:
            config.resetTimeoutMs ??
            DEFAULT_CIRCUIT_BREAKER_CONFIG.resetTimeoutMs,
          monitoringPeriodMs: DEFAULT_CIRCUIT_BREAKER_CONFIG.monitoringPeriodMs,
        })
      : undefined;

    const wrapper = createResilientWrapper(operation, {
      timeoutMs: config.timeoutMs,
      retryConfig: config.maxRetries
        ? {
            maxRetries: config.maxRetries,
            initialDelayMs:
              config.baseDelayMs ?? DEFAULT_RETRIES.initialDelayMs,
            maxDelayMs: config.maxDelayMs ?? DEFAULT_RETRIES.maxDelayMs,
            backoffMultiplier: DEFAULT_RETRIES.backoffMultiplier,
          }
        : undefined,
      circuitBreaker,
    });

    return wrapper();
  },

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return cbManager.get(name);
  },

  getCircuitBreakerStates(): Record<string, unknown> {
    return cbManager.getAllStatuses();
  },

  resetCircuitBreaker(name: string): void {
    cbManager.reset(name);
  },
};
