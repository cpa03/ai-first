/**
 * Tests for Configuration Validator
 * Target: Increase coverage to 80%+
 */

import {
  validateConfiguration,
  validateConfigurationOrThrow,
  isConfigurationHealthy,
} from '@/lib/config/config-validator';

// Mock dependencies
jest.mock('@/lib/config/app', () => ({
  APP_CONFIG: {
    NAME: 'IdeaFlow',
    VERSION: '1.0.0',
    DESCRIPTION: 'Turn ideas into actionable plans',
    URLS: {
      BASE: 'https://ideaflow.app',
    },
    PAGINATION: {
      DEFAULT_LIMIT: 50,
      MIN_LIMIT: 10,
      MAX_LIMIT: 100,
    },
    ENV_VARS: {
      REQUIRED: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
      AI_PROVIDERS: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
    },
  },
}));

jest.mock('@/lib/config/constants', () => ({
  TIMEOUT_CONFIG: {
    DEFAULT: 30000,
    QUICK: 5000,
    STANDARD: 15000,
    LONG: 60000,
    TRELLO: {
      CREATE_BOARD: 10000,
      CREATE_LIST: 8000,
      CREATE_CARD: 5000,
    },
    GITHUB: {
      GET_USER: 5000,
      CREATE_REPO: 30000,
    },
    NOTION: {
      CLIENT_TIMEOUT: 15000,
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('ConfigValidator', () => {
  describe('validateConfiguration', () => {
    it('should return valid result when all configs are valid', () => {
      // Set required environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'sk-test';

      const result = validateConfiguration();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors when required env vars are missing', () => {
      // Clear environment variables
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const result = validateConfiguration();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return warnings when no AI provider is configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const result = validateConfiguration();

      expect(result.warnings.some((w) => w.includes('AI provider'))).toBe(true);
    });

    it('should return errors and warnings correctly', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'sk-test';

      const result = validateConfiguration();

      // Valid config should have no errors
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('validateConfigurationOrThrow', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'sk-test';
    });

    it('should not throw when configuration is valid', () => {
      expect(() => validateConfigurationOrThrow()).not.toThrow();
    });

    it('should throw in production when configuration is invalid', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const originalEnv = (process.env as any).NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      expect(() => validateConfigurationOrThrow()).toThrow();
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should not throw in non-production when configuration is invalid', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const originalEnv = (process.env as any).NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      expect(() => validateConfigurationOrThrow()).not.toThrow();
      (process.env as any).NODE_ENV = originalEnv;
    });
  });

  describe('isConfigurationHealthy', () => {
    it('should return true when configuration is valid', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'sk-test';

      expect(isConfigurationHealthy()).toBe(true);
    });

    it('should return false when configuration is invalid', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      expect(isConfigurationHealthy()).toBe(false);
    });
  });
});
