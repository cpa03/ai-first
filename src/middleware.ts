import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export const runtime = 'experimental-edge';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Security: Disable legacy browser XSS auditor (modern standard)
  response.headers.set('X-XSS-Protection', '0');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
