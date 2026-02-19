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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('sb-auth-token')?.value || 
                   request.cookies.get('supabase-auth-token')?.value;

  if (!authToken && !AUTH_PATHS.includes(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authToken && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
