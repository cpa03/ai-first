export interface CircuitBreakerConfig {
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
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private nextAttemptTime: number = 0;

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

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (
      this.failures >= this.config.failureThreshold &&
      this.state !== CircuitBreakerState.OPEN
    ) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeoutMs;
      console.error(
        `Circuit breaker ${this.name} opened after ${this.failures} failures`
      );
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  getNextAttemptTime(): number {
    return this.nextAttemptTime;
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
  }
}

export function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              errorMessage || `Operation timed out after ${timeoutMs}ms`
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  }
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const shouldRetry = isRetryableError(lastError, config.retryableErrors);

      if (!shouldRetry || attempt === config.maxRetries) {
        throw lastError;
      }

      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelayMs
      );

      console.warn(
        `Retry attempt ${attempt}/${config.maxRetries} after ${delay}ms. Error: ${lastError.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

function isRetryableError(
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

    const wrappedOperation = async () => {
      let op = operation;

      if (timeoutMs) {
        op = () => withTimeout(op, timeoutMs);
      }

      if (retryConfig) {
        return await withRetry(op, retryConfig);
      }

      return await op();
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
    const statuses: Record<string, any> = {};
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
