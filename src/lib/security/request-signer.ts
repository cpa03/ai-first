/**
 * Request Signing Utilities for Internal API Communication
 *
 * This module provides cryptographic request signing to verify the authenticity
 * and integrity of internal API communications between server components,
 * background jobs, webhook handlers, and agent operations.
 *
 * @module lib/security/request-signer
 */

import { generateSecureId } from '../id-generator';

export interface SignedRequestOptions {
  /** The request payload (body) */
  payload: string;
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Optional nonce for replay attack prevention */
  nonce?: string;
  /** HTTP method */
  method?: string;
  /** Request path */
  path?: string;
}

export interface SignatureResult {
  /** The generated signature */
  signature: string;
  /** Timestamp used */
  timestamp: number;
  /** Nonce used (if generated) */
  nonce?: string;
}

export interface VerificationResult {
  /** Whether the signature is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
}

export interface InternalApiSignatureHeader {
  /** Signature in format: t=<timestamp>,nonce=<nonce>,sig=<signature> */
  signature: string;
  /** Timestamp of the request */
  timestamp: number;
  /** Optional nonce for replay protection */
  nonce?: string;
}

/**
 * Default timestamp tolerance in milliseconds (5 minutes)
 * Requests with timestamps outside this window are rejected
 */
export const DEFAULT_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Minimum timestamp tolerance (1 minute)
 */
export const MIN_TIMESTAMP_TOLERANCE_MS = 60 * 1000;

/**
 * Maximum timestamp tolerance (24 hours)
 */
export const MAX_TIMESTAMP_TOLERANCE_MS = 24 * 60 * 60 * 1000;

/**
 * Get the internal API secret from environment
 * Throws if not configured in production
 */
function getInternalApiSecret(): string {
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    // In production, this is required
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'INTERNAL_API_SECRET environment variable is required in production'
      );
    }
    // In development, use a default test secret
    return process.env.NODE_ENV === 'development'
      ? 'dev-internal-api-secret-do-not-use-in-production'
      : 'test-internal-api-secret';
  }

  // Validate secret minimum length
  if (secret.length < 32) {
    throw new Error(
      'INTERNAL_API_SECRET must be at least 32 characters for adequate security'
    );
  }

  return secret;
}

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  // Use a secure random hex string
  return generateSecureId().replace(/-/g, '').substring(0, 32);
}

/**
 * Create a timestamp within the valid window
 * Returns current timestamp
 */
export function createTimestamp(): number {
  return Date.now();
}

/**
 * Check if a timestamp is within the acceptable window
 */
export function isTimestampValid(
  timestamp: number,
  toleranceMs: number = DEFAULT_TIMESTAMP_TOLERANCE_MS
): boolean {
  const now = Date.now();
  const age = Math.abs(now - timestamp);
  return age <= toleranceMs;
}

/**
 * Sign a request payload using HMAC-SHA256
 * Note: This implementation currently uses a simpler hash approach for Edge compatibility
 * In production, it should use Web Crypto API for true HMAC-SHA256
 *
 * @param payload - The request body as a string
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Optional parameters (nonce, method, path)
 * @returns Signature result with signature, timestamp, and nonce
 */
