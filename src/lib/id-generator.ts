/**
 * Secure ID Generation Utilities
 *
 * Provides cryptographically secure unique identifiers across all supported runtimes
 * (Browser, Node.js, and Edge/Cloudflare Workers).
 *
 * This module addresses security concerns regarding the use of Math.random()
 * for identifier generation, which is not cryptographically secure and can
 * be predictable.
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 * Uses crypto.randomUUID() when available (Node.js 19+, modern browsers, Edge).
 * Falls back to a robust manual implementation using crypto.getRandomValues if randomUUID is missing.
 *
 * @param prefix - Optional prefix for the ID (e.g., 'session_', 'req_')
 * @returns A secure unique identifier
 */
export function generateSecureId(prefix: string = ''): string {
  let uuid: string;

  try {
    // Access crypto via globalThis for maximum compatibility in Edge/Node/Browser
    const cryptoObj =
      typeof globalThis !== 'undefined' && globalThis.crypto
        ? globalThis.crypto
        : typeof crypto !== 'undefined'
          ? crypto
          : null;

    // 1. Try native crypto.randomUUID() - most efficient and secure
    // Use type assertion to handle older TypeScript environments or limited Crypto interface
    const extendedCrypto = cryptoObj as Crypto & { randomUUID?: () => string };
    if (extendedCrypto && typeof extendedCrypto.randomUUID === 'function') {
      uuid = extendedCrypto.randomUUID();
    } else if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      // 2. Fallback to manual UUID v4 generation using crypto.getRandomValues
      uuid = generateFallbackUuid(cryptoObj);
    } else {
      throw new Error('No cryptographic random generator available');
    }
  } catch (_error) {
    // 3. Last resort - timestamp + random (less secure, but prevents total failure)
    // This should almost never happen in modern environments
    const randomPart = Math.random().toString(36).substring(2, 11);
    uuid = `fallback_${Date.now()}_${randomPart}`;
  }

  return prefix ? `${prefix}${uuid}` : uuid;
}

/**
 * Generates a UUID v4 using available cryptographic random number generators.
 * Compatible with environments that have crypto.getRandomValues but not crypto.randomUUID.
 * @param cryptoObj - The cryptographic object to use
 */
function generateFallbackUuid(cryptoObj: Crypto): string {
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);

  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Set version to 4 (0100 in bits 4-7 of the 7th byte)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122 (10xx in bits 6-7 of the 9th byte)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return Array.from(bytes)
    .map((b, i) => {
      const s = b.toString(16).padStart(2, '0');
      // Add dashes at appropriate positions
      return i === 4 || i === 6 || i === 8 || i === 10 ? `-${s}` : s;
    })
    .join('');
}
