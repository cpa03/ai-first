import { validateCSRF, CSRF_CONFIG } from '@/lib/security/csrf';

describe('CSRF Protection', () => {
  const originalEnabled = CSRF_CONFIG.ENABLED;

  beforeAll(() => {
    // Force enable CSRF protection for tests
    (CSRF_CONFIG as any).ENABLED = true;
  });

  afterAll(() => {
    (CSRF_CONFIG as any).ENABLED = originalEnabled;
  });

  describe('isTrustedOrigin vulnerability', () => {
    it('should NOT allow malicious subdomains of trusted providers', () => {
      const trustedOrigins = [
        'https://my-app.vercel.app',
        'https://my-site.pages.dev',
      ];

      // Malicious origin trying to exploit suffix matching
      const maliciousVercel = 'https://attacker.vercel.app';
      const maliciousPages = 'https://attacker.pages.dev';

      const reqVercel = new Request('https://my-app.vercel.app/api/data', {
        method: 'POST',
        headers: {
          origin: maliciousVercel,
        },
      });

      const reqPages = new Request('https://my-app.vercel.app/api/data', {
        method: 'POST',
        headers: {
          origin: maliciousPages,
        },
      });

      const resultVercel = validateCSRF(reqVercel, { trustedOrigins });
      const resultPages = validateCSRF(reqPages, { trustedOrigins });

      expect(resultVercel.valid).toBe(false);
      expect(resultPages.valid).toBe(false);
    });

    it('should allow exact matches for trusted providers', () => {
      const trustedOrigins = ['https://my-app.vercel.app'];
      const validOrigin = 'https://my-app.vercel.app';

      const req = new Request('https://my-app.vercel.app/api/data', {
        method: 'POST',
        headers: {
          origin: validOrigin,
        },
      });

      const result = validateCSRF(req, { trustedOrigins });
      expect(result.valid).toBe(true);
    });
  });
});
