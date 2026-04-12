/**
 * Cryptographically secure ID generation utilities.
 * This file has NO dependencies to avoid circular imports.
 */

/**
 * Generate a cryptographically secure unique identifier.
 * Uses crypto.randomUUID() when available, falling back to crypto.getRandomValues().
 *
 * @param prefix - Optional prefix for the ID (e.g., 'session', 'req')
 * @returns A secure unique identifier string
 */
export function generateSecureId(prefix?: string): string {
  let id: string;

  try {
    // Access crypto via globalThis for maximum compatibility across environments
    const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : (typeof crypto !== 'undefined' ? crypto : null);

    // 1. Try crypto.randomUUID() - most secure and efficient
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
      id = cryptoObj.randomUUID();
    }
    // 2. Fallback to crypto.getRandomValues()
    else if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      cryptoObj.getRandomValues(bytes);
      id = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // 3. Last resort - not cryptographically secure but provides a fallback
    else {
      id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  } catch {
    // Ultimate fallback if crypto access fails
    id = Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  return prefix ? `${prefix}_${id}` : id;
}
