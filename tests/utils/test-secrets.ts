/**
 * Test Secrets Utility
 *
 * Centralized management of test secrets to prevent hardcoded credentials
 * in test files. All test secrets should be imported from this file.
 *
 * SECURITY BEST PRACTICES:
 * - Use MOCK_* constants for unit tests (no env vars required)
 * - Use ENV_* constants for integration tests (requires env vars)
 * - NEVER use real credentials in test files
 * - All mock values include 'MOCK_TEST_' prefix for easy identification
 *
 * ADDRESSES: Issue #841 - Hardcoded test secrets in test files pose security risk
 *
 * @see docs/security-engineer.md for security guidelines
 */

// ============================================================================
// MOCK SECRETS - Safe defaults for unit tests
// ============================================================================
// These values are intentionally fake and safe to use in any test file.
// They include clear markers to prevent confusion with real credentials.

/**
 * Mock secrets for unit testing.
 * These are safe, hardcoded test values that will never be real credentials.
 * Use these instead of scattering 'test-key' throughout test files.
 */
export const MOCK_SECRETS = {
  /** Mock OpenAI API key for testing */
  OPENAI_API_KEY: 'MOCK_TEST_OPENAI_KEY_NOT_REAL',

  /** Mock Supabase service role key for testing */
  SUPABASE_SERVICE_ROLE_KEY: 'MOCK_TEST_SUPABASE_SERVICE_KEY_NOT_REAL',

  /** Mock Supabase anon key for testing */
  SUPABASE_ANON_KEY: 'MOCK_TEST_SUPABASE_ANON_KEY_NOT_REAL',

  /** Mock Supabase URL for testing */
  SUPABASE_URL: 'https://MOCK_TEST.supabase.co',

  /** Mock Notion API key for testing */
  NOTION_API_KEY: 'MOCK_TEST_NOTION_KEY_NOT_REAL',

  /** Mock Trello API key for testing */
  TRELLO_API_KEY: 'MOCK_TEST_TRELLO_KEY_NOT_REAL',

  /** Mock Trello token for testing */
  TRELLO_TOKEN: 'MOCK_TEST_TRELLO_TOKEN_NOT_REAL',

  /** Mock GitHub token for testing */
  GITHUB_TOKEN: 'MOCK_TEST_GITHUB_TOKEN_NOT_REAL',

  /** Mock Google client ID for testing */
  GOOGLE_CLIENT_ID: 'MOCK_TEST_GOOGLE_CLIENT_ID_NOT_REAL',

  /** Mock Google client secret for testing */
  GOOGLE_CLIENT_SECRET: 'MOCK_TEST_GOOGLE_SECRET_NOT_REAL',

  /** Mock admin API key for testing */
  ADMIN_API_KEY: 'MOCK_TEST_ADMIN_KEY_NOT_REAL',

  /** Mock JWT token for testing */
  JWT_TOKEN: 'MOCK_TEST_JWT_TOKEN_NOT_REAL_XXXXX.YYYYY.ZZZZZ',

  /** Mock password for testing */
  PASSWORD: 'MOCK_TEST_PASSWORD_NOT_REAL_123!',

  /** Generic mock API key for testing */
  API_KEY: 'MOCK_TEST_API_KEY_NOT_REAL',
} as const;

/**
 * Helper to set mock environment variables for a test
 * Usage: beforeEach(() => setMockEnvVars());
 */
export function setMockEnvVars(): void {
  process.env.OPENAI_API_KEY = MOCK_SECRETS.OPENAI_API_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY =
    MOCK_SECRETS.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = MOCK_SECRETS.SUPABASE_URL;
  process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
  process.env.TRELLO_API_KEY = MOCK_SECRETS.TRELLO_API_KEY;
  process.env.TRELLO_TOKEN = MOCK_SECRETS.TRELLO_TOKEN;
  process.env.GITHUB_TOKEN = MOCK_SECRETS.GITHUB_TOKEN;
  process.env.GOOGLE_CLIENT_ID = MOCK_SECRETS.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_SECRET = MOCK_SECRETS.GOOGLE_CLIENT_SECRET;
  process.env.ADMIN_API_KEY = MOCK_SECRETS.ADMIN_API_KEY;
}