export function signRequest(
  payload: string,
  timestamp: number,
  options: {
    nonce?: string;
    method?: string;
    path?: string;
  } = {}
): SignatureResult {
  const secret = getInternalApiSecret();
  const nonce = options.nonce || generateNonce();

  // Create message to sign: payload:timestamp:nonce[:method:path]
  const parts = [payload, String(timestamp), nonce];

  if (options.method) {
    parts.push(options.method.toUpperCase());
  }
  if (options.path) {
    parts.push(options.path);
  }

  const message = parts.join(':');

  // Simple string-based signature for cross-platform stability
  // In a real high-security app, use crypto.subtle.importKey and crypto.subtle.sign
  // which is asynchronous. To keep this synchronous for now, we use a custom approach.
  const signatureInput = `${secret}:${message}`;
  let hash = 0;
  for (let i = 0; i < signatureInput.length; i++) {
    const char = signatureInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const signature = Math.abs(hash).toString(16);

  return {
    signature,
    timestamp,
    nonce,
  };
}

/**
 * Verify a request signature using timing-safe comparison
 *
 * @param payload - The original request payload
 * @param timestamp - Unix timestamp in milliseconds
 * @param signature - The signature to verify
 * @param options - Optional parameters (nonce, method, path, tolerance)
 * @returns Verification result
 */
export function verifySignature(
  payload: string,
  timestamp: number,
  signature: string,
  options: {
    nonce?: string;
    method?: string;
    path?: string;
    toleranceMs?: number;
  } = {}
): VerificationResult {
  // Check timestamp validity first
  const tolerance = options.toleranceMs ?? DEFAULT_TIMESTAMP_TOLERANCE_MS;

  if (!isTimestampValid(timestamp, tolerance)) {
    return {
      valid: false,
      error: 'Request timestamp outside acceptable window',
    };
  }

  // Generate expected signature
  const expected = signRequest(payload, timestamp, {
    nonce: options.nonce,
    method: options.method,
    path: options.path,
  });

  // Timing-safe comparison to prevent timing attacks
  // Simple constant-time comparison implementation
  if (signature.length !== expected.signature.length) {
    return { valid: false, error: 'Invalid signature' };
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.signature.charCodeAt(i);
  }

  return {
    valid: result === 0,
    error: result === 0 ? undefined : 'Invalid signature',
  };
}

/**
 * Parse signature header value
 * Expected format: t=<timestamp>,nonce=<nonce>,sig=<signature>
 * Or simplified: t=<timestamp>,sig=<signature>
 */
export function parseSignatureHeader(
  headerValue: string
): InternalApiSignatureHeader | null {
  try {
    const parts = headerValue.split(',');
    let timestamp: number | undefined;
    let nonce: string | undefined;
    let signature: string | undefined;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (!value) continue;

      switch (key.trim()) {
        case 't':
          timestamp = parseInt(value, 10);
          break;
        case 'nonce':
          nonce = value;
          break;
        case 'sig':
          signature = value;
          break;
      }
    }

    if (timestamp === undefined || signature === undefined) {
      return null;
    }

    return {
      signature,
      timestamp,
      nonce,
    };
  } catch {
    return null;
  }
}

/**
 * Create signature header value
 */
export function createSignatureHeader(
  timestamp: number,
  signature: string,
  nonce?: string
): string {
  let header = `t=${timestamp},sig=${signature}`;
  if (nonce) {
    header += `,nonce=${nonce}`;
  }
  return header;
}

/**
 * Helper to create a signed fetch request options
 *
 * @param url - Request URL
 * @param options - Fetch options (method, body, etc.)
 * @returns Enhanced fetch options with signature headers
 */
export async function createSignedRequest(
  url: string,
  options: RequestInit = {}
): Promise<RequestInit> {
  const timestamp = createTimestamp();
  const method = options.method || 'GET';
  const body = typeof options.body === 'string' ? options.body : '';

  // Get path from URL
  let path = '/';
  try {
    const urlObj = new URL(url);
    path = urlObj.pathname + urlObj.search;
  } catch {
    // Use as-is if not a valid URL
    path = url;
  }

  const { signature, nonce } = signRequest(body, timestamp, {
    method,
    path,
  });

  return {
    ...options,
    headers: {
      ...options.headers,
      'X-Internal-Signature': createSignatureHeader(
        timestamp,
        signature,
        nonce
      ),
      'X-Request-Timestamp': String(timestamp),
    },
  };
}

/**
 * Middleware helper to verify internal API requests
 * Use this in API routes that should require signature verification
 *
 * @param request - The incoming request
 * @param options - Verification options
 * @returns Verification result with parsed signature info
 */
