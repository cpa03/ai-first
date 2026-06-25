/**
 * PII Redaction Configuration Module
 *
 * Centralizes configuration for PII (Personally Identifiable Information) redaction.
 * Extracted from constants.ts to improve modularity.
 *
 * @module lib/config/pii-redaction-config
 */

export const PII_REDACTION_CONFIG = {
  /**
   * Redaction labels for different PII types
   */
  REDACTION_LABELS: {
    JWT: '[REDACTED_TOKEN]',
    URL_WITH_CREDENTIALS: '[REDACTED_URL]',
    EMAIL: '[REDACTED_EMAIL]',
    PHONE: '[REDACTED_PHONE]',
    SSN: '[REDACTED_SSN]',
    CREDIT_CARD: '[REDACTED_CARD]',
    IP_ADDRESS: '[REDACTED_IP]',
    API_KEY: '[REDACTED_API_KEY]',
    PASSPORT: '[REDACTED_PASSPORT]',
    DRIVERS_LICENSE: '[REDACTED_LICENSE]',
  } as const,

  /**
   * Private IP address ranges
   */
  PRIVATE_IP_RANGES: {
    LOOPBACK: ['127'],
    PRIVATE_CLASS_A: ['10'],
    PRIVATE_CLASS_B: ['172'],
    PRIVATE_CLASS_C: ['192', '168'],
  } as const,

  /**
   * API key prefixes for regex patterns
   */
  API_KEY_PREFIXES: [
    'api[-_ ]?key',
    'apikey',
    'secret',
    'token',
    'credential',
    'auth',
    'authorization',
    'admin[-_ ]?key',
    'adminkey',
    'password',
    'passphrase',
    'bearer',
    'access[-_ ]?key',
    'signature',
    'salt',
    'hmac',
    'webhook',
    'oauth',
    'cert',
    'pwd',
    // Additional banking/financial patterns (Issue #1171 security hardening)
    'iban',
    'swift',
    'bic',
    // Tax/identification patterns
    'tax[-_ ]?id',
    'nino',
    'ni[-_ ]?number',
    // License patterns
    'license',
    'licence',
  ] as const,

  /**
   * Safe fields that should not be redacted
   */
  SAFE_FIELDS: [
    'id',
    'created_at',
    'updated_at',
    'status',
    'priority',
    'estimate_hours',
  ] as const,

  /**
   * Minimum string length to check for PII patterns
   * Strings shorter than this are returned unchanged for performance
   * NOTE: Not environment-configurable as this is a performance optimization
   */
  MIN_LENGTH_FOR_PII_CHECK: 4,

  /**
   * Minimum lengths for various PII types to avoid running regex on short strings
   */
  MIN_LENGTHS: {
    EMAIL: 6,
    PHONE: 10,
    SSN: 11,
    CREDIT_CARD: 13,
    IP_ADDRESS: 7,
    API_KEY: 8,
    JWT: 40,
    URL_WITH_CREDENTIALS: 15,
    PASSPORT: 6,
    DRIVERS_LICENSE: 6,
  } as const,

  /**
   * Maximum recursion depth for PII redaction in nested objects
   * Prevents stack overflow on deeply nested or circular structures
   * NOTE: Not environment-configurable as this is a safety limit
   */
  MAX_RECURSION_DEPTH: 100,

  /**
   * Maximum size of key action cache
   * Prevents unbounded memory growth for key classification cache
   * NOTE: Not environment-configurable as this is a safety limit
   */
  MAX_KEY_ACTION_CACHE_SIZE: 1000,
} as const;

// Type export
export type PIIRedactionConfig = typeof PII_REDACTION_CONFIG;
