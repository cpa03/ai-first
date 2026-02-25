/**
 * Request Signing Module - HMAC-based Request Authentication
 *
 * This module provides request signing for internal/automated API communication.
 * It ensures that internal API routes can verify the authenticity of requests
 * from background jobs, webhook handlers, and other automated systems.
 *
 * Usage:
 * ```typescript
 * // Signing a request (client side)
 * import { signRequest, createSignedHeaders } from '@/lib/security/request-signer';
 *
 * const timestamp = Date.now();
 * const payload = JSON.stringify({ action: 'process' });
 * const signature = await signRequest(payload, timestamp);
 *
 * const headers = await createSignedHeaders(payload, timestamp);
 * // headers includes: x-request-signature, x-request-timestamp, x-request-payload-hash
 *
 * // Verifying a request (server side)
 * import { verifySignature, extractAndVerifySignature } from '@/lib/security/request-signer';
 *
 * const isValid = await verifySignature(payload, timestamp, signature);
 *
 * // Or extract and verify from headers
 * const result = extractAndVerifySignature(request.headers);
 * if (!result.valid) {
 *   throw new Error('Invalid signature');
 * }
 * ```
 *
 * @module lib/security/request-signing
 */

import { createLogger } from '@/lib/logger';
import {
  SecurityAuditLog,
  type SecurityEventSeverity,
  type SecurityEventCategory,
} from './audit-log';

const logger = createLogger('RequestSigner');

/**
 * Get the internal API secret from environment
 * Uses a function to allow tests to modify env between test runs
 */
function getInternalApiSecret(): string | undefined {
  return process.env.INTERNAL_API_SECRET;
}

/**
 * Configuration for request signing
 */
export const REQUEST_SIGNER_CONFIG = {
  /** Timestamp tolerance in milliseconds (5 minutes) */
  TIMESTAMP_TOLERANCE: 5 * 60 * 1000,
  /** Minimum secret length */
  MIN_SECRET_LENGTH: 32,
  /** Maximum age of request timestamp before considering it replay */
  MAX_TIMESTAMP_AGE: 5 * 60 * 1000,
} as const;

/**
 * Result of signature verification
 */
export interface SignatureVerificationResult {
  /** Whether the signature is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** The extracted payload */
  payload?: string;
  /** The timestamp used */
  timestamp?: number;
}

/**
 * Helper to log security events using the audit log
 */
function logSecurityEvent(
  severity: SecurityEventSeverity,
  category: SecurityEventCategory,
  message: string,
  details?: Record<string, unknown>
): void {
  SecurityAuditLog.logEvent({
    timestamp: new Date().toISOString(),
    category,
    severity,
    message,
    metadata: details,
    environment: process.env.NODE_ENV || 'development',
  });
}

/**
 * Signs a request payload with HMAC-SHA256
 *
 * @param payload - The request payload to sign
 * @param timestamp - Unix timestamp in milliseconds
 * @returns HMAC-SHA256 signature as hex string
 * @throws Error if INTERNAL_API_SECRET is not configured
 */
export async function signRequest(
  payload: string,
  timestamp: number
): Promise<string> {
  const INTERNAL_API_SECRET = getInternalApiSecret();

  if (!INTERNAL_API_SECRET) {
    logger.warn(
      'INTERNAL_API_SECRET not configured - request signing disabled'
    );
    throw new Error('Internal API secret not configured');
  }

  if (INTERNAL_API_SECRET.length < REQUEST_SIGNER_CONFIG.MIN_SECRET_LENGTH) {
    logger.warn(
      `INTERNAL_API_SECRET too short (${INTERNAL_API_SECRET.length} chars, minimum ${REQUEST_SIGNER_CONFIG.MIN_SECRET_LENGTH})`
    );
  }

  // Create message: payload:timestamp
  const message = `${payload}:${timestamp}`;

  // Use Web Crypto API for HMAC-SHA256 (Edge-compatible)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(INTERNAL_API_SECRET);
  const messageData = encoder.encode(message);

  // Create HMAC key and sign asynchronously
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the message (async)
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

  // Convert to hex string
  return new Uint8Array(signature).reduce(
    (hex, byte) => hex + byte.toString(16).padStart(2, '0'),
    ''
  );
}

/**
 * Verifies a request signature using timing-safe comparison
 *
 * @param payload - The request payload
 * @param timestamp - Unix timestamp in milliseconds
 * @param signature - The signature to verify
 * @returns true if signature is valid, false otherwise
 */
