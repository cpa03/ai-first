/**
 * Secure Identification and Hashing Utilities
 *
 * This module provides utilities for secure ID generation, constant-time
 * comparisons to prevent timing attacks, and deterministic hashing for
 * anonymization of sensitive identifiers.
 *
 * @module lib/security/id-generator
 */

/**
 * Deterministic hash algorithm (DJB2) for stable identifiers
 *
 * Used for anonymizing sensitive data (like user tokens) for rate limiting
 * without leaking the original value or introducing asynchronous complexity.
 * DJB2 provides a good distribution with minimal collision risk for short strings.
 *
 * @param input - The string to hash
 * @returns A stable, numeric hash as a string
 */
export function simpleHash(input: string, length?: number): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char; // hash * 33 ^ c
  }
  const hashStr = Math.abs(hash >>> 0).toString(16);
  if (length) {
    return hashStr.padStart(length, '0').substring(0, length);
  }
  return hashStr;
}

/**
 * Constant-time comparison to prevent timing attacks
 *
 * Supports both strings and Uint8Arrays. When comparing sensitive values
 * (like API keys, hashes, or signatures), this function ensures the
 * execution time does not depend on the value being compared.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are identical
 */
export function timingSafeEqual(
  a: string | Uint8Array,
  b: string | Uint8Array
): boolean {
  const bufA = typeof a === 'string' ? new TextEncoder().encode(a) : a;
  const bufB = typeof b === 'string' ? new TextEncoder().encode(b) : b;

  if (bufA.length !== bufB.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
}

/**
 * Generate a cryptographically secure, collision-resistant unique ID
 * Uses globalThis.crypto.randomUUID() for platform-neutral execution.
 *
 * @returns A secure UUID string
 */
export function generateSecureId(): string {
  return globalThis.crypto.randomUUID();
}
