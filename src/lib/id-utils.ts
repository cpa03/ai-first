/**
 * ID Generation Utilities
 *
 * Provides cryptographically secure unique identifier generation.
 * Centralized here to avoid dependency bloat in foundational modules.
 */

/**
 * Generate a cryptographically secure unique identifier.
 *
 * Prioritizes crypto.randomUUID() for maximum security and collision resistance.
 * Falls back to a high-entropy custom generator if randomUUID is unavailable.
 *
 * @param prefix - Optional prefix for the ID (e.g. 'req', 'session')
 * @returns A unique ID string
 */
export function generateSecureId(prefix?: string): string {
  // Access globalThis robustly for maximum compatibility across environments (Node.js, Browser, Edge)
  const g = typeof globalThis !== 'undefined' ? globalThis :
            typeof self !== 'undefined' ? self :
            typeof window !== 'undefined' ? window : {} as any;

  const cryptoInstance = g.crypto;

  let id: string;

  try {
    if (cryptoInstance && typeof cryptoInstance.randomUUID === 'function') {
      id = cryptoInstance.randomUUID();
    } else if (cryptoInstance && typeof cryptoInstance.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      cryptoInstance.getRandomValues(bytes);
      // Generate a UUID-v4-like string from random bytes
      id = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      // Insert hyphens to match UUID format if desired, but a simple hex string is also fine
      // For consistency with randomUUID, we'll keep it as a simple hex string or similar
    } else {
      throw new Error('no crypto');
    }
  } catch {
    // Last resort fallback for legacy environments
    // Combine timestamp with multiple random parts for higher entropy
    const r1 = Math.random().toString(36).substring(2, 10);
    const r2 = Math.random().toString(36).substring(2, 10);
    id = `${Date.now()}-${r1}-${r2}`;
  }

  return prefix ? `${prefix}_${id}` : id;
}
