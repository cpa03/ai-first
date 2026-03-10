import { validateCSRF, CSRF_CONFIG } from '@/lib/security/csrf';

describe('CSRF Security', () => {
  const originalEnabled = CSRF_CONFIG.ENABLED;

  beforeAll(() => {
    // Manually enable CSRF for testing as it's disabled in 'test' env by default
    (CSRF_CONFIG as any).ENABLED = true;
  });

  afterAll(() => {
    (CSRF_CONFIG as any).ENABLED = originalEnabled;
  });

  it('should trust exact matches for trusted origins', () => {
    const trustedOrigins = ['https://myapp.vercel.app'];
    const request = new Request('https://myapp.vercel.app/api/action', {
      method: 'POST',
      headers: {
        'Origin': 'https://myapp.vercel.app'
      }
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should NOT trust subdomains of the same platform (Vercel) if not explicitly trusted', () => {
    // This is the VULNERABILITY: currently it erroneously trusts 'attacker.vercel.app'
    // because 'myapp.vercel.app' contains '.vercel.app'
    const trustedOrigins = ['https://myapp.vercel.app'];
    const request = new Request('https://myapp.vercel.app/api/action', {
      method: 'POST',
      headers: {
        'Origin': 'https://attacker.vercel.app'
      }
    });

    const result = validateCSRF(request, { trustedOrigins });
    // This expectation should FAIL with the current vulnerable code
    expect(result.valid).toBe(false);
  });

  it('should NOT trust subdomains of the same platform (Cloudflare Pages) if not explicitly trusted', () => {
    const trustedOrigins = ['https://myapp.pages.dev'];
    const request = new Request('https://myapp.pages.dev/api/action', {
      method: 'POST',
      headers: {
        'Origin': 'https://attacker.pages.dev'
      }
    });

    const result = validateCSRF(request, { trustedOrigins });
    // This expectation should FAIL with the current vulnerable code
    expect(result.valid).toBe(false);
  });

  it('should correctly handle normalized origins with trailing slashes', () => {
    const trustedOrigins = ['https://myapp.com/'];
    const request = new Request('https://myapp.com/api/action', {
      method: 'POST',
      headers: {
        'Origin': 'https://myapp.com'
      }
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should allow GET requests without origin validation', () => {
    const request = new Request('https://myapp.com/api/data', {
      method: 'GET'
    });

    const result = validateCSRF(request);
    expect(result.valid).toBe(true);
  });
});
