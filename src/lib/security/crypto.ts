/**
 * Cryptographic Utilities for Security and Edge Compatibility
 *
 * This module provides centralized, cryptographically secure utilities
 * that are compatible across Browser, Node.js, and Cloudflare Workers.
 *
 * @module lib/security/crypto
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 *
 * Priority:
 * 1. globalThis.crypto.randomUUID() - Native, fast, and secure (Node 19+, modern browsers)
 * 2. globalThis.crypto.getRandomValues() - Secure construction for older environments
 * 3. Fallback - Timestamp + Math.random (only if Web Crypto API is unavailable)
 *
 * @returns A unique string ID
 */
export function generateId(): string {
  // Use globalThis.crypto for cross-environment compatibility
  // Robust check for various runtimes (Browsers, Node, Workers)
  const cryptoObj =
    typeof globalThis !== 'undefined'
      ? globalThis.crypto
      : typeof crypto !== 'undefined'
        ? crypto
        : undefined;

  // 1. Native randomUUID (preferred)
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  // 2. Manual construction via getRandomValues
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);

    // Format as UUID v4-ish string
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xxxxxx

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // 3. Last resort fallback (non-cryptographic)
  // This should only be reached in extremely restricted legacy environments
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${randomPart}`;
}

/**
 * Generate a simple, deterministic 32-bit hash for a string.
 * Uses a hardened djb2 algorithm with bitwise OR wrapping to maintain
 * 32-bit precision across all environments.
 *
 * Use for non-security-critical fingerprinting or caching.
 * For sensitive data, use SHA-256 via the Web Crypto API.
 *
 * @param str - The string to hash
 * @returns A 32-bit hex string hash (up to 8 characters)
 */
export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  // Return as positive hex string, padded to 8 chars
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Returns a cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
 * Provides a security-hardened alternative to Math.random() that is compatible
 * across Browser, Node.js, and Cloudflare Workers.
 *
 * @returns A random number between 0 and 1
 */
export function secureRandom(): number {
  const cryptoObj =
    typeof globalThis !== 'undefined'
      ? globalThis.crypto
      : typeof crypto !== 'undefined'
        ? crypto
        : undefined;

  if (cryptoObj?.getRandomValues) {
    const array = new Uint32Array(1);
    cryptoObj.getRandomValues(array);
    // Divide by 2^32 (4294967296) to get a number in [0, 1)
    return array[0] / 4294967296;
  }

  // Fallback to Math.random if Web Crypto API is unavailable
  // This is a last resort and will be flagged by security scripts
  console.warn(
    'CRITICAL SECURITY WARNING: Using insecure random generator as Web Crypto API is unavailable.'
  );
  return Math.random();
}
