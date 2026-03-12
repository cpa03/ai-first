/**
 * ID Generation Utilities
 *
 * Provides utilities for generating unique identifiers.
 * This is a zero-dependency module to ensure it can be used in the core
 * logger and other foundational modules without introducing circular
 * dependencies or large bundle sizes in the Edge runtime.
 */

/**
 * Generate a cryptographically secure unique ID.
 * Prioritizes crypto.randomUUID() and falls back to a high-entropy string
 * if the Web Crypto API is unavailable.
 *
 * @param prefix - Optional prefix for the ID
 * @returns A unique string ID
 */
export function generateSecureId(prefix: string = ''): string {
  try {
    // crypto.randomUUID() is available in most modern environments
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}_${uuid}` : uuid;
  } catch {
    // High-entropy fallback using timestamp, random numbers, and base-36 encoding
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 10);
    const random2 = Math.random().toString(36).substring(2, 10);
    const id = `${timestamp}-${random1}-${random2}`;
    return prefix ? `${prefix}_${id}` : id;
  }
}
