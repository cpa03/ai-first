/**
 * PII Redaction Utility for Agent Logs
 *
 * This utility redacts personally identifiable information from agent logs
 * to ensure user privacy and security compliance.
 */

import { PII_REDACTION_CONFIG } from './config/constants';

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
    /(?:api[_-]?key|apikey|secret|token|credential|auth|authorization|admin[-_ ]?key|adminkey)[\s:=]+['"]?([a-zA-Z0-9_-]{20,})['"]?|(?:sk|pk|rk)_(?:live|test)_[a-zA-Z0-9]{24,64}|sk-[a-zA-Z0-9]{32,64}|AKIA[0-9A-Z]{16}/gi,
  jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  urlWithCredentials: /[a-zA-Z]+:\/\/[^:\s]+:[^@\s]+@[^\s]+/g,
};

/**
 * Combined regex for single-pass PII redaction.
 * Using named capture groups to identify which pattern matched.
 *
 * Priority is handled by:
 * 1. Order in the alternative group (|)
 * 2. Including common prefixes in higher-priority patterns (like JWT) to ensure they
 *    start matching at the same position as lower-priority patterns (like API Key).
 */
const API_KEY_PREFIXES = `(?:${PII_REDACTION_CONFIG.API_KEY_PREFIXES.join('|')})[\\s:=]+['"]?`;

const COMBINED_PII_REGEX = new RegExp(
  [
    `(?<jwt>(?:${API_KEY_PREFIXES})?${PII_REGEX_PATTERNS.jwt.source})`,
    `(?<urlWithCredentials>${PII_REGEX_PATTERNS.urlWithCredentials.source})`,
    `(?<email>${PII_REGEX_PATTERNS.email.source})`,
    `(?<phone>${PII_REGEX_PATTERNS.phone.source})`,
    `(?<ssn>${PII_REGEX_PATTERNS.ssn.source})`,
    `(?<creditCard>${PII_REGEX_PATTERNS.creditCard.source})`,
    `(?<ipAddress>${PII_REGEX_PATTERNS.ipAddress.source})`,
    `(?<apiKey>${PII_REGEX_PATTERNS.apiKey.source})`,
  ].join('|'),
  'gi'
);

/**
 * Redact PII from a string using predefined patterns in a single pass
 */
export function redactPII(text: string): string {
  if (typeof text !== 'string') return text;
  if (!text) return text;

  const labels = PII_REDACTION_CONFIG.REDACTION_LABELS;

  return text.replace(COMBINED_PII_REGEX, (match, ...args) => {
    // In String.replace(regex, replacer), the last argument is the groups object if named groups are used
    const groups = args[args.length - 1] as Record<string, string | undefined>;

    if (groups.jwt) return labels.JWT;
    if (groups.urlWithCredentials) return labels.URL_WITH_CREDENTIALS;
    if (groups.email) return labels.EMAIL;
    if (groups.phone) return labels.PHONE;
    if (groups.ssn) return labels.SSN;
    if (groups.creditCard) return labels.CREDIT_CARD;
    if (groups.ipAddress) {
      // PERFORMANCE: Faster private IP check without full split
      const firstDot = match.indexOf('.');
      if (firstDot === -1) return labels.IP_ADDRESS;

      const firstOctet = match.substring(0, firstDot);

      if (firstOctet === '10' || firstOctet === '127') return match;
      if (firstOctet === '192') {
        if (match.startsWith('192.168.')) return match;
      } else if (firstOctet === '172') {
        const secondDot = match.indexOf('.', firstDot + 1);
        if (secondDot !== -1) {
          const secondOctet = parseInt(
            match.substring(firstDot + 1, secondDot),
            10
          );
          if (secondOctet >= 16 && secondOctet <= 31) return match;
        }
      }

      return labels.IP_ADDRESS;
    }
    if (groups.apiKey) return labels.API_KEY;

    return match;
  });
}

/**
 * Combined regex for sensitive field detection to avoid iterating through an array
 */
const SENSITIVE_FIELD_REGEX =
  /api[_-]?key|apikey|secret|token|password|passphrase|credential|auth|authorization|access[_-]?key|bearer|session[_-]?id|cookie|set-cookie|xsrf-token|csrf-token|private[_-]?key|secret[_-]?key|connection[_-]?string|email|phone|ssn|credit[_-]?card|ip[_-]?address|admin[-_ ]?key|adminkey/i;

const SAFE_FIELDS_SET = new Set<string>(
  PII_REDACTION_CONFIG.SAFE_FIELDS.map((f) => f.toLowerCase())
);

const REDACTION_LABEL_CACHE = new Map<string, string>();

/**
 * Get or create a redaction label for a sensitive field key
 */
function getRedactionLabel(key: string): string {
  let label = REDACTION_LABEL_CACHE.get(key);
  if (label) return label;

  // Convert field name to uppercase with underscores for redaction label (camelCase to snake_case)
  const fieldName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
  const fieldNameUpper = fieldName.toUpperCase().replace(/^_+/, '');
  label = `[REDACTED_${fieldNameUpper}]`;

  // Prevent unbounded cache growth
  if (REDACTION_LABEL_CACHE.size < 1000) {
    REDACTION_LABEL_CACHE.set(key, label);
  }

  return label;
}

/**
 * Redact PII from an object recursively
 */
export function redactPIIInObject(obj: unknown, seen = new WeakSet()): unknown {
  if (typeof obj === 'string') {
    return redactPII(obj);
  }

  if (obj !== null && typeof obj === 'object') {
    // Handle circular references
    if (seen.has(obj)) {
      return '[Circular Reference]';
    }
    seen.add(obj);

    if (obj instanceof Error) {
      // For Error objects, we convert to a POJO including non-enumerable props
      // then recursively redact to ensure all custom properties are protected
      const errorData = {
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
        ...Object.getOwnPropertyNames(obj).reduce(
          (acc, key) => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              acc[key] = (obj as unknown as Record<string, unknown>)[key];
            } catch {
              // Skip properties that can't be accessed
            }
            return acc;
          },
          {} as Record<string, unknown>
        ),
      };
      return redactPIIInObject(errorData, seen);
    }

    if (Array.isArray(obj)) {
      // PERFORMANCE: Faster array processing with pre-allocated array and for loop
      const result = new Array(obj.length);
      for (let i = 0; i < obj.length; i++) {
        result[i] = redactPIIInObject(obj[i], seen);
      }
      return result;
    }

    const redacted: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as Record<string, unknown>)[key];

        // PERFORMANCE: O(1) safe field check (checking both original and lowercase for efficiency)
        if (SAFE_FIELDS_SET.has(key) || SAFE_FIELDS_SET.has(key.toLowerCase())) {
          redacted[key] = value;
          continue;
        }

        // PERFORMANCE: O(1) label lookup after first hit
        if (SENSITIVE_FIELD_REGEX.test(key)) {
          redacted[key] = getRedactionLabel(key);
          continue;
        }

        // PERFORMANCE: Skip recursive call for non-string primitives
        if (typeof value === 'string') {
          redacted[key] = redactPII(value);
        } else if (value !== null && typeof value === 'object') {
          redacted[key] = redactPIIInObject(value, seen);
        } else {
          redacted[key] = value;
        }
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
