import { validateCSRF, CSRF_CONFIG } from '@/lib/security/csrf';

describe('CSRF Security', () => {
  const originalEnabled = CSRF_CONFIG.ENABLED;

  beforeAll(() => {
    // Manually enable CSRF for testing as it's disabled in 'test' env by default
    (CSRF_CONFIG as Record<string, unknown>).ENABLED = true;
  });

  afterAll(() => {
    (CSRF_CONFIG as Record<string, unknown>).ENABLED = originalEnabled;
  });

  it('should trust exact matches for trusted origins', () => {
    const trustedOrigins = ['https://myapp.vercel.app'];
    const request = new Request('https://myapp.vercel.app/api/action', {
      method: 'POST',
      headers: {
        Origin: 'https://myapp.vercel.app',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should NOT trust subdomains of the same platform (Vercel) if not explicitly trusted', () => {
    const trustedOrigins = ['https://myapp.vercel.app'];
    const request = new Request('https://myapp.vercel.app/api/action', {
      method: 'POST',
      headers: {
        Origin: 'https://attacker.vercel.app',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(false);
  });

  it('should NOT trust subdomains of the same platform (Cloudflare Pages) if not explicitly trusted', () => {
    const trustedOrigins = ['https://myapp.pages.dev'];
    const request = new Request('https://myapp.pages.dev/api/action', {
      method: 'POST',
      headers: {
        Origin: 'https://attacker.pages.dev',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(false);
  });

  it('should correctly handle normalized origins with trailing slashes', () => {
    const trustedOrigins = ['https://myapp.com/'];
    const request = new Request('https://myapp.com/api/action', {
      method: 'POST',
      headers: {
        Origin: 'https://myapp.com',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should allow GET requests without origin validation', () => {
    const request = new Request('https://myapp.com/api/data', {
      method: 'GET',
    });

    const result = validateCSRF(request);
    expect(result.valid).toBe(true);
  });

  it('should REJECT state-changing requests with NO origin or referer header', () => {
    const request = new Request('https://myapp.com/api/action', {
      method: 'POST',
      headers: {},
    });

    const result = validateCSRF(request);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing Origin or Referer header');
  });

  it('should ALLOW state-changing requests with NO origin header IF they have an Authorization header', () => {
    const request = new Request('https://myapp.com/api/action', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer my-token',
      },
    });

    const result = validateCSRF(request);
    expect(result.valid).toBe(true);
  });

  describe('Origin Header Sanitization', () => {
    const trustedOrigins = ['https://myapp.vercel.app'];

    it('should REJECT origin headers with javascript: protocol', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Origin: 'javascript:alert(1)',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });

    it('should REJECT origin headers with file: protocol', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Origin: 'file:///etc/passwd',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });

    it('should REJECT origin headers with data: protocol', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Origin: 'data:text/html,<script>alert(1)</script>',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });

    it('should ACCEPT valid HTTPS origin', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Origin: 'https://myapp.vercel.app',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });

    it('should ACCEPT valid HTTP origin in development', () => {
      const request = new Request('http://localhost:3000/api/action', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:3000',
        },
      });

      const result = validateCSRF(request, {
        trustedOrigins: ['http://localhost:3000'],
      });
      expect(result.valid).toBe(true);
    });

    it('should REJECT origins with spaces (potential header injection)', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Origin: 'https://trusted.com evil.com',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });

    it('should REJECT empty origin header', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Origin: '',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });
  });

  describe('Referer Header Sanitization', () => {
    const trustedOrigins = ['https://myapp.vercel.app'];

    it('should ACCEPT valid HTTPS referer', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Referer: 'https://myapp.vercel.app/page',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(true);
    });

    it('should REJECT referer with invalid protocol', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Referer: 'javascript:alert(1)',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });

    it('should REJECT referer with malformed URL', () => {
      const request = new Request('https://myapp.vercel.app/api/action', {
        method: 'POST',
        headers: {
          Referer: 'not-a-valid-url',
        },
      });

      const result = validateCSRF(request, { trustedOrigins });
      expect(result.valid).toBe(false);
    });
  });
});
