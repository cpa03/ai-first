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
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open',
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    state: 'closed',
    failures: 0,
  };
  private cachedState?: CircuitBreakerState;
  private recentFailures: number[] = [];

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    }
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() >= this.nextAttemptTime) {
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        throw new Error(
          `Circuit breaker ${this.name} is OPEN. Retry after ${new Date(
            this.nextAttemptTime
          ).toISOString()}`
        );
      }
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
    this.failures = 0;
    this.state = CircuitBreakerState.CLOSED;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
  }

  getStatus(): {
    state: CircuitBreakerState;
    failures: number;
    nextAttemptTime?: string;
  } {
    return {
      state: this.state,
      failures: this.failures,
      nextAttemptTime:
        this.state === CircuitBreakerState.OPEN
          ? new Date(this.nextAttemptTime).toISOString()
          : undefined,
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

function _isRetryableError(
  error: Error,
  customRetryableErrors?: string[]
): boolean {
  const retryablePatterns = [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'timeout',
    '529',
    '502',
    '503',
    '504',
    '429',
    'RATE_LIMIT',
    'QUOTA_EXCEEDED',
    ...(customRetryableErrors || []),
  ];

  return retryablePatterns.some((pattern) => error.message.includes(pattern));
}

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

    const _executeWithResilience = async (): Promise<T> => {
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

      if (timeoutMs) {
        return await withTimeout(operation, timeoutMs);
      }

      if (retryConfig) {
        return await withRetry(operation, retryConfig);
      }

      return await operation();
    };

    if (circuitBreaker) {
      return await circuitBreaker.execute(wrappedOperation);
    }

    return await wrappedOperation();
  };
}

export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  getOrCreate(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker(name, config));
    }
    return this.circuitBreakers.get(name)!;
  }

  get(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  getAllStatuses(): Record<
    string,
    {
      state: CircuitBreakerState;
      failures: number;
      nextAttemptTime?: string;
    }
  > {
    const statuses: Record<
      string,
      {
        state: CircuitBreakerState;
        failures: number;
        nextAttemptTime?: string;
      }
    > = {};
    this.circuitBreakers.forEach((cb, name) => {
      statuses[name] = cb.getStatus();
    });
    return statuses;
  }

  reset(name: string): void {
    const cb = this.circuitBreakers.get(name);
    if (cb) {
      cb.reset();
    }
  }

  resetAll(): void {
    this.circuitBreakers.forEach((cb) => cb.reset());
  }
}

export const circuitBreakerManager = CircuitBreakerManager.getInstance();

export const DEFAULT_RETRIES: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export const DEFAULT_TIMEOUTS: Record<string, number> = {
  openai: 60000,
  notion: 30000,
  trello: 30000,
  github: 30000,
  database: 10000,
};

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  monitoringPeriodMs: 10000,
};
