/**
 * Runtime Environment Security Validation
 *
 * Validates environment variables on application startup to prevent
 * security misconfigurations such as exposing sensitive keys to client bundles.
 *
 * This module runs on the server-side only and throws errors if critical
 * security violations are detected, preventing the application from starting
 * with insecure configuration.
 *
 * @module lib/security/env-validation
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('EnvValidation');

// Sensitive keys that must NEVER be exposed to client
const SENSITIVE_KEYS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
] as const;

/**
 * Patterns that indicate a sensitive environment variable name.
 * Variables matching these patterns should be excluded from health check
 * responses and logs to prevent credential exposure.
 *
 * @see SECURITY.md for security documentation
 * @see docs/security-engineer.md for security guidelines
 */
const SENSITIVE_VAR_PATTERNS = [
  'KEY',
  'SECRET',
  'TOKEN',
  'PASSWORD',
  'PASSPHRASE',
  'CREDENTIAL',
  'AUTH',
  'PWD',
  'DATABASE',
  'CONNECTION',
  'DB_', // Database identifiers
  'CERT',
  'SIGNATURE',
  'PRIVATE',
  '_SK',
  '_PK',
  '_RK',
  'OAUTH', // OAuth tokens/secrets
  'WEBHOOK', // Webhook secrets
  'SALT', // Salt values for hashing
  'HMAC', // HMAC keys
  'APIKEY', // API key without underscore
  'IBAN', // Bank account info
  'SWIFT', // SWIFT/BIC codes
  'BIC', // SWIFT/BIC codes
  'SESSION', // Session identifiers
  'SSN', // Social security numbers
  'CSRF', // CSRF tokens
  'XSRF', // XSRF tokens
  'COOKIE', // Cookies
  'OTP', // One-time passwords
  'NONCE', // Cryptographic nonces
  'PIN', // Personal identification numbers
  'TAXID', // Tax identification numbers
  'NINO', // National Insurance numbers
  'PASSPORT', // Passport numbers
  'LICENSE', // License numbers
  'LICENCE', // License numbers (UK)
  // Security improvement: Added 2026-02-21
  'PEM', // Certificate files
  'KEYSTORE', // Java keystores
  'ENCRYPTION', // Encryption keys
  'DECRYPT', // Decryption keys
  'MFA', // Multi-factor authentication secrets
  'MNEMONIC', // Wallet seed phrases (crypto)
  'RECOVERY', // Recovery codes/keys
  'BACKUP', // Backup keys/codes
  'SEED', // Seed phrases/values
  'JWK', // JSON Web Keys
] as const;

/**
 * Check if an environment variable name contains sensitive patterns.
 * SECURITY: Variables matching these patterns are excluded from health check responses
 * to prevent credential exposure.
 *
 * @param varName - The environment variable name to check
 * @returns true if the variable name matches sensitive patterns
 *
 * @example
 * ```typescript
 * if (!isSensitiveVar(varName)) {
 *   envStatus.checks[varName] = { present: isSet, required: true };
 * }
 * ```
 */
export function isSensitiveVar(varName: string): boolean {
  const upper = varName.toUpperCase();
  return SENSITIVE_VAR_PATTERNS.some((pattern) => upper.includes(pattern));
}

// Keys that must NOT have NEXT_PUBLIC_ prefix
const MUST_BE_PRIVATE = ['SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_API_KEY'] as const;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check if sensitive keys are incorrectly prefixed with NEXT_PUBLIC_
 */
function checkNextPublicPrefix(): string[] {
  const errors: string[] = [];

  for (const key of MUST_BE_PRIVATE) {
    const publicKey = `NEXT_PUBLIC_${key}`;
    const value = process.env[publicKey];

    if (value !== undefined) {
      errors.push(
        `CRITICAL SECURITY VIOLATION: ${publicKey} is defined. ` +
          `${key} must NEVER be prefixed with NEXT_PUBLIC_ as it would expose the key to client bundles. ` +
          `Remove ${publicKey} from your environment and use ${key} instead.`
      );
    }
  }

  return errors;
}

/**
 * Check if sensitive keys have safe values (not placeholder/example values)
 */
function checkKeySafety(): string[] {
  const warnings: string[] = [];

  for (const key of SENSITIVE_KEYS) {
    const value = process.env[key];

    if (value) {
      // Check for placeholder values
      const unsafePatterns = [
        /your_.*?_here/i,
        /example/i,
        /placeholder/i,
        /test.*key/i,
        /fake/i,
        /mock/i,
        /^key$/i,
        /^token$/i,
      ];

      for (const pattern of unsafePatterns) {
        if (pattern.test(value)) {
          warnings.push(
            `WARNING: ${key} appears to contain a placeholder or example value. ` +
              `Ensure this is a real credential before deploying to production.`
          );
          break;
        }
      }

      // Check for suspiciously short keys
      if (value.length < 20) {
        warnings.push(
          `WARNING: ${key} is suspiciously short (${value.length} chars). ` +
            `This may be a placeholder or invalid key.`
        );
      }
    }
  }

  return warnings;
}

