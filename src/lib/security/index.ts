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

// Security Audit Logging
export {
  SecurityAuditLog,
  type SecurityEventSeverity,
  type SecurityEventCategory,
  type SecurityEventBase,
  type AuthEventDetails,
  type RateLimitEventDetails,
  type CSPViolationEventDetails,
  type EnvironmentEventDetails,
  type InputValidationEventDetails,
} from './audit-log';
