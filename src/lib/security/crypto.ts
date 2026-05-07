/**
 * Cryptographic and Hashing Utilities
 *
 * Centralized security utilities for generating unique IDs and hashing strings.
 * Optimized for performance and collision resistance across different environments
 * (Browsers, Node.js, and Cloudflare Workers).
 */

/**
 * Hardened djb2 hash algorithm
 *
 * Provides a fast, deterministic 32-bit hash of a string with good distribution.
 * Uses bitwise OR wrapping (| 0) to maintain 32-bit precision across all environments.
 *
 * ⚠️ SECURITY: This is a non-cryptographic hash used for identification and
 * rate limiting. It should NOT be used for password hashing or sensitive data integrity.
 *
 * @param str - The string to hash
 * @returns 32-bit unsigned integer as a string
 */
export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // hash * 33 + char
    hash = ((hash << 5) + hash + char) | 0;
  }
  return Math.abs(hash >>> 0).toString(36);
}

/**
 * Generates a cryptographically secure, collision-resistant unique identifier.
 *
 * Priority:
 * 1. globalThis.crypto.randomUUID() (Modern browsers, Node.js 20+, Cloudflare Workers)
 * 2. globalThis.crypto.getRandomValues() fallback
 * 3. Date.now() + Math.random() (Legacy fallback, non-cryptographic)
 *
 * @returns A unique identifier string
 */
export function generateId(): string {
  // Use modern randomUUID if available
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails in specific environments
    }
  }

  // Fallback to getRandomValues
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    try {
      const buffer = new Uint8Array(16);
      globalThis.crypto.getRandomValues(buffer);
      // Simple hex conversion
      return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback if getRandomValues fails
    }
  }

  // Final fallback (least secure)
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${randomPart}`;
}
