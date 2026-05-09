/**
 * Cryptographic Utilities
 *
 * Provides secure, environment-agnostic cryptographic functions.
 * Designed to work in Browsers, Node.js, and Cloudflare Workers/Edge.
 *
 * @module lib/security/crypto
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 * Uses Web Crypto API (globalThis.crypto) for maximum security and performance.
 *
 * @param prefix - Optional prefix for the ID (e.g., 'session', 'req')
 * @returns A secure unique identifier
 */
/**
 * Generate a cryptographically secure, collision-resistant ID.
 * Uses Web Crypto API (globalThis.crypto) for maximum security and performance.
 *
 * Pattern: [prefix_]<uuid>
 *
 * @param prefix - Optional prefix for the ID (e.g., 'session', 'req')
 * @returns A secure unique identifier
 */
export function generateId(prefix?: string): string {
  let id: string = '';

  try {
    // 1. Prioritize globalThis.crypto for environment compatibility (Edge, Worker, Browser)
    const crypto = typeof globalThis !== 'undefined' ? globalThis.crypto : null;

    if (crypto) {
      // 1.1 Try native randomUUID (CSPRNG)
      if (typeof crypto.randomUUID === 'function') {
        id = crypto.randomUUID();
      }
      // 1.2 Fallback to getRandomValues (CSPRNG)
      else if (typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);

        // Manual UUID v4 construction from bytes
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx

        id = Array.from(bytes)
          .map((b, i) => {
            const s = b.toString(16).padStart(2, '0');
            if ([4, 6, 8, 10].includes(i)) return '-' + s;
            return s;
          })
          .join('');
      }
    }
  } catch {
    // Ignore errors and fall through to insecure fallback
  }

  // 3. Last resort fallback (non-cryptographic)
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 12)}`;
  }

  if (!prefix) return id;
  const separator = prefix.endsWith('_') ? '' : '_';
  return `${prefix}${separator}${id}`;
}

/**
 * Generates a simple, non-cryptographic hash for strings.
 * Useful for fingerprints or deduplication where full cryptographic
 * strength is not required and performance is priority.
 *
 * Implementation: djb2 algorithm with bitwise OR wrapping
 *
 * @param str - The string to hash
 * @returns A 32-bit integer hash as a hex string
 */
export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + c
    hash = (hash << 5) + hash + str.charCodeAt(i);
    // Convert to 32bit integer
    hash = hash | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Hardened djb2 hash that produces a longer string for better collision resistance.
 * Not cryptographically secure, but suitable for fingerprints.
 *
 * @param str - The string to hash
 * @returns A 12-character hex string
 */
export function hardenedHash(str: string): string {
  let hash1 = 5381;
  let hash2 = 8903;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = ((hash2 << 5) + hash2) ^ char;
  }

  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');

  return (h1 + h2).substring(0, 12);
}
