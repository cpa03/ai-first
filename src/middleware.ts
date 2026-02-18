/**
 * Next.js Middleware
 * 
 * Handles CSP nonce generation and security header injection.
 * Runs on every request to generate a unique nonce for CSP.
 * 
 * @module middleware
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/middleware}
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateNonce, buildCSPHeader } from './lib/security/csp';

/**
 * Middleware function for all routes
 * 
 * Generates a CSP nonce for each request and sets security headers.
 * The nonce is used to allow inline scripts that are part of the
 * Next.js framework while maintaining strict CSP.
 * 
 * @param request - The incoming Next.js request
 * @returns NextResponse with security headers
 */
export function middleware(request: NextRequest) {
  // Generate a unique nonce for this request
  const nonce = generateNonce();

  // Build CSP header with the nonce
  const cspValue = buildCSPHeader(nonce);

  // Create response with the nonce header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header with nonce
  response.headers.set('Content-Security-Policy', cspValue);

  // Set additional security headers
  // Note: These are also set in next.config.js, but middleware headers
  // take precedence and can be dynamic
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Middleware configuration
 * 
 * Specifies which routes the middleware should run on.
 * Excludes static files, API routes, and Next.js internals.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap file)
     * - robots.txt (robots file)
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
