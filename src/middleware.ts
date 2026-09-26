import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateApiCacheControl, generateStaticAssetCacheControl } from '@/lib/config/cache-control';

/**
 * Middleware for edge caching, redirects, and performance optimization
 *
 * This middleware runs at the edge and provides:
 * - Cache-Control headers for static assets and API routes
 * - Security headers
 * - Geo-based redirects (if needed)
 * - Performance optimizations
 */

// Paths that should have long-term caching (static assets)
const STATIC_ASSET_PATHS = [
  '/_next/static/',
  '/_next/image/',
  '/favicon.ico',
  '/favicon.svg',
  '/manifest.json',
  '/icon-',
  '/screenshot.png',
  '/og-image.svg',
];

// API routes that should have edge caching
const CACHEABLE_API_PATHS = [
  '/api/ideas',
];

// Paths that should never be cached
const NO_CACHE_PATHS = [
  '/api/auth/',
  '/dashboard',
  '/clarify',
  '/results',
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers to all responses
  addSecurityHeaders(response);

  // Handle static asset caching (long-term, immutable)
  if (STATIC_ASSET_PATHS.some(path => pathname.startsWith(path))) {
    response.headers.set('Cache-Control', generateStaticAssetCacheControl(31536000)); // 1 year
    return response;
  }

  // Handle API route caching
  if (CACHEABLE_API_PATHS.some(path => pathname.startsWith(path))) {
    // Only cache GET requests
    if (request.method === 'GET') {
      response.headers.set('Cache-Control', generateApiCacheControl());
    } else {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    return response;
  }

  // Handle no-cache paths
  if (NO_CACHE_PATHS.some(path => pathname.startsWith(path))) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // Default cache control for other routes
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // XSS Protection
  response.headers.set('X-XSS-Protection', '0');

  // Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Cross-Origin-Resource-Policy
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // Cross-Origin-Opener-Policy
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes - no cache)
     * - _next/static (handled above)
     * - _next/image (handled above)
     * - favicon.ico (handled above)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|icon-|screenshot.png|og-image.svg).*)',
  ],
};