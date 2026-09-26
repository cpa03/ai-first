import {
  checkRateLimit,
  clearRateLimitStore,
  cleanupExpiredEntries,
  getRateLimitStats,
} from '@/lib/rate-limit';

/**
 * Regression tests for #688 — race condition in the rate limit store
 * (potential DoS bypass).
 *
 * The fix (PR #3884, commit adc3aab9) added the per-identifier promise chain
 * (`withRateLimitLock`) plus the store-wide `withStoreGlobalLock` around every
 * read-modify-write of `rateLimitStore`, and moved the capacity cleanup behind
 * that same lock.
 *
 * Invariants proven here:
 *  1. A parallel burst of N calls for one identifier can never consume more
 *     than `limit` slots (no lost updates => no bypass).
 *  2. The same holds while store-wide cleanup / stats reads are racing with
 *     the increment path (store deliberately pushed to capacity first, which
 *     is the branch that awaits `cleanupOldestEntries()`).
 *  3. The recorded history length matches `limit` exactly after a burst.
 *
 * RED evidence: the tests are sensitive to a read-modify-write split across an
 * `await` — the exact lost-update defect described in #688 (see the mutation
 * check recorded in the PR: inserting a single `await` between the store read
 * and write makes the burst allow all N callers).
 */
describe('Rate limit store atomicity under concurrent requests (#688)', () => {
  beforeEach(async () => {
    await clearRateLimitStore();
  });

  afterEach(async () => {
    await clearRateLimitStore();
  });

  it('allows exactly `limit` requests from a 50-call parallel burst', async () => {
    const identifier = 'burst-user-688';
    const config = { limit: 5, windowMs: 60000 };

    const results = await Promise.all(
      Array.from({ length: 50 }, () => checkRateLimit(identifier, config))
    );

    const allowed = results.filter((r) => r.allowed);
    const denied = results.filter((r) => !r.allowed);

    // Lost updates would let more than `limit` callers through (DoS bypass).
    expect(allowed).toHaveLength(config.limit);
    expect(denied).toHaveLength(50 - config.limit);

    // Denied callers always report a fully consumed window.
    for (const result of denied) {
      expect(result.info.remaining).toBe(0);
    }

    // Allowed callers count down to zero: no slot is handed out twice.
    const remaining = allowed.map((r) => r.info.remaining);
    expect(remaining).toEqual([4, 3, 2, 1, 0]);
  });

  it('records exactly `limit` timestamps for the identifier after a burst', async () => {
    const identifier = 'history-user-688';
    const config = { limit: 3, windowMs: 60000 };

    await Promise.all(
      Array.from({ length: 25 }, () => checkRateLimit(identifier, config))
    );

    const stats = await getRateLimitStats();
    const entry = stats.topUsers.find((u) => u.identifier === identifier);

    expect(entry).toBeDefined();
    expect(entry?.count).toBe(config.limit);
  });

  it('keeps the limit exact while store-wide cleanup races with the increment path', async () => {
    const identifier = 'cleanup-race-user-688';
    const config = { limit: 3, windowMs: 60000 };

    // Seed some history, then hammer the identifier while cleanup runs.
    await checkRateLimit(identifier, config);

    const cleanups = [
      cleanupExpiredEntries(),
      cleanupExpiredEntries(),
      getRateLimitStats(),
    ];

    const results = await Promise.all([
      ...Array.from({ length: 20 }, () => checkRateLimit(identifier, config)),
    ]);
    await Promise.all(cleanups);

    const allowed = results.filter((r) => r.allowed);

    // 1 seeded + 2 from the burst = the configured limit of 3.
    expect(allowed).toHaveLength(config.limit - 1);
  });

  describe('when the store is at capacity (cleanup branch awaits)', () => {
    const ENV_KEY = 'RATE_LIMIT_MAX_STORE_SIZE';

    it('still hands out exactly `limit` slots to a parallel burst', async () => {
      const previous = process.env[ENV_KEY];
      process.env[ENV_KEY] = '100';

      jest.resetModules();
      const rl =
        require('@/lib/rate-limit') as typeof import('@/lib/rate-limit');

      try {
        await rl.clearRateLimitStore();

        // Fill the store to capacity so every check hits the
        // `await cleanupOldestEntries()` branch before its read-modify-write.
        for (let i = 0; i < 100; i++) {
          await rl.checkRateLimit(`filler-688-${i}`, {
            limit: 1,
            windowMs: 60000,
          });
        }

        // Prove the store really is at capacity, i.e. every check below is
        // forced through the `await cleanupOldestEntries()` branch.
        const healthBeforeBurst = await rl.getStoreHealthMetrics();
        expect(healthBeforeBurst.maxSize).toBe(100);
        expect(healthBeforeBurst.currentSize).toBeGreaterThanOrEqual(
          healthBeforeBurst.maxSize
        );

        const identifier = 'capacity-user-688';
        const config = { limit: 4, windowMs: 60000 };

        // Race store-wide operations against the burst, too.
        const background = [rl.cleanupExpiredEntries(), rl.getRateLimitStats()];

        const results = await Promise.all(
          Array.from({ length: 30 }, () =>
            rl.checkRateLimit(identifier, config)
          )
        );
        await Promise.all(background);

        const allowed = results.filter((r) => r.allowed);
        expect(allowed).toHaveLength(config.limit);
        expect(results.filter((r) => !r.allowed)).toHaveLength(
          30 - config.limit
        );

        const stats = await rl.getRateLimitStats();
        const entry = stats.topUsers.find((u) => u.identifier === identifier);
        expect(entry?.count).toBe(config.limit);

        await rl.clearRateLimitStore();
      } finally {
        if (previous === undefined) {
          delete process.env[ENV_KEY];
        } else {
          process.env[ENV_KEY] = previous;
        }
        jest.resetModules();
      }
    });
  });
});
