import { ValidationError, ValidationResult } from './input-sanitizer';

/**
 * PII (Personally Identifiable Information) detection utilities.
 * Detects common PII patterns in strings.
 */

// PII detection patterns
const PII_PATTERNS = {
  // Email addresses
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Phone numbers (various formats)
  PHONE: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  // Credit card numbers (basic pattern)
  CREDIT_CARD: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  // SSN (US)
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  // IP addresses
  IP_ADDRESS: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  // URLs that might contain sensitive data
  URL_WITH_CREDENTIALS: /https?:\/\/[^:\/\s]+:[^@\/\s]+@[^\/]+\/?/gi,
  // API keys (common patterns)
  API_KEY:
    /\b(?:api[_-]?key|apikey|secret[_-]?key|access[_-]?token)\s*[:=]\s*[a-zA-Z0-9_-]{20,}\b/gi,
  // JWT tokens
  JWT: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
  // AWS keys
  AWS_KEY: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  // Private keys
  PRIVATE_KEY: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/i,
};

/**
 * PII detection result
 */
export interface PIIDetectionResult {
  hasPII: boolean;
  detectedTypes: string[];
  redactedText: string;
}

/**
 * Detect PII in a string and return detection result
 */
export function detectPII(text: string): PIIDetectionResult {
  if (!text || typeof text !== 'string') {
    return { hasPII: false, detectedTypes: [], redactedText: '' };
  }

  const detectedTypes: string[] = [];
  let redactedText = text;

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      detectedTypes.push(type);
      // Redact the matched content
      redactedText = redactedText.replace(pattern, `[REDACTED_${type}]`);
    }
  }

  return {
    hasPII: detectedTypes.length > 0,
    detectedTypes,
    redactedText,
  };
}

/**
 * Check if a string contains PII (boolean only, faster)
 */
export function hasPII(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  for (const pattern of Object.values(PII_PATTERNS)) {
    // Patterns carry the /g flag for use with .match()/.replace(); .test()
    // on a /g regex is stateful via lastIndex, so reset it for a stable result.
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Redact PII from a string
 */
export function redactPII(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let redacted = text;
  for (const pattern of Object.values(PII_PATTERNS)) {
    redacted = redacted.replace(pattern, (match) => `[REDACTED]`);
  }
  return redacted;
}

/**
 * Validate that a string doesn't contain PII
 */
export function validateNoPII(
  text: unknown,
  fieldName: string = 'input'
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!text || typeof text !== 'string') {
    return { valid: true, errors: [] };
  }

  const result = detectPII(text);
  if (result.hasPII) {
    errors.push({
      field: fieldName,
      message: `PII detected in ${fieldName}: ${result.detectedTypes.join(', ')}`,
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Redact PII from an object recursively
 */
export function redactPIIInObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return redactPII(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactPIIInObject(item)) as unknown as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = redactPIIInObject(value);
    }
    return result as T;
  }

  return obj;
}
