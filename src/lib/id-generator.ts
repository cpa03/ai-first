/**
 * ID and Cryptographic Utilities
 *
 * Provides cross-platform, edge-compatible utilities for ID generation,
 * hashing, and secure comparisons.
 */

/**
 * Generate a cryptographically secure ID
 * Uses globalThis.crypto.randomUUID() when available.
 */
export function generateSecureId(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback for older environments or specific testing contexts
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `id_${timestamp}_${randomPart}`;
}

/**
 * A deterministic simple hash function using the DJB2 algorithm.
 * Provides stable identifiers across different runtimes (Node, Browser, Edge).
 *
 * @param input - The string to hash
 * @returns A 16-character hexadecimal string
 */
export function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i);
  }

  // Convert to unsigned 32-bit integer and then to hex string
  const unsignedHash = hash >>> 0;
  return unsignedHash.toString(16).padStart(8, '0') +
         (hash & 0x00FFFFFF).toString(16).padStart(8, '0');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Edge-compatible implementation.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a random hex string of specified length.
 * Uses globalThis.crypto.getRandomValues for high entropy.
 */
export function generateRandomHex(length: number): string {
  const byteLength = Math.ceil(length / 2);
  const bytes = new Uint8Array(byteLength);

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length);
}
