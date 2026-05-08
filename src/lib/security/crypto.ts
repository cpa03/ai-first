/**
 * Cryptographic and Hashing Utilities
 *
 * Centralized security utilities for generating collision-resistant IDs
 * and performing consistent non-cryptographic hashing.
 *
 * @module lib/security/crypto
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 *
 * This implementation is designed to be environment-aware, working in:
 * - Modern Browsers (via Web Crypto API)
 * - Node.js 19+ (via globalThis.crypto)
 * - Cloudflare Workers (via Web Crypto API)
 *
 * It prioritizes randomUUID() for performance and collision resistance,
 * with secure fallbacks for environments where the Web Crypto API might
 * be partially available or completely absent.
 *
 * @returns A unique string identifier
 */
export function generateId(): string {
  // Use globalThis.crypto to avoid importing node:crypto which can break Edge runtimes
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  // 1. Primary: crypto.randomUUID() (Standard in Node 19+ and modern browsers)
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    try {
      return cryptoObj.randomUUID();
    } catch {
      // Fall through to next method
    }
  }

  // 2. Secondary: crypto.getRandomValues() (Standard in all modern environments)
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    try {
      const buffer = new Uint8Array(16);
      cryptoObj.getRandomValues(buffer);

      // Simple hex conversion as fallback for UUID format
      return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fall through to next method
    }
  }

  // 3. Final Fallback: Non-cryptographic (Rare edge cases/legacy environments)
  // This is a last resort and should not be relied upon for security-sensitive IDs
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Hardened djb2 hash function.
 *
 * A fast, non-cryptographic hash function suitable for generating
 * consistent identifiers from strings (e.g., for rate limiting or fingerprinting).
 *
 * Uses bitwise OR wrapping (| 0) to maintain 32-bit precision across
 * different JavaScript runtimes.
 *
 * @param str - The string to hash
 * @returns A 32-bit integer hash
 */
export function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // (hash * 33) + charCode
    hash = (hash << 5) + hash + str.charCodeAt(i);
    // Wrap to 32-bit integer
    hash = hash | 0;
  }
  return hash;
}
