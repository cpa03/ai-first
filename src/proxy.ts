import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { SECURITY_CONFIG, CSP_CONFIG } from '@/lib/config/constants';

// Generate a unique nonce for each request to enhance security
function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

// Build CSP header with dynamic nonce replacement
function buildCSPHeader(nonce: string): string {
  const directives: string[] = [];

  for (const [directive, values] of Object.entries(CSP_CONFIG.DIRECTIVES)) {
    if (values.length === 0) {
      directives.push(directive);
    } else {
      const processedValues = values.map((value) => {
        if (value === "'nonce-placeholder'") {
          return `'nonce-${nonce}'`;
        }
        return value;
      });
      directives.push(`${directive} ${processedValues.join(' ')}`);
    }
  }

  return directives.join('; ');
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
