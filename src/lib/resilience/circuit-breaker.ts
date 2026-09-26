import { createLogger } from '../logger';
import { CircuitBreakerOptions, CircuitBreakerState } from './types';
import { CircuitBreakerError, RetryExhaustedError } from '../errors';
import { DEFAULT_CIRCUIT_BREAKER_CONFIG } from './config';

type CircuitBreakerInternalState = {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
};

const logger = createLogger('CircuitBreaker');

export class CircuitBreaker {
  private circuitState: CircuitBreakerInternalState = {
    state: 'closed',
    failures: 0,
  };
  private recentFailures: number[] = [];
  /** Mutex for half-open state to prevent concurrent recovery probes */
  private halfOpenLock: Promise<void> = Promise.resolve();

  /**
   * Creates a new CircuitBreaker instance.
   *
   * @param name - Unique identifier for this circuit breaker (used for logging and locking)
   * @param config - Configuration options for failure threshold, reset timeout, and monitoring period
   */
  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerOptions = DEFAULT_CIRCUIT_BREAKER_CONFIG
  ) {}

  /**
   * Executes an operation with circuit breaker protection.
   *
   * The circuit breaker tracks failures and transitions through states:
   * - CLOSED: Normal operation, failures are counted
   * - OPEN: Failure threshold exceeded, requests fail fast
   * - HALF_OPEN: Testing recovery with a single request
   *
   * @param operation - Async operation to execute
   * @returns Promise that resolves with the operation result
   * @throws CircuitBreakerError if the circuit is open and not ready for recovery
   * @throws Error if the operation fails (after updating failure state)
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (this.circuitState.state === 'open') {
      if (now >= (this.circuitState.nextAttemptTime || 0)) {
        // Acquire lock before transitioning to half-open to prevent
        // multiple concurrent requests from all transitioning simultaneously.
        return this.withHalfOpenLock(() => {
          // Double-check: Another request may have already transitioned the state
          if (this.circuitState.state === 'open') {
            this.circuitState.state = 'half-open';
            logger.info(
              `Circuit breaker HALF-OPEN transition for "${this.name}" - starting recovery probe`
            );
          }
          return this.executeOperation(operation, now);
        });
      } else {
        throw new CircuitBreakerError(
          this.name,
          new Date(this.circuitState.nextAttemptTime || 0)
        );
      }
    }

    if (this.circuitState.state === 'half-open') {
      return this.withHalfOpenLock(() => this.executeOperation(operation, now));
    }

    return this.executeOperation(operation, now);
  }

  /**
   * Executes callback with mutual exclusion for half-open state.
   * Uses a simple promise-based mutex - each call waits for the previous to complete.
   */
  private async withHalfOpenLock<T>(callback: () => Promise<T>): Promise<T> {
    // Create a new lock that resolves after the callback completes
    const lock = this.halfOpenLock.then(() => callback());

    // Update the mutex to wait for this operation
    this.halfOpenLock = lock.then(
      () => {},
      () => {} // Ignore rejections to prevent unhandled promise warnings
    );

    try {
      return await lock;
    } finally {
      // Lock is automatically released when the promise chain completes
    }
  }

  private async executeOperation<T>(
    operation: () => Promise<T>,
    now: number
  ): Promise<T> {
    this.cleanupOldFailures(now);

    try {
      const result = await operation();
      this.onSuccess(now);
      return result;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = normalizedError.message;
      // Don't use attemptCount from RetryExhaustedError - circuit breaker should
      // record 1 failure per execute() call, not per retry attempt
      const isRetryExhausted = normalizedError instanceof RetryExhaustedError;
      const attemptCount = isRetryExhausted
        ? 1
        : (normalizedError as Error & { attemptCount?: number }).attemptCount ||
          (errorMessage?.includes('stopped due to circuit breaker') ? 0 : 1);
      this.onError(normalizedError, now, attemptCount);
      throw normalizedError;
    }
  }

  /**
   * Cleanup failure timestamps that are outside the monitoring period.
   * Uses simple filter since failure counts are typically small (<100).
   */
  private cleanupOldFailures(now: number): void {
    const monitoringPeriod = this.config.monitoringPeriodMs;
    const cutoff = now - monitoringPeriod;

    // Filter out expired failures - O(N) but N is typically very small
    this.recentFailures = this.recentFailures.filter(
      (timestamp) => timestamp >= cutoff
    );
    this.circuitState.failures = this.recentFailures.length;
  }

  private onSuccess(_now: number): void {
    const previousState = this.circuitState.state;
    this.recentFailures = [];
    this.circuitState.failures = 0;
    this.circuitState.state = 'closed';

    if (previousState !== 'closed') {
      logger.info(
        `Circuit breaker RECOVERED for "${this.name}" - state transitioned from ${previousState.toUpperCase()} to CLOSED`
      );
    }
  }

  private onError(_error: Error, now: number, attemptCount: number = 1): void {
    for (let i = 0; i < attemptCount; i++) {
      this.recentFailures.push(now);
    }
    this.circuitState.failures = this.recentFailures.length;
    this.circuitState.lastFailureTime = now;

    if (this.circuitState.failures >= this.config.failureThreshold) {
      this.openCircuit(now);
    }
  }

  private openCircuit(now: number): void {
    this.circuitState.state = 'open';
    this.circuitState.nextAttemptTime = now + this.config.resetTimeoutMs;
    // Log at WARN level to ensure visibility in production (error/warn are preserved)
    // This is a critical reliability event that operators need to see
    logger.warn(
      `Circuit breaker OPENED for "${this.name}". Failures: ${this.circuitState.failures}, Threshold: ${this.config.failureThreshold}, Next attempt: ${new Date(this.circuitState.nextAttemptTime).toISOString()}`
    );
  }

  /**
   * Returns the current state of the circuit breaker.
   *
   * @returns The current CircuitBreakerState (CLOSED, OPEN, or HALF_OPEN)
   */
  getState(): CircuitBreakerState {
    const stateValue = this.circuitState.state;
    if (stateValue === 'closed') return CircuitBreakerState.CLOSED;
    if (stateValue === 'open') return CircuitBreakerState.OPEN;
    return CircuitBreakerState.HALF_OPEN;
  }

  /**
   * Resets the circuit breaker to its initial closed state.
   * Clears all failure counts and timing information.
   */
  reset(): void {
    this.circuitState.failures = 0;
    this.circuitState.state = 'closed';
    this.circuitState.lastFailureTime = 0;
    this.circuitState.nextAttemptTime = 0;
  }

  /**
   * Returns the current failure count.
   *
   * @returns Number of failures in the current monitoring period
   */
  getFailures(): number {
    return this.circuitState.failures;
  }

  /**
   * Returns the timestamp when the next recovery attempt is allowed.
   *
   * @returns Unix timestamp in milliseconds, or 0 if circuit is not open
   */
  getNextAttemptTime(): number {
    return this.circuitState.nextAttemptTime || 0;
  }

  /**
   * Returns a detailed status object for monitoring and debugging.
   *
   * @returns Object containing state, failure count, and next attempt time (if open)
   */
  getStatus(): {
    state: CircuitBreakerState;
    failures: number;
    nextAttemptTime?: string;
  } {
    let state: CircuitBreakerState;
    const stateValue = this.circuitState.state;
    if (stateValue === 'closed') {
      state = CircuitBreakerState.CLOSED;
    } else if (stateValue === 'open') {
      state = CircuitBreakerState.OPEN;
    } else {
      state = CircuitBreakerState.HALF_OPEN;
    }

    return {
      state,
      failures: this.circuitState.failures,
      nextAttemptTime:
        stateValue === 'open'
          ? new Date(this.circuitState.nextAttemptTime || 0).toISOString()
          : undefined,
    };
  }

  /**
   * Record a successful operation externally (e.g., from RetryManager)
   * Useful when the circuit breaker is not the direct executor but should track results
   */
  recordSuccess(now: number = Date.now()): void {
    this.onSuccess(now);
  }

  /**
   * Record a failed operation externally (e.g., from RetryManager)
   * Useful when the circuit breaker is not the direct executor but should track results
   */
  recordFailure(error: Error, now: number = Date.now(), attemptCount: number = 1): void {
    this.onError(error, now, attemptCount);
  }
}
