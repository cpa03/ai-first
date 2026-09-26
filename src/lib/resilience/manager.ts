import { ResilienceConfig } from './types';
import { CircuitBreakerManager } from './circuit-breaker-manager';
import { CircuitBreaker } from './circuit-breaker';
import { createResilientWrapper } from './resilient-wrapper';
import { DEFAULT_CIRCUIT_BREAKER_CONFIG, DEFAULT_RETRIES } from './config';

const cbManager = CircuitBreakerManager.getInstance();

/**
 * High-level resilience facade that combines timeout, retry, and circuit breaker.
 * Provides a simple API for executing operations with full fault tolerance.
 */
export const resilienceManager = {
  /**
   * Executes an operation with configured resilience policies.
   *
   * @param operation - Async operation to execute
   * @param config - Resilience configuration (timeout, retries, circuit breaker)
   * @param context - Optional context name for circuit breaker isolation
   * @returns Promise that resolves with the operation result
   */
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

  /**
   * Gets a circuit breaker by name.
   *
   * @param name - Circuit breaker name
   * @returns CircuitBreaker instance or undefined if not found
   */
  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return cbManager.get(name);
  },

  /**
   * Gets status of all circuit breakers.
   *
   * @returns Record mapping circuit breaker names to their status
   */
  getCircuitBreakerStates(): Record<string, unknown> {
    return cbManager.getAllStatuses();
  },

  /**
   * Resets a specific circuit breaker to closed state.
   *
   * @param name - Name of the circuit breaker to reset
   */
  resetCircuitBreaker(name: string): void {
    cbManager.reset(name);
  },

  /**
   * Reset all circuit breakers to closed state.
   * Useful for admin operations and testing.
   */
  resetAllCircuitBreakers(): void {
    cbManager.resetAll();
  },

  /**
   * Get all circuit breaker names.
   * Useful for monitoring and debugging.
   *
   * @returns Array of circuit breaker names
   */
  getCircuitBreakerNames(): string[] {
    return cbManager.getNames();
  },
};
