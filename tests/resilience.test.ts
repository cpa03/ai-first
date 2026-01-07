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
  CircuitBreakerConfig,
  RetryConfig,
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
      expect(status.lastFailureTime).toBe(0);
      expect(status.nextAttemptTime).toBe(0);
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

describe('CircuitBreakerManager', () => {
  it('should be a singleton', () => {
    const instance1 = CircuitBreakerManager.getInstance();
    const instance2 = CircuitBreakerManager.getInstance();

    expect(instance1).toBe(instance2);
  });

  it('should create and retrieve circuit breakers', () => {
    const manager = CircuitBreakerManager.getInstance();
    const cb1 = manager.getOrCreate('service-1', {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    });
    const cb2 = manager.get('service-1');

    expect(cb1).toBe(cb2);
  });

  it('should create separate circuit breakers for different services', () => {
    const manager = CircuitBreakerManager.getInstance();
    const cb1 = manager.getOrCreate('service-1');
    const cb2 = manager.getOrCreate('service-2');

    expect(cb1).not.toBe(cb2);
  });

  it('should return undefined for non-existent circuit breaker', () => {
    const manager = CircuitBreakerManager.getInstance();
    const cb = manager.get('non-existent');

    expect(cb).toBeUndefined();
  });

  it('should reset specific circuit breaker', async () => {
    const manager = CircuitBreakerManager.getInstance();
    const cb = manager.getOrCreate('reset-test', {
      failureThreshold: 2,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    });

    const operation = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(cb.execute(operation)).rejects.toThrow();
    await expect(cb.execute(operation)).rejects.toThrow();

    manager.reset('reset-test');

    const status = cb.getStatus();
    expect(status.state).toBe(CircuitBreakerState.CLOSED);
    expect(status.failures).toBe(0);
  });

  it('should reset all circuit breakers', async () => {
    const manager = CircuitBreakerManager.getInstance();
    const cb1 = manager.getOrCreate('service-1', {
      failureThreshold: 2,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    });
    const cb2 = manager.getOrCreate('service-2', {
      failureThreshold: 2,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    });

    const operation = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(cb1.execute(operation)).rejects.toThrow();
    await expect(cb1.execute(operation)).rejects.toThrow();
    await expect(cb2.execute(operation)).rejects.toThrow();
    await expect(cb2.execute(operation)).rejects.toThrow();

    manager.resetAll();

    expect(cb1.getState()).toBe(CircuitBreakerState.CLOSED);
    expect(cb2.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  it('should get all circuit breaker statuses', () => {
    const manager = CircuitBreakerManager.getInstance();
    manager.getOrCreate('service-1');
    manager.getOrCreate('service-2');

    const statuses = manager.getAllStatuses();

    expect(statuses).toHaveProperty('service-1');
    expect(statuses).toHaveProperty('service-2');
    expect(statuses['service-1']).toHaveProperty('state');
    expect(statuses['service-1']).toHaveProperty('failures');
  });
});

describe('withTimeout', () => {
  describe('successful operations', () => {
    it('should return result when operation completes before timeout', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await withTimeout(operation, 1000);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle fast operations', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve('fast'), 10))
        );

      const result = await withTimeout(operation, 100);

      expect(result).toBe('fast');
    });

    it('should handle operation that returns undefined', async () => {
      const operation = jest.fn().mockResolvedValue(undefined);

      const result = await withTimeout(operation, 100);

      expect(result).toBeUndefined();
    });
  });

  describe('timeout enforcement', () => {
    it('should throw error when operation exceeds timeout', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve('slow'), 200))
        );

      await expect(withTimeout(operation, 50)).rejects.toThrow(
        'Operation timed out after 50ms'
      );

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should include custom error message on timeout', async () => {
      const operation = jest
        .fn()
        .mockImplementation(() => new Promise(() => {}));

      await expect(
        withTimeout(operation, 5000, 'Custom timeout message')
      ).rejects.toThrow('Custom timeout message');
    });
  });

  describe('error handling', () => {
    it('should propagate operation errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('immediate error'));

      await expect(withTimeout(operation, 1000)).rejects.toThrow(
        'immediate error'
      );
    });

    it('should propagate errors after delay', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('delayed error')), 50)
            )
        );

      await expect(withTimeout(operation, 1000)).rejects.toThrow(
        'delayed error'
      );
    });
  });
});

