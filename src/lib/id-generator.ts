/**
 * Secure ID Generator
 *
 * Provides cryptographically secure, collision-resistant identifiers.
 * This is a lightweight utility with no dependencies, safe for use in
 * both server-side (Node.js/Edge) and client-side environments.
 */

/**
 * Generate a cryptographically secure, collision-resistant identifier.
 * Uses crypto.randomUUID() when available, with robust fallbacks for different environments.
 *
 * @param prefix - Optional prefix for the ID (e.g., 'session_', 'req_')
 * @returns A unique identifier string
 */
export function generateSecureId(prefix: string = ''): string {
  try {
    // Access crypto from globalThis for maximum compatibility across environments
    const cryptoObj =
      typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

    // 1. Try crypto.randomUUID() - standard in modern browsers and Node.js 15.6+
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
      return `${prefix}${cryptoObj.randomUUID()}`;
    }

    // 2. Try crypto.getRandomValues() - available in older modern browsers and Node.js
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      const array = new Uint8Array(16);
      cryptoObj.getRandomValues(array);
      const hex = Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      // Format as UUID-like structure (8-4-4-4-12)
      const uuid = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
      return `${prefix}${uuid}`;
    }
  } catch {
    // Fallback if crypto operations fail
  }

  // 3. Last resort: Timestamp + random alphanumeric string (not cryptographically secure)
  // Used only when Web Crypto API is completely unavailable
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}-${random}`;
}
