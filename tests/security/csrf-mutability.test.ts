import { CSRF_CONFIG, validateCSRF } from '@/lib/security/csrf';

describe('CSRF_CONFIG mutability', () => {
  const originalEnabled = CSRF_CONFIG.ENABLED;

  beforeAll(() => {
    // Manually enable CSRF for testing as it's disabled in 'test' env by default
    (CSRF_CONFIG as Record<string, unknown>).ENABLED = true;
  });

  afterAll(() => {
    (CSRF_CONFIG as Record<string, unknown>).ENABLED = originalEnabled;
  });

  it('should not allow external mutation of TRUSTED_ORIGINS', () => {
    const originalOrigins = [...CSRF_CONFIG.TRUSTED_ORIGINS];
    const origins = CSRF_CONFIG.TRUSTED_ORIGINS;

    // Attempt to mutate the returned array
    origins.push('https://malicious-site.com');

    // The internal list should remain unchanged
    expect(CSRF_CONFIG.TRUSTED_ORIGINS).toEqual(originalOrigins);
    expect(CSRF_CONFIG.TRUSTED_ORIGINS).not.toContain('https://malicious-site.com');
  });

  it('should verify that mutation does not affect validation', () => {
    const origins = CSRF_CONFIG.TRUSTED_ORIGINS;
    origins.push('https://attacker.com');

    const request = new Request('https://api.example.com/data', {
      method: 'POST',
      headers: {
        'origin': 'https://attacker.com'
      }
    });

    const result = validateCSRF(request);

    // It should still be invalid because the internal Set used for validation
    // was not (and should not be) affected by the push to the copy.
    expect(result.valid).toBe(false);
  });
});
