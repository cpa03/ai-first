import { AppError, ErrorCode } from '@/lib/errors';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY && process.env.NODE_ENV !== 'development') {
  console.warn(
    'ADMIN_API_KEY not set. Admin routes will be disabled in production.'
  );
}

export function isAdminAuthenticated(request: Request): boolean {
  if (!ADMIN_API_KEY) {
    return process.env.NODE_ENV === 'development';
  }

  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('admin_key');

  if (!authHeader && !apiKey) {
    return false;
  }

  if (authHeader) {
    const [scheme, credentials] = authHeader.split(' ');
    if (scheme.toLowerCase() === 'bearer') {
      return credentials === ADMIN_API_KEY;
    }
  }

  if (apiKey) {
    return apiKey === ADMIN_API_KEY;
  }

  return false;
}

export function requireAdminAuth(request: Request): void {
  if (!isAdminAuthenticated(request)) {
    throw new AppError(
      'Unauthorized. Valid admin API key required.',
      ErrorCode.AUTHENTICATION_ERROR,
      401
    );
  }
}
