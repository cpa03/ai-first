/**
 * PII Redaction Utility for Agent Logs
 *
 * This utility redacts personally identifiable information from agent logs
 * to ensure user privacy and security compliance.
 *
 * Security Improvements (Issue #923):
 * - Comprehensive edge case handling (Symbol keys, Maps, Sets, Dates)
 * - Strong type safety with strict types
 * - Safe property access with try-catch for getters/setters
 * - Handling of frozen objects and special object types
 */

import { PII_REDACTION_CONFIG } from './config/constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supported PII pattern types
 */
export type PIIPatternType =
  | 'email'
  | 'phone'
  | 'ssn'
  | 'creditCard'
  | 'ipAddress'
  | 'apiKey'
  | 'jwt'
  | 'urlWithCredentials';

/**
 * PII regex patterns interface
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

/**
 * Redaction result type for type safety
 */
export type RedactionResult =
  | string
  | number
  | boolean
  | null
  | undefined
  | RedactedObject
  | RedactedArray;

interface RedactedObject {
  [key: string]: RedactionResult;
}

type RedactedArray = Array<RedactionResult>;

/**
 * Safe property descriptor for error handling
 */
interface SafePropertyDescriptor {
  key: string | symbol;
  value: unknown;
  enumerable: boolean;
  hasGetter: boolean;
  error?: Error;
}

