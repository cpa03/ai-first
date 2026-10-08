import { checkRateLimit, clearRateLimitStore } from '@/lib/rate-limit';

describe('Rate Limit Performance', () => {
  beforeEach(async () => {
    await clearRateLimitStore();
  });

  it('measures performance of checkRateLimit with binary search under pressure', async () => {
    const iterations = 5000;
    const identifier = 'perf-test-user';
    const maxExpectedMs = 5000;

    for (let i = 0; i < 1000; i++) {
      const result = await checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
      expect(result.success).toBe(true);
    }

    let start = Date.now();
    const results: boolean[] = [];
    for (let i = 0; i < iterations; i++) {
      const result = await checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
      results.push(result.success);
    }
    let end = Date.now();
    const allCurrentMs = end - start;
    console.log(`All current (5000 calls): ${allCurrentMs}ms`);

    expect(results.every((r) => r)).toBe(true);
    expect(allCurrentMs).toBeLessThan(maxExpectedMs);

    await clearRateLimitStore();
    for (let i = 0; i < 1000; i++) {
      const result = await checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
      expect(result.success).toBe(true);
    }

    start = Date.now();
    const expiredResults: boolean[] = [];
    for (let i = 0; i < iterations; i++) {
      const result = await checkRateLimit(identifier, { limit: 10000, windowMs: 1 });
      expiredResults.push(result.success);
    }
    end = Date.now();
    const expiredMs = end - start;
    console.log(`Most expired (5000 calls): ${expiredMs}ms`);

    expect(expiredResults.every((r) => r)).toBe(true);
    expect(expiredMs).toBeLessThan(maxExpectedMs);
  });
});
