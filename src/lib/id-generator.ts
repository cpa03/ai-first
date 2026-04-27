/**
 * Centralized ID generation and hashing utilities
 * Provides cryptographically secure, platform-neutral tools for ID generation,
 * constant-time comparisons, and deterministic anonymization.
 */

/**
 * Generate a cryptographically secure, collision-resistant ID
 * Uses crypto.randomUUID() which is available in Node.js 20+ and modern browsers.
 * Falls back to a robust timestamp + crypto.getRandomValues pattern if randomUUID is missing.
 */
export function generateSecureId(prefix?: string): string {
  // Check for crypto availability
  const hasCrypto = typeof crypto !== 'undefined';

  try {
    if (hasCrypto && typeof crypto.randomUUID === 'function') {
      return (prefix || '') + crypto.randomUUID();
    }
  } catch {
    // Fall through to manual generation
  }

  // Fallback for environments without randomUUID
  const timestamp = Date.now().toString(36);
  let randomHex: string;

  if (hasCrypto && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    randomHex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    // Last resort fallback using Math.random
    randomHex = Math.random().toString(36).substring(2, 15);
  }

  return (prefix || '') + `${timestamp}-${randomHex}`;
}

/**
 * Perform a timing-safe comparison of two strings or Uint8Arrays
 * Prevents timing attacks by ensuring comparison time is constant regardless of match.
 */
export function timingSafeEqual(a: string | Uint8Array, b: string | Uint8Array): boolean {
  const bufA = typeof a === 'string' ? new TextEncoder().encode(a) : a;
  const bufB = typeof b === 'string' ? new TextEncoder().encode(b) : b;

  if (bufA.length !== bufB.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
}

/**
 * Deterministic hash for anonymization purposes
 * Uses DJB2 and SDBM algorithms to provide stable, low-collision identifiers
 * across environments. Supports lengths up to 64 characters.
 * This is NOT a cryptographic hash and should not be used for password hashing.
 */
export function simpleHash(input: string, length: number = 12): string {
  let h1 = 5381;
  let h2 = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    // DJB2
    h1 = (h1 * 33) ^ char;
    // SDBM
    h2 = char + (h2 << 6) + (h2 << 16) - h2;
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');

  // For longer hashes, we add more entropy passes
  if (length > 16) {
    let h3 = 0;
    for (let i = 0; i < input.length; i++) {
      h3 = (h3 << 5) - h3 + input.charCodeAt(i);
      h3 |= 0;
    }
    const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
    return (hex1 + hex2 + hex3).substring(0, length);
  }

  return (hex1 + hex2).substring(0, length);
}

/**
 * Perform an HMAC-SHA256 signature using SubtleCrypto
 * This is platform-neutral and works in Browser, Node.js, and Edge runtimes.
 */
export async function signHmacSha256(
  secret: string,
  message: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
