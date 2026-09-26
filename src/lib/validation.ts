/**
 * Validation Module - Backward Compatible Wrapper
 *
 * This file maintains backward compatibility by re-exporting all validation
 * utilities from the new modular validators/ folder.
 *
 * New code should import directly from '@/lib/validators' or specific modules:
 * - '@/lib/validators/input-sanitizer'
 * - '@/lib/validators/schema-validator'
 * - '@/lib/validators/pii-detector'
 * - '@/lib/validators/xss-sanitizer'
 */

// Re-export everything from the new modular validators
export * from './validators';

// Additional backward-compatible exports that were in the original validation.ts
// These are already exported from validators/index.ts but we ensure they're available

// Re-export type-guards for backward compatibility
export * from './type-guards';