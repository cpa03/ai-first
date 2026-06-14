
import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
import { secureRandom } from '@/lib/security/crypto';

describe('Enhanced Security Detection', () => {
  const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url, 'https://example.com'));
  };

  describe('NoSQL Injection Improvements', () => {
    it('should detect NoSQL bracket notation injection in keys', () => {
      const request = createMockRequest('https://example.com/api/users?id[$ne]=1');
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });

      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
      expect(result.patterns.some(p => p.field === 'id[$ne]')).toBe(true);
    });

    it('should detect NoSQL bracket notation injection in values', () => {
      const request = createMockRequest('https://example.com/api/users?filter={"id":{"$gt":1}}');
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });

      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    });

    it('should detect bracket notation in query parameter values', () => {
        // e.g. some frameworks might use this
        const request = createMockRequest('https://example.com/api/users?op=$gt]');
        const result = detectSuspiciousPatterns(request, { minSeverity: 1 });

        expect(result.detected).toBe(true);
        expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    });
  });

  describe('Secure Random Warning', () => {
    it('should log a warning if Web Crypto is unavailable (simulated)', () => {
      const originalCrypto = globalThis.crypto;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        // Force fallback by temporarily overriding crypto
        // Using defineProperty because globalThis.crypto can be read-only
        Object.defineProperty(globalThis, 'crypto', {
          value: undefined,
          configurable: true,
        });

        secureRandom();

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('CRITICAL SECURITY WARNING')
        );
      } finally {
        // Restore original crypto
        Object.defineProperty(globalThis, 'crypto', {
          value: originalCrypto,
          configurable: true,
        });
        warnSpy.mockRestore();
      }
    });
  });
});
