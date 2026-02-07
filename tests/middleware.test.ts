import { middleware, config } from '../src/middleware';

// Mock NextResponse
jest.mock('next/server', () => {
  class MockHeaders {
    private headers = new Map<string, string>();
    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }
    get(name: string) {
      return this.headers.get(name.toLowerCase());
    }
  }

  return {
    NextResponse: {
      next: jest.fn().mockImplementation(() => ({
        headers: new MockHeaders(),
      })),
    },
  };
});

describe('middleware - unit tests for internal logic', () => {
  describe('CSP header construction', () => {
    it('should build CSP with correct directives', () => {
      const response = middleware();
      const cspHeader = response.headers.get('Content-Security-Policy') || '';

      expect(cspHeader).toBeDefined();
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self' 'unsafe-inline' https://vercel.live");
      expect(cspHeader).not.toContain('unsafe-eval');
    });
  });

  describe('Security header values', () => {
    it('should have correct X-Frame-Options', () => {
      const response = middleware();
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should have correct X-Content-Type-Options', () => {
      const response = middleware();
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should have correct X-XSS-Protection', () => {
      const response = middleware();
      expect(response.headers.get('X-XSS-Protection')).toBe('0');
    });

    it('should have correct Referrer-Policy', () => {
      const response = middleware();
      expect(response.headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin'
      );
    });

    it('should have correct Permissions-Policy', () => {
      const response = middleware();
      const permissionsPolicy = response.headers.get('Permissions-Policy') || '';
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=()');
    });

    it('should have correct HSTS for production (when NODE_ENV is production)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const prodResponse = middleware();
      expect(prodResponse.headers.get('Strict-Transport-Security')).toContain(
        'max-age=31536000'
      );
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Middleware configuration', () => {
    it('should have correct matcher pattern', () => {
      const matcher = config.matcher[0];

      expect(matcher).not.toContain('?!api');
      expect(matcher).toContain('_next/static');
      expect(matcher).toContain('_next/image');
      expect(matcher).toContain('favicon.ico');
    });
  });
});