const PII_REGEX_PATTERNS: PIIPatterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  phone:
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  apiKey:
    /(?:api[_-]?key|apikey|secret|token|password|passphrase|credential|auth|authorization|access[_-]?key|bearer|admin[-_ ]?key|adminkey)[\s:=]+['"]?([a-zA-Z0-9_-]{20,})['"]?|(?:sk|pk|rk)_(?:live|test)_[a-zA-Z0-9]{24,64}|sk-[a-zA-Z0-9_-]{32,64}|AKIA[0-9A-Z]{16}/gi,
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
      return isPrivateIP(match) ? match : labels.IP_ADDRESS;
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

function isSafeField(key: string): boolean {
  return SAFE_FIELDS_SET.has(key.toLowerCase());
}

function getRedactionLabel(key: string): string {
  let label = REDACTION_LABEL_CACHE.get(key);
  if (label) return label;

  const fieldName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
  const fieldNameUpper = fieldName.toUpperCase().replace(/^_+/, '');
  label = `[REDACTED_${fieldNameUpper}]`;

  if (REDACTION_LABEL_CACHE.size < 1000) {
    REDACTION_LABEL_CACHE.set(key, label);
  }

  return label;
}

function isPrivateIP(ip: string): boolean {
  const firstDot = ip.indexOf('.');
  if (firstDot === -1) return false;

  const firstOctet = ip.substring(0, firstDot);

  if (firstOctet === '127' || firstOctet === '10') return true;
  if (firstOctet === '192' && ip.startsWith('192.168.')) return true;
  if (firstOctet === '172') {
    const secondDot = ip.indexOf('.', firstDot + 1);
    if (secondDot !== -1) {
      const secondOctet = parseInt(ip.substring(firstDot + 1, secondDot), 10);
      return secondOctet >= 16 && secondOctet <= 31;
    }
  }

  return false;
}

function getAllPropertyDescriptors(obj: object): SafePropertyDescriptor[] {
  const descriptors: SafePropertyDescriptor[] = [];

  try {
    const stringKeys = Object.getOwnPropertyNames(obj);
    for (const key of stringKeys) {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor) {
          let value: unknown;
          let hasGetter = false;

          if (descriptor.get) {
            hasGetter = true;
            try {
              value = descriptor.get.call(obj);
            } catch {
              value = '[Getter Error]';
            }
          } else if ('value' in descriptor) {
            value = descriptor.value;
          }

          descriptors.push({
            key,
            value,
            enumerable: descriptor.enumerable ?? false,
            hasGetter,
          });
        }
      } catch (e) {
        descriptors.push({
          key,
          value: '[Property Access Error]',
          enumerable: false,
          hasGetter: false,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    }

    const symbolKeys = Object.getOwnPropertySymbols(obj);
    for (const key of symbolKeys) {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor) {
          let value: unknown;
          let hasGetter = false;

          if (descriptor.get) {
            hasGetter = true;
            try {
              value = descriptor.get.call(obj);
            } catch {
              value = '[Getter Error]';
            }
          } else if ('value' in descriptor) {
            value = descriptor.value;
          }

          descriptors.push({
            key,
            value,
            enumerable: descriptor.enumerable ?? false,
            hasGetter,
          });
        }
      } catch (e) {
        descriptors.push({
          key,
          value: '[Property Access Error]',
          enumerable: false,
          hasGetter: false,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    }
  } catch {
    // Intentionally empty - errors are captured per-property above
  }

  return descriptors;
}

const MAX_RECURSION_DEPTH = 100;

export function redactPIIInObject(
  obj: unknown,
  seen = new WeakSet<object>(),
  depth = 0
): RedactionResult {
  if (depth > MAX_RECURSION_DEPTH) {
    return '[Max Depth Exceeded]';
  }

  if (typeof obj === 'string') {
    return redactPII(obj);
  }

  if (obj === null || typeof obj !== 'object') {
    return obj as RedactionResult;
  }

  if (seen.has(obj)) {
    return '[Circular Reference]';
  }
  seen.add(obj);

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (obj instanceof RegExp) {
    return obj.toString();
  }

  if (obj instanceof Map) {
    const redactedMap = new Map<RedactionResult, RedactionResult>();
    for (const [key, value] of obj.entries()) {
      const redactedKey = redactPIIInObject(key, seen, depth + 1);
      const redactedValue = redactPIIInObject(value, seen, depth + 1);
      redactedMap.set(redactedKey, redactedValue);
    }
    return redactedMap as unknown as RedactionResult;
  }

  if (obj instanceof Set) {
    const redactedSet = new Set<RedactionResult>();
    for (const value of obj.values()) {
      redactedSet.add(redactPIIInObject(value, seen, depth + 1));
    }
    return redactedSet as unknown as RedactionResult;
  }

  if (obj instanceof WeakMap || obj instanceof WeakSet) {
    return '[Weak Collection]';
  }

  if (obj instanceof Error) {
    const errorData: Record<string, unknown> = {
      name: obj.name,
      message: obj.message,
      stack: obj.stack,
    };

    const descriptors = getAllPropertyDescriptors(obj);
    for (const descriptor of descriptors) {
      const key =
        typeof descriptor.key === 'symbol'
          ? descriptor.key.toString()
          : descriptor.key;
      if (!(key in errorData)) {
        errorData[key] = descriptor.value;
      }
    }

    return redactPIIInObject(errorData, seen, depth + 1);
  }

  if (Array.isArray(obj)) {
    const result: RedactionResult[] = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) {
      result[i] = redactPIIInObject(obj[i], seen, depth + 1);
    }
    return result;
  }

  const redacted: RedactedObject = {};
  const descriptors = getAllPropertyDescriptors(obj);

  for (const descriptor of descriptors) {
    if (!descriptor.enumerable && !(obj instanceof Error)) {
      continue;
    }

    let key: string;
    if (typeof descriptor.key === 'symbol') {
      key = descriptor.key.toString();
    } else {
      key = descriptor.key;
    }

    const value = descriptor.value;

    if (isSafeField(key)) {
      redacted[key] = value as RedactionResult;
      continue;
    }

    if (SENSITIVE_FIELD_REGEX.test(key)) {
      redacted[key] = getRedactionLabel(key);
      continue;
    }

    if (typeof value === 'string') {
      redacted[key] = redactPII(value);
    } else if (value !== null && typeof value === 'object') {
      redacted[key] = redactPIIInObject(value, seen, depth + 1);
    } else {
      redacted[key] = value as RedactionResult;
    }
  }

  return redacted;
}

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

export function containsPII(text: string): boolean {
  if (typeof text !== 'string') return false;
  const redacted = redactPII(text);
  return redacted !== text;
}

export function getRedactionStats(): {
  labelCacheSize: number;
  maxRecursionDepth: number;
  safeFieldsCount: number;
} {
  return {
    labelCacheSize: REDACTION_LABEL_CACHE.size,
    maxRecursionDepth: MAX_RECURSION_DEPTH,
    safeFieldsCount: SAFE_FIELDS_SET.size,
  };
}

export function clearRedactionCache(): void {
  REDACTION_LABEL_CACHE.clear();
}
