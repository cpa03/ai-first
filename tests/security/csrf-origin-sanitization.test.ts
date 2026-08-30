import { CSRF_CONFIG, validateCSRF } from '@/lib/security/csrf';

describe('CSRF Origin Sanitization & Validation', () => {
  const originalEnabled = CSRF_CONFIG.ENABLED;

  beforeAll(() => {
    (CSRF_CONFIG as Record<string, unknown>).ENABLED = true;
  });

  afterAll(() => {
    (CSRF_CONFIG as Record<string, unknown>).ENABLED = originalEnabled;
  });

  it('rejects origin header containing CRLF characters', () => {
    const request = new Request('https://api.example.com/data', {
      method: 'POST',
    });
    jest.spyOn(request.headers, 'get').mockImplementation((headerName: string) => {
      if (headerName.toLowerCase() === 'origin') {
        return 'https://attacker.com\r\nSet-Cookie: session=stolen';
      }
      return null;
    });

    const result = validateCSRF(request, {
      trustedOrigins: ['https://api.example.com'],
    });

    expect(result.valid).toBe(false);
    expect(result.origin).toBeUndefined();
  });

  it('rejects origin header containing null bytes or control characters', () => {
    const request = new Request('https://api.example.com/data', {
      method: 'POST',
    });
    jest.spyOn(request.headers, 'get').mockImplementation((headerName: string) => {
      if (headerName.toLowerCase() === 'origin') {
        return 'https://attacker.com\x00/path';
      }
      return null;
    });

    const result = validateCSRF(request, {
      trustedOrigins: ['https://api.example.com'],
    });

    expect(result.valid).toBe(false);
    expect(result.origin).toBeUndefined();
  });

  it('rejects referer header containing CRLF injection', () => {
    const request = new Request('https://api.example.com/data', {
      method: 'POST',
    });
    jest.spyOn(request.headers, 'get').mockImplementation((headerName: string) => {
      if (headerName.toLowerCase() === 'referer') {
        return 'https://attacker.com\r\nHost: malicious.com';
      }
      return null;
    });

    const result = validateCSRF(request, {
      trustedOrigins: ['https://api.example.com'],
    });

    expect(result.valid).toBe(false);
    expect(result.origin).toBeUndefined();
  });

  it('correctly validates clean valid trusted origin', () => {
    const request = new Request('https://api.example.com/data', {
      method: 'POST',
      headers: {
        origin: 'https://api.example.com',
      },
    });

    const result = validateCSRF(request, {
      trustedOrigins: ['https://api.example.com'],
    });

    expect(result.valid).toBe(true);
    expect(result.origin).toBe('https://api.example.com');
  });

  it('extracts origin cleanly from valid referer header', () => {
    const request = new Request('https://api.example.com/data', {
      method: 'POST',
      headers: {
        referer: 'https://api.example.com/dashboard/page',
      },
    });

    const result = validateCSRF(request, {
      trustedOrigins: ['https://api.example.com'],
    });

    expect(result.valid).toBe(true);
    expect(result.origin).toBe('https://api.example.com');
  });
});
