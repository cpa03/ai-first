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

import { PII_REDACTION_CONFIG } from './config/pii-redaction-config';

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
  | 'urlWithCredentials'
  | 'passport'
  | 'driversLicense';

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
  passport: RegExp;
  driversLicense: RegExp;
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
  // Enhanced email regex with Unicode support for international characters
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gu,
  phone:
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ipAddress:
    /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|(?<=\s|^)(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?::[0-9a-fA-F]{1,4}){1,7}|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|::1|::)(?=\s|$)/g,
  apiKey:
    /(?:api[-_ ]?key|apikey|secret|token|password|passphrase|credential|auth|authorization|access[-_ ]?key|bearer|admin[-_ ]?key|adminkey)[\s:=]{1,50}['"]?([a-zA-Z0-9_/+=-]{4,128})['"]?|(?:sk|pk|rk)_(?:live|test)_[a-zA-Z0-9]{24,64}|sk-[a-zA-Z0-9_-]{32,64}|AKIA[0-9A-Z]{16}/gi,
  jwt: /eyJ[a-zA-Z0-9_-]{4,}\.[a-zA-Z0-9_-]{4,}\.[a-zA-Z0-9_-]{4,}/g,
  urlWithCredentials: /[a-zA-Z]{2,10}:\/\/[^:\s]{1,64}:[^@\s]{1,64}@[^\s]{1,255}/g,
  // US Passport: 9 characters (alphanumeric, starting with letter for newer formats)
  // Pattern 1: With "passport" prefix or "passport #" context
  // Pattern 2: 1-2 letters followed by 7-9 digits (common format)
  // Pattern 3: Exactly 9 characters with at least 2 digits (look-ahead only checks within the word)
  passport:
    /\b(?:passport[:\s]{1,10}|passport\s*#\s*)[A-Z0-9]{6,9}\b|\b[A-Z]{1,2}[0-9]{7,9}\b|\b(?=[A-Z0-9]{0,20}[0-9][A-Z0-9]{0,20}[0-9])[A-Z0-9]{9}\b/gi,
  // Driver's License: Alphanumeric, typically 6-14 characters, various formats
  driversLicense:
    /\b(?:dl|driver[\s_-]?license|license[:\s]{1,10})[\s]{0,10}[:#]?\s{0,10}([A-Za-z0-9*-]{6,14})\b|\b[A-Z]{1,2}[0-9]{6,10}[A-Z]{0,2}\b/gi,
};

/**
 * Combined trigger regex for ALL possible PII types to avoid sequential replace overhead.
 * Covers: digits (phones, ssn, cc, ip, passport, dl, most api keys), '@' (email, credentials),
 * 'eyJ' (jwt), '://' (urls), common assignment operators ':', '=', and '#', and specific API key prefixes,
 * and common secret-related keywords.
 * PERFORMANCE: Single regex test is faster than multiple tests on every log message.
 */
const COMBINED_TRIGGER_REGEX =
  /[\d@:=#]|eyJ|:\/\/|sk_|pk_|rk_|AKIA|sk-|api[-_ ]?key|secret|token|password|passphrase|credential|auth|authorization|bearer/i;

/**
 * Specific triggers for API keys and secrets to avoid running the full complex regex.
 */
const API_KEY_SPECIFIC_TRIGGER_REGEX =
  /api[-_ ]?key|secret|token|password|passphrase|credential|auth|authorization|bearer/i;

/**
 * Internal redaction logic that skips fast-path checks.
 * Use this when the fast-path check has already been performed.
 */
function _redactPII(text: string): string {
  let redacted = text;
  const labels = PII_REDACTION_CONFIG.REDACTION_LABELS;

  // PERFORMANCE: Sequential replace is actually faster in V8 for large strings
  // than a single complex combined regex with many branches and capturing groups.
  // Order matters: more specific patterns first.
  // We use additional conditional checks to skip regex execution when triggers are absent.

  if (redacted.includes('eyJ')) {
    redacted = redacted.replace(PII_REGEX_PATTERNS.jwt, labels.JWT);
  }

  if (redacted.includes('://')) {
    redacted = redacted.replace(
      PII_REGEX_PATTERNS.urlWithCredentials,
      labels.URL_WITH_CREDENTIALS
    );
  }

  if (redacted.includes('@')) {
    redacted = redacted.replace(PII_REGEX_PATTERNS.email, labels.EMAIL);
  }

  // Digits are a trigger for many PII types
  if (/\d/.test(redacted)) {
    redacted = redacted.replace(PII_REGEX_PATTERNS.passport, labels.PASSPORT);
    redacted = redacted.replace(
      PII_REGEX_PATTERNS.driversLicense,
      labels.DRIVERS_LICENSE
    );
    redacted = redacted.replace(PII_REGEX_PATTERNS.phone, labels.PHONE);
    redacted = redacted.replace(PII_REGEX_PATTERNS.ssn, labels.SSN);
    redacted = redacted.replace(
      PII_REGEX_PATTERNS.creditCard,
      labels.CREDIT_CARD
    );

    // IP addresses also need dots (v4) or colons (v6)
    if (redacted.includes('.') || redacted.includes(':')) {
      redacted = redacted.replace(PII_REGEX_PATTERNS.ipAddress, (match) => {
        return isPrivateIP(match) ? match : labels.IP_ADDRESS;
      });
    }
  }

  // API keys often have assignments ':' or '=' or specific prefixes
  // PERFORMANCE: More specific check before running complex apiKey regex
  if (
    /[:=]/.test(redacted) ||
    /sk_|pk_|rk_|AKIA|sk-/.test(redacted) ||
    API_KEY_SPECIFIC_TRIGGER_REGEX.test(redacted)
  ) {
    redacted = redacted.replace(PII_REGEX_PATTERNS.apiKey, labels.API_KEY);
  }

  return redacted;
}

/**
 * Redact PII from a string using predefined patterns
 */
export function redactPII(text: string): string {
  // PERFORMANCE: Fast path for non-strings or strings too short to contain PII
  if (typeof text !== 'string' || text.length < 4) return text;

  // PERFORMANCE: Fast-path for strings that don't contain any potential PII triggers.
  // This avoids 10 sequential .replace() calls for most log messages.
  if (!COMBINED_TRIGGER_REGEX.test(text)) return text;

  return _redactPII(text);
}

/**
 * Combined regex for sensitive field detection to avoid iterating through an array
 * SECURITY: Includes common sensitive fields like CVV, CVC, PIN to prevent accidental logging.
 * Updated: Added IBAN, SWIFT/BIC, Tax ID, NINO, License patterns, Passport, Routing Number (Issue #1171).
 */
const SENSITIVE_FIELD_REGEX =
  /api[-_ ]?key|apikey|secret|token|password|passphrase|credential|auth|authorization|access[-_ ]?key|bearer|session[_-]?id|cookie|set-cookie|xsrf-token|csrf-token|private[_-]?key|secret[_-]?key|connection[_-]?string|email|phone|ssn|credit[_-]?card|ip[_-]?address|admin[-_ ]?key|adminkey|cvv|cvc|pin|stack|signature|salt|hmac|webhook|oauth|cert|pwd|iban|swift|bic|tax[-_]?id|nino|ni[-_]?num|license|licence|passport|routing[-_ ]?number/i;

const SAFE_FIELDS_SET = new Set<string>(
  PII_REDACTION_CONFIG.SAFE_FIELDS.map((f) => f.toLowerCase())
);

/**
 * Cache for key classification results to avoid redundant regex tests
 * and set lookups. This significantly improves performance when
 * processing large arrays of objects with similar structures.
 */
type KeyAction = {
  type: 'SAFE' | 'SENSITIVE' | 'REDACTABLE';
  label?: string;
};

const KEY_ACTION_CACHE = new Map<string, KeyAction>();

function isSafeField(key: string): boolean {
  // PERFORMANCE: Fast path for exact matches before calling toLowerCase()
  // to avoid unnecessary string allocations.
  if (SAFE_FIELDS_SET.has(key)) return true;
  return SAFE_FIELDS_SET.has(key.toLowerCase());
}

/**
 * Determines the redaction action for a given key and caches the result.
 */
function getKeyAction(key: string): KeyAction {
  let action = KEY_ACTION_CACHE.get(key);
  if (action) return action;

  if (isSafeField(key)) {
    action = { type: 'SAFE' };
  } else if (SENSITIVE_FIELD_REGEX.test(key)) {
    // Generate redaction label (formerly getRedactionLabel logic)
    const fieldName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const fieldNameUpper = fieldName.toUpperCase().replace(/^_+/, '');
    action = {
      type: 'SENSITIVE',
      label: `[REDACTED_${fieldNameUpper}]`,
    };
  } else {
    action = { type: 'REDACTABLE' };
  }

  if (KEY_ACTION_CACHE.size < 1000) {
    KEY_ACTION_CACHE.set(key, action);
  }

  return action;
}

function isPrivateIP(ip: string): boolean {
  // Handle IPv6 loopback
  const trimmed = ip.trim();
  if (trimmed === '::1' || trimmed === '0:0:0:0:0:0:0:1') return true;

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
      // SECURITY: skip prototype-polluting keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
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

const MAX_RECURSION_DEPTH = PII_REDACTION_CONFIG.MAX_RECURSION_DEPTH;

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
    // SECURITY: Do not include stack traces in redacted error data
    // to prevent leaking internal application structure and file paths.
    // NOTE: name and message are explicitly included here as they may be
    // non-enumerable on some Error implementations. The recursive call
    // to redactPIIInObject will then process these as enumerable keys.
    const errorData: Record<string, unknown> = {
      name: obj.name,
      message: obj.message,
    };

    const descriptors = getAllPropertyDescriptors(obj);
    for (const descriptor of descriptors) {
      const key =
        typeof descriptor.key === 'symbol'
          ? descriptor.key.toString()
          : descriptor.key;

      // SECURITY: Double-check to ensure 'stack' is never included even if it's
      // an enumerable property or returned by property descriptors.
      if (!(key in errorData) && key !== 'stack') {
        errorData[key] = descriptor.value;
      }
    }

    return redactPIIInObject(errorData, seen, depth + 1);
  }

  if (Array.isArray(obj)) {
    const result: RedactionResult[] = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) {
      const item = obj[i];
      // PERFORMANCE: Inline string handling to avoid recursive redactPIIInObject call
      if (typeof item === 'string') {
        // PERFORMANCE: Inline string handling to avoid recursive redactPIIInObject call
        result[i] =
          item.length < 4 || !COMBINED_TRIGGER_REGEX.test(item)
            ? item
            : _redactPII(item);
      } else {
        result[i] = redactPIIInObject(item, seen, depth + 1);
      }
    }
    return result;
  }

  const redacted: RedactedObject = {};

  // PERFORMANCE: Inline processEntry logic to avoid closure creation overhead per object property.
  // Using Object.keys() for string keys and processing symbols separately is
  // significantly faster than getAllPropertyDescriptors() for non-Error objects.
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // SECURITY: skip prototype-polluting keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    try {
      const value = (obj as Record<string, unknown>)[key];
      const action = getKeyAction(key);

      if (action.type === 'SAFE') {
        redacted[key] = value as RedactionResult;
      } else if (action.type === 'SENSITIVE') {
        redacted[key] = action.label!;
      } else if (typeof value === 'string') {
        // PERFORMANCE: Inline fast-path check to avoid function call overhead
        // for safe strings. Most log strings do not contain PII.
        redacted[key] =
          value.length < 4 || !COMBINED_TRIGGER_REGEX.test(value)
            ? value
            : _redactPII(value);
      } else if (value !== null && typeof value === 'object') {
        redacted[key] = redactPIIInObject(value, seen, depth + 1);
      } else {
        redacted[key] = value as RedactionResult;
      }
    } catch {
      redacted[key] = '[Getter Error]';
    }
  }

  // Handle enumerable symbols
  const symbols = Object.getOwnPropertySymbols(obj);
  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    if (Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      try {
        const key = sym.toString();
        const value = (obj as Record<symbol, unknown>)[sym];
        const action = getKeyAction(key);

        if (action.type === 'SAFE') {
          redacted[key] = value as RedactionResult;
        } else if (action.type === 'SENSITIVE') {
          redacted[key] = action.label!;
        } else if (typeof value === 'string') {
          // PERFORMANCE: Inline fast-path check
          redacted[key] =
            value.length < 4 || !COMBINED_TRIGGER_REGEX.test(value)
              ? value
              : _redactPII(value);
        } else if (value !== null && typeof value === 'object') {
          redacted[key] = redactPIIInObject(value, seen, depth + 1);
        } else {
          redacted[key] = value as RedactionResult;
        }
      } catch {
        redacted[sym.toString()] = '[Getter Error]';
      }
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
  actionCacheSize: number;
  labelCacheSize: number; // Backward compatibility
  maxRecursionDepth: number;
  safeFieldsCount: number;
} {
  return {
    actionCacheSize: KEY_ACTION_CACHE.size,
    labelCacheSize: KEY_ACTION_CACHE.size,
    maxRecursionDepth: MAX_RECURSION_DEPTH,
    safeFieldsCount: SAFE_FIELDS_SET.size,
  };
}

export function clearRedactionCache(): void {
  KEY_ACTION_CACHE.clear();
}
