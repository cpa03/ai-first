import { CircuitBreaker, CircuitBreakerState } from '@/lib/resilience';

/**
 * Regression tests for #597 — race condition in CircuitBreaker state management.
 *
 * The fix (PR #3717, commit eda120f6) replaced the boolean `halfOpenLock` flag
 * with the promise-chain mutex `halfOpenLock` / `withHalfOpenLock()`.
 *
 * Invariant proven here: while a circuit is OPEN and the reset timeout expires,
 * a burst of concurrent `execute()` calls must result in exactly ONE recovery
 * probe running at a time. Concurrent callers must queue behind the in-flight
 * probe instead of double-executing against an already degraded service.
 *
 * The operation bodies are gated on an explicit promise so that a double
 * execution would be observable (concurrency > 1) instead of being hidden by
 * fast-resolving operations.
 */
describe('CircuitBreaker half-open concurrency regression (#597)', () => {
  const config = {
    failureThreshold: 1,
    resetTimeoutMs: 0,
    monitoringPeriodMs: 60000,
  };

  /** Flush pending microtasks/macrotasks so queued probes can start. */
  function drainMicrotasks(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function createGate(): { promise: Promise<void>; release: () => void } {
    let release: () => void = () => {};
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });
    return { promise, release };
  }

  /** Trips the breaker (threshold 1) and asserts it is OPEN. */
  async function tripOpen(breaker: CircuitBreaker): Promise<void> {
    await expect(
      breaker.execute(() => Promise.reject(new Error('service down')))
    ).rejects.toThrow('service down');
    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
  }

  describe('open -> half-open transition under a concurrent burst', () => {
    it('runs exactly one recovery probe when a burst hits the ready-open circuit', async () => {
      const breaker = new CircuitBreaker('race-597-transition', config);
      await tripOpen(breaker);

      const gate = createGate();
      let active = 0;
      let maxActive = 0;
      let started = 0;

      const probe = async (): Promise<string> => {
        started += 1;
        active += 1;
        maxActive = Math.max(maxActive, active);
        await gate.promise;
        active -= 1;
        return 'ok';
      };

      const burst = Array.from({ length: 10 }, () =>
        breaker.execute(probe)
      ) as Promise<string>[];

      await drainMicrotasks();

      // Only the first caller may have entered the circuit; the other nine
      // must be queued behind it rather than executing in parallel.
      expect(started).toBe(1);
      expect(breaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      gate.release();

      const results = await Promise.all(burst);

      expect(results).toEqual(Array(10).fill('ok'));
      // No caller was ever executed concurrently with another one.
      expect(maxActive).toBe(1);
      expect(started).toBe(10);
      expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('queues callers that arrive while a half-open probe is already in flight', async () => {
      const breaker = new CircuitBreaker('race-597-half-open', config);
      await tripOpen(breaker);

      const gate = createGate();
      let active = 0;
      let maxActive = 0;
      let queuedStarted = 0;

      const firstProbe = breaker.execute(async (): Promise<string> => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await gate.promise;
        active -= 1;
        return 'probe';
      });

      await drainMicrotasks();
      expect(breaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      const queued = Array.from({ length: 5 }, () =>
        breaker.execute(async (): Promise<string> => {
          queuedStarted += 1;
          active += 1;
          maxActive = Math.max(maxActive, active);
          await drainMicrotasks();
          active -= 1;
          return 'queued';
        })
      ) as Promise<string>[];

      await drainMicrotasks();

      // The second wave must not start while the probe holds the lock.
      expect(queuedStarted).toBe(0);
      expect(breaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      gate.release();

      const [probeResult, ...queuedResults] = await Promise.all([
        firstProbe,
        ...queued,
      ]);

      expect(probeResult).toBe('probe');
      expect(queuedResults).toEqual(Array(5).fill('queued'));
      expect(maxActive).toBe(1);
      expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('failure path stays serialized', () => {
    it('never overlaps probes when the half-open probe fails and the burst continues', async () => {
      const breaker = new CircuitBreaker('race-597-failure', config);
      await tripOpen(breaker);

      let active = 0;
      let maxActive = 0;

      const failingProbe = async (): Promise<string> => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await drainMicrotasks();
        active -= 1;
        throw new Error('still down');
      };

      const burst = Array.from({ length: 8 }, () =>
        breaker.execute(failingProbe)
      );

      const results = await Promise.allSettled(burst);

      // Every caller either probed or failed fast — never ran in parallel.
      expect(maxActive).toBe(1);
      expect(results).toHaveLength(8);
      expect(
        results.every(
          (r) =>
            r.status === 'rejected' &&
            (r as PromiseRejectedResult).reason instanceof Error
        )
      ).toBe(true);
      expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
    });
  });
});
