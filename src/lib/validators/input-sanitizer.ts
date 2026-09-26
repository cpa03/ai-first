import { VALIDATION_LIMITS } from '../config';
import { CACHE_CONFIG } from '../config/cache';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Export constants from VALIDATION_LIMITS for backward compatibility
export const MAX_IDEA_LENGTH = VALIDATION_LIMITS.IDEA.MAX_LENGTH;
export const MIN_IDEA_LENGTH = VALIDATION_LIMITS.IDEA.MIN_LENGTH;
export const MAX_TITLE_LENGTH = VALIDATION_LIMITS.TITLE.MAX_LENGTH;
export const MAX_IDEA_ID_LENGTH = VALIDATION_LIMITS.IDEA.MAX_ID_LENGTH;

// Answer validation constants for clarification flow
export const MIN_ANSWER_LENGTH = VALIDATION_LIMITS.ANSWER.MIN_LENGTH;
export const MAX_ANSWER_LENGTH = VALIDATION_LIMITS.ANSWER.MAX_LENGTH;
export const MIN_SHORT_ANSWER_LENGTH =
  VALIDATION_LIMITS.ANSWER.MIN_SHORT_LENGTH;
export const MAX_SHORT_ANSWER_LENGTH =
  VALIDATION_LIMITS.ANSWER.MAX_SHORT_LENGTH;

/**
 * Input sanitization functions for strings, HTML, and objects.
 * Prevents XSS and injection attacks.
 */

// PERFORMANCE: Cache for the results of sanitizeHtml to avoid redundant regex
// execution and string replacement on identical input strings.
const SANITIZE_HTML_CACHE = new Map<string, string>();

/**
 * Clears the sanitizeHtml cache.
 * Useful for testing and memory management.
 */
export function clearSanitizeHtmlCache(): void {
  SANITIZE_HTML_CACHE.clear();
}

/**
 * Sanitizes HTML content by removing script tags and escaping HTML entities
 * to prevent XSS attacks. This is a basic sanitization suitable for
 * simple text fields like titles.
 */
/**
 * Pre-compiled regex for HTML entity escaping to avoid dynamic creation on every call.
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};
const HTML_ESCAPE_REGEX = new RegExp(
  `[${Object.keys(HTML_ESCAPE_MAP)
    .join('')
    .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`,
  'g'
);

/**
 * Fast-path trigger regex to identify strings that likely need no sanitization.
 * Checks for: <, >, &, ", ', / or any common event handler pattern (on...),
 * or dangerous protocols (javascript:, vbscript:, livescript:, data:text/html, data:image/svg+xml)
 * including obfuscated versions with whitespace/control characters.
 */
