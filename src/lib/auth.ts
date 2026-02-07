import { AppError, ErrorCode } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/db';
import { timingSafeEqual } from 'crypto';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY && process.env.NODE_ENV !== 'development') {
  console.warn(
    'ADMIN_API_KEY not set. Admin routes will be disabled in production.'
  );
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
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

  const bufferKey = Buffer.from(ADMIN_API_KEY, 'utf8');

  if (authHeader) {
    const [scheme, credentials] = authHeader.split(' ');
    if (scheme.toLowerCase() === 'bearer' && credentials) {
      const bufferCredentials = Buffer.from(credentials, 'utf8');
      // Ensure buffers are same length to prevent early returns
      if (bufferKey.length !== bufferCredentials.length) {
        return false;
      }
      return timingSafeEqual(bufferKey, bufferCredentials);
    }
  }

  if (apiKey) {
    const bufferApiKey = Buffer.from(apiKey, 'utf8');
    // Ensure buffers are same length to prevent early returns
    if (bufferKey.length !== bufferApiKey.length) {
      return false;
    }
    return timingSafeEqual(bufferKey, bufferApiKey);
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

/**
 * Extract and verify JWT token from Authorization header
 * Returns the authenticated user or null if invalid
 */
export async function verifyAuth(
  request: Request
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');

  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized');
    }

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(
  request: Request
): Promise<AuthenticatedUser> {
  const user = await verifyAuth(request);

  if (!user) {
    throw new AppError(
      'Unauthorized. Valid authentication token required.',
      ErrorCode.AUTHENTICATION_ERROR,
      401
    );
  }

  return user;
}

/**
 * Verify that a user owns a resource
 * Throws 403 Forbidden if user does not own the resource
 */
export function verifyResourceOwnership(
  userId: string,
  resourceOwnerId: string,
  resourceType: string = 'resource'
): void {
  if (userId !== resourceOwnerId) {
    throw new AppError(
      `Forbidden. You do not have access to this ${resourceType}.`,
      ErrorCode.AUTHORIZATION_ERROR,
      403
    );
  }
}