export async function verifySignature(
  payload: string,
  timestamp: number,
  signature: string
): Promise<boolean> {
  const INTERNAL_API_SECRET = getInternalApiSecret();

  if (!INTERNAL_API_SECRET) {
    logger.warn('INTERNAL_API_SECRET not configured - cannot verify signature');
    return false;
  }

  // Check timestamp is within tolerance
  const now = Date.now();
  const age = Math.abs(now - timestamp);

  if (age > REQUEST_SIGNER_CONFIG.MAX_TIMESTAMP_AGE) {
    logSecurityEvent(
      'medium',
      'authentication',
      'Request timestamp outside tolerance window',
      {
        timestamp,
        now,
        age,
        maxAge: REQUEST_SIGNER_CONFIG.MAX_TIMESTAMP_AGE,
      }
    );
    return false;
  }

  try {
    const expectedSignature = await signRequest(payload, timestamp);

    // Timing-safe comparison using Uint8Array for Edge compatibility
    const expectedBytes = hexToBytes(expectedSignature);
    const actualBytes = hexToBytes(signature);

    if (expectedBytes.length !== actualBytes.length) {
      return false;
    }

    // Constant-time comparison
    let result = 0;
    for (let i = 0; i < expectedBytes.length; i++) {
      result |= expectedBytes[i] ^ actualBytes[i];
    }

    return result === 0;
  } catch (error) {
    logger.error('Signature verification error', error);
    return false;
  }
}

/**
 * Creates signed headers for a request
 *
 * @param payload - The request payload
 * @param timestamp - Optional timestamp (defaults to now)
 * @returns Object containing signature headers
 */
export async function createSignedHeaders(
  payload: string,
  timestamp: number = Date.now()
): Promise<Record<string, string>> {
  const signature = await signRequest(payload, timestamp);
  const payloadHash = simpleHash(payload);

  return {
    'x-request-signature': signature,
    'x-request-timestamp': String(timestamp),
    'x-request-payload-hash': payloadHash,
  };
}

/**
 * Extracts and verifies signature from request headers
 *
 * @param headers - The request headers
 * @returns Verification result with payload if valid
 */
export function extractAndVerifySignature(
  headers: Headers
): SignatureVerificationResult {
  const signature = headers.get('x-request-signature');
  const timestampStr = headers.get('x-request-timestamp');

  if (!signature) {
    return { valid: false, error: 'Missing signature header' };
  }

  if (!timestampStr) {
    return { valid: false, error: 'Missing timestamp header' };
  }

  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  // Check timestamp validity
  const now = Date.now();
  const age = Math.abs(now - timestamp);

  if (age > REQUEST_SIGNER_CONFIG.MAX_TIMESTAMP_AGE) {
    logSecurityEvent(
      'medium',
      'authentication',
      'Request timestamp outside tolerance window (from headers)',
      {
        timestamp,
        now,
        age,
        maxAge: REQUEST_SIGNER_CONFIG.MAX_TIMESTAMP_AGE,
      }
    );
    return {
      valid: false,
      error: 'Request timestamp outside tolerance window',
    };
  }

  return {
    valid: true,
    timestamp,
  };
}

/**
 * Creates a middleware-compatible signature verification function
 *
 * @returns Async function that verifies request signature from headers
 */
export function createSignatureVerifier() {
  return async (headers: Headers, body?: string): Promise<boolean> => {
    const signature = headers.get('x-request-signature');

    if (!signature) {
      logSecurityEvent(
        'low',
        'authentication',
        'Missing signature in internal API request'
      );
      return false;
    }

    // If body is provided, we can do full verification
    if (body) {
      const timestampStr = headers.get('x-request-timestamp');
      if (!timestampStr) {
        return false;
      }
      const timestamp = parseInt(timestampStr, 10);
      return verifySignature(body, timestamp, signature);
    }

    // Otherwise just check timestamp validity
    const result = extractAndVerifySignature(headers);
    return result.valid;
  };
}

/**
 * Simple hash of payload for verification purposes
 * Uses a simple djb2-like hash for header size reduction
 *
 * @param payload - The payload to hash
 * @returns Simple hash as hex string
 */
function simpleHash(payload: string): string {
  let hashValue = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + char;
    hashValue = hashValue & hashValue; // Convert to 32bit integer
  }

  // Return as hex string
  return Math.abs(hashValue).toString(16);
}

/**
 * Convert hex string to Uint8Array for timing-safe comparison
 *
 * @param hex - Hex string to convert
 * @returns Uint8Array representation
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Check if request signing is configured and enabled
 *
 * @returns true if signing is enabled
 */
export function isSigningEnabled(): boolean {
  return !!getInternalApiSecret();
}

/**
 * Get configuration status for debugging
 *
 * @returns Object with configuration status
 */
export function getSigningConfig() {
  const secret = getInternalApiSecret();
  return {
    enabled: !!secret,
    secretLength: secret?.length || 0,
    minSecretLength: REQUEST_SIGNER_CONFIG.MIN_SECRET_LENGTH,
    timestampTolerance: REQUEST_SIGNER_CONFIG.TIMESTAMP_TOLERANCE,
    maxTimestampAge: REQUEST_SIGNER_CONFIG.MAX_TIMESTAMP_AGE,
  };
}
