import { createLogger } from './logger';
import { TimeoutError, RetryExhaustedError } from './errors';

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

type CircuitBreakerInternalState = {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
};

export class CircuitBreaker {
  private circuitState: CircuitBreakerInternalState = {
    state: 'closed',
    failures: 0,
  };
  private cachedState?: CircuitBreakerInternalState;
  private recentFailures: number[] = [];

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerOptions = {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    }
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.circuitState.state === 'open') {
      if (Date.now() >= (this.circuitState.nextAttemptTime || 0)) {
        this.circuitState.state = 'half-open';
      } else {
        throw new Error(
          `Circuit breaker ${this.name} is OPEN. Retry after ${new Date(
            this.circuitState.nextAttemptTime || 0
          ).toISOString()}`
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
      const errorMessage = (error as Error).message;
      const attemptCount =
        (error as Error & { attemptCount?: number }).attemptCount ||
        (errorMessage?.includes('stopped due to circuit breaker') ? 0 : 1);
      this.onError(error as Error, now, attemptCount);
      throw error;
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
    this.circuitState.failures = this.recentFailures.length;
    this.circuitState.lastFailureTime = _now;

    if (this.circuitState.failures >= this.config.failureThreshold) {
      this.openCircuit(_now);
    }

    if (this.cachedState) {
      this.cachedState.failures = this.circuitState.failures;
      this.cachedState.state = this.circuitState.state;
      this.cachedState.lastFailureTime = this.circuitState.lastFailureTime;
      this.cachedState.nextAttemptTime = this.circuitState.nextAttemptTime;
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
    if (!this.cachedState) {
      this.cachedState = { ...this.circuitState };
    }
    const stateValue = this.cachedState.state;
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

export class TimeoutManager {
  static async withTimeout<T>(
    operation: () => Promise<T>,
    options: TimeoutOptions
  ): Promise<T> {
    const { timeoutMs, onTimeout } = options;

    if (timeoutMs <= 0) {
      return Promise.reject(
        new TimeoutError('Timeout must be greater than 0', 0)
      );
    }

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          onTimeout?.();
          reject(
            new TimeoutError(
              `Operation timed out after ${timeoutMs}ms`,
              timeoutMs
            )
          );
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

export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  getOrCreate(name: string, config?: CircuitBreakerOptions): CircuitBreaker {
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

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  monitoringPeriodMs: 10000,
};

export const defaultResilienceConfigs: Record<string, ServiceResilienceConfig> =
  {
    openai: {
      retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 10000 },
      timeout: { timeoutMs: 60000 },
      circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 60000 },
    },
    github: {
      retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
      timeout: { timeoutMs: 30000 },
      circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30000 },
    },
    notion: {
      retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
      timeout: { timeoutMs: 30000 },
      circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30000 },
    },
    trello: {
      retry: { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 3000 },
      timeout: { timeoutMs: 15000 },
      circuitBreaker: { failureThreshold: 3, resetTimeoutMs: 20000 },
    },
    supabase: {
      retry: { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 },
      timeout: { timeoutMs: 10000 },
      circuitBreaker: { failureThreshold: 10, resetTimeoutMs: 60000 },
    },
  };

export interface ResilienceConfig {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

export const DEFAULT_RESILIENCE_CONFIG: ResilienceConfig = {
  timeoutMs: 30000,
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  failureThreshold: 5,
  resetTimeoutMs: 60000,
};

export interface ServiceResilienceConfig {
  retry: {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
  timeout: {
    timeoutMs: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    resetTimeoutMs: number;
  };
}

export const resilienceManager = {
  async execute<T>(
    operation: () => Promise<T>,
    config: ResilienceConfig = {},
    context?: string
  ): Promise<T> {
    const circuitBreaker = config.failureThreshold
      ? circuitBreakerManager.getOrCreate(context || 'default', {
          failureThreshold: config.failureThreshold,
          resetTimeoutMs: config.resetTimeoutMs || 60000,
          monitoringPeriodMs: 10000,
        })
      : undefined;

    const wrapper = createResilientWrapper(operation, {
      timeoutMs: config.timeoutMs,
      retryConfig: config.maxRetries
        ? {
            maxRetries: config.maxRetries,
            initialDelayMs: config.baseDelayMs || 1000,
            maxDelayMs: config.maxDelayMs || 30000,
            backoffMultiplier: 2,
          }
        : undefined,
      circuitBreaker,
    });

    return wrapper();
  },

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return circuitBreakerManager.get(name);
  },

  getCircuitBreakerStates(): Record<string, unknown> {
    return circuitBreakerManager.getAllStatuses();
  },

  resetCircuitBreaker(name: string): void {
    circuitBreakerManager.reset(name);
  },
};

export const withRetry = RetryManager.withRetry;

export const withTimeout = TimeoutManager.withTimeout;