/**
 * Check ADMIN_API_KEY strength requirements
 * Enforces the security requirements documented in config/.env.example
 */
function checkAdminApiKeyStrength(): string[] {
  const warnings: string[] = [];
  const adminKey = process.env.ADMIN_API_KEY;

  // Skip validation if not set (already warned elsewhere)
  if (!adminKey) {
    return warnings;
  }

  // Skip validation in development mode to allow easier local development
  if (process.env.NODE_ENV === 'development') {
    return warnings;
  }

  // Check minimum length (32 characters as per documentation)
  const MIN_LENGTH = 32;
  if (adminKey.length < MIN_LENGTH) {
    warnings.push(
      `SECURITY WARNING: ADMIN_API_KEY is too short (${adminKey.length} chars). ` +
        `Minimum required: ${MIN_LENGTH} characters. ` +
        `Generate a secure key with: openssl rand -base64 32`
    );
  }

  // Check complexity requirements
  const hasUppercase = /[A-Z]/.test(adminKey);
  const hasLowercase = /[a-z]/.test(adminKey);
  const hasNumber = /[0-9]/.test(adminKey);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(adminKey);

  const missingRequirements: string[] = [];
  if (!hasUppercase) missingRequirements.push('uppercase letters');
  if (!hasLowercase) missingRequirements.push('lowercase letters');
  if (!hasNumber) missingRequirements.push('numbers');
  if (!hasSpecialChar) missingRequirements.push('special characters');

  if (missingRequirements.length > 0) {
    warnings.push(
      `SECURITY WARNING: ADMIN_API_KEY lacks complexity. ` +
        `Missing: ${missingRequirements.join(', ')}. ` +
        `A strong key should contain uppercase, lowercase, numbers, and special characters.`
    );
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^(password|admin|secret|key|token)+$/i,
    /^([a-zA-Z0-9])\1+$/, // Repeated characters
    /^123456/,
    /^qwerty/i,
    /^abcdef/i,
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(adminKey)) {
      warnings.push(
        `SECURITY WARNING: ADMIN_API_KEY matches a weak pattern. ` +
          `Please use a cryptographically secure random key.`
      );
      break;
    }
  }

  return warnings;
}

/**
 * Check if required security environment variables are present
 */
function checkRequiredEnvVars(): string[] {
  const errors: string[] = [];
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      errors.push(
        `CRITICAL: ${key} is not defined or is empty. ` +
          `This environment variable is required for the application to function.`
      );
    }
  }

  return errors;
}

/**
 * Validate all environment variables for security compliance
 *
 * @returns ValidationResult with status and messages
 */
export function validateEnvironment(): ValidationResult {
  logger.info('Running environment security validation...');

  const errors: string[] = [];
  const warnings: string[] = [];

  errors.push(...checkNextPublicPrefix());
  errors.push(...checkRequiredEnvVars());
  warnings.push(...checkKeySafety());
  warnings.push(...checkAdminApiKeyStrength());

  const valid = errors.length === 0;

  if (valid && warnings.length === 0) {
    logger.info(
      '✅ Environment validation passed - no security issues detected'
    );
  } else if (valid) {
    logger.warn('⚠️  Environment validation passed with warnings');
    warnings.forEach((w) => logger.warn(w));
  } else {
    logger.error(
      '❌ Environment validation failed - critical security issues detected'
    );
    errors.forEach((e) => logger.error(e));
  }

  return { valid, errors, warnings };
}

/**
 * Validates environment and throws on critical errors.
 * Use this in critical startup paths to prevent launching with bad config.
 *
 * @throws Error if critical security violations are detected
 */
export function validateEnvironmentStrict(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    const errorMessage = [
      'ENVIRONMENT VALIDATION FAILED - Critical security issues detected:',
      '',
      ...result.errors.map((e) => `  ❌ ${e}`),
      '',
      'The application cannot start with these security violations.',
      'Please fix the issues above and restart.',
      '',
      'For more information, see:',
      '  - SECURITY.md',
      '  - docs/security.md',
      '  - config/.env.example',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Log warnings but don't fail
  if (result.warnings.length > 0) {
    logger.warn('Environment validation warnings:');
    result.warnings.forEach((w) => logger.warn(`  ⚠️  ${w}`));
  }
}

/**
 * Quick check for NEXT_PUBLIC_ prefix violations only.
 * Useful for build-time checks.
 *
 * @returns true if safe, false if violations detected
 */
export function checkNoPublicPrefix(): boolean {
  const errors = checkNextPublicPrefix();

  if (errors.length > 0) {
    errors.forEach((e) => logger.error(e));
    return false;
  }

  return true;
}