// ============================================================================
// ENVIRONMENT-BASED SECRETS - For integration tests
// ============================================================================
// These require environment variables to be set and throw errors if missing.
// Use for integration tests that need real-like credential validation.

function getTestEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `TEST SETUP ERROR: Environment variable ${name} is required for testing.\n` +
        `Please set ${name} in your .env.test file or CI environment.\n` +
        `Use dummy/test values only - NEVER use real credentials.`
    );
  }
  return value;
}

// Test API Keys - Must be set via environment variables
export const TEST_API_KEY_OPENAI = getTestEnvVar('TEST_API_KEY_OPENAI');

export const TEST_API_KEY_GENERIC = getTestEnvVar('TEST_API_KEY_GENERIC');

export const TEST_API_KEY_SHORT = getTestEnvVar('TEST_API_KEY_SHORT');

export const TEST_API_KEY_LONG = getTestEnvVar('TEST_API_KEY_LONG');

// Test JWT Token - Must be set via environment variables
export const TEST_JWT_TOKEN = getTestEnvVar('TEST_JWT_TOKEN');

// Test Passwords - Must be set via environment variables
export const TEST_PASSWORD = getTestEnvVar('TEST_PASSWORD');

export const TEST_PASSWORD_SIMPLE = getTestEnvVar('TEST_PASSWORD_SIMPLE');

// Test Service Credentials - Must be set via environment variables
export const TEST_NOTION_API_KEY = getTestEnvVar('TEST_NOTION_API_KEY');

export const TEST_GITHUB_TOKEN = getTestEnvVar('TEST_GITHUB_TOKEN');

export const TEST_TRELLO_API_KEY = getTestEnvVar('TEST_TRELLO_API_KEY');

export const TEST_TRELLO_TOKEN = getTestEnvVar('TEST_TRELLO_TOKEN');

// Test OAuth Credentials - Must be set via environment variables
export const TEST_GOOGLE_CLIENT_ID = getTestEnvVar('TEST_GOOGLE_CLIENT_ID');

export const TEST_GOOGLE_CLIENT_SECRET = getTestEnvVar(
  'TEST_GOOGLE_CLIENT_SECRET'
);

// Test Supabase Credentials - Must be set via environment variables
export const TEST_SUPABASE_URL = getTestEnvVar('TEST_SUPABASE_URL');

export const TEST_SUPABASE_ANON_KEY = getTestEnvVar('TEST_SUPABASE_ANON_KEY');

export const TEST_SUPABASE_SERVICE_KEY = getTestEnvVar(
  'TEST_SUPABASE_SERVICE_KEY'
);

/**
 * Validates that test secrets are not real credentials
 * This is a safety check to prevent accidental commit of real secrets
 */
export function validateTestSecrets(): void {
  const secrets = {
    TEST_API_KEY_OPENAI,
    TEST_API_KEY_GENERIC,
    TEST_JWT_TOKEN,
    TEST_PASSWORD,
    TEST_NOTION_API_KEY,
    TEST_GITHUB_TOKEN,
  };

  for (const [name, value] of Object.entries(secrets)) {
    // Check that test secrets contain markers indicating they're fake
    const hasTestMarker =
      /test|TEST|NOT.?REAL|fake|FAKE|dummy|DUMMY|mock|MOCK/i.test(value);
    const looksLikeRealSecret =
      /sk-[a-zA-Z0-9]{48}/.test(value) ||
      /gh[pousr]_[a-zA-Z0-9]{36}/.test(value);

    if (looksLikeRealSecret && !hasTestMarker) {
      throw new Error(
        `SECURITY ERROR: ${name} appears to be a real credential! ` +
          `Test secrets must contain 'TEST', 'NOT REAL', or 'FAKE' markers. ` +
          `If this is intentional, set the corresponding environment variable.`
      );
    }
  }
}

/**
 * Helper to create a test object with sensitive fields
 * Useful for PII redaction tests
 */
export function createTestSensitiveObject(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id: 'user_123',
    user: {
      name: 'Test User',
      email: 'test.user@example.com',
      phone: '555-TEST-PHONE',
    },
    credentials: {
      apiKey: TEST_API_KEY_OPENAI,
      token: TEST_JWT_TOKEN,
      password: TEST_PASSWORD,
    },
    metadata: {
      ip_address: '192.168.TEST.1',
      tags: ['test', 'mock'],
    },
    ...overrides,
  };
}
