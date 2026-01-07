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

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onError(error as Error, now);
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failures = 0;
    this.state.state = 'closed';
  }

  private onError(error: Error, now: number): void {
    this.state.failures++;
    this.state.lastFailureTime = now;

    if (this.state.failures >= this.options.failureThreshold) {
      this.state.state = 'open';
      this.state.nextAttemptTime = now + this.options.resetTimeout;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      state: 'closed',
      failures: 0,
    };
  }
}

export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    context?: string
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      shouldRetry = RetryManager.defaultShouldRetry,
    } = options;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt > maxRetries || !shouldRetry(lastError, attempt)) {
          throw new RetryExhaustedError(
            `Operation${context ? ` '${context}'` : ''} failed after ${attempt} attempts`,
            lastError,
            attempt
          );
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

  private static defaultShouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= 3) return false;

    const retryableStatuses = [
      408,
      429,
      500,
      502,
      503,
      504,
      507,
      509,
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
    ];

    const message = error.message.toLowerCase();

    return (
      retryableStatuses.some((status) => message.includes(String(status))) ||
      message.includes('timeout') ||
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('temporary failure')
    );
  }
}

export class TimeoutManager {
  static async withTimeout<T>(
    operation: () => Promise<T>,
    options: TimeoutOptions
  ): Promise<T> {
    const { timeoutMs, onTimeout } = options;

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          onTimeout?.();
          reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        timeoutId.unref();
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
          context
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
