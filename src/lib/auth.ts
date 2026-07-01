import { AppError, ErrorCode } from '@/lib/errors';
import { getSupabaseAdmin } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import { AUTH_CONFIG } from '@/lib/config/constants';
import { STATUS_CODES } from '@/lib/config/http';
import { SecurityAuditLog } from '@/lib/security/audit-log';
import { SECURITY_ENV_KEYS, PLATFORM_ENV_KEYS } from '@/lib/config/env-keys';
import { API_ERROR_MESSAGES } from '@/lib/config';

const logger = createLogger('auth');

/**
 * Lazy-loaded admin API key to avoid side-effects during module evaluation.
 * This ensures compatibility with Cloudflare Workers build-time scans.
 */
let memoizedAdminKey: string | undefined;
let adminKeyInitialized = false;

function getAdminApiKey(): string | undefined {
  if (!adminKeyInitialized) {
    memoizedAdminKey = process.env[SECURITY_ENV_KEYS.ADMIN_API_KEY];
    adminKeyInitialized = true;

    if (
      !memoizedAdminKey &&
      process.env[PLATFORM_ENV_KEYS.NODE_ENV] !== 'development'
    ) {
      logger.warn(
        'ADMIN_API_KEY not set. Admin routes will be disabled in production.'
      );
    }
  }
  return memoizedAdminKey;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function isAdminAuthenticated(request: Request): Promise<boolean> {
  const adminKey = getAdminApiKey();
  if (!adminKey) {
    return process.env[PLATFORM_ENV_KEYS.NODE_ENV] === 'development';
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: 'missing_credentials',
      method: 'bearer_token',
    });
    return false;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: 'invalid_credentials',
      method: 'bearer_token',
    });
    return false;
  }

  const credentials = parts[1];

  if (!credentials || credentials.length > AUTH_CONFIG.MAX_CREDENTIAL_LENGTH) {
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: 'invalid_credentials',
      method: 'bearer_token',
    });
    return false;
  }

  try {
    const encoder = new TextEncoder();

    const expectedHash = await crypto.subtle.digest(
      AUTH_CONFIG.HASH_ALGORITHM,
      encoder.encode(adminKey)
    );
    const actualHash = await crypto.subtle.digest(
      AUTH_CONFIG.HASH_ALGORITHM,
      encoder.encode(credentials)
    );

    const authenticated = safeEqual(
      new Uint8Array(expectedHash),
      new Uint8Array(actualHash)
    );

    SecurityAuditLog.logAuthAttempt({
      success: authenticated,
      reason: authenticated ? undefined : 'invalid_credentials',
      method: 'bearer_token',
    });

    return authenticated;
  } catch (error) {
    logger.error('Admin authentication error', error);
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: 'other',
      method: 'bearer_token',
    });
    return false;
  }
}

export async function requireAdminAuth(request: Request): Promise<void> {
  const authenticated = await isAdminAuthenticated(request);
  if (!authenticated) {
    throw new AppError(
      'Unauthorized. Valid admin API key required.',
      ErrorCode.AUTHENTICATION_ERROR,
      STATUS_CODES.UNAUTHORIZED
    );
  }
}

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
      throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
    }

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

export async function requireAuth(
  request: Request
): Promise<AuthenticatedUser> {
  const user = await verifyAuth(request);

  if (!user) {
    throw new AppError(
      'Unauthorized. Valid authentication token required.',
      ErrorCode.AUTHENTICATION_ERROR,
      STATUS_CODES.UNAUTHORIZED
    );
  }

  return user;
}

export function verifyResourceOwnership(
  userId: string,
  resourceOwnerId: string,
  resourceType: string = 'resource'
): void {
  if (userId !== resourceOwnerId) {
    throw new AppError(
      `Forbidden. You do not have access to this ${resourceType}.`,
      ErrorCode.AUTHORIZATION_ERROR,
      STATUS_CODES.FORBIDDEN
    );
  }
}
