/**
 * Secure ID and Hashing Utilities
 *
 * Provides cryptographically secure ID generation and deterministic hashing
 * that works across Node.js, Browser, and Edge runtimes.
 *
 * @module lib/id-generator
 */

/**
 * Get the crypto object from the global scope
 */
const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  if (typeof crypto !== 'undefined') return crypto;
  return null;
};

/**
 * Generate a cryptographically secure, collision-resistant unique identifier.
 * Uses the standard Web Crypto API randomUUID() which is available in all
 * modern environments (Edge, Node.js 16+, Browsers).
 *
 * @returns A secure UUID v4 string
 */
export function generateSecureId(): string {
  const crypto = getCrypto();
  if (crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Secure fallback using getRandomValues
  const array = new Uint8Array(16);
  if (crypto && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(array);
  } else {
    // This should ideally never happen in our supported environments
    throw new Error('Crypto implementation not found');
  }

  // Set version to 4
  array[6] = (array[6] & 0x0f) | 0x40;
  // Set variant to RFC4122
  array[8] = (array[8] & 0x3f) | 0x80;

  const hex = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generate a cryptographically secure random hex string.
 *
 * @param bytes - Number of random bytes to generate
 * @returns Hex string
 */
export function generateRandomHex(bytes: number = 16): string {
  const crypto = getCrypto();
  const array = new Uint8Array(bytes);
  if (crypto && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(array);
  } else {
    throw new Error('Crypto implementation not found');
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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
    const char = input.charCodeAt(i);
    // DJB2a algorithm: (hash * 33) ^ char
    hash = ((hash << 5) + hash) ^ char;
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

  // Use ArrayBufferView check for better compatibility across realms
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    const ua = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const ub = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    if (ua.length !== ub.length) return false;
    let result = 0;
    for (let i = 0; i < ua.length; i++) {
      result |= ua[i] ^ ub[i];
    }
    return result === 0;
  }

  return false;
}
