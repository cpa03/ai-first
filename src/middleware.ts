import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SECURITY_CONFIG,
  CSP_CONFIG,
  PROXY_CONFIG,
} from '@/lib/config/constants';
import {
  getCloudflareRequestInfo,
  getClientIp,
} from '@/lib/cloudflare';





/**
 * Middleware for Next.js 16+ on Cloudflare Workers
 *
 * This file uses the standard middleware.ts convention to ensure compatibility
 * with Cloudflare Workers (OpenNext), which requires web-standard APIs.
 *
 * Key Cloudflare-specific features:
 * - Uses web-standard btoa() instead of Node.js Buffer for Edge compatibility
 * - Adds Cloudflare-specific request context headers (X-CF-Ray, X-CF-Country)
 * - Supports Cloudflare geo-location headers for request context
 *
 * @see https://opennext.js.org/cloudflare
 * @see https://developers.cloudflare.com/workers/runtime-apis/
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

/**
 * Generate a cryptographically secure nonce for CSP
 * Uses web-standard btoa() instead of Node.js Buffer for Edge/Cloudflare compatibility
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  // Web-standard base64 encoding without Node.js Buffer for Edge compatibility
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

/**
 * Pre-computed CSP template for performance optimization
 * Only nonce is substituted at runtime
 */
const CSP_DIRECTIVE_ORDER = [
  'default-src',
  'script-src',
  'style-src',
  'img-src',
  'font-src',
  'object-src',
  'base-uri',
  'form-action',
  'frame-ancestors',
  'upgrade-insecure-requests',
  'connect-src',
  'worker-src',
  'manifest-src',
] as const;

function buildCSPHeader(nonce: string): string {
  const directives = CSP_CONFIG.DIRECTIVES;
  const cspParts: string[] = [];

  // Process directives in consistent order for cacheability
  for (const directive of CSP_DIRECTIVE_ORDER) {
    const values = directives[directive as keyof typeof directives];
    if (!values) continue;

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

/**
 * Apply Cloudflare-specific request context headers
 * These headers help with debugging and geo-aware features
 */
function applyCloudflareContextHeaders(
  response: NextResponse,
  request: NextRequest
): void {
  const cfInfo = getCloudflareRequestInfo(request);

  // Add Cloudflare Ray ID for request tracing
  if (cfInfo.rayId) {
    response.headers.set('X-CF-Ray', cfInfo.rayId);
  }

  // Add country code for geo-aware features
  if (cfInfo.country) {
    response.headers.set('X-CF-Country', cfInfo.country);
  }

  // Add client IP for debugging (only in non-production or for debugging)
  const clientIp = getClientIp(request);
  if (clientIp && process.env.NODE_ENV !== 'production') {
    response.headers.set('X-Client-IP', clientIp);
  }

  // Mark that request came through Cloudflare
  response.headers.set('X-CF-Worker', String(cfInfo.isWorker));
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

  // SECURITY: Explicitly disable legacy XSS auditor
  // Modern browsers rely on CSP; disabling prevents side-channel attacks
  // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
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

  // Apply security headers first
  applySecurityHeaders(response, nonce, isProduction);

  // Add Cloudflare-specific context headers for enhanced debugging
  applyCloudflareContextHeaders(response, request);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
