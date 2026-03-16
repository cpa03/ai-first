/**
 * Secure ID Generation Utilities
 *
 * Provides standardized methods for generating cryptographically secure,
 * collision-resistant identifiers and symbols.
 *
 * Uses globalThis.crypto.randomUUID() where available, with a fallback to
 * getRandomValues() for maximum compatibility across Node.js and Edge runtimes.
 */

/**
 * Generate a cryptographically secure UUID (v4)
 * @returns A secure UUID string
 */
export function generateUUID(): string {
  // Use globalThis.crypto.randomUUID() if available (Node.js 15.6+, modern browsers, Edge)
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback using getRandomValues for environments without randomUUID
  const array = new Uint8Array(16);
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Last resort fallback (non-secure) if no crypto is available at all
    // This should be extremely rare in modern environments
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  // Set version (4) and variant (RFC4122) bits
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;

  const hex = Array.from(array).map((b) => b.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

/**
 * Generate a secure, prefixed identifier
 * @param prefix - The prefix for the ID (e.g., 'req', 'user', 'session')
 * @returns A secure, prefixed ID string
 */
export function generateSecureId(prefix?: string): string {
  const uuid = generateUUID();
  // Use a portion of the UUID for a shorter but still unique ID
  const suffix = uuid.replace(/-/g, '').substring(0, 12);
  return prefix ? `${prefix}_${suffix}` : suffix;
}
