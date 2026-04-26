/**
 * id-generator.ts - Centralized Secure ID and Hashing Utilities
 *
 * Provides cryptographically secure IDs and deterministic hashing for
 * use across Node.js, Browser, and Edge runtimes.
 *
 * DESIGN PHILOSOPHY:
 * 1. Platform Neutrality: No node:* or platform-specific imports.
 * 2. Secure by Default: Use globalThis.crypto for all operations.
 * 3. Graceful Fallbacks: Handle environments where randomUUID might be missing.
 */

/**
 * Generates a cryptographically secure, collision-resistant ID.
 * Favors globalThis.crypto.randomUUID() for high entropy.
 *
 * @returns A secure UUID v4 string
 */
export function generateSecureId(): string {
  // 1. Try native randomUUID (Node 19+, all modern browsers/Edge runtimes)
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  // 2. Fallback for older Node.js/browsers using getRandomValues
  // Follows RFC 4122 UUID v4 format
  try {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);

    // Set version (4) and variant (10xx)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    // 3. Absolute last resort fallback (insecure, but ensures availability)
    // Only happens if globalThis.crypto is completely missing
    const ts = Date.now().toString(36);
    const r = Math.random().toString(36).substring(2, 10);
    return `legacy-${ts}-${r}`;
  }
}

/**
 * Deterministic hash function for stable identifiers and anonymization.
 * Uses a multi-component entropy pattern (including DJB2 and Murmur-like mixing)
 * to provide low-collision hashes across all runtimes.
 *
 * @param input - The string to hash
 * @param length - Desired length of the resulting hex string (max 64)
 * @returns A deterministic hex string
 */
export function simpleHash(input: string, length: number = 16): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  let h3 = 0x85ebca6b;
  let h4 = 0xc2b2ae35;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3266489909);
    h4 = Math.imul(h4 ^ ch, 2246822507);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);

  const fullHash = (h1 >>> 0).toString(16).padStart(8, '0') +
                   (h2 >>> 0).toString(16).padStart(8, '0') +
                   (h3 >>> 0).toString(16).padStart(8, '0') +
                   (h4 >>> 0).toString(16).padStart(8, '0') +
                   (h1 ^ h3 >>> 0).toString(16).padStart(8, '0') +
                   (h2 ^ h4 >>> 0).toString(16).padStart(8, '0') +
                   (h1 ^ h2 >>> 0).toString(16).padStart(8, '0') +
                   (h3 ^ h4 >>> 0).toString(16).padStart(8, '0');

  return fullHash.substring(0, Math.min(length, 64));
}

/**
 * Constant-time comparison to prevent timing attacks.
 * Supports both string and Uint8Array inputs.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are equal, false otherwise
 */
export function timingSafeEqual(
  a: string | Uint8Array,
  b: string | Uint8Array
): boolean {
  const aBuf = typeof a === 'string' ? new TextEncoder().encode(a) : a;
  const bBuf = typeof b === 'string' ? new TextEncoder().encode(b) : b;

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }

  return result === 0;
}
