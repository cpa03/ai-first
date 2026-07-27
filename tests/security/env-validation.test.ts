/**
 * Tests for environment validation module
 * @module tests/security/env-validation.test
 */

import {
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

    it('should detect NEXT_PUBLIC_ prefix on new sensitive keys', () => {
      process.env.NEXT_PUBLIC_INTERNAL_API_SECRET = 'exposed-secret';
      process.env.NEXT_PUBLIC_JWT_SECRET = 'exposed-jwt-secret';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateEnvironment();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('NEXT_PUBLIC_INTERNAL_API_SECRET'))
      ).toBe(true);
      expect(
        result.errors.some((e) => e.includes('NEXT_PUBLIC_JWT_SECRET'))
      ).toBe(true);
    });

    it('should detect missing required variables', () => {
      // Ensure CI mode doesn't skip validation
      delete process.env.CI;
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

    it('should detect NEXT_PUBLIC_ prefix on integration keys', () => {
      process.env.NEXT_PUBLIC_NOTION_API_KEY = 'notion-exposed';
      process.env.NEXT_PUBLIC_GITHUB_TOKEN = 'github-exposed';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateEnvironment();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('NEXT_PUBLIC_NOTION_API_KEY'))
      ).toBe(true);
      expect(
        result.errors.some((e) => e.includes('NEXT_PUBLIC_GITHUB_TOKEN'))
      ).toBe(true);
    });

    it('should warn about placeholders and weak strength on integration keys outside development', () => {
      // Set to production to enable strength/complexity checks
      // NODE_ENV is read-only in Node.js types; use Object.defineProperty to bypass
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      process.env.NOTION_API_KEY = 'your_notion_key_here'; // placeholder + too short
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          (w) => w.includes('NOTION_API_KEY') && w.includes('placeholder')
        )
      ).toBe(true);
      expect(
        result.warnings.some(
          (w) => w.includes('NOTION_API_KEY') && w.includes('too short')
        )
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
});
