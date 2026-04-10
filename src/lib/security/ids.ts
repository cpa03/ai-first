/**
 * Secure ID Generation Utilities
 *
 * Provides cryptographically secure random identifiers using the Web Crypto API.
 * Designed to work in Browser, Node.js (19+), and Cloudflare Workers environments.
 */

/**
 * Generate a cryptographically secure random identifier.
 * Uses crypto.randomUUID() when available, falling back to a combination of
 * timestamp and random values if necessary.
 *
 * @returns A secure unique identifier string
 */
export function generateSecureId(): string {
  // Use crypto.randomUUID() if available (Node 19+, modern browsers, Workers)
  // We check globalThis to be most compatible across environments
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto :
                   (typeof crypto !== 'undefined' ? crypto : undefined);

  if (
    cryptoObj &&
    typeof cryptoObj.randomUUID === 'function'
  ) {
    try {
      return cryptoObj.randomUUID();
    } catch {
      // Fallback if randomUUID fails for some reason
    }
  }

  // Fallback 1: Use crypto.getRandomValues if available
  if (
    cryptoObj &&
    typeof cryptoObj.getRandomValues === 'function'
  ) {
    try {
      const array = new Uint8Array(16);
      cryptoObj.getRandomValues(array);
      return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
        ''
      );
    } catch {
      // Fallback to timestamp-based if crypto fails
    }
  }

  // Fallback 2: Timestamp + random (last resort)
  // Use a format similar to UUID but with less entropy
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
}
