/**
 * Centralized ID Generation Utility
 *
 * Provides cryptographically secure unique identifiers across different runtimes
 * (Node.js, Browser, Cloudflare Workers).
 */

/**
 * Generate a cryptographically secure, unique identifier.
 * Uses crypto.randomUUID() where available (Node.js 15.6+, modern browsers, Cloudflare Workers).
 * Falls back to a secure random string using crypto.getRandomValues() or timestamp.
 *
 * @returns A unique string ID
 */
export function generateId(): string {
  // 1. Try crypto.randomUUID() - Most modern & standard
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // 2. Try crypto.getRandomValues() - Browser/Node fallback
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const uint32 = new Uint32Array(4);
    crypto.getRandomValues(uint32);
    return (
      uint32[0].toString(16) +
      '-' +
      uint32[1].toString(16).substring(0, 4) +
      '-' +
      uint32[2].toString(16).substring(0, 4) +
      '-' +
      uint32[3].toString(16)
    );
  }

  // 3. Absolute fallback - Timestamp + Math.random (not cryptographically secure)
  // Only used in extremely old or restricted environments
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `id_${timestamp}_${randomPart}`;
}

/**
 * Generate a cryptographically secure request ID with a standard prefix.
 *
 * @returns A unique request ID string
 */
export function generateRequestId(): string {
  return `req_${generateId()}`;
}
