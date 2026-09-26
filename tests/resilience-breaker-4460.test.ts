import {
  CircuitBreaker,
  CircuitBreakerManager,
  resilienceManager,
  CircuitBreakerState,
} from '@/lib/resilience';

describe('CircuitBreaker Integration with ResilienceManager (#4460)', () => {
  beforeEach(() => {
    // Reset all circuit breakers before each test
    resilienceManager.resetAllCircuitBreakers();
    // Also reset the singleton manager
    CircuitBreakerManager.getInstance().resetAll();
  });

  describe('Circuit breaker trips via resilienceManager.execute', () => {
    it('should trip circuit breaker after threshold failures through resilienceManager', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('Service unavailable'));
      const config = { failureThreshold: 3, maxRetries: 0 }; // No retries to test circuit breaker directly

      // First 3 failures should trip the breaker
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-4460')
      ).rejects.toThrow('Service unavailable');
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-4460')
      ).rejects.toThrow('Service unavailable');
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-4460')
      ).rejects.toThrow('Service unavailable');

      // Circuit breaker should now be OPEN
      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState; failures: number }
      >;
      expect(states['test-service-4460'].state).toBe(CircuitBreakerState.OPEN);
      expect(states['test-service-4460'].failures).toBe(3);
    });

    it('should reject immediately when circuit is open via resilienceManager', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('Service unavailable'));
      const config = { failureThreshold: 2, maxRetries: 0 };

      // Trip the circuit breaker
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-open')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-open')
      ).rejects.toThrow();

      // Next call should be rejected by circuit breaker (not call the operation)
      const callCountBefore = failingOp.mock.calls.length;
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-open')
      ).rejects.toThrow(/Circuit breaker open for test-service-open/);

      // Operation should not have been called again
      expect(failingOp.mock.calls.length).toBe(callCountBefore);
    });

    it('should recover circuit breaker on successful operation via resilienceManager', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('fail'));
      const successOp = jest.fn().mockResolvedValue('success');
      const config = { failureThreshold: 2, maxRetries: 0, resetTimeoutMs: 100 };

      // Trip the circuit breaker
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-recover')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-recover')
      ).rejects.toThrow();

      // Verify it's open
      let states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['test-service-recover'].state).toBe(CircuitBreakerState.OPEN);

      // Wait for reset timeout
      jest.useFakeTimers();
      jest.advanceTimersByTime(150);

      // Successful operation should close the circuit
      const result = await resilienceManager.execute(successOp, config, 'test-service-recover');
      expect(result).toBe('success');

      states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['test-service-recover'].state).toBe(CircuitBreakerState.CLOSED);
      jest.useRealTimers();
    });
  });

  describe('Circuit breaker with retries via resilienceManager', () => {
    it('should trip circuit breaker after all retries exhausted', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('Transient error'));
      const config = { failureThreshold: 3, maxRetries: 2, baseDelayMs: 10 };

      // Each call will retry 2 times (3 attempts total), then fail
      // After 3 calls = 3 failures = threshold reached
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-retry')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-retry')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-retry')
      ).rejects.toThrow();

      // Circuit breaker should be OPEN
      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState; failures: number }
      >;
      expect(states['test-service-retry'].state).toBe(CircuitBreakerState.OPEN);
      expect(states['test-service-retry'].failures).toBe(3);
    });

    it('should NOT trip circuit breaker if retry eventually succeeds', async () => {
      // Use errors that match retryable patterns (timeout, rate limit, etc.)
      const flakyOp = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout: connection timed out'))
        .mockRejectedValueOnce(new Error('rate limit exceeded'))
        .mockResolvedValue('success');
      const config = { failureThreshold: 2, maxRetries: 2, baseDelayMs: 10 };

      // First call: 2 failures then success = recorded as success
      const result = await resilienceManager.execute(flakyOp, config, 'test-service-flaky');
      expect(result).toBe('success');

      // Circuit breaker should remain CLOSED
      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState; failures: number }
      >;
      expect(states['test-service-flaky'].state).toBe(CircuitBreakerState.CLOSED);
      expect(states['test-service-flaky'].failures).toBe(0);
    });

    it('should record failure in circuit breaker after retries exhausted', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('Permanent error'));
      const config = { failureThreshold: 2, maxRetries: 1, baseDelayMs: 10 };

      // First call: 2 attempts (1 retry), both fail = 1 failure recorded
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-retry-fail')
      ).rejects.toThrow();

      let states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState; failures: number }
      >;
      expect(states['test-service-retry-fail'].state).toBe(CircuitBreakerState.CLOSED);
      expect(states['test-service-retry-fail'].failures).toBe(1);

      // Second call: another failure = 2 failures = threshold reached
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-retry-fail')
      ).rejects.toThrow();

      states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState; failures: number }
      >;
      expect(states['test-service-retry-fail'].state).toBe(CircuitBreakerState.OPEN);
      expect(states['test-service-retry-fail'].failures).toBe(2);
    });
  });

  describe('Circuit breaker half-open state via resilienceManager', () => {
    it('should transition to half-open after reset timeout and test with one request', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('fail'));
      const successOp = jest.fn().mockResolvedValue('success');
      const config = { failureThreshold: 2, maxRetries: 0, resetTimeoutMs: 100 };

      // Trip the circuit breaker
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-halfopen')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-halfopen')
      ).rejects.toThrow();

      // Wait for reset timeout
      jest.useFakeTimers();
      jest.advanceTimersByTime(150);

      // Next call should go to half-open and succeed, closing the circuit
      const result = await resilienceManager.execute(successOp, config, 'test-service-halfopen');
      expect(result).toBe('success');

      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['test-service-halfopen'].state).toBe(CircuitBreakerState.CLOSED);
      jest.useRealTimers();
    });

    it('should re-open circuit if half-open request fails', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('fail'));
      const config = { failureThreshold: 2, maxRetries: 0, resetTimeoutMs: 100 };

      // Trip the circuit breaker
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-halfopen-fail')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-halfopen-fail')
      ).rejects.toThrow();

      // Wait for reset timeout
      jest.useFakeTimers();
      jest.advanceTimersByTime(150);

      // Half-open request fails
      await expect(
        resilienceManager.execute(failingOp, config, 'test-service-halfopen-fail')
      ).rejects.toThrow();

      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['test-service-halfopen-fail'].state).toBe(CircuitBreakerState.OPEN);
      jest.useRealTimers();
    });
  });

  describe('Multiple independent circuit breakers', () => {
    it('should track each service independently', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('fail'));
      const config = { failureThreshold: 2, maxRetries: 0 };

      // Trip service-1
      await expect(
        resilienceManager.execute(failingOp, config, 'service-1')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'service-1')
      ).rejects.toThrow();

      // Trip service-2
      await expect(
        resilienceManager.execute(failingOp, config, 'service-2')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'service-2')
      ).rejects.toThrow();

      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['service-1'].state).toBe(CircuitBreakerState.OPEN);
      expect(states['service-2'].state).toBe(CircuitBreakerState.OPEN);
    });

    it('should not affect other services when one trips', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('fail'));
      const successOp = jest.fn().mockResolvedValue('success');
      const config = { failureThreshold: 2, maxRetries: 0 };

      // Trip service-a
      await expect(
        resilienceManager.execute(failingOp, config, 'service-a')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'service-a')
      ).rejects.toThrow();

      // Service-b should still work
      const result = await resilienceManager.execute(successOp, config, 'service-b');
      expect(result).toBe('success');

      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['service-a'].state).toBe(CircuitBreakerState.OPEN);
      expect(states['service-b'].state).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('resetCircuitBreaker and resetAllCircuitBreakers', () => {
    it('should reset specific circuit breaker via resilienceManager', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('fail'));
      const config = { failureThreshold: 2, maxRetries: 0 };

      // Trip the circuit breaker
      await expect(
        resilienceManager.execute(failingOp, config, 'test-reset-specific')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'test-reset-specific')
      ).rejects.toThrow();

      // Reset it
      resilienceManager.resetCircuitBreaker('test-reset-specific');

      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['test-reset-specific'].state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should reset all circuit breakers via resilienceManager', async () => {
      const failingOp = jest.fn().mockRejectedValue(new Error('fail'));
      const config = { failureThreshold: 1, maxRetries: 0 };

      // Trip multiple circuit breakers
      await expect(
        resilienceManager.execute(failingOp, config, 'reset-all-1')
      ).rejects.toThrow();
      await expect(
        resilienceManager.execute(failingOp, config, 'reset-all-2')
      ).rejects.toThrow();

      // Reset all
      resilienceManager.resetAllCircuitBreakers();

      const states = resilienceManager.getCircuitBreakerStates() as Record<
        string,
        { state: CircuitBreakerState }
      >;
      expect(states['reset-all-1'].state).toBe(CircuitBreakerState.CLOSED);
      expect(states['reset-all-2'].state).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('CircuitBreaker recordSuccess/recordFailure public methods', () => {
    it('should record success via public method', () => {
      const cb = new CircuitBreaker('test-record', { failureThreshold: 3, resetTimeoutMs: 1000 });

      // Record some failures first
      cb.recordFailure(new Error('fail'), Date.now());
      cb.recordFailure(new Error('fail'), Date.now());
      expect(cb.getFailures()).toBe(2);

      // Record success - should reset
      cb.recordSuccess(Date.now());
      expect(cb.getFailures()).toBe(0);
      expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should record failure via public method and trip', () => {
      const cb = new CircuitBreaker('test-record-fail', { failureThreshold: 2, resetTimeoutMs: 1000 });

      cb.recordFailure(new Error('fail'), Date.now());
      expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);

      cb.recordFailure(new Error('fail'), Date.now());
      expect(cb.getState()).toBe(CircuitBreakerState.OPEN);
    });
  });
});