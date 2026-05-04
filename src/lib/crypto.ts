/**
 * Cryptographic utility functions for secure random number generation.
 * Centralizes the pattern for generating collision-resistant IDs across environments.
 */

/**
 * Generate a cryptographically secure random UUID or a robust fallback string.
 * This function handles different environments (Browsers, Node.js, Cloudflare Workers)
 * by attempting multiple Web Crypto API methods before falling back to a timestamp
 * and Math.random() based string.
 *
 * @returns A secure unique identifier string
 */
export function generateSecureId(): string {
  try {
    // 1. Attempt standard randomUUID() (Most modern environments)
    // We check globalThis.crypto for broad compatibility
    const crypto =
      typeof globalThis !== 'undefined'
        ? (globalThis.crypto as unknown as Crypto)
        : null;

    if (crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    // 2. Attempt construction via getRandomValues() (Compatibility for some Edge/Browsers)
    if (crypto && typeof crypto.getRandomValues === 'function') {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      // Format as a simple hex string for consistency
      return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (_error) {
    // Graceful degradation: errors in secure random source should not crash the app
    // We fall through to the Math.random() fallback below
  }

  // 3. Fallback to timestamp + Math.random (Legacy/Insecure environments)
  // This ensures the application remains functional even in restricted environments
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${random}`;
}
