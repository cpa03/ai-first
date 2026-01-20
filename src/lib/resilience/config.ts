import {
  RetryConfig,
  CircuitBreakerOptions,
  ServiceResilienceConfig,
  ResilienceConfig,
} from './types';

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

export const DEFAULT_RESILIENCE_CONFIG: ResilienceConfig = {
  timeoutMs: 30000,
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  failureThreshold: 5,
  resetTimeoutMs: 60000,
};
