import { NextResponse } from 'next/server';
import { SECURITY_CONFIG, CSP_CONFIG } from '@/lib/config/constants';

function buildCSPHeader(): string {
  const directives: string[] = [];

  for (const [directive, values] of Object.entries(CSP_CONFIG.DIRECTIVES)) {
    if (values.length === 0) {
      directives.push(directive);
    } else {
      directives.push(`${directive} ${values.join(' ')}`);
    }
  }

  return directives.join('; ');
}

export function proxy() {
  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', buildCSPHeader());
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  response.headers.set(
    'Permissions-Policy',
    CSP_CONFIG.PERMISSIONS_POLICY.join(', ')
  );

  if (process.env.NODE_ENV === 'production') {
    const hstsDirectives = [
      `max-age=${SECURITY_CONFIG.HSTS_MAX_AGE}`,
      ...(SECURITY_CONFIG.HSTS_INCLUDE_SUBDOMAINS ? ['includeSubDomains'] : []),
      ...(SECURITY_CONFIG.HSTS_PRELOAD ? ['preload'] : []),
    ];
    response.headers.set(
      'Strict-Transport-Security',
      hstsDirectives.join('; ')
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
