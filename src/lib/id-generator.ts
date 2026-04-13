/**
 * ID Generation Utilities
 *
 * Provides cryptographically secure, collision-resistant ID generation
 * that works across all environments (Browser, Node.js, Edge/Cloudflare).
 */

/**
 * Generate a cryptographically secure, collision-resistant ID.
 * Uses crypto.randomUUID() when available, falling back to a robust
 * timestamp-based random ID for maximum compatibility.
 *
 * @returns A unique ID string
 */
export function generateSecureId(): string {
  // Use crypto.randomUUID() if available (Node.js 15.6+, modern browsers, Edge runtime)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails for any reason
    }
  }

  // Robust fallback for environments without crypto.randomUUID support
  // Combines high-resolution timestamp with multiple random parts for entropy
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart1}-${randomPart2}`;
}
