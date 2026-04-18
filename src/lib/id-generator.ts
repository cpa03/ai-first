/**
 * Secure ID and Hashing Utilities
 *
 * This module provides cryptographically secure ID generation and
 * deterministic hashing utilities that are compatible across all
 * environments (Browser, Node.js, and Edge/Cloudflare Workers).
 */

/**
 * Generates a cryptographically secure, collision-resistant ID (UUID v4).
 * Uses the Web Crypto API which is globally available in modern environments.
 *
 * @returns A secure UUID string
 */
export function generateSecureId(): string {
  // 1. Try global crypto (Node.js 19+, modern Browsers, Edge)
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }

  // 2. Try globalThis.crypto
  try {
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === 'function'
    ) {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }

  // 3. Fallback using getRandomValues()
  try {
    const c = typeof crypto !== 'undefined' ? crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
    if (c && typeof c.getRandomValues === 'function') {
      const array = new Uint8Array(16);
      c.getRandomValues(array);

      // Set version (4) and variant (RFC4122)
      array[6] = (array[6] & 0x0f) | 0x40;
      array[8] = (array[8] & 0x3f) | 0x80;

      const hex = Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
  } catch {
    /* ignore */
  }

  // 4. Final fallback: JS-based UUID (guaranteed compatibility)
  // Used only when no cryptographic source is available
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a deterministic, non-cryptographic hash of a string.
 * Returns a 16-character hexadecimal string.
 *
 * This is useful for stable error fingerprinting or anonymizing tokens
 * in a way that is consistent across different platforms without
 * requiring platform-specific crypto modules like 'node:crypto'.
 *
 * Uses a modified DJB2 algorithm for good distribution with low collisions.
 *
 * @param str - The input string to hash
 * @returns A 16-character hex string
 */
export function simpleHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ char, 2654435761);
    h2 = Math.imul(h2 ^ char, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}
