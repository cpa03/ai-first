import { generateId, secureRandom } from '@/lib/security/crypto';

describe('generateId Fallback', () => {
  let originalCrypto: any;
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

  it('should use secureRandom() fallback and log warning when crypto is unavailable', () => {
    // Force fallback by making crypto undefined
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
    });

    const id = generateId();

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.includes('-')).toBe(true);
    // Should have logged a warning from secureRandom()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('CRITICAL SECURITY WARNING: Using insecure random generator')
    );
  });
});
