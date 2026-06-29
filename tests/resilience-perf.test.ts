import { CircuitBreakerManager } from '@/lib/resilience';

describe('CircuitBreakerManager Performance', () => {
  const MAX_SIZE = 1000;
  const ITERATIONS = 10000;

  it('should maintain O(1) performance for getOrCreate regardless of size', () => {
    const manager = new CircuitBreakerManager({ maxSize: MAX_SIZE });

    // Fill the manager
    for (let i = 0; i < MAX_SIZE; i++) {
      manager.getOrCreate(`service-${i}`);
    }

    const start = performance.now();

    // Perform many accesses to existing entries
    // In the old O(N) implementation, each call would take ~O(MAX_SIZE) due to indexOf/splice
    for (let i = 0; i < ITERATIONS; i++) {
      const index = i % MAX_SIZE;
      manager.getOrCreate(`service-${index}`);
    }

    const end = performance.now();
    const duration = end - start;
    const avgPerCall = duration / ITERATIONS;

    console.log(`Average getOrCreate (access existing) time: ${avgPerCall.toFixed(6)}ms`);

    // Expect very fast execution (typically < 0.01ms per call in V8)
    expect(avgPerCall).toBeLessThan(0.1);
  });

  it('should maintain O(1) performance for eviction during getOrCreate', () => {
    const manager = new CircuitBreakerManager({ maxSize: MAX_SIZE });

    const start = performance.now();

    // Continuously add new entries, triggering eviction every time
    for (let i = 0; i < ITERATIONS; i++) {
      manager.getOrCreate(`new-service-${i}`);
    }

    const end = performance.now();
    const duration = end - start;
    const avgPerCall = duration / ITERATIONS;

    console.log(`Average getOrCreate (with eviction) time: ${avgPerCall.toFixed(6)}ms`);

    expect(avgPerCall).toBeLessThan(0.1);
  });
});
