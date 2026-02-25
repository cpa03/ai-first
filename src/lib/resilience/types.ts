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

export interface ResilienceConfig {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

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

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open',
}
