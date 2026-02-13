import { NextResponse } from 'next/server';
import { SECURITY_CONFIG, CSP_CONFIG } from '@/lib/config/constants';

// PERFORMANCE: Pre-calculate the CSP header to avoid overhead on every request.
const CSP_HEADER = ((): string => {
  const directives: string[] = [];

  for (const [directive, values] of Object.entries(CSP_CONFIG.DIRECTIVES)) {
    if (values.length === 0) {
      directives.push(directive);
    } else {
      directives.push(`${directive} ${values.join(' ')}`);
    }
  }

  return directives.join('; ');
})();

// PERFORMANCE: Pre-calculate the Permissions-Policy header.
const PERMISSIONS_POLICY = CSP_CONFIG.PERMISSIONS_POLICY.join(', ');

// PERFORMANCE: Pre-calculate HSTS header if applicable.
const HSTS_HEADER = `max-age=${SECURITY_CONFIG.HSTS_MAX_AGE}${
  SECURITY_CONFIG.HSTS_INCLUDE_SUBDOMAINS ? '; includeSubDomains' : ''
}${SECURITY_CONFIG.HSTS_PRELOAD ? '; preload' : ''}`;

export function proxy() {
  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', CSP_HEADER);
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
