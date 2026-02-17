import { AppError, ErrorCode } from '@/lib/errors';
import { getSupabaseAdmin } from '@/lib/db';
import { createLogger } from '@/lib/logger';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const logger = createLogger('auth');

if (!ADMIN_API_KEY && process.env.NODE_ENV !== 'development') {
  logger.warn(
    'ADMIN_API_KEY not set. Admin routes will be disabled in production.'
  );
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

/**
 * Timing-safe comparison of two Uint8Arrays to prevent timing attacks.
 * This is an environment-agnostic implementation of timingSafeEqual.
 */
function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Validates administrative authentication.
 * SECURITY: Uses SHA-256 hashing and timing-safe comparison to prevent secret leakage.
 * Uses Web Crypto API for compatibility across Node, Edge, and Workers.
 */
export async function isAdminAuthenticated(
  request: Request
): Promise<boolean> {
  if (!ADMIN_API_KEY) {
    return process.env.NODE_ENV === 'development';
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return false;
  }

  const credentials = parts[1];

  // SECURITY: Limit token length to prevent DoS attacks during hashing
  if (!credentials || credentials.length > 512) {
    return false;
  }

  try {
    const encoder = new TextEncoder();

    // SECURITY: Hash both strings before comparison to prevent timing attacks and leaking key length.
    // Use the standard Web Crypto API available in all modern runtimes.
    const expectedHash = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(ADMIN_API_KEY)
    );
    const actualHash = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(credentials)
    );

    return safeEqual(new Uint8Array(expectedHash), new Uint8Array(actualHash));
  } catch (error) {
    logger.error('Admin authentication error', error);
    return false;
  }
}

/**
 * Throws an AppError if administrative authentication fails.
 */
export async function requireAdminAuth(request: Request): Promise<void> {
  const authenticated = await isAdminAuthenticated(request);
  if (!authenticated) {
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
    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      throw new Error('Supabase admin client not initialized');
    }

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await adminClient.auth.getUser(token);

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
