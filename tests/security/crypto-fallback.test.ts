import {
  generateId,
  secureRandom,
  timingSafeEqualStrings,
  timingSafeEqualArrays,
} from '@/lib/security/crypto';
import { asInvalidInput } from '../utils/_testHelpers';

describe('generateId Fallback', () => {
  let originalCrypto: unknown;
  let warnSpy: jest.SpyInstance;

  beforeAll(() => {
    originalCrypto = globalThis.crypto;
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
    });
    warnSpy.mockRestore();
  });

  it('should throw error when crypto is unavailable instead of insecure fallback', () => {
    // Force fallback by making crypto undefined
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
    });

    expect(() => generateId()).toThrow(/CRITICAL SECURITY/);
  });
});

describe('timingSafeEqualStrings', () => {
  it('should return true for identical strings', () => {
    expect(timingSafeEqualStrings('hello', 'hello')).toBe(true);
    expect(timingSafeEqualStrings('', '')).toBe(true);
    expect(timingSafeEqualStrings('a', 'a')).toBe(true);
    expect(
      timingSafeEqualStrings('super-secret-key-123!', 'super-secret-key-123!')
    ).toBe(true);
  });

  it('should return false for different strings of the same length', () => {
    expect(timingSafeEqualStrings('hello', 'world')).toBe(false);
    expect(timingSafeEqualStrings('abc', 'abd')).toBe(false);
    expect(timingSafeEqualStrings('abc', 'xbc')).toBe(false);
  });

  it('should return false for strings of different lengths', () => {
    expect(timingSafeEqualStrings('hello', 'hello-world')).toBe(false);
    expect(timingSafeEqualStrings('hello-world', 'hello')).toBe(false);
    expect(timingSafeEqualStrings('a', '')).toBe(false);
    expect(timingSafeEqualStrings('', 'b')).toBe(false);
  });

  it('should return false if any parameter is not a string', () => {
    expect(timingSafeEqualStrings(asInvalidInput<string>(null), 'hello')).toBe(
      false
    );
    expect(
      timingSafeEqualStrings('hello', asInvalidInput<string>(undefined))
    ).toBe(false);
    expect(
      timingSafeEqualStrings(
        asInvalidInput<string>(123),
        asInvalidInput<string>(123)
      )
    ).toBe(false);
  });
});

describe('timingSafeEqual Performance Benchmarks', () => {
  it('benchmarks timingSafeEqualStrings with matched vs mismatched lengths', () => {
    const stringA = 'a'.repeat(10000);
    const stringB = 'a'.repeat(10000);
    const stringC = 'a'.repeat(500); // significantly different length
    const iterations = 5000;

    // Matching lengths benchmark
    const startMatch = performance.now();
    for (let i = 0; i < iterations; i++) {
      timingSafeEqualStrings(stringA, stringB);
    }
    const endMatch = performance.now();
    const durationMatch = endMatch - startMatch;

    // Mismatched lengths benchmark (optimized path)
    const startMismatch = performance.now();
    for (let i = 0; i < iterations; i++) {
      timingSafeEqualStrings(stringA, stringC);
    }
    const endMismatch = performance.now();
    const durationMismatch = endMismatch - startMismatch;

    console.log(
      `[Benchmark] timingSafeEqualStrings matching lengths (10k chars, ${iterations} runs): ${durationMatch.toFixed(2)}ms`
    );
    console.log(
      `[Benchmark] timingSafeEqualStrings mismatched lengths (10k vs 500, ${iterations} runs): ${durationMismatch.toFixed(2)}ms`
    );

    // Expect the mismatched path to be significantly faster (under normal circumstances at least 3x faster)
    expect(durationMismatch).toBeLessThan(durationMatch);
  });

  it('benchmarks timingSafeEqualArrays with matched vs mismatched lengths', () => {
    const arrayA = new Uint8Array(10000);
    const arrayB = new Uint8Array(10000);
    const arrayC = new Uint8Array(500);
    const iterations = 5000;

    // Matching lengths benchmark
    const startMatch = performance.now();
    for (let i = 0; i < iterations; i++) {
      timingSafeEqualArrays(arrayA, arrayB);
    }
    const endMatch = performance.now();
    const durationMatch = endMatch - startMatch;

    // Mismatched lengths benchmark (optimized path)
    const startMismatch = performance.now();
    for (let i = 0; i < iterations; i++) {
      timingSafeEqualArrays(arrayA, arrayC);
    }
    const endMismatch = performance.now();
    const durationMismatch = endMismatch - startMismatch;

    console.log(
      `[Benchmark] timingSafeEqualArrays matching lengths (10k bytes, ${iterations} runs): ${durationMatch.toFixed(2)}ms`
    );
    console.log(
      `[Benchmark] timingSafeEqualArrays mismatched lengths (10k vs 500, ${iterations} runs): ${durationMismatch.toFixed(2)}ms`
    );

    // Expect the mismatched path to be significantly faster
    expect(durationMismatch).toBeLessThan(durationMatch);
  });
});

describe('timingSafeEqualArrays', () => {
  it('should return true for identical Uint8Arrays', () => {
    expect(
      timingSafeEqualArrays(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 2, 3])
      )
    ).toBe(true);
    expect(timingSafeEqualArrays(new Uint8Array([]), new Uint8Array([]))).toBe(
      true
    );
    expect(
      timingSafeEqualArrays(new Uint8Array([255]), new Uint8Array([255]))
    ).toBe(true);
  });

  it('should return false for different Uint8Arrays of the same length', () => {
    expect(
      timingSafeEqualArrays(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 2, 4])
      )
    ).toBe(false);
    expect(
      timingSafeEqualArrays(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 9, 3])
      )
    ).toBe(false);
  });

  it('should return false for Uint8Arrays of different lengths', () => {
    expect(
      timingSafeEqualArrays(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 2, 3, 4])
      )
    ).toBe(false);
    expect(
      timingSafeEqualArrays(
        new Uint8Array([1, 2, 3, 4]),
        new Uint8Array([1, 2, 3])
      )
    ).toBe(false);
    expect(timingSafeEqualArrays(new Uint8Array([1]), new Uint8Array([]))).toBe(
      false
    );
    expect(timingSafeEqualArrays(new Uint8Array([]), new Uint8Array([1]))).toBe(
      false
    );
  });

  it('should return false if any parameter is not a Uint8Array', () => {
    expect(
      timingSafeEqualArrays(
        asInvalidInput<Uint8Array>(null),
        new Uint8Array([1])
      )
    ).toBe(false);
    expect(
      timingSafeEqualArrays(
        new Uint8Array([1]),
        asInvalidInput<Uint8Array>(undefined)
      )
    ).toBe(false);
    expect(
      timingSafeEqualArrays(
        asInvalidInput<Uint8Array>('not-array'),
        asInvalidInput<Uint8Array>('not-array')
      )
    ).toBe(false);
    expect(
      timingSafeEqualArrays(
        asInvalidInput<Uint8Array>([1, 2, 3]),
        asInvalidInput<Uint8Array>([1, 2, 3])
      )
    ).toBe(false);
  });
});
