import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
import { secureRandom } from '@/lib/security/crypto';

describe('Enhanced Security Detection', () => {
  const createMockRequest = (url: string, headers: Record<string, string> = {}) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  describe('NoSQL Bracket Notation and Key Scanning', () => {
    it('should detect NoSQL bracket notation in query parameter keys', () => {
      const request = createMockRequest('https://example.com/api/test?id[$ne]=1');
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      // Currently fails, should pass after enhancements
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    });

    it('should detect SQL injection keywords in query parameter keys', () => {
      const request = createMockRequest('https://example.com/api/test?select=1');
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });

      // Currently fails, should pass after enhancements
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'sql_injection')).toBe(true);
    });

    it('should detect suspicious patterns in header keys', () => {
      const request = createMockRequest('https://example.com/api/test', {
        'X-Malicious-Select': 'value'
      });
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });

      // Currently fails, should pass after enhancements
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.location === 'header')).toBe(true);
    });
  });

  describe('Secure Random Fallback', () => {
    it('should log a warning when falling back to Math.random', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Force fallback by mocking globalThis.crypto
      const originalCrypto = globalThis.crypto;
      // @ts-expect-error - Testing fallback when crypto is unavailable
      delete globalThis.crypto;

      try {
        secureRandom();
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('CRITICAL SECURITY WARNING: Using insecure random generator')
        );
      } finally {
        // Restore crypto
        globalThis.crypto = originalCrypto;
        warnSpy.mockRestore();
      }
    });
  });
});
