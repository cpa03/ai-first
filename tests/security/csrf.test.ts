import { validateCSRF, CSRF_CONFIG } from '@/lib/security/csrf';

describe('CSRF Security Validation', () => {
  // Enable CSRF for testing logic
  beforeAll(() => {
    // Force enable CSRF logic even in test environment for these unit tests
    (CSRF_CONFIG as any).ENABLED = true;
  });

  const trustedOrigins = [
    'https://my-app.vercel.app',
    'https://my-app.pages.dev',
    'https://example.com',
  ];

  const createRequest = (origin: string | null, method = 'POST') => {
    const headers = new Headers();
    if (origin) {
      headers.set('origin', origin);
    }
    return new Request('https://my-app.vercel.app/api/test', {
      method,
      headers,
    });
  };

  describe('Exact Origin Matching', () => {
    it('should allow exact matches for trusted Vercel domains', () => {
      const request = createRequest('https://my-app.vercel.app');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });

    it('should allow exact matches for trusted Cloudflare Pages domains', () => {
      const request = createRequest('https://my-app.pages.dev');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });

    it('should allow exact matches for custom trusted domains', () => {
      const request = createRequest('https://example.com');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });
  });

  describe('Shared Platform Protection (Vulnerability Prevention)', () => {
    it('should reject origins that are suffixes of trusted domains but not exact matches (Vercel)', () => {
      // Prior to fix, 'https://attacker-my-app.vercel.app' might have passed if logic used .endsWith('.vercel.app')
      const request = createRequest('https://attacker-my-app.vercel.app');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject origins that are suffixes of trusted domains but not exact matches (Cloudflare Pages)', () => {
      const request = createRequest('https://attacker-my-app.pages.dev');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject unrelated subdomains on the same platform', () => {
      const request = createRequest('https://other-app.vercel.app');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });
  });

  describe('Normalization and Robustness', () => {
    it('should be case-insensitive', () => {
      const request = createRequest('HTTPS://MY-APP.VERCEL.APP');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });

    it('should normalize trailing slashes', () => {
      const request = createRequest('https://my-app.vercel.app/');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });

    it('should handle trusted origins with trailing slashes in config', () => {
      const originsWithSlash = ['https://example.com/'];
      const request = createRequest('https://example.com');
      const result = validateCSRF(request, {
        trustedOrigins: originsWithSlash,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('Bypass and Non-State-Changing Methods', () => {
    it('should allow non-state-changing methods (GET)', () => {
      const request = createRequest('https://malicious.com', 'GET');
      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });

    it('should allow when bypass option is true', () => {
      const request = createRequest('https://malicious.com', 'POST');
      const result = validateCSRF(request, { trustedOrigins, bypass: true });
      expect(result.valid).toBe(true);
    });
  });
});
