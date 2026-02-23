/**
 * Tests for isSensitiveVar utility
 * @module tests/security/is-sensitive-var.test
 */

import { isSensitiveVar } from '@/lib/security/env-validation';

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
