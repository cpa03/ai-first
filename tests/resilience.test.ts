import {
  CircuitBreaker,
  RetryManager,
  TimeoutManager,
  ResilienceManager,
  RetryExhaustedError,
  TimeoutError,
  defaultResilienceConfigs,
} from '@/lib/resilience';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
      monitoringPeriod: 60000,
    });
  });

  describe('initial state', () => {
    it('should start in closed state', () => {
      const state = circuitBreaker.getState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });
  });

  describe('successful operations', () => {
    it('should execute operation successfully when closed', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(operation, 'test-operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);

      const state = circuitBreaker.getState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });

    it('should reset failures on successful operation', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await circuitBreaker.execute(operation, 'test');

      const state = circuitBreaker.getState();
      expect(state.failures).toBe(0);
      expect(state.state).toBe('closed');
    });
  });

  describe('failure handling', () => {
    it('should track failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      const state = circuitBreaker.getState();
      expect(state.failures).toBe(1);
      expect(state.state).toBe('closed');
    });

    it('should open circuit when failure threshold reached', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();

      const state = circuitBreaker.getState();
      expect(state.state).toBe('open');
      expect(state.failures).toBe(3);
      expect(state.lastFailureTime).toBeDefined();
      expect(state.nextAttemptTime).toBeDefined();
    });

    it('should reject immediately when circuit is open', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('reset timeout and half-open state', () => {
    it('should transition to half-open after reset timeout', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1001);

      const successfulOperation = jest.fn().mockResolvedValue('success');
      await circuitBreaker.execute(successfulOperation, 'test');

      const state = circuitBreaker.getState();
      expect(state.state).toBe('closed');
      jest.useRealTimers();
    });

    it('should close circuit on successful half-open operation', async () => {
      const failingOperation = jest
        .fn()
        .mockRejectedValue(new Error('failure'));

      await expect(
        circuitBreaker.execute(failingOperation, 'test')
      ).rejects.toThrow();
      await expect(
        circuitBreaker.execute(failingOperation, 'test')
      ).rejects.toThrow();
      await expect(
        circuitBreaker.execute(failingOperation, 'test')
      ).rejects.toThrow();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1001);

      const successfulOperation = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(successfulOperation, 'test');

      expect(result).toBe('success');
      expect(circuitBreaker.getState().state).toBe('closed');
      jest.useRealTimers();
    });

    it('should open circuit again on failed half-open operation', async () => {
      const failingOperation = jest
        .fn()
        .mockRejectedValue(new Error('failure'));

      await expect(
        circuitBreaker.execute(failingOperation, 'test')
      ).rejects.toThrow();
      await expect(
        circuitBreaker.execute(failingOperation, 'test')
      ).rejects.toThrow();
      await expect(
        circuitBreaker.execute(failingOperation, 'test')
      ).rejects.toThrow();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1001);

      await expect(
        circuitBreaker.execute(failingOperation, 'test')
      ).rejects.toThrow();

      expect(circuitBreaker.getState().state).toBe('open');
      jest.useRealTimers();
    });
  });

  describe('reset functionality', () => {
    it('should reset circuit breaker state', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();

      circuitBreaker.reset();

      const state = circuitBreaker.getState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
      expect(state.lastFailureTime).toBeUndefined();
      expect(state.nextAttemptTime).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle operations that throw non-Error objects', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('string error'));

      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow();
      expect(circuitBreaker.getState().failures).toBe(1);
    });

    it('should handle operations that return falsy values', async () => {
      const operation = jest.fn().mockResolvedValue(null);

      const result = await circuitBreaker.execute(operation, 'test');
      expect(result).toBeNull();
      expect(circuitBreaker.getState().state).toBe('closed');
    });

    it('should include context in error messages', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(
        circuitBreaker.execute(operation, 'my-operation')
      ).rejects.toThrow();
      await expect(
        circuitBreaker.execute(operation, 'my-operation')
      ).rejects.toThrow();
      await expect(
        circuitBreaker.execute(operation, 'my-operation')
      ).rejects.toThrow();

      await expect(
        circuitBreaker.execute(operation, 'my-operation')
      ).rejects.toThrow('Circuit breaker is OPEN for my-operation');
    });
  });
});

