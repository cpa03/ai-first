/**
 * Centralized ID and Hash Generation Utilities
 *
 * Provides cryptographically secure ID generation and deterministic hashing
 * that works across Node.js, Browser, and Edge runtimes.
 *
 * @module lib/id-generator
 */

/**
 * Generate a cryptographically secure, collision-resistant unique identifier.
 * Uses globalThis.crypto.randomUUID() for high entropy.
 *
 * @returns A random UUID string
 */
export function generateSecureId(): string {
  /**
   * globalThis.crypto.randomUUID() is the standard Web API for secure UUID generation.
   * It is supported in:
   * - Node.js 19.0.0+ (and 14.7.0+ / 16.7.0+ via crypto module, global in 19+)
   * - Cloudflare Workers & Vercel Edge Runtime
   * - All modern browsers
   *
   * Since this project requires Node.js >= 20, we can safely rely on the global version.
   */
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
    // Fallback for some Node.js environments where it might not be global yet or in tests
    // @ts-ignore - crypto might be available via global in Node
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {
    // Fallback handled below
  }

  // Final fallback using a robust but less secure method if Web Crypto is completely unavailable.
  // This should be extremely rare given our environment constraints.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Constant-time comparison for strings or Uint8Arrays to prevent timing attacks.
 * This is crucial for comparing passwords, tokens, or other secrets.
 *
 * Supports both string and Uint8Array inputs.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if the values are equal, false otherwise
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
 * Deterministic, non-cryptographic hash utility using the DJB2 algorithm.
 * Useful for stable identifiers (e.g., for rate limiting) without leaking original data.
 *
 * @param input - The string to hash
 * @returns A stable, numeric hash as a string
 */
export function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char; // hash * 33 ^ c
  }
  // Return as 32-bit hex string (8 characters)
  return (hash >>> 0).toString(16).padStart(8, '0');
}
