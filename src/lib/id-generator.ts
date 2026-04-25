/**
 * ID Generation and Cryptographic Utilities
 *
 * Provides centralized, secure utilities for generating IDs, hashing tokens,
 * and performing timing-safe comparisons across Node.js and Browser/Edge runtimes.
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 * Uses crypto.randomUUID() which is available in Node.js 15.6+ and modern browsers.
 */
export function generateSecureId(): string {
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    // Fallback for environments where crypto.randomUUID might be missing (rare)
    const uint32 = new Uint32Array(4);
    globalThis.crypto.getRandomValues(uint32);
    return Array.from(uint32)
      .map((n) => n.toString(16).padStart(8, '0'))
      .join('-');
  }
}

/**
 * Generate a deterministic, non-cryptographic hash of a string.
 * Uses the DJB2 algorithm for stability across platforms and runtimes.
 *
 * Useful for anonymizing tokens or identifiers without the complexity of
 * async Web Crypto APIs.
 *
 * @param str - The string to hash
 * @param length - Optional length to truncate the hex result (default: 32)
 */
export function simpleHash(str: string, length: number = 32): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  // Convert to unsigned 32-bit hex string
  const hex = (hash >>> 0).toString(16).padStart(8, '0');

  // If we need a longer hash, we can combine with string length and some bits
  if (length <= 8) return hex.substring(0, length);

  // For longer identifiers, add a deterministic secondary component
  let hash2 = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    hash2 = (hash2 * 31) ^ str.charCodeAt(i);
  }
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');

  // Add a third component for more entropy in the hex string
  let hash3 = 0;
  for (let i = 0; i < str.length; i++) {
    hash3 = (hash3 * 37) + str.charCodeAt(i);
    hash3 = hash3 & hash3; // Convert to 32bit integer
  }
  const hex3 = (hash3 >>> 0).toString(16).padStart(8, '0');

  // Add a fourth component
  let hash4 = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    hash4 = (hash4 * 41) + str.charCodeAt(i);
    hash4 = hash4 & hash4;
  }
  const hex4 = (hash4 >>> 0).toString(16).padStart(8, '0');

  return (hex + hex2 + hex3 + hex4).substring(0, length);
}

/**
 * Perform a timing-safe comparison of two strings or Uint8Arrays.
 * Prevents timing attacks by ensuring comparison time is independent of input values.
 */
export function timingSafeEqual(
  a: string | Uint8Array,
  b: string | Uint8Array
): boolean {
  const encoder = new TextEncoder();
  const aArr = typeof a === 'string' ? encoder.encode(a) : a;
  const bArr = typeof b === 'string' ? encoder.encode(b) : b;

  if (aArr.length !== bArr.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aArr.length; i++) {
    result |= aArr[i] ^ bArr[i];
  }
  return result === 0;
}
