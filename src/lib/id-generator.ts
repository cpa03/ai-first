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
 * Uses crypto.randomUUID() when available (Node.js 15.6+, modern browsers, Edge).
 * Falls back to a robust manual implementation using crypto.getRandomValues if randomUUID is missing.
 *
 * @param prefix - Optional prefix for the ID (e.g., 'session_', 'req_')
 * @returns A secure unique identifier
 */
export function generateSecureId(prefix: string = ''): string {
  let uuid: string;

  try {
    // 1. Try native crypto.randomUUID() - most efficient and secure
    // Modern environments (Node 19+, Browsers, Edge) have this in the global scope
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      uuid = crypto.randomUUID();
    } else {
      // 2. Fallback to manual UUID v4 generation using crypto.getRandomValues
      uuid = generateFallbackUuid();
    }
  } catch (error) {
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
 */
function generateFallbackUuid(): string {
  // Try to use global crypto if available
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : null;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
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

  // Final fallback using Math.random if NO cryptographic entropy is available
  // This is a "fail-open" strategy to ensure the application still functions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
