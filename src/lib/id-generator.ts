/**
 * ID Generator and Hashing Utilities
 *
 * Provides cryptographically secure ID generation and deterministic hashing
 * for anonymizing sensitive data (like tokens) while maintaining stability.
 * Designed to be compatible with both Node.js and Edge runtimes (Cloudflare Workers).
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 * Uses globalThis.crypto.randomUUID() when available.
 */
export function generateSecureId(): string {
  // Use globalThis.crypto for cross-environment compatibility
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails for some reason
    }
  }

  // Fallback for older Node.js or environments without randomUUID
  // Using a robust fallback that avoids Math.random if possible
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    try {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      // Format as UUID-like string or just hex
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback if getRandomValues fails
    }
  }

  // Last resort fallback using timestamp and Math.random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Generate a deterministic hash for a string input.
 * Used for anonymizing sensitive data like tokens while maintaining stable identifiers.
 * This is NOT for password hashing - it's a fast, non-cryptographic stable hash (DJB2).
 */
export function simpleHash(input: string): string {
  if (!input) return 'empty';

  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    // (hash * 33) + char
    hash = (hash << 5) + hash + char;
  }

  // Return as an unsigned 32-bit hex string
  return (hash >>> 0).toString(16);
}
