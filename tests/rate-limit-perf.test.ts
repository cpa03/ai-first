import { checkRateLimit, clearRateLimitStore } from '@/lib/rate-limit';

describe('Rate Limit Performance', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it('measures performance of checkRateLimit with binary search under pressure', () => {
    const iterations = 5000;
    const identifier = 'perf-test-user';

    // Scenario 1: History is full of CURRENT timestamps
    for (let i = 0; i < 1000; i++) {
      checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
    }

    let start = Date.now();
    for (let i = 0; i < iterations; i++) {
      checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
    }
    let end = Date.now();
    console.log(`All current (5000 calls): ${end - start}ms`);

    // Scenario 2: History is full of EXPIRED timestamps
    clearRateLimitStore();
    for (let i = 0; i < 1000; i++) {
      checkRateLimit(identifier, { limit: 10000, windowMs: 1000000 });
    }

    start = Date.now();
    for (let i = 0; i < iterations; i++) {
      checkRateLimit(identifier, { limit: 10000, windowMs: 1 });
    }
    end = Date.now();
    console.log(`Most expired (5000 calls): ${end - start}ms`);
  });
});
