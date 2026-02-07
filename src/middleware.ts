import { NextResponse } from 'next/server';
import { SECURITY_CONFIG } from '@/lib/config/constants';

export function middleware() {
  const response = NextResponse.next();

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
    "connect-src 'self' https://*.supabase.co",
    "worker-src 'self'",
    "manifest-src 'self'",
  ];

  const cspHeader = cspDirectives.join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
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
