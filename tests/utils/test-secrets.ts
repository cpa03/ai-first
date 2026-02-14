/**
 * Test Secrets Utility
 *
 * Centralized management of test secrets to prevent hardcoded credentials
 * in test files. All test secrets should be imported from this file.
 *
 * SECURITY NOTICE:
 * - These values MUST be set via environment variables
 * - NO hardcoded fallback values are provided
 * - Tests will fail if environment variables are not configured
 * - In CI environments, set these via repository secrets
 */

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
