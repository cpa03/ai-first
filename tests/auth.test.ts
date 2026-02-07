import { AppError, ErrorCode } from '@/lib/errors';

describe('auth', () => {
  let originalNodeEnv: string | undefined;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    originalApiKey = process.env.ADMIN_API_KEY;

    jest.resetModules();
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalNodeEnv;
    if (originalApiKey === undefined) {
      delete process.env.ADMIN_API_KEY;
    } else {
      process.env.ADMIN_API_KEY = originalApiKey;
    }
    jest.resetModules();
  });

  describe('isAdminAuthenticated', () => {
    describe('development mode', () => {
      beforeEach(() => {
        (process.env as any).NODE_ENV = 'development';
        delete process.env.ADMIN_API_KEY;
      });

      it('should return true when ADMIN_API_KEY is not set', () => {
        const { isAdminAuthenticated } = require('@/lib/auth');
        const request = new Request('http://localhost/api/admin/test');
        const result = isAdminAuthenticated(request);

        expect(result).toBe(true);
      });

      it('should return true even without credentials', () => {
        const { isAdminAuthenticated } = require('@/lib/auth');
        const request = new Request('http://localhost/api/admin/test');
        const result = isAdminAuthenticated(request);

        expect(result).toBe(true);
      });
    });

    describe('production mode', () => {
      beforeEach(() => {
        (process.env as any).NODE_ENV = 'production';
        process.env.ADMIN_API_KEY = 'test-admin-key-12345';
      });

      describe('Bearer token authentication', () => {
        it('should return true with valid Bearer token', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer test-admin-key-12345',
            },
          });
          const result = isAdminAuthenticated(request);

          expect(result).toBe(true);
        });

        it('should return false with invalid Bearer token', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer wrong-key',
            },
          });
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should return false with malformed Bearer token (no credentials)', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer',
            },
          });
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should handle Bearer token case-insensitively', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'bearer test-admin-key-12345',
            },
          });
          const result = isAdminAuthenticated(request);

          expect(result).toBe(true);
        });

        it('should return false with different scheme', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Basic test-admin-key-12345',
            },
          });
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should handle Authorization header with multiple spaces', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer  test-admin-key-12345',
            },
          });
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });
      });

      describe('Query parameter authentication', () => {
        it('should return true with valid admin_key query parameter', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request(
            'http://localhost/api/admin/test?admin_key=test-admin-key-12345'
          );
          const result = isAdminAuthenticated(request);

          expect(result).toBe(true);
        });

        it('should return false with invalid admin_key query parameter', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request(
            'http://localhost/api/admin/test?admin_key=wrong-key'
          );
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should return false with empty admin_key query parameter', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request(
            'http://localhost/api/admin/test?admin_key='
          );
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });
      });

      describe('Multiple authentication methods', () => {
        it('should accept valid Bearer token even with admin_key query param', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request(
            'http://localhost/api/admin/test?admin_key=wrong-key',
            {
              headers: {
                Authorization: 'Bearer test-admin-key-12345',
              },
            }
          );
          const result = isAdminAuthenticated(request);

          expect(result).toBe(true);
        });

        it('should return false with valid admin_key but invalid Authorization header', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request(
            'http://localhost/api/admin/test?admin_key=test-admin-key-12345',
            {
              headers: {
                Authorization: 'Bearer wrong-key',
              },
            }
          );
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });
      });

      describe('No authentication provided', () => {
        it('should return false when no Authorization header or admin_key', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test');
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should return false when Authorization header is empty', () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: '',
            },
          });
          const result = isAdminAuthenticated(request);

          expect(result).toBe(false);
        });
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        (process.env as any).NODE_ENV = 'production';
        process.env.ADMIN_API_KEY = 'test-key-with-special-chars!@#$%';
      });

      it('should handle API keys with special characters', () => {
        const { isAdminAuthenticated } = require('@/lib/auth');
        const request = new Request('http://localhost/api/admin/test', {
          headers: {
            Authorization: 'Bearer test-key-with-special-chars!@#$%',
          },
        });
        const result = isAdminAuthenticated(request);

        expect(result).toBe(true);
      });

      it('should handle URL encoding in query parameter', () => {
        const { isAdminAuthenticated } = require('@/lib/auth');
        const request = new Request(
          'http://localhost/api/admin/test?admin_key=test-key-with-special-chars%21%40%23%24%25'
        );
        const result = isAdminAuthenticated(request);

        expect(result).toBe(true);
      });
    });
  });

  describe('requireAdminAuth', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.ADMIN_API_KEY = 'test-admin-key';
    });

    it('should throw error when not authenticated', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      expect(() => requireAdminAuth(request)).toThrow();
    });

    it('should throw error with AUTHENTICATION_ERROR code', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      expect(() => requireAdminAuth(request)).toThrow(
        expect.objectContaining({
          code: ErrorCode.AUTHENTICATION_ERROR,
        })
      );
    });

    it('should throw error with 401 status code', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      expect(() => requireAdminAuth(request)).toThrow(
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });

    it('should throw error with descriptive message', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      expect(() => requireAdminAuth(request)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Unauthorized'),
        })
      );
    });

    it('should not throw when authenticated with Bearer token', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test', {
        headers: {
          Authorization: 'Bearer test-admin-key',
        },
      });

      expect(() => requireAdminAuth(request)).not.toThrow();
    });

    it('should not throw when authenticated with admin_key', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request(
        'http://localhost/api/admin/test?admin_key=test-admin-key'
      );

      expect(() => requireAdminAuth(request)).not.toThrow();
    });

    it('should handle empty request gracefully', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      expect(() => requireAdminAuth(request)).toThrow();
    });
  });

  describe('development mode bypass', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      delete process.env.ADMIN_API_KEY;
    });

    it('should not throw in development mode without API key', () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      expect(() => requireAdminAuth(request)).not.toThrow();
    });

    it('should allow all requests in development mode', () => {
      const { isAdminAuthenticated, requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test', {
        headers: {
          Authorization: 'Bearer any-random-key',
        },
      });

      expect(isAdminAuthenticated(request)).toBe(true);
      expect(() => requireAdminAuth(request)).not.toThrow();
    });
  });
});
