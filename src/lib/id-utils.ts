/**
 * ID Utilities - Secure ID generation for browser and server
 *
 * Provides cryptographically secure ID generation with defensive fallbacks
 * for different runtimes (Node.js, Browser, Edge).
 */

/**
 * Generate a cryptographically secure UUID v4
 */
export function generateSecureUUID(): string {
  // Use globalThis.crypto for cross-environment compatibility
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback using getRandomValues if randomUUID is not available
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
      const b = parseInt(c, 10);
      return (
        b ^
        (globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (b / 4)))
      ).toString(16);
    });
  }

  // Last resort fallback for environments with no crypto at all
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a secure, prefixed ID
 * @param prefix - Optional prefix for the ID (e.g., 'session', 'req')
 * @returns A secure ID string
 */
export function generateSecureId(prefix?: string): string {
  const uuid = generateSecureUUID();
  const shortId = uuid.split('-')[0] + uuid.split('-')[1];

  if (!prefix) return shortId;
  return `${prefix}_${shortId}`;
}
