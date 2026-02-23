/**
 * Tests for environment validation module
 * @module tests/security/env-validation.test
 */

import {
  isSensitiveVar,
  validateEnvironment,
  validateEnvironmentStrict,
  checkNoPublicPrefix,
} from '@/lib/security/env-validation';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should pass with valid configuration', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY =
        'test-service-role-key-with-minimum-length';

      const result = validateEnvironment();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect NEXT_PUBLIC_ prefix on sensitive keys', () => {
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'exposed-key';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateEnvironment();

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')
      );
    });

    it('should detect missing required variables', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateEnvironment();

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('SUPABASE_SERVICE_ROLE_KEY')
      );
    });

    it('should warn about placeholder values', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'your_service_role_key_here';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          (w) => w.includes('placeholder') || w.includes('example')
        )
      ).toBe(true);
    });

    it('should warn about suspiciously short keys', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'short';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateEnvironment();

      expect(
        result.warnings.some((w) => w.includes('suspiciously short'))
      ).toBe(true);
    });
  });

  describe('validateEnvironmentStrict', () => {
    it('should throw on critical errors', () => {
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'exposed-key';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      expect(() => validateEnvironmentStrict()).toThrow(
        'ENVIRONMENT VALIDATION FAILED'
      );
    });

    it('should not throw when valid', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY =
        'test-service-role-key-with-minimum-length';

      expect(() => validateEnvironmentStrict()).not.toThrow();
    });
  });

  describe('checkNoPublicPrefix', () => {
    it('should return true when no violations', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.NEXT_PUBLIC_ADMIN_API_KEY;

      expect(checkNoPublicPrefix()).toBe(true);
    });

    it('should return false when violations exist', () => {
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'exposed';

      expect(checkNoPublicPrefix()).toBe(false);
    });
  });

  describe('isSensitiveVar', () => {
    const sensitiveVars = [
      'API_KEY',
      'DB_PASSWORD',
      'STRIPE_SECRET',
      'AUTH_TOKEN',
      'CSRF_TOKEN',
      'XSRF_TOKEN',
      'SESSION_COOKIE',
      'MFA_OTP',
      'JWT_NONCE',
      'CARD_CVV',
      'CARD_CVC',
      'USER_PIN',
      'BANK_SWIFT',
      'BANK_BIC',
      'USER_TAXID',
      'USER_NINO',
      'USER_PASSPORT',
      'DRIVERS_LICENSE',
      'USER_LICENCE',
      'DB_CONNECTION_STRING',
      'USER_EMAIL',
      'USER_PHONE',
      'CREDIT_CARD_NUMBER',
      'CLIENT_IP_ADDRESS',
      'BEARER_TOKEN',
      'ERROR_STACK',
    ];

    const nonSensitiveVars = [
      'APP_NAME',
      'VERSION',
      'NODE_ENV',
      'LOG_LEVEL',
      'NEXT_PUBLIC_APP_URL',
      'PAGINATION_LIMIT',
      'UI_THEME',
    ];

    it('should identify sensitive variables correctly', () => {
      sensitiveVars.forEach((varName) => {
        expect(isSensitiveVar(varName)).toBe(true);
      });
    });

    it('should identify non-sensitive variables correctly', () => {
      nonSensitiveVars.forEach((varName) => {
        expect(isSensitiveVar(varName)).toBe(false);
      });
    });

    it('should be case-insensitive', () => {
      expect(isSensitiveVar('api_key')).toBe(true);
      expect(isSensitiveVar('SecretToken')).toBe(true);
    });
  });
});
