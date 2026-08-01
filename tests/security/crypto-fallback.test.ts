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
