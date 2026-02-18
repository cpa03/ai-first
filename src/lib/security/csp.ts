/**
 * Content Security Policy (CSP) Builder
 *
 * Generates CSP header values from configuration directives.
 * Supports nonce injection for script-src directives.
 *
 * @module lib/security/csp
 * @see {@link ../config/constants.ts} for CSP configuration
 */

import { CSP_CONFIG } from '../config/constants';

/**
 * Build a CSP header value from configuration directives
 *
 * @param nonce - Optional nonce value for script-src directive
 * @returns Formatted CSP header value
 *
 * @example
 * ```typescript
 * // Without nonce
 * const csp = buildCSPHeader();
 * // Returns: "default-src 'self'; script-src 'self' 'nonce-placeholder'..."
 *
 * // With nonce
 * const csp = buildCSPHeader('abc123...');
 * // Returns: "default-src 'self'; script-src 'self' 'nonce-abc123...'..."
 * ```
 */
export function buildCSPHeader(nonce?: string): string {
  const { DIRECTIVES } = CSP_CONFIG;

  return Object.entries(DIRECTIVES)
    .map(([directive, values]) => {
      // Handle directives with no values (e.g., 'upgrade-insecure-requests')
      if (values.length === 0) {
        return directive;
      }

      // Process values, replacing nonce placeholder if provided
      const processedValues = values.map((value) => {
        if (value === "'nonce-placeholder'" && nonce) {
          return `'nonce-${nonce}'`;
        }
        return value;
      });

      return `${directive} ${processedValues.join(' ')}`;
    })
    .join('; ');
}

/**
 * Generate a cryptographically secure nonce for CSP
 *
 * The nonce should be unique per request and unpredictable.
 * This implementation uses SHA-256 hash of random bytes.
 *
 * @returns Base64-encoded nonce string (44 characters)
 *
 * @example
 * ```typescript
 * const nonce = generateNonce();
 * // Returns: "aBc123XyZ..." (44 character base64 string)
 * ```
 */
export function generateNonce(): string {
  // In Node.js environment (server-side)
  if (typeof window === 'undefined') {
    // Dynamic import to avoid bundling crypto in client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64');
  }

  // Fallback for client-side (should not be used for CSP)
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for older browsers - not cryptographically secure
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return btoa(String.fromCharCode(...array));
}

/**
 * Validate a CSP header value
 *
 * Performs basic validation to ensure the CSP string is well-formed.
 *
 * @param cspValue - The CSP header value to validate
 * @returns Object with validation result and any error messages
 */
export function validateCSP(cspValue: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for empty CSP
  if (!cspValue || cspValue.trim().length === 0) {
    errors.push('CSP value is empty');
    return { valid: false, errors };
  }

  // Split into directives
  const directives = cspValue.split(';').map((d) => d.trim());

  for (const directive of directives) {
    if (!directive) continue;

    const parts = directive.split(/\s+/);
    const directiveName = parts[0];

    // Check for required directives
    if (directiveName === 'default-src' && parts.length < 2) {
      errors.push('default-src directive requires at least one value');
    }

    // Check for unsafe-inline without nonce in script-src
    if (directiveName === 'script-src') {
      const values = parts.slice(1);
      const hasUnsafeInline = values.includes("'unsafe-inline'");
      const hasNonce = values.some((v) => v.startsWith("'nonce-"));

      if (hasUnsafeInline && !hasNonce) {
        errors.push(
          'script-src contains unsafe-inline without nonce - consider using nonces for better security'
        );
      }
    }
  }

  // Check for frame-ancestors (equivalent to X-Frame-Options)
  const hasFrameAncestors = directives.some((d) =>
    d.startsWith('frame-ancestors')
  );
  if (!hasFrameAncestors) {
    errors.push(
      'frame-ancestors directive is recommended (replaces X-Frame-Options)'
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get CSP directives as a structured object
 *
 * Useful for debugging or logging CSP configuration.
 *
 * @returns Object with directive names as keys and values as arrays
 */
export function getCSPDirectives(): Record<string, string[]> {
  // Convert readonly arrays to mutable arrays
  return Object.fromEntries(
    Object.entries(CSP_CONFIG.DIRECTIVES).map(([key, value]) => [
      key,
      [...value],
    ])
  ) as Record<string, string[]>;
}
