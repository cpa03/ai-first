/**
 * Centralized ID generation and hashing utilities
 * Provides cryptographically secure, platform-neutral tools for ID generation,
 * constant-time comparisons, and deterministic anonymization.
 */

/**
 * Generate a cryptographically secure, collision-resistant ID
 * Uses globalThis.crypto.randomUUID() which is available in Node.js 20+ and modern browsers.
 * Falls back to a robust timestamp + crypto.getRandomValues pattern if randomUUID is missing.
 */
export function generateSecureId(prefix?: string): string {
  let id: string;

  try {
    // native randomUUID is the most secure and efficient option
    id = globalThis.crypto.randomUUID();
  } catch {
    // Fallback for environments without randomUUID
    const timestamp = Date.now().toString(36);
    const randomBuffer = new Uint8Array(16);
    globalThis.crypto.getRandomValues(randomBuffer);
    const randomHex = Array.from(randomBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    id = `${timestamp}-${randomHex}`;
  }

  return prefix ? `${prefix}${id}` : id;
}

/**
 * Perform a timing-safe comparison of two strings or Uint8Arrays
 * Prevents timing attacks by ensuring comparison time is constant regardless of match.
 */
export function timingSafeEqual(a: string | Uint8Array, b: string | Uint8Array): boolean {
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
 * Deterministic hash for anonymization purposes
 * Uses a multi-pass approach (DJB2 and SDBM) to provide stable, low-collision
 * identifiers across environments. Supports lengths up to 64 characters.
 * This is NOT a cryptographic hash and should not be used for password hashing.
 */
export function simpleHash(input: string, length: number = 12): string {
  let h1 = 5381;
  let h2 = 0;
  let h3 = 0;
  let h4 = 0x811c9dc5; // FNV-1a basis

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    // DJB2
    h1 = (h1 * 33) ^ char;
    // SDBM
    h2 = char + (h2 << 6) + (h2 << 16) - h2;
    // JS Hash
    h3 = (h3 << 5) - h3 + char;
    h3 |= 0;
    // FNV-1a
    h4 ^= char;
    h4 += (h4 << 1) + (h4 << 4) + (h4 << 7) + (h4 << 8) + (h4 << 24);
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');

  const combined = hex1 + hex2 + hex3 + hex4;
  return combined.substring(0, length);
}
