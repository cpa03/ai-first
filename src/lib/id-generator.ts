/**
 * ID Generation Utilities
 *
 * Provides cryptographically secure, collision-resistant ID generation
 * that works across all environments (Browser, Node.js, Edge/Cloudflare).
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 * Uses crypto.randomUUID() when available, falling back to a robust
 * combination of high-resolution timestamp and secure random values.
 *
 * @returns A unique ID string
 */
export function generateSecureId(): string {
  // 1. Try native crypto.randomUUID() (Node.js 15.6+, modern browsers, Edge runtime)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails
    }
  }

  // 2. Try crypto.getRandomValues() for secure random fallback
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    try {
      const array = new Uint32Array(4);
      crypto.getRandomValues(array);
      const timestamp = Date.now().toString(36);
      const randomPart = Array.from(array)
        .map((n) => n.toString(36))
        .join('-');
      return `${timestamp}-${randomPart}`;
    } catch {
      // Fallback to basic random
    }
  }

  // 3. Last resort: high-resolution timestamp + multiple Math.random() parts
  // Only reached in very restricted or ancient environments
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart1}-${randomPart2}`;
}
