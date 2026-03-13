import { validateCSRF, CSRF_CONFIG } from '@/lib/security/csrf';
import { APP_CONFIG } from '@/lib/config/app';

describe('CSRF Protection Security', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // CSRF is disabled in 'test' mode by default in CSRF_CONFIG
    // We need to ensure it's enabled for these tests
    // @ts-ignore
    CSRF_CONFIG.ENABLED = true;
  });

  afterAll(() => {
    // @ts-ignore
    CSRF_CONFIG.ENABLED = originalEnv !== 'test';
  });

  it('should allow trusted origins', () => {
    const trustedOrigin = APP_CONFIG.URLS.BASE;
    const request = new Request('https://api.ideaflow.com/api/ideas', {
      method: 'POST',
      headers: {
        'origin': trustedOrigin
      }
    });

    const result = validateCSRF(request);
    expect(result.valid).toBe(true);
  });

  it('should block untrusted origins', () => {
    const request = new Request('https://api.ideaflow.com/api/ideas', {
      method: 'POST',
      headers: {
        'origin': 'https://evil.com'
      }
    });

    const result = validateCSRF(request);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid origin header');
  });

  it('VULNERABILITY REPRODUCTION: should NOT allow untrusted subdomains on same platform', () => {
    // This test currently FAILS (returns valid: true) because of the broad suffix matching
    // We want it to be FALSE after our fix

    const platformTrustedOrigin = 'https://myapp.vercel.app';
    const maliciousSubdomain = 'https://attacker.vercel.app';

    const request = new Request('https://myapp.vercel.app/api/ideas', {
      method: 'POST',
      headers: {
        'origin': maliciousSubdomain
      }
    });

    // Mocking trusted origins to include a vercel.app one
    const result = validateCSRF(request, {
      trustedOrigins: [platformTrustedOrigin]
    });

    // In the vulnerable version, this is TRUE
    // We want it to be FALSE
    expect(result.valid).toBe(false);
  });

  it('VULNERABILITY REPRODUCTION: should NOT allow untrusted Cloudflare subdomains', () => {
    const platformTrustedOrigin = 'https://myapp.pages.dev';
    const maliciousSubdomain = 'https://attacker.pages.dev';

    const request = new Request('https://myapp.pages.dev/api/ideas', {
      method: 'POST',
      headers: {
        'origin': maliciousSubdomain
      }
    });

    const result = validateCSRF(request, {
      trustedOrigins: [platformTrustedOrigin]
    });

    expect(result.valid).toBe(false);
  });
});
