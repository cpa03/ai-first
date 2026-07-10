import { generateId, secureRandom } from '@/lib/security/crypto';

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
