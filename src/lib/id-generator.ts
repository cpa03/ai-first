/**
 * Secure ID Generation Utility
 *
 * Provides cryptographically secure identifiers for sessions, requests,
 * and other security-sensitive contexts. Uses the Web Crypto API
 * (crypto.randomUUID) with a robust fallback for legacy environments.
 */

/**
 * Generates a cryptographically secure unique identifier.
 *
 * Priority:
 * 1. crypto.randomUUID() - Modern browsers and Node.js 15.6+
 * 2. crypto.getRandomValues() - Standard Web Crypto API
 * 3. Math.random() - Last resort fallback
 *
 * @param prefix - Optional prefix for the ID
 * @returns A secure unique identifier string
 */
export function generateSecureId(prefix: string = ''): string {
  let id = '';

  try {
    // 1. Try modern randomUUID
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    }
    // 2. Try getRandomValues for custom UUID-like string
    else if (
      typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
    ) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      // Set version to 4 (random)
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      // Set variant to RFC4122
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      id = Array.from(bytes)
        .map((b, i) => {
          const s = b.toString(16).padStart(2, '0');
          return i === 4 || i === 6 || i === 8 || i === 10 ? `-${s}` : s;
        })
        .join('');
    }
  } catch {
    // Fail-safe: fall through to last resort
  }

  // 3. Last resort: timestamp + Math.random (not cryptographically secure)
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  return prefix ? `${prefix}${id}` : id;
}
