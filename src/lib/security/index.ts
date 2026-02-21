/**
 * Security Module - Centralized Security Utilities
 *
 * This module provides a single import point for all security-related
 * utilities, following the pattern established in src/lib/config/index.ts.
 *
 * Usage:
 * ```typescript
 * import { isSensitiveVar, validateEnvironment } from '@/lib/security';
 * ```
 *
 * @module lib/security
 */

// Environment Security Validation
export {
  isSensitiveVar,
  validateEnvironment,
  validateEnvironmentStrict,
  checkNoPublicPrefix,
} from './env-validation';
