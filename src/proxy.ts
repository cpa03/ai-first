import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_CONFIG, CSP_CONFIG } from '@/lib/config/constants';

// Generate a unique nonce for each request to enhance security
function generateNonce(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return btoa(Array.from(buffer).map(b => String.fromCharCode(b)).join(''));
}

// PERFORMANCE: Pre-calculate the CSP header template.
// This avoids re-iterating over the directives on every request.
const CSP_TEMPLATE = Object.entries(CSP_CONFIG.DIRECTIVES)
  .map(([directive, values]) => {
    if (values.length === 0) {
      return directive;
    }
    return `${directive} ${values.join(' ')}`;
  })
  .join('; ');

/**
 * Build CSP header with dynamic nonce replacement
 * PERFORMANCE: Uses a pre-calculated template to minimize overhead.
 */
function buildCSPHeader(nonce: string): string {
  return CSP_TEMPLATE.replaceAll("'nonce-placeholder'", `'nonce-${nonce}'`);
}

// PERFORMANCE: Pre-calculate the Permissions-Policy header.
const PERMISSIONS_POLICY = CSP_CONFIG.PERMISSIONS_POLICY.join(', ');

// PERFORMANCE: Pre-calculate HSTS header if applicable.
const HSTS_HEADER = `max-age=${SECURITY_CONFIG.HSTS_MAX_AGE}${
  SECURITY_CONFIG.HSTS_INCLUDE_SUBDOMAINS ? '; includeSubDomains' : ''
}${SECURITY_CONFIG.HSTS_PRELOAD ? '; preload' : ''}`;

export function proxy(_request: NextRequest) {
  const nonce = generateNonce();
  const response = NextResponse.next();

  // Set nonce header for layout.tsx to access
  response.headers.set('x-nonce', nonce);

  // Set security headers with nonce-based CSP
  response.headers.set('Content-Security-Policy', buildCSPHeader(nonce));
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', HSTS_HEADER);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
