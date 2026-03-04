export const runtime = 'experimental-edge';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_CONFIG } from '@/lib/config/security-config';
import { CSP_CONFIG } from '@/lib/config/csp-config';
import { PROXY_CONFIG } from '@/lib/config/proxy-config';

/**
 * Middleware for Next.js
 *
 * Features:
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * - Authentication flow handling
 * - Cloudflare Workers optimization (edge detection, geo, caching)
 *
 * Cloudflare Headers Used:
 * - cf-ray: Request ID for debugging
 * - cf-country/cf-ipcountry: Country code for geo features
 * - cf-connecting-ip: Original client IP
 * - cf-visitor: HTTPS info
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
  // Convert Uint8Array to base64 using Web APIs (Edge-compatible)
  // Avoids Node.js Buffer which is not available in Cloudflare Workers
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

/**
 * PERFORMANCE: Pre-calculate the CSP header template at module level to avoid
 * expensive object iteration and string construction on every request.
 */
const CSP_TEMPLATE = (function buildCSPTemplate(): string {
  const directives = CSP_CONFIG.DIRECTIVES;
  const cspParts: string[] = [];

  for (const [directive, values] of Object.entries(directives)) {
    if (directive === 'script-src') {
      const scriptValues = [...values, PROXY_CONFIG.VERCEL_LIVE_URL];
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
})();

/**
 * Build Content Security Policy header with runtime nonce injection.
 * Uses .replaceAll() for fast substitution within the pre-calculated template.
 */
function buildCSPHeader(nonce: string): string {
  return CSP_TEMPLATE.replaceAll("'nonce-placeholder'", `'nonce-${nonce}'`);
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
  response.headers.set('X-XSS-Protection', SECURITY_CONFIG.X_XSS_PROTECTION);
  response.headers.set('Referrer-Policy', SECURITY_CONFIG.REFERRER_POLICY);
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

/**
 * Apply Cloudflare-specific headers for edge optimization
 *
 * Cloudflare provides unique headers that can be used for:
 * - Request tracing (cf-ray)
 * - Geographic optimization (cf-country, cf-ipcountry)
 * - Client IP detection (cf-connecting-ip)
 * - HTTPS detection (cf-visitor)
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties
 */
function applyCloudflareHeaders(
  request: NextRequest,
  response: NextResponse
): void {
  // Detect if running on Cloudflare Workers via cf-ray header
  const cfRay = request.headers.get('cf-ray');
  const isCloudflare = !!cfRay;

  if (isCloudflare) {
    // Mark response as coming from Cloudflare edge
    response.headers.set('x-cloudflare-edge', 'true');

    // Add request ID from cf-ray for debugging and tracing
    // cf-ray format: "7d1e2f3g4h5i-SJC" (requestId-datacenter)
    if (cfRay) {
      const requestId = cfRay.split('-')[0];
      response.headers.set('x-request-id', requestId);
    }

    // Extract and expose geographic information
    // cf-country: ISO 3166-1 Alpha 2 country code (e.g., "US", "GB", "JP")
    const cfCountry = request.headers.get('cf-country') ||
                       request.headers.get('cf-ipcountry');
    if (cfCountry) {
      response.headers.set('x-user-country', cfCountry);
    }

    // Extract real client IP from Cloudflare
    // cf-connecting-ip: Original visitor IP address
    const cfIP = request.headers.get('cf-connecting-ip');
    if (cfIP) {
      response.headers.set('x-real-ip', cfIP);
    }

    // Optimize cache headers for Cloudflare edge
    const { pathname } = request.nextUrl;

    // API routes: shorter cache for dynamic content
    // Static assets are handled by the matcher exclusion in config
    if (pathname.startsWith('/api/')) {
      // Cache at edge for 5 minutes, revalidate after 10 minutes
      const existingCacheControl = response.headers.get('cache-control');
      if (!existingCacheControl || existingCacheControl === 'no-store') {
        response.headers.set(
          'cache-control',
          'public, max-age=300, s-maxage=600, stale-while-revalidate=60'
        );
      }
    }
  }
}

export function middleware(request: NextRequest) {
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
  // Apply Cloudflare-specific optimizations for edge deployment
  applyCloudflareHeaders(request, response);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
