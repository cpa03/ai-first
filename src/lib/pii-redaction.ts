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
    /(?:api[_-]?key|apikey|secret|token)[\s:=]+['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
  jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  urlWithCredentials: /https?:\/\/[^:\s]+:[^@\s]+@[^\s]+/g,
};

/**
 * Redact PII from a string using predefined patterns
 */
export function redactPII(text: string): string {
  let redacted = text;

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

  // Redact JWT tokens
  redacted = redacted.replace(PII_REGEX_PATTERNS.jwt, '[REDACTED_TOKEN]');

  // Redact URLs with credentials
  redacted = redacted.replace(
    PII_REGEX_PATTERNS.urlWithCredentials,
    '[REDACTED_URL]'
  );

  return redacted;
}

/**
 * Redact PII from an object recursively
 */
export function redactPIIInObject(obj: any, seen = new WeakSet()): any {
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

    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip redaction for known safe fields
      const safeFields = [
        'id',
        'created_at',
        'updated_at',
        'status',
        'priority',
        'estimate_hours',
      ];
      if (safeFields.includes(key.toLowerCase())) {
        redacted[key] = value;
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
export function sanitizeAgentLog(agent: string, action: string, payload: any) {
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
  const originalLength = text.length;
  const redacted = redactPII(text);
  return redacted.length !== originalLength;
}
