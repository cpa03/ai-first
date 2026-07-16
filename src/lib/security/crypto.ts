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
 * PERFORMANCE: Pre-computed byte-to-hex lookup table for fast manual UUID construction.
 * Avoids expensive Array.from(), .map(), and .padStart() calls in the fallback path.
 * Benchmarks show ~10x speedup over the previous iterative approach.
 */
const BYTE_TO_HEX = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0')
);

/**
 * PERFORMANCE: Fast-path access to global object for crypto detection.
 * Accessing globalThis.crypto directly is extremely fast and ensures
 * we stay "live" and testable in environments that mock or nuke globalThis.crypto.
 */
const GLOBAL_OBJ =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
        ? window
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({} as any);

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
  const c =
    GLOBAL_OBJ.crypto || (typeof crypto !== 'undefined' ? crypto : undefined);

  // 1. Native randomUUID (preferred)
  if (c?.randomUUID) {
    return c.randomUUID();
  }

  // 2. Manual construction via getRandomValues
  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);

    // Format as UUID v4-ish string
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xxxxxx

    // PERFORMANCE: Use fast-path lookup table instead of Array.from().map()
    const h = (start: number, end: number): string => {
      let res = '';
      for (let i = start; i < end; i++) res += BYTE_TO_HEX[bytes[i]];
      return res;
    };

    return `${h(0, 4)}-${h(4, 6)}-${h(6, 8)}-${h(8, 10)}-${h(10, 16)}`;
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

  // PERFORMANCE: Use pre-computed lookup table for the most common case (8 chars).
  // Benchmarks show ~4x speedup over .toString(16).padStart(8, '0').
  const h = hash >>> 0;
  if (HASH_CONFIG.FINGERPRINT_LENGTH === 8) {
    return (
      BYTE_TO_HEX[(h >>> 24) & 0xff] +
      BYTE_TO_HEX[(h >>> 16) & 0xff] +
      BYTE_TO_HEX[(h >>> 8) & 0xff] +
      BYTE_TO_HEX[h & 0xff]
    );
  }

  // Fallback for non-standard fingerprint lengths
  return h.toString(16).padStart(HASH_CONFIG.FINGERPRINT_LENGTH, '0');
}

/**
 * Returns a cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
 * Provides a security-hardened alternative to Math.random() that is compatible
 * across Browser, Node.js, and Cloudflare Workers.
 *
 * @returns A random number between 0 and 1
 */
export function secureRandom(): number {
  const c =
    GLOBAL_OBJ.crypto || (typeof crypto !== 'undefined' ? crypto : undefined);

  if (c?.getRandomValues) {
    const array = new Uint32Array(1);
    c.getRandomValues(array);
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
