import { validateCSRF, CSRF_CONFIG } from '@/lib/security/csrf';

describe('CSRF Protection', () => {
  const originalEnabled = CSRF_CONFIG.ENABLED;

  beforeAll(() => {
    // CSRF protection is usually disabled in tests, so we force enable it
    // Use type assertion to modify read-only property for testing
    (CSRF_CONFIG as any).ENABLED = true;
  });

  afterAll(() => {
    (CSRF_CONFIG as any).ENABLED = originalEnabled;
  });

  it('should allow exact trusted origin matches', () => {
    const trustedOrigins = ['https://app.example.com'];
    const request = new Request('https://app.example.com/api/data', {
      method: 'POST',
      headers: {
        'Origin': 'https://app.example.com',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should block malicious subdomains on same platform (Vercel)', () => {
    const trustedOrigins = ['https://my-app.vercel.app'];
    const request = new Request('https://my-app.vercel.app/api/data', {
      method: 'POST',
      headers: {
        'Origin': 'https://attacker.vercel.app',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(false);
  });

  it('should block malicious subdomains on same platform (Cloudflare)', () => {
    const trustedOrigins = ['https://my-app.pages.dev'];
    const request = new Request('https://my-app.pages.dev/api/data', {
      method: 'POST',
      headers: {
        'Origin': 'https://attacker.pages.dev',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(false);
  });

  it('should block unauthorized external origins', () => {
    const trustedOrigins = ['https://app.example.com'];
    const request = new Request('https://app.example.com/api/data', {
      method: 'POST',
      headers: {
        'Origin': 'https://malicious.com',
      },
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(false);
  });

  it('should allow requests from the same origin when no Origin header is present', () => {
    const trustedOrigins = ['https://app.example.com'];
    const request = new Request('https://app.example.com/api/data', {
      method: 'POST',
      // No Origin or Referer header
    });

    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });
});
