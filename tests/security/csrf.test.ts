import { validateCSRF, CSRF_CONFIG } from '@/lib/security/csrf';

describe('CSRF Validation', () => {
  const trustedOrigins = ['https://ideaflow.vercel.app', 'https://ideaflow.pages.dev'];

  beforeAll(() => {
    // @ts-ignore
    CSRF_CONFIG.ENABLED = true;
  });

  afterAll(() => {
    // @ts-ignore
    CSRF_CONFIG.ENABLED = process.env.NODE_ENV !== 'test';
  });

  it('should accept exact matches', () => {
    const request = new Request('https://ideaflow.vercel.app/api/ideas', {
      method: 'POST',
      headers: { 'Origin': 'https://ideaflow.vercel.app' }
    });
    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should reject malicious subdomains', () => {
    const request = new Request('https://ideaflow.vercel.app/api/ideas', {
      method: 'POST',
      headers: { 'Origin': 'https://attacker-app.vercel.app' }
    });
    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(false);
  });

  it('should reject malicious pages.dev subdomains', () => {
    const request = new Request('https://ideaflow.vercel.app/api/ideas', {
      method: 'POST',
      headers: { 'Origin': 'https://attacker.pages.dev' }
    });
    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(false);
  });

  it('should handle trailing slashes in origin', () => {
    const request = new Request('https://ideaflow.vercel.app/api/ideas', {
      method: 'POST',
      headers: { 'Origin': 'https://ideaflow.vercel.app/' }
    });
    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should handle uppercase origins', () => {
    const request = new Request('https://ideaflow.vercel.app/api/ideas', {
      method: 'POST',
      headers: { 'Origin': 'HTTPS://IDEAFLOW.VERCEL.APP' }
    });
    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });

  it('should accept when no origin/referer but method is state-changing (fail-open for non-browser)', () => {
    const request = new Request('https://ideaflow.vercel.app/api/ideas', {
      method: 'POST'
    });
    const result = validateCSRF(request, { trustedOrigins });
    expect(result.valid).toBe(true);
  });
});
