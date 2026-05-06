/**
 * Centralized Cryptographic Utilities
 *
 * Provides secure, environment-agnostic cryptographic functions for ID generation,
 * hashing, and other security-sensitive operations.
 *
 * @module lib/security/crypto
 */

/**
 * A simple, fast string hashing function using the djb2 algorithm.
 * Uses bitwise operations to ensure 32-bit precision across all environments
 * (Node.js, Browser, Cloudflare Workers).
 *
 * @param str - The string to hash
 * @returns A base-36 encoded hash string
 */
export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode, with 32-bit integer wrapping
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  // Convert to unsigned 32-bit and return as base-36 for compactness
  return (hash >>> 0).toString(36);
}

/**
 * Generates a secure, collision-resistant unique identifier.
 * Prioritizes the Web Crypto API (crypto.randomUUID) for maximum security.
 *
 * @param prefix - Optional prefix for the ID (e.g., 'session_', 'req_')
 * @returns A unique identifier string
 */
export function generateSecureId(prefix: string = ''): string {
  try {
    // 1. Try native randomUUID (Node 20+, Cloudflare, Modern Browsers)
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === 'function'
    ) {
      return `${prefix}${globalThis.crypto.randomUUID()}`;
    }

    // 2. Fallback to getRandomValues if randomUUID is missing
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.crypto &&
      typeof globalThis.crypto.getRandomValues === 'function'
    ) {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      // Simple hex conversion
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return `${prefix}${hex}`;
    }
  } catch {
    // Fall through to non-crypto fallback if anything fails
  }

  // 3. Last resort fallback (non-cryptographic, for very old/restricted environments)
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}-${random}`;
}