describe('RetryManager', () => {
  describe('successful operations', () => {
    it('should return result on first success', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await RetryManager.withRetry(
        operation,
        {},
        'test-operation'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      await RetryManager.withRetry(operation, { maxRetries: 3 }, 'test');

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry logic', () => {
    it('should retry on retryable errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Request timeout (408)'))
        .mockResolvedValue('success');

      const result = await RetryManager.withRetry(
        operation,
        { maxRetries: 3 },
        'test'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 rate limit errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('429 Too Many Requests'))
        .mockResolvedValue('success');

      const result = await RetryManager.withRetry(
        operation,
        { maxRetries: 3 },
        'test'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry on 500 errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('500 Internal Server Error'))
        .mockResolvedValue('success');

      const result = await RetryManager.withRetry(
        operation,
        { maxRetries: 3 },
        'test'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry on ECONNRESET errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');

      const result = await RetryManager.withRetry(
        operation,
        { maxRetries: 3 },
        'test'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry on ECONNREFUSED errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValue('success');

      const result = await RetryManager.withRetry(
        operation,
        { maxRetries: 3 },
        'test'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry on ETIMEDOUT errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValue('success');

      const result = await RetryManager.withRetry(
        operation,
        { maxRetries: 3 },
        'test'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('exhausted retries', () => {
    it('should throw RetryExhaustedError after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('timeout'));

      await expect(
        RetryManager.withRetry(operation, { maxRetries: 2 }, 'test')
      ).rejects.toThrow(RetryExhaustedError);

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should include original error in RetryExhaustedError', async () => {
      const originalError = new Error('timeout');
      const operation = jest.fn().mockRejectedValue(originalError);

      try {
        await RetryManager.withRetry(operation, { maxRetries: 2 }, 'test');
        fail('Should have thrown RetryExhaustedError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(RetryExhaustedError);
        expect(error.originalError).toBe(originalError);
        expect(error.attempts).toBe(3);
      }
    });

    it('should include context in RetryExhaustedError message', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('timeout'));

      try {
        await RetryManager.withRetry(
          operation,
          { maxRetries: 2 },
          'my-operation'
        );
        fail('Should have thrown RetryExhaustedError');
      } catch (error: any) {
        expect(error.message).toContain('my-operation');
      }
    });
  });

  describe('non-retryable errors', () => {
    it('should not retry validation errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('validation failed'));

      await expect(
        RetryManager.withRetry(operation, { maxRetries: 3 }, 'test')
      ).rejects.toThrow(RetryExhaustedError);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry 400 errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('400 Bad Request'));

      await expect(
        RetryManager.withRetry(operation, { maxRetries: 3 }, 'test')
      ).rejects.toThrow(RetryExhaustedError);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should stop retrying after 2 retries even on retryable errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('timeout'));

      await expect(
        RetryManager.withRetry(operation, { maxRetries: 2 }, 'test')
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('custom retry logic', () => {
    it('should use custom shouldRetry function', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('custom error'));

      const shouldRetry = jest.fn().mockReturnValue(true);

      await expect(
        RetryManager.withRetry(
          operation,
          { maxRetries: 2, shouldRetry },
          'test'
        )
      ).rejects.toThrow();

      expect(shouldRetry).toHaveBeenCalledTimes(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should respect custom shouldRetry returning false', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('custom error'));

      const shouldRetry = jest.fn().mockReturnValue(false);

      await expect(
        RetryManager.withRetry(
          operation,
          { maxRetries: 5, shouldRetry },
          'test'
        )
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('delay behavior', () => {
    it('should use exponential backoff', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      jest.useFakeTimers();
      const promise = RetryManager.withRetry(
        operation,
        { maxRetries: 3, baseDelay: 100 },
        'test'
      );

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
      const promise = RetryManager.withRetry(
        operation,
        { maxRetries: 3, baseDelay: 1000, maxDelay: 1500 },
        'test'
      );

      jest.advanceTimersByTime(1000);
      await jest.advanceTimersByTimeAsync(1000);

      jest.advanceTimersByTime(1500);
      await jest.advanceTimersByTimeAsync(1500);

      const result = await promise;
      jest.useRealTimers();

      expect(result).toBe('success');
    });

    it('should add jitter to delays', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      jest.useFakeTimers();
      const promise = RetryManager.withRetry(
        operation,
        { maxRetries: 1, baseDelay: 100 },
        'test'
      );

      const startTime = Date.now();
      jest.advanceTimersByTime(1100);
      await jest.advanceTimersByTimeAsync(1100);

      await promise;
      jest.useRealTimers();

      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('default configuration', () => {
    it('should use default maxRetries of 3', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      await RetryManager.withRetry(operation);

      expect(operation).toHaveBeenCalledTimes(4);
    });

    it('should use default baseDelay of 1000ms', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      jest.useFakeTimers();
      const promise = RetryManager.withRetry(operation, { maxRetries: 1 });

      jest.advanceTimersByTime(1000);
      await jest.advanceTimersByTimeAsync(1000);

      await promise;
      jest.useRealTimers();
    });

    it('should use default maxDelay of 30000ms', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      jest.useFakeTimers();
      const promise = RetryManager.withRetry(operation, {
        maxRetries: 1,
        baseDelay: 30000,
      });

      jest.advanceTimersByTime(30000);
      await jest.advanceTimersByTimeAsync(30000);

      await promise;
      jest.useRealTimers();
    });
  });
});

describe('TimeoutManager', () => {
  describe('successful operations within timeout', () => {
    it('should return result when operation completes before timeout', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await TimeoutManager.withTimeout(operation, {
        timeoutMs: 1000,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle fast operations', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve('fast'), 10))
        );

      const result = await TimeoutManager.withTimeout(operation, {
        timeoutMs: 100,
      });

      expect(result).toBe('fast');
    });
  });

  describe('timeout enforcement', () => {
    it('should throw TimeoutError when operation exceeds timeout', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve('slow'), 200))
        );

      await expect(
        TimeoutManager.withTimeout(operation, { timeoutMs: 50 })
      ).rejects.toThrow(TimeoutError);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should include timeout duration in error message', async () => {
      const operation = jest
        .fn()
        .mockImplementation(() => new Promise(() => {}));

      try {
        await TimeoutManager.withTimeout(operation, { timeoutMs: 5000 });
        fail('Should have thrown TimeoutError');
      } catch (error: any) {
        expect(error.message).toContain('5000ms');
      }
    });

    it('should call onTimeout callback when timeout occurs', async () => {
      const operation = jest
        .fn()
        .mockImplementation(() => new Promise(() => {}));
      const onTimeout = jest.fn();

      await expect(
        TimeoutManager.withTimeout(operation, { timeoutMs: 50, onTimeout })
      ).rejects.toThrow();

      expect(onTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle zero timeout', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      await expect(
        TimeoutManager.withTimeout(operation, { timeoutMs: 0 })
      ).rejects.toThrow(TimeoutError);
    });

    it('should handle operation that rejects immediately', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('immediate error'));

      await expect(
        TimeoutManager.withTimeout(operation, { timeoutMs: 1000 })
      ).rejects.toThrow('immediate error');
    });

    it('should handle operation that rejects after delay', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('delayed error')), 50)
            )
        );

      await expect(
        TimeoutManager.withTimeout(operation, { timeoutMs: 1000 })
      ).rejects.toThrow('delayed error');
    });

    it('should handle operations returning null', async () => {
      const operation = jest.fn().mockResolvedValue(null);

      const result = await TimeoutManager.withTimeout(operation, {
        timeoutMs: 100,
      });

      expect(result).toBeNull();
    });

    it('should handle operations returning undefined', async () => {
      const operation = jest.fn().mockResolvedValue(undefined);

      const result = await TimeoutManager.withTimeout(operation, {
        timeoutMs: 100,
      });

      expect(result).toBeUndefined();
    });
  });
});

