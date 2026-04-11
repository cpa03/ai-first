/**
 * ID Generation Utilities
 *
 * Provides cryptographically secure identifier generation.
 * Isolated from other modules to prevent circular dependencies.
 */

/**
 * Generates a cryptographically secure unique identifier.
 * Uses crypto.randomUUID() if available, with robust fallbacks.
 *
 * @returns A secure unique identifier string
 */
export function generateSecureId(): string {
  // 1. Try crypto.randomUUID() (Node.js 15.6+, modern browsers, Cloudflare Workers)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to next method
    }
  }

  // 2. Fallback to crypto.getRandomValues()
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fall through to final method
    }
  }

  // 3. Final resort (non-secure but collision-resistant)
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
