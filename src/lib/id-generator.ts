/**
 * Secure ID and Hashing Utilities
 *
 * Provides cryptographically secure ID generation and deterministic hashing
 * that works across Node.js, Browser, and Edge runtimes.
 *
 * @module lib/id-generator
 */

/**
 * Generate a cryptographically secure, collision-resistant unique identifier.
 * Uses the standard Web Crypto API randomUUID() which is available in all
 * modern environments (Edge, Node.js 16+, Browsers).
 *
 * @returns A secure UUID v4 string
 */
export function generateSecureId(): string {
  return globalThis.crypto.randomUUID();
}

/**
 * Deterministic non-cryptographic hash using the DJB2 algorithm.
 * Provides stable identifiers across platforms without the overhead or
 * async complexity of Web Crypto digests.
 *
 * ⚠️ WARNING: This is NOT for cryptographic security (like password hashing).
 * It is intended for stable identifiers, cache keys, and data anonymization
 * where pre-image resistance is not a requirement.
 *
 * @param input - The string to hash
 * @returns An 8-character hex string
 */
export function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // hash * 33 + c
    hash = (hash << 5) + hash + input.charCodeAt(i);
  }
  // Convert to unsigned 32-bit integer and then to hex
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Constant-time comparison to prevent timing attacks.
 * Supports both strings and Uint8Arrays (e.g., from Web Crypto digests).
 *
 * Timing attacks allow an attacker to determine a secret by measuring
 * how long a comparison takes. This function ensures the comparison
 * time is independent of the values being compared.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if values are equal
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
