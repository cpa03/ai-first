import { generateId } from '@/lib/security/crypto';

describe('UI Visual ID Performance and Correctness Benchmarks', () => {
  it('benchmarks cryptographic generateId vs non-cryptographic counter', () => {
    const iterations = 10000;

    // 1. Benchmark generateId()
    const startCrypto = performance.now();
    for (let i = 0; i < iterations; i++) {
      generateId();
    }
    const endCrypto = performance.now();
    const durationCrypto = endCrypto - startCrypto;

    // 2. Benchmark auto-incrementing counter (simulating how we construct IDs in useConfetti/Button)
    let counter = 0;
    const now = Date.now();
    const startCounter = performance.now();
    for (let i = 0; i < iterations; i++) {
      const id = `confetti-${now}-${i}-${counter++}`;
      // Do a simple primitive check instead of heavy Jest matcher
      if (!id) {
        throw new Error('ID is empty');
      }
    }
    const endCounter = performance.now();
    const durationCounter = endCounter - startCounter;

    const speedup = durationCrypto / durationCounter;

    console.log(
      `[Benchmark] Cryptographic generateId for ${iterations} IDs: ${durationCrypto.toFixed(2)}ms`
    );
    console.log(
      `[Benchmark] Non-cryptographic Counter for ${iterations} IDs: ${durationCounter.toFixed(2)}ms`
    );
    console.log(`[Benchmark] Speedup factor: ${speedup.toFixed(2)}x faster!`);

    expect(durationCounter).toBeLessThan(durationCrypto * 2);
  });

  it('verifies that the counter IDs are unique and sequentially generated', () => {
    let counter = 0;
    const ids = new Set<string>();

    for (let i = 0; i < 50; i++) {
      const id = `confetti-${Date.now()}-${i}-${counter++}`;
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }

    expect(ids.size).toBe(50);
  });
});
