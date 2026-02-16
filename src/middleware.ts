import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { CSP_CONFIG, SECURITY_CONFIG } from '@/lib/config/constants';

function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

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

function buildPermissionsPolicy(): string {
  return CSP_CONFIG.PERMISSIONS_POLICY.join(', ');
}

function buildHSTSHeader(): string {
  const parts = [`max-age=${SECURITY_CONFIG.HSTS_MAX_AGE}`];
  if (SECURITY_CONFIG.HSTS_INCLUDE_SUBDOMAINS) {
    parts.push('includeSubDomains');
  }
  if (SECURITY_CONFIG.HSTS_PRELOAD) {
    parts.push('preload');
  }
  return parts.join('; ');
}

export function middleware(request: NextRequest): NextResponse {
  const nonce = generateNonce();
  const response = NextResponse.next();

  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', buildCSPHeader(nonce));
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', buildPermissionsPolicy());

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', buildHSTSHeader());
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
};