describe('ResilienceManager', () => {
  let manager: ResilienceManager;

  beforeEach(() => {
    manager = new ResilienceManager();
  });

  describe('basic execution', () => {
    it('should execute operation without any resilience features', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await manager.execute(operation, {}, 'test');

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should execute with timeout only', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await manager.execute(
        operation,
        { timeout: { timeoutMs: 1000 } },
        'test'
      );

      expect(result).toBe('result');
    });

    it('should execute with retry only', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await manager.execute(
        operation,
        { retry: { maxRetries: 3 } },
        'test'
      );

      expect(result).toBe('result');
    });

    it('should execute with circuit breaker only', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await manager.execute(
        operation,
        {
          circuitBreaker: {
            failureThreshold: 5,
            resetTimeout: 1000,
            monitoringPeriod: 60000,
          },
        },
        'test'
      );

      expect(result).toBe('result');
    });
  });

  describe('combined resilience features', () => {
    it('should combine timeout and retry', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      const result = await manager.execute(
        operation,
        {
          retry: { maxRetries: 2, baseDelay: 10 },
          timeout: { timeoutMs: 100 },
        },
        'test'
      );

      expect(result).toBe('success');
    });

    it('should combine timeout, retry, and circuit breaker', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await manager.execute(
        operation,
        {
          retry: { maxRetries: 2 },
          timeout: { timeoutMs: 100 },
          circuitBreaker: {
            failureThreshold: 5,
            resetTimeout: 1000,
            monitoringPeriod: 60000,
          },
        },
        'test'
      );

      expect(result).toBe('success');
    });

    it('should apply circuit breaker around retry and timeout', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('timeout'));

      const config = {
        retry: { maxRetries: 1 },
        timeout: { timeoutMs: 50 },
        circuitBreaker: {
          failureThreshold: 3,
          resetTimeout: 5000,
          monitoringPeriod: 60000,
        },
      };

      await expect(
        manager.execute(operation, config, 'test')
      ).rejects.toThrow();
      await expect(
        manager.execute(operation, config, 'test')
      ).rejects.toThrow();

      await expect(manager.execute(operation, config, 'test')).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      expect(operation).toHaveBeenCalledTimes(4);
    });
  });

  describe('circuit breaker management', () => {
    it('should create separate circuit breakers for different contexts', async () => {
      const operation1 = jest.fn().mockRejectedValue(new Error('fail'));
      const operation2 = jest.fn().mockResolvedValue('success');

      const config = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000,
          monitoringPeriod: 60000,
        },
      };

      await expect(
        manager.execute(operation1, config, 'context-1')
      ).rejects.toThrow();
      await expect(
        manager.execute(operation1, config, 'context-1')
      ).rejects.toThrow();

      const result = await manager.execute(operation2, config, 'context-2');
      expect(result).toBe('success');
    });

    it('should get all circuit breaker states', () => {
      manager.execute(
        jest.fn().mockResolvedValue('success'),
        {
          circuitBreaker: {
            failureThreshold: 3,
            resetTimeout: 1000,
            monitoringPeriod: 60000,
          },
        },
        'context-1'
      );

      const states = manager.getCircuitBreakerStates();
      expect(states).toHaveProperty('context-1');
      expect(states['context-1'].state).toBe('closed');
    });

    it('should reset specific circuit breaker', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      const config = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000,
          monitoringPeriod: 60000,
        },
      };

      await expect(
        manager.execute(operation, config, 'test')
      ).rejects.toThrow();
      await expect(
        manager.execute(operation, config, 'test')
      ).rejects.toThrow();

      manager.resetCircuitBreaker('test');

      const states = manager.getCircuitBreakerStates();
      expect(states['test'].state).toBe('closed');
      expect(states['test'].failures).toBe(0);
    });

    it('should reset all circuit breakers', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      const config = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000,
          monitoringPeriod: 60000,
        },
      };

      await expect(
        manager.execute(operation, config, 'context-1')
      ).rejects.toThrow();
      await expect(
        manager.execute(operation, config, 'context-1')
      ).rejects.toThrow();
      await expect(
        manager.execute(operation, config, 'context-2')
      ).rejects.toThrow();
      await expect(
        manager.execute(operation, config, 'context-2')
      ).rejects.toThrow();

      manager.resetAllCircuitBreakers();

      const states = manager.getCircuitBreakerStates();
      expect(states['context-1'].state).toBe('closed');
      expect(states['context-2'].state).toBe('closed');
    });

    it('should handle reset for non-existent circuit breaker', () => {
      expect(() => manager.resetCircuitBreaker('non-existent')).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle operations that throw synchronous errors', async () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('sync error');
      });

      await expect(manager.execute(operation, {}, 'test')).rejects.toThrow(
        'sync error'
      );
    });

    it('should handle operations that return non-Promise values', async () => {
      const operation = jest.fn().mockReturnValue('sync result');

      const result = await manager.execute(operation, {}, 'test');

      expect(result).toBe('sync result');
    });

    it('should reuse circuit breaker instance for same context', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const config = {
        circuitBreaker: {
          failureThreshold: 3,
          resetTimeout: 1000,
          monitoringPeriod: 60000,
        },
      };

      await manager.execute(operation, config, 'test');
      const states1 = manager.getCircuitBreakerStates();
      await manager.execute(operation, config, 'test');
      const states2 = manager.getCircuitBreakerStates();

      expect(states1['test']).toBe(states2['test']);
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