describe('withRetry', () => {
  describe('successful operations', () => {
    it('should return result on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');

      const result = await withRetry(operation, {
        maxRetries: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry on HTTP 429 errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('429'))
        .mockResolvedValue('success');

      const result = await withRetry(operation, {
        maxRetries: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('retry behavior', () => {
    it('should use exponential backoff', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      jest.useFakeTimers();
      const promise = withRetry(operation, {
        maxRetries: 3,
        initialDelayMs: 100,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
      });

      jest.advanceTimersByTime(100);
      await jest.advanceTimersByTimeAsync(100);

      jest.advanceTimersByTime(200);
      await jest.advanceTimersByTimeAsync(200);

      const result = await promise;
      jest.useRealTimers();

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should respect maxDelay', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      jest.useFakeTimers();
      const promise = withRetry(operation, {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 1500,
        backoffMultiplier: 2,
      });

      jest.advanceTimersByTime(1000);
      await jest.advanceTimersByTimeAsync(1000);

      jest.advanceTimersByTime(1500);
      await jest.advanceTimersByTimeAsync(1500);

      const result = await promise;
      jest.useRealTimers();

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('should throw error when all retries exhausted', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('ECONNRESET'));

      await expect(
        withRetry(operation, {
          maxRetries: 3,
          initialDelayMs: 10,
          maxDelayMs: 100,
          backoffMultiplier: 2,
        })
      ).rejects.toThrow('ECONNRESET');

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('non-retryable'));

      await expect(
        withRetry(operation, {
          maxRetries: 3,
          initialDelayMs: 10,
          maxDelayMs: 100,
          backoffMultiplier: 2,
        })
      ).rejects.toThrow('non-retryable');

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle custom retryable errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('CUSTOM_ERROR'))
        .mockResolvedValue('success');

      const result = await withRetry(operation, {
        maxRetries: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
        retryableErrors: ['CUSTOM_ERROR'],
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('default configuration', () => {
    it('should use DEFAULT_RETRIES when no config provided', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      await withRetry(operation);

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});

describe('createResilientWrapper', () => {
  it('should wrap operation with circuit breaker', async () => {
    const circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    });

    const operation = jest.fn().mockResolvedValue('result');
    const wrapped = createResilientWrapper(operation, { circuitBreaker });

    const result = await wrapped();

    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should wrap operation with timeout', async () => {
    const operation = jest.fn().mockResolvedValue('result');
    const wrapped = createResilientWrapper(operation, { timeoutMs: 1000 });

    const result = await wrapped();

    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should wrap operation with retry', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue('result');
    const wrapped = createResilientWrapper(operation, {
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      },
    });

    const result = await wrapped();

    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should wrap operation with all resilience features', async () => {
    const circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    });
    const operation = jest.fn().mockResolvedValue('result');
    const wrapped = createResilientWrapper(operation, {
      circuitBreaker,
      timeoutMs: 1000,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      },
    });

    const result = await wrapped();

    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should timeout wrapped operation', async () => {
    const operation = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('slow'), 200))
      );
    const wrapped = createResilientWrapper(operation, { timeoutMs: 50 });

    await expect(wrapped()).rejects.toThrow('Operation timed out after 50ms');
  });

  it('should retry wrapped operation on failure', async () => {
    const circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000,
    });
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue('result');
    const wrapped = createResilientWrapper(operation, {
      circuitBreaker,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      },
    });

    const result = await wrapped();

    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('Default Configurations', () => {
  describe('DEFAULT_RETRIES', () => {
    it('should have maxRetries of 3', () => {
      expect(DEFAULT_RETRIES.maxRetries).toBe(3);
    });

    it('should have initialDelayMs of 1000', () => {
      expect(DEFAULT_RETRIES.initialDelayMs).toBe(1000);
    });

    it('should have maxDelayMs of 30000', () => {
      expect(DEFAULT_RETRIES.maxDelayMs).toBe(30000);
    });

    it('should have backoffMultiplier of 2', () => {
      expect(DEFAULT_RETRIES.backoffMultiplier).toBe(2);
    });
  });

  describe('DEFAULT_TIMEOUTS', () => {
    it('should have OpenAI timeout of 60000', () => {
      expect(DEFAULT_TIMEOUTS.openai).toBe(60000);
    });

    it('should have Notion timeout of 30000', () => {
      expect(DEFAULT_TIMEOUTS.notion).toBe(30000);
    });

    it('should have Trello timeout of 30000', () => {
      expect(DEFAULT_TIMEOUTS.trello).toBe(30000);
    });

    it('should have GitHub timeout of 30000', () => {
      expect(DEFAULT_TIMEOUTS.github).toBe(30000);
    });

    it('should have Database timeout of 10000', () => {
      expect(DEFAULT_TIMEOUTS.database).toBe(10000);
    });
  });

  describe('DEFAULT_CIRCUIT_BREAKER_CONFIG', () => {
    it('should have failureThreshold of 5', () => {
      expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold).toBe(5);
    });

    it('should have resetTimeoutMs of 60000', () => {
      expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.resetTimeoutMs).toBe(60000);
    });

    it('should have monitoringPeriodMs of 10000', () => {
      expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.monitoringPeriodMs).toBe(10000);
    });
  });
});

describe('exported circuitBreakerManager instance', () => {
  it('should export singleton instance', () => {
    const { circuitBreakerManager } = require('@/lib/resilience');

    expect(circuitBreakerManager).toBeDefined();
    expect(typeof circuitBreakerManager.getOrCreate).toBe('function');
    expect(typeof circuitBreakerManager.get).toBe('function');
    expect(typeof circuitBreakerManager.reset).toBe('function');
    expect(typeof circuitBreakerManager.resetAll).toBe('function');
  });
});
