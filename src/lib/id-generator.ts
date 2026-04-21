/**
 * ID Generation and Cryptographic Utilities
 *
 * Provides cryptographically secure ID generation and timing-safe comparison
 * utilities compatible with both Node.js and Edge runtimes.
 *
 * @module lib/id-generator
 */

/**
 * Generate a cryptographically secure, collision-resistant UUID (v4).
 * Uses the Web Crypto API (globalThis.crypto) for cross-platform compatibility.
 *
 * @returns A randomly generated UUID string
 */
export function generateSecureId(): string {
  return globalThis.crypto.randomUUID();
}

/**
 * Timing-safe comparison for two strings or Uint8Arrays.
 * Prevents timing attacks by ensuring the comparison time is independent of the content.
 * Both inputs must have the same length for the comparison to proceed; if lengths differ,
 * it returns false immediately to avoid leaks via length-based timing.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if values are equal, false otherwise
 */
export function timingSafeEqual(
  a: string | Uint8Array,
  b: string | Uint8Array
): boolean {
  if (typeof a === 'string' && typeof b === 'string') {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  if (a instanceof Uint8Array && b instanceof Uint8Array) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  return false;
}

/**
 * A deterministic, non-cryptographic hash function for generating stable identifiers.
 * Uses a variant of the DJB2 algorithm to produce a 16-character hex string.
 * Useful for anonymizing tokens while maintaining stability across sessions.
 *
 * @param str - The string to hash
 * @returns A 16-character hex string representing the hash
 */
export function simpleHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (
    (h1 >>> 0).toString(16).padStart(8, '0') +
    (h2 >>> 0).toString(16).padStart(8, '0')
  );
}
