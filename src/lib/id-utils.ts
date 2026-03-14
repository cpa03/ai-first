/**
 * ID Generation Utilities
 *
 * Provides cryptographically secure unique identifier generation.
 * Centralized here to avoid dependency bloat in foundational modules.
 */

/**
 * Generate a cryptographically secure unique identifier.
 *
 * Prioritizes crypto.randomUUID() for maximum security and collision resistance.
 * Falls back to a high-entropy custom generator if randomUUID is unavailable.
 *
 * @param prefix - Optional prefix for the ID (e.g. 'req', 'session')
 * @returns A unique ID string
 */
export function generateSecureId(prefix?: string): string {
  let id: string;

  try {
    // Modern environments (Node.js 15.6+, modern browsers, Edge/Cloudflare)
    // Use globalThis for maximum compatibility across environments
    const cryptoInstance = typeof globalThis !== 'undefined' ? globalThis.crypto : (typeof crypto !== 'undefined' ? crypto : null);

    if (cryptoInstance && typeof cryptoInstance.randomUUID === 'function') {
      id = cryptoInstance.randomUUID();
    } else {
      throw new Error('crypto.randomUUID not available');
    }
  } catch {
    // High-entropy fallback using crypto.getRandomValues or Math.random
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = new Uint8Array(16);
    const cryptoInstance = typeof globalThis !== 'undefined' ? globalThis.crypto : (typeof crypto !== 'undefined' ? crypto : null);

    if (cryptoInstance && typeof cryptoInstance.getRandomValues === 'function') {
      cryptoInstance.getRandomValues(bytes);
    } else {
      // Last resort fallback for legacy environments
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    let fallbackId = '';
    for (let i = 0; i < bytes.length; i++) {
      fallbackId += chars[bytes[i] % chars.length];
    }
    id = `${Date.now()}-${fallbackId}`;
  }

  return prefix ? `${prefix}_${id}` : id;
}
