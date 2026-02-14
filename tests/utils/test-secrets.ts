/**
 * Test Secrets Utility
 *
 * Centralized management of test secrets to prevent hardcoded credentials
 * in test files. All test secrets should be imported from this file.
 *
 * SECURITY NOTICE:
 * - These are TEST-ONLY values used for testing PII redaction and security features
 * - They are intentionally fake and clearly marked as test data
 * - Real credentials should NEVER be added to this file
 * - In CI environments, these can be overridden via environment variables
 */

// Test API Keys - Fake values for testing redaction patterns
export const TEST_API_KEY_OPENAI =
  process.env.TEST_API_KEY_OPENAI ||
  'sk-test-1234567890abcdef-NOT-REAL-KEY-FOR-TESTING-ONLY';

export const TEST_API_KEY_GENERIC =
  process.env.TEST_API_KEY_GENERIC || 'test-api-key-NOT-REAL-12345';

export const TEST_API_KEY_SHORT =
  process.env.TEST_API_KEY_SHORT || 'sk-test-12345';

export const TEST_API_KEY_LONG =
  process.env.TEST_API_KEY_LONG ||
  'very_long_api_key_string_here_TEST_ONLY_NOT_REAL';

// Test JWT Token - Fake token for testing (decodes to test payload)
export const TEST_JWT_TOKEN =
  process.env.TEST_JWT_TOKEN ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.TEST_SIGNATURE_ONLY_NOT_REAL';

// Test Passwords - Fake passwords for testing redaction
export const TEST_PASSWORD =
  process.env.TEST_PASSWORD || 'test-password-123-NOT-REAL';

export const TEST_PASSWORD_SIMPLE =
  process.env.TEST_PASSWORD_SIMPLE || 'secret_password_TEST_ONLY';

// Test Service Credentials
export const TEST_NOTION_API_KEY =
  process.env.TEST_NOTION_API_KEY || 'test-notion-key-NOT-REAL';

export const TEST_GITHUB_TOKEN =
  process.env.TEST_GITHUB_TOKEN || 'test-github-token-NOT-REAL';

export const TEST_TRELLO_API_KEY =
  process.env.TEST_TRELLO_API_KEY || 'test-trello-key-NOT-REAL';

export const TEST_TRELLO_TOKEN =
  process.env.TEST_TRELLO_TOKEN || 'test-trello-token-NOT-REAL';

// Test OAuth Credentials
export const TEST_GOOGLE_CLIENT_ID =
  process.env.TEST_GOOGLE_CLIENT_ID ||
  'test-google-client-id-NOT-REAL.apps.googleusercontent.com';

export const TEST_GOOGLE_CLIENT_SECRET =
  process.env.TEST_GOOGLE_CLIENT_SECRET || 'test-google-client-secret-NOT-REAL';

// Test Supabase Credentials
export const TEST_SUPABASE_URL =
  process.env.TEST_SUPABASE_URL || 'https://test-project.supabase.co';

export const TEST_SUPABASE_ANON_KEY =
  process.env.TEST_SUPABASE_ANON_KEY || 'test-supabase-anon-key-NOT-REAL';

export const TEST_SUPABASE_SERVICE_KEY =
  process.env.TEST_SUPABASE_SERVICE_KEY || 'test-supabase-service-key-NOT-REAL';

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
    const hasTestMarker = /test|TEST|NOT.?REAL|fake|FAKE/i.test(value);
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
