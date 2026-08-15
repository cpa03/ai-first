import { checkRateLimit, clearRateLimitStore } from '@/lib/rate-limit';

describe('Rate Limit Performance', () => {
  beforeEach(async () => {
    await clearRateLimitStore();
  });

  it('measures performance of checkRateLimit with binary search under pressure', async () => {
    const iterations = 5000;
    const identifier = 'perf-test-user';

    for (let i = 0; i < 1000; i++) {
      await checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
    }

    let start = Date.now();
    for (let i = 0; i < iterations; i++) {
      await checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
    }
    let end = Date.now();
    console.log(`All current (5000 calls): ${end - start}ms`);

    await clearRateLimitStore();
    for (let i = 0; i < 1000; i++) {
      await checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
    }

    start = Date.now();
    for (let i = 0; i < iterations; i++) {
      await checkRateLimit(identifier, { limit: 10000, windowMs: 1 });
    }
    end = Date.now();
    console.log(`Most expired (5000 calls): ${end - start}ms`);
  });
});
