import { createLogger } from '../logger';
import { CircuitBreakerOptions, CircuitBreakerState } from './types';
import { CircuitBreakerError } from '../errors';
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

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerOptions = DEFAULT_CIRCUIT_BREAKER_CONFIG
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.circuitState.state === 'open') {
      if (Date.now() >= (this.circuitState.nextAttemptTime || 0)) {
        this.circuitState.state = 'half-open';
      } else {
        throw new CircuitBreakerError(
          this.name,
          new Date(this.circuitState.nextAttemptTime || 0)
        );
      }
    }

    const now = Date.now();
    this.cleanupOldFailures(now);

    try {
      const result = await operation();
      this.onSuccess(now);
      return result;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = normalizedError.message;
      const attemptCount =
        (normalizedError as Error & { attemptCount?: number }).attemptCount ||
        (errorMessage?.includes('stopped due to circuit breaker') ? 0 : 1);
      this.onError(normalizedError, now, attemptCount);
      throw normalizedError;
    }
  }

  private cleanupOldFailures(now: number): void {
    const monitoringPeriod = this.config.monitoringPeriodMs;
    this.recentFailures = this.recentFailures.filter(
      (timestamp) => now - timestamp <= monitoringPeriod
    );
    this.circuitState.failures = this.recentFailures.length;
  }

  private onSuccess(_now: number): void {
    this.recentFailures = [];
    this.circuitState.failures = 0;
    this.circuitState.state = 'closed';
  }

  private onError(error: Error, now: number, attemptCount: number = 1): void {
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
    logger.debug(
      `Opening circuit breaker. Failures: ${this.circuitState.failures}, Threshold: ${this.config.failureThreshold}`
    );
  }

  getState(): CircuitBreakerState {
    const stateValue = this.circuitState.state;
    if (stateValue === 'closed') return CircuitBreakerState.CLOSED;
    if (stateValue === 'open') return CircuitBreakerState.OPEN;
    return CircuitBreakerState.HALF_OPEN;
  }

  reset(): void {
    this.circuitState.failures = 0;
    this.circuitState.state = 'closed';
    this.circuitState.lastFailureTime = 0;
    this.circuitState.nextAttemptTime = 0;
  }

  getFailures(): number {
    return this.circuitState.failures;
  }

  getNextAttemptTime(): number {
    return this.circuitState.nextAttemptTime || 0;
  }

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
}
