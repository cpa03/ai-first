/**
 * id-generator.ts - Centralized Secure ID and Hashing Utilities
 *
 * Provides cryptographically secure IDs and deterministic hashing for
 * use across Node.js, Browser, and Edge runtimes.
 */

/**
 * Generates a cryptographically secure, collision-resistant ID.
 * Uses globalThis.crypto.randomUUID() to ensure high entropy.
 *
 * @returns A secure UUID v4 string
 */
export function generateSecureId(): string {
  // In modern environments (Node 16+, Browsers, Edge), randomUUID is standard
  return globalThis.crypto.randomUUID();
}

/**
 * Deterministic hash function for stable identifiers and anonymization.
 * Uses a multi-component entropy pattern (including DJB2 and Murmur-like mixing)
 * to provide low-collision hashes across all runtimes.
 *
 * @param input - The string to hash
 * @param length - Desired length of the resulting hex string (max 16)
 * @returns A deterministic hex string
 */
export function simpleHash(input: string, length: number = 16): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const fullHash = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  return fullHash.substring(0, Math.min(length, 16));
}

/**
 * Constant-time comparison to prevent timing attacks.
 * Supports both string and Uint8Array inputs.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are equal, false otherwise
 */
export function timingSafeEqual(
  a: string | Uint8Array,
  b: string | Uint8Array
): boolean {
  const aBuf = typeof a === 'string' ? new TextEncoder().encode(a) : a;
  const bBuf = typeof b === 'string' ? new TextEncoder().encode(b) : b;

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }

  return result === 0;
}