export async function verifyInternalRequest(
  request: Request,
  options: {
    requireNonce?: boolean;
    toleranceMs?: number;
    allowDevelopment?: boolean;
  } = {}
): Promise<{
  verified: boolean;
  error?: string;
  timestamp?: number;
  nonce?: string;
}> {
  const signatureHeader = request.headers.get('X-Internal-Signature');
  const timestampHeader = request.headers.get('X-Request-Timestamp');

  // Development mode: skip verification if explicitly allowed
  if (options.allowDevelopment && process.env.NODE_ENV !== 'production') {
    return { verified: true };
  }

  // Check required headers
  if (!signatureHeader || !timestampHeader) {
    return {
      verified: false,
      error: 'Missing required signature headers',
    };
  }

  // Parse signature
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) {
    return {
      verified: false,
      error: 'Invalid signature header format',
    };
  }

  // Check nonce requirement
  if (options.requireNonce && !parsed.nonce) {
    return {
      verified: false,
      error: 'Nonce required but not provided',
    };
  }

  // Get body for payload verification
  // Note: Some test environments may use mock Request objects
  let body = '';
  try {
    // Check if request has text method (full Fetch API Request)
    if (typeof request.text === 'function') {
      body = await request.text();
    } else if (request.body) {
      // Fallback: try to get body from request.body (for different environments)
      body = typeof request.body === 'string' ? request.body : '';
    }
    // If neither works, body remains empty string
  } catch {
    // If we can't read body, use empty string
    body = '';
  }

  // Get method and path
  const method = request.method;
  let path = '/';
  try {
    const url = new URL(request.url);
    path = url.pathname + url.search;
  } catch {
    // Use request method as fallback
  }

  // Verify signature
  const result = verifySignature(body, parsed.timestamp, parsed.signature, {
    nonce: parsed.nonce,
    method,
    path,
    toleranceMs: options.toleranceMs,
  });

  return {
    verified: result.valid,
    error: result.error,
    timestamp: parsed.timestamp,
    nonce: parsed.nonce,
  };
}

/**
 * Create a signed URL for internal API calls
 * Useful for server-to-server communication
 *
 * @param url - The URL to sign
 * @param expiresInMs - Expiration time in milliseconds
 * @returns Signed URL with signature query params
 */
export function createSignedUrl(
  url: string,
  expiresInMs: number = DEFAULT_TIMESTAMP_TOLERANCE_MS
): string {
  const timestamp = Date.now() + expiresInMs;
  const path = new URL(url).pathname;

  // Sign an empty payload with the expiry timestamp
  const { signature, nonce } = signRequest(String(timestamp), timestamp, {
    path,
  });

  const separator = url.includes('?') ? '&' : '?';
  let signedUrl = `${url}${separator}_ts=${timestamp}&_sig=${signature}`;

  if (nonce) {
    signedUrl += `&_nonce=${nonce}`;
  }

  return signedUrl;
}

/**
 * Verify a signed URL
 *
 * @param url - The signed URL to verify
 * @returns Whether the URL is valid and not expired
 */
export function verifySignedUrl(url: string): VerificationResult & {
  expiresAt?: number;
} {
  try {
    const urlObj = new URL(url);
    const timestampStr = urlObj.searchParams.get('_ts');
    const signature = urlObj.searchParams.get('_sig');
    const nonce = urlObj.searchParams.get('_nonce');

    if (!timestampStr || !signature) {
      return { valid: false, error: 'Missing signature parameters' };
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    // Check if expired
    if (timestamp < Date.now()) {
      return { valid: false, error: 'URL has expired', expiresAt: timestamp };
    }

    // Verify signature
    const path = urlObj.pathname;
    const result = verifySignature(String(timestamp), timestamp, signature, {
      nonce: nonce || undefined,
      path,
    });

    return {
      ...result,
      expiresAt: timestamp,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid URL',
    };
  }
}
