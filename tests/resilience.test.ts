import {
  CircuitBreaker,
  CircuitBreakerManager,
  withRetry,
  withTimeout,
  createResilientWrapper,
  DEFAULT_RETRIES,
  DEFAULT_TIMEOUTS,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  CircuitBreakerState,
  ServiceResilienceConfig,
  RetryConfig,
  defaultResilienceConfigs,
} from '@/lib/resilience';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      monitoringPeriodMs: 60000,
    });
  });

  describe('initial state', () => {
    it('should start in closed state', () => {
      const status = circuitBreaker.getStatus();
      expect(status.state).toBe(CircuitBreakerState.CLOSED);
      expect(status.failures).toBe(0);
    });

    it('should return closed state from getState()', () => {
      const state = circuitBreaker.getState();
      expect(state).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('successful operations', () => {
    it('should execute operation successfully when closed', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);

      const status = circuitBreaker.getStatus();
      expect(status.state).toBe(CircuitBreakerState.CLOSED);
      expect(status.failures).toBe(0);
    });

    it('should reset failures on successful operation', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await circuitBreaker.execute(operation);

      const status = circuitBreaker.getStatus();
      expect(status.failures).toBe(0);
      expect(status.state).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('failure handling', () => {
    it('should track failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      const status = circuitBreaker.getStatus();
      expect(status.failures).toBe(1);
      expect(status.state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should open circuit when failure threshold reached', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();

      const status = circuitBreaker.getStatus();
      expect(status.state).toBe(CircuitBreakerState.OPEN);
      expect(status.failures).toBe(3);
      expect(status.nextAttemptTime).toBeDefined();
    });

    it('should reject immediately when circuit is open', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();

      await expect(circuitBreaker.execute(operation)).rejects.toThrow(
        'Circuit breaker test-service is OPEN'
      );

      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('reset timeout and half-open state', () => {
    it('should transition to half-open after reset timeout', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1001);

      const successfulOperation = jest.fn().mockResolvedValue('success');
      await circuitBreaker.execute(successfulOperation);

      const status = circuitBreaker.getStatus();
      expect(status.state).toBe(CircuitBreakerState.CLOSED);
      jest.useRealTimers();
    });

    it('should close circuit on successful half-open operation', async () => {
      const failingOperation = jest
        .fn()
        .mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1001);

      const successfulOperation = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(successfulOperation);

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
      jest.useRealTimers();
    });

    it('should open circuit again on failed half-open operation', async () => {
      const failingOperation = jest
        .fn()
        .mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1001);

      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      jest.useRealTimers();
    });
  });

  describe('reset functionality', () => {
    it('should reset circuit breaker state', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();

      circuitBreaker.reset();

      const status = circuitBreaker.getStatus();
      expect(status.state).toBe(CircuitBreakerState.CLOSED);
      expect(status.failures).toBe(0);
      expect(status.nextAttemptTime).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle operations that throw errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('test error'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      expect(circuitBreaker.getStatus().failures).toBe(1);
    });

    it('should handle multiple circuit breakers independently', async () => {
      const cb1 = new CircuitBreaker('service-1', {
        failureThreshold: 2,
        resetTimeoutMs: 1000,
        monitoringPeriodMs: 60000,
      });
      const cb2 = new CircuitBreaker('service-2', {
        failureThreshold: 2,
        resetTimeoutMs: 1000,
        monitoringPeriodMs: 60000,
      });

      const op1 = jest.fn().mockRejectedValue(new Error('fail'));
      const op2 = jest.fn().mockResolvedValue('success');

      await expect(cb1.execute(op1)).rejects.toThrow();
      await expect(cb1.execute(op1)).rejects.toThrow();

      const result = await cb2.execute(op2);
      expect(result).toBe('success');
      expect(cb1.getState()).toBe(CircuitBreakerState.OPEN);
      expect(cb2.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('getter methods', () => {
    it('should get failure count', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      expect(circuitBreaker.getFailures()).toBe(1);
    });

    it('should get next attempt time when circuit is open', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      await expect(circuitBreaker.execute(operation)).rejects.toThrow();

      const nextAttemptTime = circuitBreaker.getNextAttemptTime();
      expect(nextAttemptTime).toBeGreaterThan(Date.now());
    });
  });
});
describe('defaultResilienceConfigs', () => {
  it('should have OpenAI configuration', () => {
    expect(defaultResilienceConfigs.openai).toBeDefined();
    expect(defaultResilienceConfigs.openai.retry?.maxRetries).toBe(3);
    expect(defaultResilienceConfigs.openai.timeout?.timeoutMs).toBe(60000);
    expect(
      defaultResilienceConfigs.openai.circuitBreaker?.failureThreshold
    ).toBe(5);
  });

  it('should have Notion configuration', () => {
    expect(defaultResilienceConfigs.notion).toBeDefined();
    expect(defaultResilienceConfigs.notion.retry?.maxRetries).toBe(3);
    expect(defaultResilienceConfigs.notion.timeout?.timeoutMs).toBe(30000);
    expect(
      defaultResilienceConfigs.notion.circuitBreaker?.failureThreshold
    ).toBe(5);
  });

  it('should have Trello configuration', () => {
    expect(defaultResilienceConfigs.trello).toBeDefined();
    expect(defaultResilienceConfigs.trello.retry?.maxRetries).toBe(3);
    expect(defaultResilienceConfigs.trello.timeout?.timeoutMs).toBe(15000);
    expect(
      defaultResilienceConfigs.trello.circuitBreaker?.failureThreshold
    ).toBe(3);
  });

  it('should have GitHub configuration', () => {
    expect(defaultResilienceConfigs.github).toBeDefined();
    expect(defaultResilienceConfigs.github.retry?.maxRetries).toBe(3);
    expect(defaultResilienceConfigs.github.timeout?.timeoutMs).toBe(30000);
    expect(
      defaultResilienceConfigs.github.circuitBreaker?.failureThreshold
    ).toBe(5);
  });

  it('should have Supabase configuration', () => {
    expect(defaultResilienceConfigs.supabase).toBeDefined();
    expect(defaultResilienceConfigs.supabase.retry?.maxRetries).toBe(2);
    expect(defaultResilienceConfigs.supabase.timeout?.timeoutMs).toBe(10000);
    expect(
      defaultResilienceConfigs.supabase.circuitBreaker?.failureThreshold
    ).toBe(10);
  });
});
