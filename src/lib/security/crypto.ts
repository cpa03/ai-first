/**
 * Cryptographic Utilities for Security and Edge Compatibility
 *
 * This module provides centralized, cryptographically secure utilities
 * that are compatible across Browser, Node.js, and Cloudflare Workers.
 *
 * @module lib/security/crypto
 */

import { HASH_CONFIG } from '@/lib/config/modular-constants';

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

  // 3. No crypto available - throw error instead of insecure fallback
  throw new Error(
    'CRITICAL SECURITY: Web Crypto API is unavailable. Cannot generate cryptographically secure IDs. ' +
      'Ensure globalThis.crypto or crypto is available, or use a polyfill.'
  );
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
  let hash = HASH_CONFIG.DJB2_SEED;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  // Return as positive hex string, padded to 8 chars
  return (hash >>> 0)
    .toString(16)
    .padStart(HASH_CONFIG.FINGERPRINT_LENGTH, '0');
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
    // Divide by 2^32 to get a number in [0, 1)
    return array[0] / HASH_CONFIG.TWO_POWER_32;
  }

  // Web Crypto API is unavailable - this is a critical security failure.
  // Math.random() is NOT cryptographically secure and must NEVER be used
  // for security-sensitive operations (tokens, IDs, keys, etc.).
  // Note: We use console.warn directly to avoid circular dependencies
  // with the logger module (logger -> crypto -> logger).
  console.warn(
    'CRITICAL SECURITY WARNING: Web Crypto API is unavailable. Refusing to use insecure fallback.'
  );
  throw new Error(
    'CRITICAL SECURITY: Web Crypto API is unavailable. Cannot generate cryptographically secure random values. ' +
      'This environment does not support secure random generation. ' +
      'Ensure globalThis.crypto or crypto is available, or use a polyfill.'
  );
}
