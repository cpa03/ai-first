/**
 * PII Redaction Utility for Agent Logs
 *
 * This utility redacts personally identifiable information from agent logs
 * to ensure user privacy and security compliance.
 */

interface PIIPatterns {
  email: RegExp;
  phone: RegExp;
  ssn: RegExp;
  creditCard: RegExp;
  ipAddress: RegExp;
  apiKey: RegExp;
  jwt: RegExp;
  urlWithCredentials: RegExp;
}

const PII_REGEX_PATTERNS: PIIPatterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  phone:
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  apiKey:
    /(?:api[_-]?key|apikey|secret|token|credential|auth|authorization)[\s:=]+['"]?([a-zA-Z0-9_-]{20,})['"]?|(?:sk|pk|rk)_(?:live|test)_[a-zA-Z0-9]{24,64}|sk-[a-zA-Z0-9_-]{32,64}|AKIA[0-9A-Z]{16}/gi,
  jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  urlWithCredentials: /[a-zA-Z]+:\/\/[^:\s]+:[^@\s]+@[^\s]+/g,
};

/**
 * Redact PII from a string using predefined patterns
 */
export function redactPII(text: string): string {
  let redacted = text;

  // Redact JWT tokens first (before API keys, since "token:" prefix might match JWTs)
  redacted = redacted.replace(PII_REGEX_PATTERNS.jwt, '[REDACTED_TOKEN]');

  // Redact URLs with credentials (before emails to prevent email regex from matching password part)
  redacted = redacted.replace(
    PII_REGEX_PATTERNS.urlWithCredentials,
    '[REDACTED_URL]'
  );

  // Redact email addresses
  redacted = redacted.replace(PII_REGEX_PATTERNS.email, '[REDACTED_EMAIL]');

  // Redact phone numbers
  redacted = redacted.replace(PII_REGEX_PATTERNS.phone, '[REDACTED_PHONE]');

  // Redact Social Security Numbers
  redacted = redacted.replace(PII_REGEX_PATTERNS.ssn, '[REDACTED_SSN]');

  // Redact credit card numbers
  redacted = redacted.replace(PII_REGEX_PATTERNS.creditCard, '[REDACTED_CARD]');

  // Redact IP addresses (except for private/internal IPs)
  redacted = redacted.replace(PII_REGEX_PATTERNS.ipAddress, (match) => {
    const parts = match.split('.');
    const isPrivate =
      parts[0] === '10' ||
      (parts[0] === '172' &&
        parseInt(parts[1]) >= 16 &&
        parseInt(parts[1]) <= 31) ||
      (parts[0] === '192' && parts[1] === '168') ||
      parts[0] === '127';

    return isPrivate ? match : '[REDACTED_IP]';
  });

  // Redact API keys and secrets
  redacted = redacted.replace(PII_REGEX_PATTERNS.apiKey, '[REDACTED_API_KEY]');

  return redacted;
}

const SENSITIVE_FIELD_PATTERNS = [
  /api[_-]?key/i,
  /apikey/i,
  /secret/i,
  /token/i,
  /password/i,
  /passphrase/i,
  /credential/i,
  /auth/i,
  /authorization/i,
  /access[_-]?key/i,
];

const SAFE_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'status',
  'priority',
  'estimate_hours',
];

/**
 * Redact PII from an object recursively
 */
export function redactPIIInObject(obj: unknown, seen = new WeakSet()): unknown {
  if (typeof obj === 'string') {
    return redactPII(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactPIIInObject(item, seen));
  }

  if (obj !== null && typeof obj === 'object') {
    // Handle circular references
    if (seen.has(obj)) {
      return '[Circular Reference]';
    }
    seen.add(obj);

    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Always redact sensitive field values regardless of content
      const isSensitive = SENSITIVE_FIELD_PATTERNS.some((pattern) =>
        pattern.test(key)
      );

      if (SAFE_FIELDS.includes(key.toLowerCase())) {
        redacted[key] = value;
      } else if (isSensitive) {
        // Convert field name to uppercase with underscores for redaction label
        const fieldName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        const fieldNameUpper = fieldName.toUpperCase().replace(/^_+/, '');
        redacted[key] = `[REDACTED_${fieldNameUpper}]`;
      } else {
        redacted[key] = redactPIIInObject(value, seen);
      }
    }
    return redacted;
  }

  return obj;
}

/**
 * Sanitize agent log payload before storing
 */
export function sanitizeAgentLog(
  agent: string,
  action: string,
  payload: unknown
) {
  return {
    agent,
    action,
    payload: redactPIIInObject(payload),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if a string contains potential PII
 */
export function containsPII(text: string): boolean {
  const redacted = redactPII(text);
  return redacted !== text;
}