const NEEDS_SANITIZATION_REGEX =
  /[<>&"'/`]|(?:^|[^a-z0-9_-])on\w+\s*=|[\s/]*style\s*=|(?:\b|[^a-z0-9])(?:j[\s\x00-\x1F]*a[\s\x00-\x1F]*v[\s\x00-\x1F]*a[\s\x00-\x1F]*s[\s\x00-\x1F]*c[\s\x00-\x1F]*r[\s\x00-\x1F]*i[\s\x00-\x1F]*p[\s\x00-\x1F]*t|v[\s\x00-\x1F]*b[\s\x00-\x1F]*s[\s\x00-\x1F]*c[\s\x00-\x1F]*r[\s\x00-\x1F]*i[\s\x00-\x1F]*p[\s\x00-\x1F]*t|l[\s\x00-\x1F]*i[\s\x00-\x1F]*v[\s\x00-\x1F]*e[\s\x00-\x1F]*s[\s\x00-\x1F]*c[\s\x00-\x1F]*r[\s\x00-\x1F]*i[\s\x00-\x1F]*p[\s\x00-\x1F]*t)[\s\x00-\x1F]*:|d[\s\x00-\x1F]*a[\s\x00-\x1F]*t[\s\x00-\x1F]*a[\s\x00-\x1F]*:[\s\x00-\x1F]*(?:text\/html|image\/svg\+xml)/i;

/**
 * Sanitizes HTML content by removing script tags and escaping HTML entities
 * to prevent XSS attacks. This is a basic sanitization suitable for
 * simple text fields like titles.
 *
 * PERFORMANCE: Uses a tiered strategy:
 * 1. Fast-path for non-strings/empty strings.
 * 2. Trim and check cache for already processed strings.
 * 3. Fast-path check if sanitization is even needed via trigger regex.
 * 4. Use pre-compiled regexes for the actual replacement work.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return '';
  }

  // PERFORMANCE: Cache lookup first. Identical strings will bypass
  // all regex operations and return immediately.
  const cached = SANITIZE_HTML_CACHE.get(trimmed);
  if (cached !== undefined) {
    return cached;
  }

  // PERFORMANCE: Fast-path for plain text without special characters.
  // This avoids multiple expensive regex replacements for the 99% case.
  if (!NEEDS_SANITIZATION_REGEX.test(trimmed)) {
    // Cache the fast-path result as well
    if (SANITIZE_HTML_CACHE.size >= CACHE_CONFIG.SANITIZE_HTML.MAX_SIZE) {
      const firstKey = SANITIZE_HTML_CACHE.keys().next().value;
      if (firstKey !== undefined) {
        SANITIZE_HTML_CACHE.delete(firstKey);
      }
    }
    SANITIZE_HTML_CACHE.set(trimmed, trimmed);
    return trimmed;
  }

  // Remove script tags and their contents
  let sanitized = trimmed.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove event handlers (onload, onclick, etc.) - handles quoted, unquoted, and no preceding space
  sanitized = sanitized.replace(
    /(?:^|[^a-z0-9_-])on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+)/gi,
    ''
  );

  // Redact potentially dangerous protocols (javascript:, vbscript:, livescript:) with whitespace/control char handling
  sanitized = sanitized.replace(
    /j[\s\x00-\x1F]*a[\s\x00-\x1F]*v[\s\x00-\x1F]*a[\s\x00-\x1F]*s[\s\x00-\x1F]*c[\s\x00-\x1F]*r[\s\x00-\x1F]*i[\s\x00-\x1F]*p[\s\x00-\x1F]*t[\s\x00-\x1F]*:/gi,
    '[REDACTED_PROTOCOL]'
  );
  sanitized = sanitized.replace(
    /v[\s\x00-\x1F]*b[\s\x00-\x1F]*s[\s\x00-\x1F]*c[\s\x00-\x1F]*r[\s\x00-\x1F]*i[\s\x00-\x1F]*p[\s\x00-\x1F]*t[\s\x00-\x1F]*:/gi,
    '[REDACTED_PROTOCOL]'
  );
  sanitized = sanitized.replace(
    /l[\s\x00-\x1F]*i[\s\x00-\x1F]*v[\s\x00-\x1F]*e[\s\x00-\x1F]*s[\s\x00-\x1F]*c[\s\x00-\x1F]*r[\s\x00-\x1F]*i[\s\x00-\x1F]*p[\s\x00-\x1F]*t[\s\x00-\x1F]*:/gi,
    '[REDACTED_PROTOCOL]'
  );

  // Redact potentially dangerous data: URIs (text/html, image/svg+xml) with whitespace/control char handling
  sanitized = sanitized.replace(
    /d[\s\x00-\x1F]*a[\s\x00-\x1F]*t[\s\x00-\x1F]*a[\s\x00-\x1F]*:[\s\x00-\x1F]*(?:text\/html|image\/svg\+xml)/gi,
    '[REDACTED_DATA_URI]'
  );

  // Redact potentially dangerous style attributes (quoted and unquoted)
  // Handles: style="...", style='...', style=..., /style="...", /style='...', /style=...
  sanitized = sanitized.replace(
    /(?:\s|\/)style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+)/gi,
    ' [REDACTED_STYLE]'
  );

  // Escape HTML entities to prevent script injection
  sanitized = sanitized.replace(
    HTML_ESCAPE_REGEX,
    (char) => (HTML_ESCAPE_MAP as Record<string, string>)[char] || char
  );

  // Cache the sanitized result
  if (SANITIZE_HTML_CACHE.size >= CACHE_CONFIG.SANITIZE_HTML.MAX_SIZE) {
    const firstKey = SANITIZE_HTML_CACHE.keys().next().value;
    if (firstKey !== undefined) {
      SANITIZE_HTML_CACHE.delete(firstKey);
    }
  }
  SANITIZE_HTML_CACHE.set(trimmed, sanitized);

  return sanitized;
}

/**
 * Sanitizes a string by trimming and limiting length
 */
export function sanitizeString(
  input: unknown,
  maxLength: number = VALIDATION_LIMITS.IDEA.MAX_LENGTH
): string {
  if (typeof input !== 'string') {
    return '';
  }
  let sanitized = input.trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Recursively sanitizes all string values within an object or array.
 * Useful for flexible JSON fields like custom_fields.
 *
 * PERFORMANCE OPTIMIZATION (⚡ Bolt):
 * - Fast-path for non-string primitives (numbers, booleans, null, undefined).
 * - Implements copy-on-change semantics for arrays and plain objects.
 * - Replaces Array.map and Object.entries (which allocate intermediate tuple arrays)
 *   with index/key loops.
 * - Returns the exact input reference when no values require sanitization, completely
 *   bypassing object/array allocations and eliminating garbage collection pressure.
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeHtml(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    let result: unknown[] | null = null;
    for (let i = 0; i < input.length; i++) {
      const item = input[i];

      let sanitizedItem: unknown;
      if (
        item === null ||
        (typeof item !== 'object' && typeof item !== 'string')
      ) {
        sanitizedItem = item;
      } else {
        sanitizedItem = sanitizeObject(item);
      }

      if (result) {
        result[i] = sanitizedItem;
      } else if (sanitizedItem !== item) {
        result = input.slice();
        result[i] = sanitizedItem;
      }
    }
    return (result || input) as unknown as T;
  }

  if (typeof input === 'object' && input.constructor === Object) {
    let result: Record<string, unknown> | null = null;
    const keys = Object.keys(input);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = (input as Record<string, unknown>)[key];

      let sanitizedValue: unknown;
      if (
        value === null ||
        (typeof value !== 'object' && typeof value !== 'string')
      ) {
        sanitizedValue = value;
      } else {
        sanitizedValue = sanitizeObject(value);
      }

      if (result) {
        result[key] = sanitizedValue;
      } else if (sanitizedValue !== value) {
        result = {};
        for (let j = 0; j < i; j++) {
          const prevKey = keys[j];
          result[prevKey] = (input as Record<string, unknown>)[prevKey];
        }
        result[key] = sanitizedValue;
      }
    }
    return (result || input) as unknown as T;
  }

  return input;
}
