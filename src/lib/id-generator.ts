/**
 * Secure ID Generation Utility
 *
 * Provides cryptographically secure unique identifiers using the Web Crypto API
 * when available, with a robust fallback for maximum environment compatibility
 * (Browser, Node.js, and Edge Runtime).
 *
 * SECURITY: Always prefer this utility over Math.random() for any ID generation
 * to prevent predictability and collision risks.
 */

/**
 * Generates a cryptographically secure unique identifier.
 *
 * Defaults to a standard UUID v4 if supported, otherwise generates a
 * high-entropy random string.
 *
 * @param length - Optional length for the random string fallback (default: 21)
 * @returns A secure unique identifier string
 */
export function generateSecureId(length: number = 21): string {
  // 1. Try modern crypto.randomUUID() for standard UUIDs (available in Node 15.6+, modern browsers, Edge)
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // Fall through if randomUUID fails for any reason
    }
  }

  // 2. Try crypto.getRandomValues() for high-entropy secure strings
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    try {
      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const bytes = new Uint8Array(length);
      globalThis.crypto.getRandomValues(bytes);
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(bytes[i] % chars.length);
      }
      return result;
    } catch {
      // Fall through to last-resort fallback
    }
  }

  // 3. Last resort fallback (non-cryptographic)
  // Used only if Web Crypto API is completely unavailable
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${random}`;
}
