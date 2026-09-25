import { AppError, ErrorCode } from '@/lib/errors';
import { getSupabaseAdmin } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import { AUTH_CONFIG } from '@/lib/config/constants';
import { STATUS_CODES } from '@/lib/config/http';
import { SecurityAuditLog } from '@/lib/security/audit-log';
import { SECURITY_ENV_KEYS, PLATFORM_ENV_KEYS } from '@/lib/config/env-keys';
import { API_ERROR_MESSAGES } from '@/lib/config';
import { timingSafeEqualArrays } from '@/lib/security/crypto';

const logger = createLogger('auth');
let warnedAboutMissingKey = false;

function getIsDevelopment(): boolean {
  if (typeof process === 'undefined') return false;
  return process.env[PLATFORM_ENV_KEYS.NODE_ENV] === 'development';
}

function getAdminApiKey(): string {
  if (typeof process === 'undefined') return '';
  return process.env[SECURITY_ENV_KEYS.ADMIN_API_KEY] || '';
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export async function isAdminAuthenticated(request: Request): Promise<boolean> {
  const adminApiKey = getAdminApiKey();
  const isDev = getIsDevelopment();

  if (!adminApiKey) {
    if (!isDev && !warnedAboutMissingKey) {
      logger.warn(
        'ADMIN_API_KEY not set. Admin routes will be disabled in production.'
      );
      warnedAboutMissingKey = true;
    }
    return isDev;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: AUTH_CONFIG.FAILURE_REASONS.MISSING_CREDENTIALS,
      method: AUTH_CONFIG.METHODS.BEARER_TOKEN,
    });
    return false;
  }

  const parts = authHeader.split(' ');
  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== AUTH_CONFIG.BEARER_SCHEME
  ) {
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: AUTH_CONFIG.FAILURE_REASONS.INVALID_CREDENTIALS,
      method: AUTH_CONFIG.METHODS.BEARER_TOKEN,
    });
    return false;
  }

  const credentials = parts[1];

  if (!credentials || credentials.length > AUTH_CONFIG.MAX_CREDENTIAL_LENGTH) {
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: AUTH_CONFIG.FAILURE_REASONS.INVALID_CREDENTIALS,
      method: AUTH_CONFIG.METHODS.BEARER_TOKEN,
    });
    return false;
  }

  try {
    const encoder = new TextEncoder();

    const expectedHash = await crypto.subtle.digest(
      AUTH_CONFIG.HASH_ALGORITHM,
      encoder.encode(adminApiKey)
    );
    const actualHash = await crypto.subtle.digest(
      AUTH_CONFIG.HASH_ALGORITHM,
      encoder.encode(credentials)
    );

    const authenticated = timingSafeEqualArrays(
      new Uint8Array(expectedHash),
      new Uint8Array(actualHash)
    );

    SecurityAuditLog.logAuthAttempt({
      success: authenticated,
      reason: authenticated
        ? undefined
        : AUTH_CONFIG.FAILURE_REASONS.INVALID_CREDENTIALS,
      method: AUTH_CONFIG.METHODS.BEARER_TOKEN,
    });

    return authenticated;
  } catch (error) {
    logger.error('Admin authentication error', error);
    SecurityAuditLog.logAuthAttempt({
      success: false,
      reason: 'other',
      method: AUTH_CONFIG.METHODS.BEARER_TOKEN,
    });
    return false;
  }
}

export async function requireAdminAuth(request: Request): Promise<void> {
  const authenticated = await isAdminAuthenticated(request);
  if (!authenticated) {
    throw new AppError(
      API_ERROR_MESSAGES.AUTH.UNAUTHORIZED_ADMIN_KEY,
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
      API_ERROR_MESSAGES.AUTH.UNAUTHORIZED_TOKEN,
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
      API_ERROR_MESSAGES.AUTH.FORBIDDEN_RESOURCE(resourceType),
      ErrorCode.AUTHORIZATION_ERROR,
      STATUS_CODES.FORBIDDEN
    );
  }
}

/**
 * Optional authentication - returns user if authenticated, null if not
 * Used for guest mode where we allow anonymous access but track user if logged in
 */
export async function optionalAuth(
  request: Request
): Promise<AuthenticatedUser | null> {
  return verifyAuth(request);
}

/**
 * Check if request has guest mode header (for API routes that support guest access)
 */
export function isGuestRequest(request: Request): boolean {
  return request.headers.get('x-guest-mode') === 'true';
}

/**
 * Guest session header constraints (mirrors src/lib/auth/guest.ts; kept local
 * so this server module never imports the 'use client' guest bundle).
 */
const GUEST_ID_PREFIX = 'guest_';
const GUEST_SESSION_ID_MAX_LENGTH = 128;
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseGuestSessionId(value: string): string | null {
  if (value.length === 0 || value.length > GUEST_SESSION_ID_MAX_LENGTH) {
    return null;
  }
  // Reject control characters / CRLF injection outright.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(value)) return null;
  const bare = value.startsWith(GUEST_ID_PREFIX)
    ? value.slice(GUEST_ID_PREFIX.length)
    : value;
  return UUID_V4_REGEX.test(bare) ? bare : null;
}

/**
 * Get user ID from request - supports both authenticated and guest users
 * For guest users, returns a special guest identifier.
 * The guest session header is untrusted: malformed values yield 401.
 */
export async function getUserIdOrGuest(
  request: Request
): Promise<{ userId: string; isGuest: boolean }> {
  const user = await verifyAuth(request);
  if (user) {
    return { userId: user.id, isGuest: false };
  }

  // Check for guest session ID in header
  const guestSessionId = request.headers.get('x-guest-session-id');
  if (guestSessionId) {
    const normalized = parseGuestSessionId(guestSessionId);
    if (!normalized) {
      throw new AppError(
        API_ERROR_MESSAGES.AUTH.UNAUTHORIZED_TOKEN,
        ErrorCode.AUTHENTICATION_ERROR,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    return { userId: `guest_${normalized}`, isGuest: true };
  }

  throw new AppError(
    API_ERROR_MESSAGES.AUTH.UNAUTHORIZED_TOKEN,
    ErrorCode.AUTHENTICATION_ERROR,
    STATUS_CODES.UNAUTHORIZED
  );
}
