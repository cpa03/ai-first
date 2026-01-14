import { createLogger } from './logger';

const logger = createLogger('Resilience');

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface TimeoutOptions {
  timeoutMs: number;
  onTimeout?: () => void;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
}

export interface ResilienceConfig {
  retry?: RetryOptions;
  timeout?: TimeoutOptions;
  circuitBreaker?: CircuitBreakerOptions;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    state: 'closed',
    failures: 0,
  };
  private cachedState?: CircuitBreakerState;
  private recentFailures: number[] = [];

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>, context?: string): Promise<T> {
    const now = Date.now();

    if (this.state.state === 'open') {
      if (now < (this.state.nextAttemptTime || 0)) {
        throw new Error(
          `Circuit breaker is OPEN for ${context || 'operation'}. Not accepting requests until ${new Date(this.state.nextAttemptTime!).toISOString()}`
        );
      }
      this.state.state = 'half-open';
    }

    this.cleanupOldFailures(now);

    try {
      const result = await operation();
      this.onSuccess(now);
      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      const attemptCount =
        (error as Error & { attemptCount?: number }).attemptCount ||
        (errorMessage?.includes('stopped due to circuit breaker') ? 0 : 1);
      this.onError(error as Error, now, attemptCount);
      throw error;
    }
  }

  private cleanupOldFailures(now: number): void {
    const monitoringPeriod = this.options.monitoringPeriod;
    this.recentFailures = this.recentFailures.filter(
      (timestamp) => now - timestamp <= monitoringPeriod
    );
    this.state.failures = this.recentFailures.length;
  }

  private onSuccess(_now: number): void {
    this.recentFailures = [];
    this.state.failures = 0;
    this.state.state = 'closed';

    if (this.cachedState) {
      this.cachedState.failures = 0;
      this.cachedState.state = 'closed';
      delete this.cachedState.lastFailureTime;
      delete this.cachedState.nextAttemptTime;
    }
  }

  private onError(error: Error, _now: number, attemptCount: number = 1): void {
    for (let i = 0; i < attemptCount; i++) {
      this.recentFailures.push(_now);
    }
    this.state.failures = this.recentFailures.length;
    this.state.lastFailureTime = _now;

    if (this.state.failures >= this.options.failureThreshold) {
      this.openCircuit(_now);
    }

    if (this.cachedState) {
      this.cachedState.failures = this.state.failures;
      this.cachedState.state = this.state.state;
      this.cachedState.lastFailureTime = this.state.lastFailureTime;
      this.cachedState.nextAttemptTime = this.state.nextAttemptTime;
    }
  }

  private openCircuit(now: number): void {
    this.state.state = 'open';
    this.state.nextAttemptTime = now + this.options.resetTimeout;
    logger.debug(
      `Opening circuit breaker. Failures: ${this.state.failures}, Threshold: ${this.options.failureThreshold}`
    );
  }

  getState(): CircuitBreakerState {
    if (!this.cachedState) {
      this.cachedState = { ...this.state };
    }
    return this.cachedState;
  }

  reset(): void {
    this.state = {
      state: 'closed',
      failures: 0,
    };
    this.recentFailures = [];
    this.cachedState = undefined;
  }
}

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

    const defaultShouldRetry = (error: Error, _attempt: number): boolean => {
      const retryableStatuses = [
        408,
        429,
        500,
        502,
        503,
        504,
        507,
        509,
        'econnreset',
        'econnrefused',
        'etimedout',
        'enotfound',
        'eai_again',
      ];

      const message = error.message.toLowerCase();

      return (
        retryableStatuses.some((status) =>
          message.includes(String(status).toLowerCase())
        ) ||
        message.includes('timeout') ||
        message.includes('rate limit') ||
        message.includes('too many requests') ||
        message.includes('temporary failure')
      );
    };

    const retryFn = shouldRetry || defaultShouldRetry;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (circuitBreaker && attempt > 1) {
          const state = circuitBreaker.getState();
          if (state.state === 'open') {
            const stateStr = state.state;
            const nextAttempt = state.nextAttemptTime;
            throw new Error(
              `Circuit breaker is ${stateStr.toUpperCase()} for ${context || 'operation'}. Not accepting requests until ${new Date(nextAttempt!).toISOString()}`
            );
          }
        }
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt > maxRetries || !retryFn(lastError, attempt)) {
          const exhaustedError = new RetryExhaustedError(
            `Operation${context ? ` '${context}'` : ''} failed after ${attempt} attempts`,
            lastError,
            attempt
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

export class TimeoutManager {
  static async withTimeout<T>(
    operation: () => Promise<T>,
    options: TimeoutOptions
  ): Promise<T> {
    const { timeoutMs, onTimeout } = options;

    if (timeoutMs <= 0) {
      return Promise.reject(new TimeoutError('Timeout must be greater than 0'));
    }

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          onTimeout?.();
          reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        if (typeof (timeoutId as NodeJS.Timeout).unref === 'function') {
          (timeoutId as NodeJS.Timeout).unref();
        }
      }),
    ]);
  }
}

