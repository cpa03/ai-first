import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SECURITY_CONFIG,
  CSP_CONFIG,
  PROXY_CONFIG,
} from '@/lib/config/constants';

/**
 * Proxy (Middleware) for Next.js 16+
 *
 * This file replaces the deprecated middleware.ts convention.
 * In Next.js 16+, middleware files should be named proxy.ts.
 *
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 */

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/forgot-password',
  '/reset-password',
  '/api/health',
  '/api/health/live',
  '/api/health/ready',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

const AUTH_PATHS = ['/login', '/signup'];

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

function buildCSPHeader(nonce: string): string {
  const directives = CSP_CONFIG.DIRECTIVES;
  const cspParts: string[] = [];

  for (const [directive, values] of Object.entries(directives)) {
    if (directive === 'script-src') {
      const scriptValues = values.map((v) =>
        v === "'nonce-placeholder'" ? `'nonce-${nonce}'` : v
      );
      scriptValues.push(PROXY_CONFIG.VERCEL_LIVE_URL);
      cspParts.push(`${directive} ${scriptValues.join(' ')}`);
    } else if (values.length === 0) {
      cspParts.push(directive);
    } else {
      cspParts.push(`${directive} ${values.join(' ')}`);
    }
  }

  cspParts.push(`report-uri ${PROXY_CONFIG.CSP_REPORT_PATH}`);
  cspParts.push('report-to csp-endpoint');

  return cspParts.join('; ');
}

function buildPermissionsPolicy(): string {
  return CSP_CONFIG.PERMISSIONS_POLICY.join(', ');
}

function applySecurityHeaders(
  response: NextResponse,
  nonce: string,
  isProduction: boolean
): void {
  response.headers.set('X-Frame-Options', SECURITY_CONFIG.X_FRAME_OPTIONS);
  response.headers.set(
    'X-Content-Type-Options',
    SECURITY_CONFIG.X_CONTENT_TYPE_OPTIONS
  );
  response.headers.set('Referrer-Policy', SECURITY_CONFIG.REFERRER_POLICY);
  response.headers.set('X-XSS-Protection', SECURITY_CONFIG.X_XSS_PROTECTION);
  response.headers.set('Permissions-Policy', buildPermissionsPolicy());
  response.headers.set('Content-Security-Policy', buildCSPHeader(nonce));
  response.headers.set(
    'Cross-Origin-Resource-Policy',
    SECURITY_CONFIG.CROSS_ORIGIN_RESOURCE_POLICY
  );
  response.headers.set(
    'Cross-Origin-Opener-Policy',
    SECURITY_CONFIG.CROSS_ORIGIN_OPENER_POLICY
  );

  if (isProduction) {
    const hstsValue = `max-age=${SECURITY_CONFIG.HSTS_MAX_AGE}; includeSubDomains${
      SECURITY_CONFIG.HSTS_PRELOAD ? '; preload' : ''
    }`;
    response.headers.set('Strict-Transport-Security', hstsValue);
  }

  response.headers.set('x-nonce', nonce);

  response.headers.set(
    'Report-To',
    JSON.stringify({
      group: 'csp-endpoint',
      max_age: PROXY_CONFIG.CSP_REPORT_MAX_AGE,
      endpoints: [{ url: PROXY_CONFIG.CSP_REPORT_PATH }],
    })
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateNonce();
  const isProduction = process.env.NODE_ENV === 'production';

  let response: NextResponse;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    response = NextResponse.next();
  } else if (pathname.startsWith('/api/')) {
    response = NextResponse.next();
  } else {
    const authToken =
      request.cookies.get('sb-auth-token')?.value ||
      request.cookies.get('supabase-auth-token')?.value;

    if (!authToken && !AUTH_PATHS.includes(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      response = NextResponse.redirect(loginUrl);
    } else if (authToken && AUTH_PATHS.includes(pathname)) {
      response = NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      response = NextResponse.next();
    }
  }

  applySecurityHeaders(response, nonce, isProduction);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
