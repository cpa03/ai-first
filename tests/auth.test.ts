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

      it('should return true when ADMIN_API_KEY is not set', async () => {
        const { isAdminAuthenticated } = require('@/lib/auth');
        const request = new Request('http://localhost/api/admin/test');
        const result = await isAdminAuthenticated(request);

        expect(result).toBe(true);
      });

      it('should return true even without credentials', async () => {
        const { isAdminAuthenticated } = require('@/lib/auth');
        const request = new Request('http://localhost/api/admin/test');
        const result = await isAdminAuthenticated(request);

        expect(result).toBe(true);
      });
    });

    describe('production mode', () => {
      beforeEach(() => {
        (process.env as any).NODE_ENV = 'production';
        process.env.ADMIN_API_KEY = 'test-admin-key-12345';
      });

      describe('Bearer token authentication', () => {
        it('should return true with valid Bearer token', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer test-admin-key-12345',
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(true);
        });

        it('should return false with invalid Bearer token', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer wrong-key',
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should return false with malformed Bearer token (no credentials)', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer',
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should handle Bearer token case-insensitively', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'bearer test-admin-key-12345',
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(true);
        });

        it('should return false with different scheme', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Basic test-admin-key-12345',
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should handle Authorization header with multiple spaces', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: 'Bearer  test-admin-key-12345',
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should return false with extremely long token (DoS prevention)', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const longToken = 'a'.repeat(1000);
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: `Bearer ${longToken}`,
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(false);
        });
      });

      describe('No authentication provided', () => {
        it('should return false when no Authorization header', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test');
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(false);
        });

        it('should return false when Authorization header is empty', async () => {
          const { isAdminAuthenticated } = require('@/lib/auth');
          const request = new Request('http://localhost/api/admin/test', {
            headers: {
              Authorization: '',
            },
          });
          const result = await isAdminAuthenticated(request);

          expect(result).toBe(false);
        });
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        (process.env as any).NODE_ENV = 'production';
        process.env.ADMIN_API_KEY = 'test-key-with-special-chars!@#$%';
      });

      it('should handle API keys with special characters', async () => {
        const { isAdminAuthenticated } = require('@/lib/auth');
        const request = new Request('http://localhost/api/admin/test', {
          headers: {
            Authorization: 'Bearer test-key-with-special-chars!@#$%',
          },
        });
        const result = await isAdminAuthenticated(request);

        expect(result).toBe(true);
      });

    });
  });

  describe('requireAdminAuth', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.ADMIN_API_KEY = 'test-admin-key';
    });

    it('should throw error when not authenticated', async () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      await expect(requireAdminAuth(request)).rejects.toThrow();
    });

    it('should throw error with AUTHENTICATION_ERROR code', async () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      await expect(requireAdminAuth(request)).rejects.toMatchObject({
        code: ErrorCode.AUTHENTICATION_ERROR,
      });
    });

    it('should throw error with 401 status code', async () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      await expect(requireAdminAuth(request)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw error with descriptive message', async () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      await expect(requireAdminAuth(request)).rejects.toMatchObject({
        message: expect.stringContaining('Unauthorized'),
      });
    });

    it('should not throw when authenticated with Bearer token', async () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test', {
        headers: {
          Authorization: 'Bearer test-admin-key',
        },
      });

      await expect(requireAdminAuth(request)).resolves.not.toThrow();
    });


    it('should handle empty request gracefully', async () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      await expect(requireAdminAuth(request)).rejects.toThrow();
    });
  });

  describe('development mode bypass', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      delete process.env.ADMIN_API_KEY;
    });

    it('should not throw in development mode without API key', async () => {
      const { requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test');

      await expect(requireAdminAuth(request)).resolves.not.toThrow();
    });

    it('should allow all requests in development mode', async () => {
      const { isAdminAuthenticated, requireAdminAuth } = require('@/lib/auth');
      const request = new Request('http://localhost/api/admin/test', {
        headers: {
          Authorization: 'Bearer any-random-key',
        },
      });

      expect(await isAdminAuthenticated(request)).toBe(true);
      await expect(requireAdminAuth(request)).resolves.not.toThrow();
    });
  });
});
