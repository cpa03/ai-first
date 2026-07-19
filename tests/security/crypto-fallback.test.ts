import { generateId, secureRandom, timingSafeEqualStrings } from '@/lib/security/crypto';

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
    expect(timingSafeEqualStrings('super-secret-key-123!', 'super-secret-key-123!')).toBe(true);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(timingSafeEqualStrings(null as any, 'hello')).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(timingSafeEqualStrings('hello', undefined as any)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(timingSafeEqualStrings(123 as any, 123 as any)).toBe(false);
  });
});