export class ResilienceManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  async execute<T>(
    operation: () => Promise<T>,
    config: ResilienceConfig,
    context: string = 'operation'
  ): Promise<T> {
    let circuitBreaker: CircuitBreaker | undefined;

    if (config.circuitBreaker) {
      if (!this.circuitBreakers.has(context)) {
        this.circuitBreakers.set(
          context,
          new CircuitBreaker(config.circuitBreaker)
        );
      }
      circuitBreaker = this.circuitBreakers.get(context)!;
    }

    const executeWithResilience = async (): Promise<T> => {
      const operationWithTimeout = async (): Promise<T> => {
        if (config.timeout) {
          return TimeoutManager.withTimeout(operation, config.timeout);
        }
        return operation();
      };

      if (config.retry) {
        return RetryManager.withRetry(
          operationWithTimeout,
          config.retry,
          context,
          circuitBreaker
        );
      }

      return operationWithTimeout();
    };

    if (circuitBreaker) {
      return circuitBreaker.execute(executeWithResilience, context);
    }

    return executeWithResilience();
  }

  getCircuitBreakerStates(): Record<string, CircuitBreakerState> {
    const states: Record<string, CircuitBreakerState> = {};
    this.circuitBreakers.forEach((cb, key) => {
      states[key] = cb.getState();
    });
    return states;
  }

  resetCircuitBreaker(context: string): void {
    const cb = this.circuitBreakers.get(context);
    if (cb) {
      cb.reset();
    }
  }

  resetAllCircuitBreakers(): void {
    this.circuitBreakers.forEach((cb) => cb.reset());
  }
}

export class RetryExhaustedError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'RetryExhaustedError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export const defaultResilienceConfigs = {
  openai: {
    retry: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    },
    timeout: {
      timeoutMs: 60000,
    },
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 60000,
    },
  },
  notion: {
    retry: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    },
    timeout: {
      timeoutMs: 30000,
    },
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 30000,
      monitoringPeriod: 30000,
    },
  },
  trello: {
    retry: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000,
    },
    timeout: {
      timeoutMs: 15000,
    },
    circuitBreaker: {
      failureThreshold: 3,
      resetTimeout: 20000,
      monitoringPeriod: 20000,
    },
  },
  github: {
    retry: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    },
    timeout: {
      timeoutMs: 30000,
    },
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 30000,
      monitoringPeriod: 30000,
    },
  },
  supabase: {
    retry: {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 5000,
    },
    timeout: {
      timeoutMs: 10000,
    },
    circuitBreaker: {
      failureThreshold: 10,
      resetTimeout: 60000,
      monitoringPeriod: 60000,
    },
  },
} as const;

export const resilienceManager = new ResilienceManager();
