import {
  CircuitBreaker,
  CircuitBreakerState,
  RetryManager,
  withRetry,
  withTimeout,
  resilienceManager,
} from '@/lib/resilience';

describe('Resilience Edge Cases', () => {
  describe('Circuit Breaker Edge Cases', () => {
    describe('boundary conditions', () => {
      it('should handle zero failure threshold', async () => {
        const circuitBreaker = new CircuitBreaker('test-zero-threshold', {
          failureThreshold: 0,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockResolvedValue('success');
        const result = await circuitBreaker.execute(operation);

        expect(result).toBe('success');
      });

      it('should handle very large failure threshold', async () => {
        const circuitBreaker = new CircuitBreaker('test-large-threshold', {
          failureThreshold: 1000,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockResolvedValue('success');

        for (let i = 0; i < 10; i++) {
          await circuitBreaker.execute(operation);
        }

        expect(operation).toHaveBeenCalledTimes(10);
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
      });

      it('should handle zero reset timeout', async () => {
        const circuitBreaker = new CircuitBreaker('test-zero-reset', {
          failureThreshold: 2,
          resetTimeoutMs: 0,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        await expect(circuitBreaker.execute(operation)).rejects.toThrow();

        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

        const successfulOperation = jest.fn().mockResolvedValue('success');
        const result = await circuitBreaker.execute(successfulOperation);

        expect(result).toBe('success');
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
      });

      it('should handle very short monitoring period', async () => {
        const circuitBreaker = new CircuitBreaker('test-short-monitoring', {
          failureThreshold: 3,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 1,
        });

        const operation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        await expect(circuitBreaker.execute(operation)).rejects.toThrow();

        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      });
    });

    describe('concurrent execution', () => {
      it('should handle multiple concurrent requests', async () => {
        const circuitBreaker = new CircuitBreaker('test-concurrent', {
          failureThreshold: 3,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockResolvedValue('success');

        const results = await Promise.all([
          circuitBreaker.execute(operation),
          circuitBreaker.execute(operation),
          circuitBreaker.execute(operation),
          circuitBreaker.execute(operation),
          circuitBreaker.execute(operation),
        ]);

        expect(results).toEqual([
          'success',
          'success',
          'success',
          'success',
          'success',
        ]);
        expect(operation).toHaveBeenCalledTimes(5);
      });

      it('should handle concurrent failures', async () => {
        const circuitBreaker = new CircuitBreaker('test-concurrent-failures', {
          failureThreshold: 2,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockRejectedValue(new Error('fail'));

        const results = await Promise.allSettled([
          circuitBreaker.execute(operation),
          circuitBreaker.execute(operation),
          circuitBreaker.execute(operation),
        ]);

        const failures = results.filter((r) => r.status === 'rejected');
        expect(failures.length).toBeGreaterThanOrEqual(2);
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      });
    });

    describe('state transitions', () => {
      it('should transition correctly through all states', async () => {
        const circuitBreaker = new CircuitBreaker('test-transitions', {
          failureThreshold: 2,
          resetTimeoutMs: 500,
          monitoringPeriodMs: 60000,
        });

        const failingOperation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(
          circuitBreaker.execute(failingOperation)
        ).rejects.toThrow();
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);

        await expect(
          circuitBreaker.execute(failingOperation)
        ).rejects.toThrow();
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

        jest.useFakeTimers();
        jest.advanceTimersByTime(501);

        const successfulOperation = jest.fn().mockResolvedValue('success');
        await circuitBreaker.execute(successfulOperation);
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
        jest.useRealTimers();
      });

      it('should handle rapid open-close cycles', async () => {
        const circuitBreaker = new CircuitBreaker('test-rapid-cycles', {
          failureThreshold: 2,
          resetTimeoutMs: 10,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn();

        operation.mockRejectedValueOnce(new Error('fail'));
        await expect(circuitBreaker.execute(operation)).rejects.toThrow();

        operation.mockRejectedValueOnce(new Error('fail'));
        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

        jest.useFakeTimers();
        jest.advanceTimersByTime(11);

        operation.mockResolvedValueOnce('success');
        await circuitBreaker.execute(operation);
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);

        operation.mockRejectedValueOnce(new Error('fail'));
        await expect(circuitBreaker.execute(operation)).rejects.toThrow();

        operation.mockRejectedValueOnce(new Error('fail'));
        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
        jest.useRealTimers();
      });
    });

    describe('error types', () => {
      it('should treat all error types as failures', async () => {
        const circuitBreaker = new CircuitBreaker('test-error-types', {
          failureThreshold: 3,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const errorTypes = [
          new Error('standard error'),
          new TypeError('type error'),
          new RangeError('range error'),
          new ReferenceError('reference error'),
        ];

        for (const error of errorTypes) {
          const operation = jest.fn().mockRejectedValue(error);
          await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        }

        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      });

      it('should handle Error-like objects', async () => {
        const circuitBreaker = new CircuitBreaker('test-error-like', {
          failureThreshold: 1,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockRejectedValue({
          message: 'Error-like object',
        });

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      });

      it('should handle throwing strings', async () => {
        const circuitBreaker = new CircuitBreaker('test-string-error', {
          failureThreshold: 1,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockImplementation(() => {
          throw 'string error';
        });

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      });

      it('should handle throwing null', async () => {
        const circuitBreaker = new CircuitBreaker('test-null-error', {
          failureThreshold: 1,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockImplementation(() => {
          throw null;
        });

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      });

      it('should handle throwing undefined', async () => {
        const circuitBreaker = new CircuitBreaker('test-undefined-error', {
          failureThreshold: 1,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        const operation = jest.fn().mockImplementation(() => {
          throw undefined;
        });

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
      });
    });
  });

  describe('Retry Manager Edge Cases', () => {
    describe('retry configuration', () => {
      it('should handle zero max retries', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(withRetry(operation, { maxRetries: 0 })).rejects.toThrow(
          'fail'
        );

        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should handle very large max retries', async () => {
        let attemptCount = 0;
        const operation = jest.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 100) {
            return Promise.reject(new Error('fail'));
          }
          return Promise.resolve('success');
        });

        const result = await withRetry(operation, {
          maxRetries: 200,
          baseDelay: 1,
          maxDelay: 10,
        });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(100);
      });

      it('should handle zero base delay', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('fail'))
          .mockRejectedValueOnce(new Error('fail'))
          .mockResolvedValue('success');

        const result = await withRetry(operation, {
          maxRetries: 3,
          baseDelay: 0,
          maxDelay: 0,
        });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(3);
      });

      it('should handle negative delays', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('fail'))
          .mockResolvedValue('success');

        const result = await withRetry(operation, {
          maxRetries: 2,
          baseDelay: -100,
          maxDelay: -100,
        });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(2);
      });
    });

    describe('retry with custom conditions', () => {
      it('should retry only when shouldRetry returns true', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('retryable error'))
          .mockRejectedValueOnce(new Error('non-retryable error'))
          .mockResolvedValue('success');

        await expect(
          withRetry(operation, {
            maxRetries: 5,
            shouldRetry: (error) => error.message.includes('retryable'),
          })
        ).rejects.toThrow('non-retryable error');

        expect(operation).toHaveBeenCalledTimes(2);
      });

      it('should handle shouldRetry throwing error', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(
          withRetry(operation, {
            maxRetries: 3,
            shouldRetry: () => {
              throw new Error('shouldRetry error');
            },
          })
        ).rejects.toThrow('shouldRetry error');

        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should handle shouldRetry returning non-boolean', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('fail'))
          .mockResolvedValue('success');

        await expect(
          withRetry(operation, {
            maxRetries: 3,
            shouldRetry: () => 'truthy' as unknown as boolean,
          })
        ).resolves.toBe('success');

        expect(operation).toHaveBeenCalledTimes(2);
      });
    });

    describe('retry timing', () => {
      it('should increase delay exponentially', async () => {
        const delays: number[] = [];
        const operation = jest.fn().mockImplementation(() => {
          return new Promise((_, reject) => {
            const start = Date.now();
            setTimeout(() => {
              delays.push(Date.now() - start);
              reject(new Error('fail'));
            }, 10);
          });
        });

        await expect(
          withRetry(operation, {
            maxRetries: 5,
            baseDelay: 10,
            maxDelay: 100,
          })
        ).rejects.toThrow();

        expect(delays.length).toBeGreaterThan(1);
        for (let i = 1; i < delays.length; i++) {
          expect(delays[i]).toBeGreaterThan(delays[i - 1] * 0.8);
        }
      });

      it('should respect max delay', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(
          withRetry(operation, {
            maxRetries: 10,
            baseDelay: 10,
            maxDelay: 50,
          })
        ).rejects.toThrow();

        expect(operation).toHaveBeenCalledTimes(11);
      });
    });

    describe('retry with circuit breaker', () => {
      it('should stop retrying when circuit opens', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('fail'));
        const circuitBreaker = new CircuitBreaker('test-cb-retry', {
          failureThreshold: 2,
          resetTimeoutMs: 1000,
          monitoringPeriodMs: 60000,
        });

        await expect(
          withRetry(
            operation,
            {
              maxRetries: 10,
              baseDelay: 10,
              maxDelay: 100,
            },
            'test-context',
            circuitBreaker
          )
        ).rejects.toThrow();

        expect(operation).toHaveBeenCalledTimes(2);
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      });

      it('should resume retries after circuit closes', async () => {
        const circuitBreaker = new CircuitBreaker('test-cb-resume', {
          failureThreshold: 2,
          resetTimeoutMs: 100,
          monitoringPeriodMs: 60000,
        });

        const failingOperation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(
          withRetry(
            failingOperation,
            {
              maxRetries: 5,
              baseDelay: 10,
              maxDelay: 50,
            },
            'test-context',
            circuitBreaker
          )
        ).rejects.toThrow();

        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

        jest.useFakeTimers();
        jest.advanceTimersByTime(101);

        const successfulOperation = jest.fn().mockResolvedValue('success');
        const result = await withRetry(
          successfulOperation,
          {
            maxRetries: 3,
            baseDelay: 10,
            maxDelay: 50,
          },
          'test-context',
          circuitBreaker
        );
        jest.useRealTimers();

        expect(result).toBe('success');
        expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
      });
    });
  });

  describe('Timeout Edge Cases', () => {
    describe('timeout configuration', () => {
      it('should handle zero timeout', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        await expect(withTimeout(operation, { timeoutMs: 0 })).rejects.toThrow(
          'timeout'
        );

        expect(operation).toHaveBeenCalledTimes(0);
      });

      it('should handle negative timeout', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        await expect(
          withTimeout(operation, { timeoutMs: -100 })
        ).rejects.toThrow('timeout');

        expect(operation).toHaveBeenCalledTimes(0);
      });

      it('should handle very large timeout', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        const result = await withTimeout(operation, {
          timeoutMs: 60000 * 60,
        });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });
    });

    describe('timeout scenarios', () => {
      it('should timeout slow operations', async () => {
        const operation = jest.fn().mockImplementation(() => {
          return new Promise((resolve) => {
            setTimeout(() => resolve('success'), 1000);
          });
        });

        await expect(withTimeout(operation, { timeoutMs: 10 })).rejects.toThrow(
          'timeout'
        );

        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should complete fast operations', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        const result = await withTimeout(operation, {
          timeoutMs: 1000,
        });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should handle operations that complete exactly at timeout', async () => {
        const operation = jest.fn().mockImplementation(() => {
          return new Promise((resolve) => {
            setTimeout(() => resolve('success'), 10);
          });
        });

        const result = await withTimeout(operation, {
          timeoutMs: 20,
        });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });
    });

    describe('timeout cleanup', () => {
      it('should clean up timer on success', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        await withTimeout(operation, { timeoutMs: 1000 });

        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should clean up timer on error', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(
          withTimeout(operation, { timeoutMs: 1000 })
        ).rejects.toThrow('fail');

        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should clean up timer on timeout', async () => {
        const operation = jest.fn().mockImplementation(() => {
          return new Promise(() => {});
        });

        await expect(withTimeout(operation, { timeoutMs: 10 })).rejects.toThrow(
          'timeout'
        );

        expect(operation).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Resilience Manager Edge Cases', () => {
    it('should handle multiple operations concurrently', async () => {
      const operations = Array.from({ length: 10 }, (_, i) =>
        jest.fn().mockResolvedValue(`success-${i}`)
      );

      const results = await Promise.all(
        operations.map((op) =>
          resilienceManager.execute(
            op,
            {
              timeoutMs: 1000,
              maxRetries: 2,
              baseDelayMs: 10,
              maxDelayMs: 100,
              failureThreshold: 3,
              resetTimeoutMs: 1000,
            },
            `test-${Math.random()}`
          )
        )
      );

      expect(results).toEqual(
        expect.arrayContaining([expect.stringMatching(/success-\d+/)])
      );
    });

    it('should handle operations with same context independently', async () => {
      const operation1 = jest.fn().mockResolvedValue('success-1');
      const operation2 = jest.fn().mockResolvedValue('success-2');

      const [result1, result2] = await Promise.all([
        resilienceManager.execute(
          operation1,
          {
            timeoutMs: 1000,
            maxRetries: 2,
            baseDelayMs: 10,
            maxDelayMs: 100,
            failureThreshold: 3,
            resetTimeoutMs: 1000,
          },
          'same-context'
        ),
        resilienceManager.execute(
          operation2,
          {
            timeoutMs: 1000,
            maxRetries: 2,
            baseDelayMs: 10,
            maxDelayMs: 100,
            failureThreshold: 3,
            resetTimeoutMs: 1000,
          },
          'same-context'
        ),
      ]);

      expect(result1).toBe('success-1');
      expect(result2).toBe('success-2');
    });
  });
});
