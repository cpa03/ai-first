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

// Suspicious Request Pattern Detection
export {
  detectSuspiciousPatterns,
  hasSuspiciousPatterns,
  getPatternDefinitions,
  type SuspiciousPatternCategory,
  type SuspiciousPatternDetail,
  type SuspiciousPatternResult,
} from './suspicious-patterns';

// Request Signing for Internal API Communication
export {
  signRequest,
  verifySignature,
  generateNonce,
  createTimestamp,
  isTimestampValid,
  parseSignatureHeader,
  createSignatureHeader,
  createSignedRequest,
  verifyInternalRequest,
  createSignedUrl,
  verifySignedUrl,
  DEFAULT_TIMESTAMP_TOLERANCE_MS,
  MIN_TIMESTAMP_TOLERANCE_MS,
  MAX_TIMESTAMP_TOLERANCE_MS,
  type SignedRequestOptions,
  type SignatureResult,
  type VerificationResult,
  type InternalApiSignatureHeader,
} from './request-signer';

// JSON-LD Security
export { safeJsonLd } from './json-ld';

// CSRF Protection
export {
  validateCSRF,
  requireCSRF,
  CSRF_CONFIG,
  type CSRFValidationResult,
} from './csrf';

// Secure ID Generation
export { generateSecureId } from './ids';
