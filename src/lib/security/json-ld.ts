/**
 * JSON-LD Security Utilities
 *
 * Provides utilities for safely embedding JSON-LD structured data in HTML script tags.
 * This prevents XSS attacks by escaping characters that can break out of the script tag.
 *
 * @module lib/security/json-ld
 */

/**
 * Safely stringifies an object for use in a JSON-LD script tag.
 *
 * Escapes characters that have special meaning in HTML script tags:
 * - '<' is replaced with '\u003c' to prevent early script tag closure (</script>)
 *   and starting new tags (<script>).
 * - '>' is replaced with '\u003e' for consistency and extra safety.
 * - '&' is replaced with '\u0026' to prevent entity injection.
 * - '\u2028' and '\u2029' are escaped as they can cause issues in some JS engines
 *   when embedded in a string.
 *
 * @param obj - The object to stringify and escape
 * @returns A safe JSON string for use in dangerouslySetInnerHTML
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
