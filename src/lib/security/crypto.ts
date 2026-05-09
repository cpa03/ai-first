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
export function generateId(prefix?: string): string {
  let id: string;

  try {
    // 1. Try native randomUUID (supported in Node.js 19+, modern browsers, and Cloudflare Workers)
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
      id = globalThis.crypto.randomUUID();
    }
    // 2. Try getRandomValues fallback for older environments
    else if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      // Format as UUID v4-ish string
      id = Array.from(bytes)
        .map((b, i) => {
          const s = b.toString(16).padStart(2, '0');
          if ([4, 6, 8, 10].includes(i)) return '-' + s;
          return s;
        })
        .join('');
    }
    // 3. Last resort fallback (non-cryptographic, but better than nothing)
    else {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
    }
  } catch {
    // Safety fallback for extremely restricted environments
    id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
  }

  return prefix ? `${prefix}_${id}` : id;
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
  return (hash >>> 0).toString(16);
}
