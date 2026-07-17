import { resourceCleanupManager } from './resource-cleanup';
import { detectPlatform as detectCloudflarePlatform } from './cloudflare';
import {
  RATE_LIMIT_CLEANUP_CONFIG,
  RATE_LIMIT_STORE_CONFIG,
  ERROR_CONFIG,
  RATE_LIMIT_STATS_CONFIG,
  RATE_LIMIT_VALUES,
  RATE_LIMIT_CONFIG,
} from './config/constants';
import { HTTP_HEADERS } from './config/http';
import { ENV_ACCESSORS } from './config/env-keys';
import { generateRequestId } from './errors';
import { simpleHash } from './security/crypto';
import { TIME_CONVERSIONS } from './config/modular-constants';
import { API_ERROR_MESSAGES } from './config/error-messages';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export type UserRole = 'anonymous' | 'authenticated' | 'premium' | 'enterprise';

/**
 * Lock mechanism for rate limit store operations.
 * Prevents race conditions in concurrent request environments.
 * Maps identifier to a promise chain ensuring atomic read-modify-write operations.
 */
const rateLimitLocks = new Map<string, Promise<void>>();

/**
 * User info extracted from request for rate limiting
 */
export interface UserRateLimitInfo {
  userId: string | null;
  role: UserRole;
  identifier: string;
}

/**
 * Extract user ID from Supabase Authorization header
 *
 * The Supabase client sends the access token in the Authorization header
 * as 'Bearer <token>'. This function extracts the user ID from the token.
 *
 * For simplicity, we extract the user ID from custom headers set by the client
 * or from the Supabase session. In production, this would validate the JWT.
 *
 * @param request - The incoming request
 * @returns User ID if found, null otherwise
 */
function extractUserIdFromRequest(request: Request): string | null {
  // Try to get user ID from custom header (set by authenticated Supabase clients)
  // SECURITY: Only trust this header in non-production or if an internal secret matches.
  const xUserId = request.headers.get('x-supabase-user-id');
  if (xUserId) {
    const isDev = ENV_ACCESSORS.PLATFORM.NODE_ENV() === 'development';
    const internalSecret = request.headers.get('x-internal-secret');
    const expectedSecret = ENV_ACCESSORS.SECURITY.INTERNAL_API_SECRET();

    if (
      isDev ||
      (internalSecret && expectedSecret && internalSecret === expectedSecret)
    ) {
      return xUserId.trim() || null;
    }
  }

  // Try Authorization header with Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    // In production, we would validate the JWT and extract user ID
    // For now, we can use the token as a unique identifier
    const token = authHeader.substring(7);
    if (token && token.length > 0) {
      // Return a hash of the token as the user identifier
      // This is a simplified approach - in production, validate JWT properly
      // Using simpleHash ensures the entire token is considered, preventing
      // collisions when tokens share identical headers.
      return `token:${simpleHash(token)}`;
    }
  }

  return null;
}

/**
 * Determine user role based on available information
 *
 * This function checks for user tier in the following priority:
 * 1. x-user-tier header (for testing/proxy forwarding)
 * 2. x-user-subscription header (alternative header for subscription status)
 * 3. Default to 'authenticated' for known users
 *
 * In production, this would query the user's subscription tier
 * from the database or cache. For now, we support header-based tier override.
 *
 * @param request - The incoming request (for header inspection)
 * @param userId - The user ID if available
 * @returns User role based on authentication status and subscription tier
 */
function determineUserRole(request: Request, userId: string | null): UserRole {
  if (!userId) {
    return 'anonymous';
  }

  // Check for tier override headers (useful for testing, development,
  // or when tier is determined by upstream proxy/gateway)
  // SECURITY: Only trust these headers in non-production or if an internal secret matches.
  const isDev = ENV_ACCESSORS.PLATFORM.NODE_ENV() === 'development';
  const internalSecret = request.headers.get('x-internal-secret');
  const expectedSecret = ENV_ACCESSORS.SECURITY.INTERNAL_API_SECRET();
  const isTrusted =
    isDev ||
    (internalSecret && expectedSecret && internalSecret === expectedSecret);

  if (isTrusted) {
    const tierHeader = request.headers.get('x-user-tier');
    if (tierHeader) {
      const normalizedTier = tierHeader.toLowerCase().trim();
      if (normalizedTier === 'premium') {
        return 'premium';
      }
      if (normalizedTier === 'enterprise') {
        return 'enterprise';
      }
      if (normalizedTier === 'authenticated' || normalizedTier === 'standard') {
        return 'authenticated';
      }
    }

    // Alternative header for subscription status
    const subscriptionHeader = request.headers.get('x-user-subscription');
    if (subscriptionHeader) {
      const normalizedSub = subscriptionHeader.toLowerCase().trim();
      if (normalizedSub === 'premium' || normalizedSub === 'pro') {
        return 'premium';
      }
      if (normalizedSub === 'enterprise' || normalizedSub === 'business') {
        return 'enterprise';
      }
    }
  }

  // For authenticated users without explicit tier, default to 'authenticated'
  // In production, this would check subscription status from database/cache
  // to determine if user is 'premium' or 'enterprise'
  return 'authenticated';
}

/**
 * Get user-based rate limit identifier
 *
 * This function extracts user information from the request and creates
 * a rate limit identifier based on the user ID when available.
 * This enables per-user rate limiting instead of just IP-based.
 *
 * Priority:
 * 1. Authenticated user ID (most preferred)
 * 2. Fall back to IP-based identifier
 *
 * @param request - The incoming request
 * @returns UserRateLimitInfo with user ID, role, and identifier
 */
export function getUserRateLimitInfo(request: Request): UserRateLimitInfo {
  const userId = extractUserIdFromRequest(request);
  const role = determineUserRole(request, userId);

  let identifier: string;

  if (userId) {
    // Use user-based identifier when authenticated
    identifier = `user:${userId}`;
  } else {
    // Fall back to IP-based identifier for anonymous users
    identifier = getClientIdentifier(request);
  }

  return {
    userId,
    role,
    identifier,
  };
}

/**
 * Check rate limit with user-based identification
 *
 * This function combines user-based rate limiting with tiered limits.
 * When a user is authenticated, their rate limit is tracked by user ID.
 * When not authenticated, it falls back to IP-based limiting.
 *
 * The effective rate limit is the MAX of:
 * - Endpoint config (e.g., lenient, moderate, strict)
 * - User tier config (e.g., anonymous, authenticated, premium, enterprise)
 *
 * This ensures premium users get higher limits regardless of endpoint restrictions.
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration for the endpoint
 * @returns Rate limit result with allowed status and info
 */
export async function checkUserRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  info: RateLimitInfo;
  userInfo: UserRateLimitInfo;
}> {
  const userInfo = getUserRateLimitInfo(request);

  const tierConfig = tieredRateLimits[userInfo.role];

  const effectiveConfig: RateLimitConfig = {
    limit: Math.max(config.limit, tierConfig.limit),
    windowMs: Math.max(config.windowMs, tierConfig.windowMs),
  };

  const result = await checkRateLimit(userInfo.identifier, effectiveConfig);

  return {
    ...result,
    userInfo,
  };
}
const rateLimitStore = new Map<string, number[]>();

/**
 * Platform detection for trusted proxy headers
 * Delegates to cloudflare.ts for comprehensive detection
 */
function detectPlatform(): 'vercel' | 'cloudflare' | 'unknown' {
  return detectCloudflarePlatform();
}

/**
 * Generate a request fingerprint for fallback rate limiting.
 *
 * SECURITY WARNING: This uses client-controlled headers (user-agent, accept-language,
 * accept-encoding) which CAN be spoofed by attackers. The server-side secret provides
 * some protection against simple header rotation, but determined attackers can still
 * bypass this by obtaining or guessing the secret.
 *
 * USE ONLY WHEN: Platform-specific trusted headers (CF-Connecting-IP, x-vercel-forwarded-for)
 * are not available. Prefer IP-based identification when possible.
 *
 * @see getClientIdentifier for the recommended identification strategy
 */
function generateRequestFingerprint(request: Request): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let urlPath = (request as any).nextUrl?.pathname || '';
  if (!urlPath) {
    try {
      urlPath = new URL(request.url).pathname;
    } catch {
      // URL parsing failed
    }
  }

  const serverSecret = ENV_ACCESSORS.SECURITY.INTERNAL_API_SECRET() || '';
  const combined = `${urlPath}:${userAgent}:${acceptLang}:${acceptEncoding}:${serverSecret}`;

  return `fp:${simpleHash(combined)}`;
}

/**
 * Try to get client IP from standard reverse proxy headers
 * This is more reliable than fingerprinting but less secure than platform-specific headers
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
 */
function getIpFromProxyHeaders(request: Request): string | null {
  // Try x-forwarded-for (standard header, may be a comma-separated list)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // The first IP in the list is typically the original client IP
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // Try x-real-ip (used by some proxies like nginx)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return null;
}

/**
 * Get a unique identifier for the client making the request
 *
 * Priority order (most trusted to least trusted):
 * 1. Platform-specific trusted headers (Cloudflare CF-Connecting-IP, Vercel x-vercel-forwarded-for)
 * 2. Standard proxy headers (x-forwarded-for, x-real-ip)
 * 3. Request fingerprint (client-controlled, use with caution)
 *
 * @param request - The incoming request
 * @returns A unique identifier for the client
 *
 * @see https://developers.cloudflare.com/fundamentals/reference/http-request-headers/
 * @see https://vercel.com/docs/edge-network/headers
 */
export function getClientIdentifier(request: Request): string {
  const platform = detectPlatform();

  // Platform-specific trusted header handling
  // These headers are set by the platform infrastructure and cannot be spoofed
  if (platform === 'vercel') {
    // Vercel sets x-vercel-forwarded-for which is trustworthy
    const vercelIp = request.headers.get('x-vercel-forwarded-for');
    if (vercelIp) {
      return `vercel:${vercelIp.split(',')[0].trim()}`;
    }
  }

  if (platform === 'cloudflare') {
    // Cloudflare sets CF-Connecting-IP
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) {
      return `cf:${cfIp.trim()}`;
    }
  }

  // Try standard reverse proxy headers before falling back to fingerprinting
  // This provides better coverage for deployments behind load balancers
  const proxyIp = getIpFromProxyHeaders(request);
  if (proxyIp) {
    return `proxy:${proxyIp}`;
  }

  // Fallback: Use request fingerprinting
  // ⚠️ WARNING: This uses client-controlled headers and should be a last resort
  // Consider logging a warning in production if this path is frequently hit
  return generateRequestFingerprint(request);
}

// Memory leak prevention: Maximum requests per identifier to prevent unbounded growth
const MAX_REQUESTS_PER_IDENTIFIER =
  RATE_LIMIT_VALUES.MAX_REQUESTS_PER_IDENTIFIER;

/**
 * Binary search to find the first index where requests[index] >= windowStart
 * PERFORMANCE: O(log N) complexity compared to O(N) linear scan.
 * This provides significant scaling guarantees for large request histories.
 */
function findFirstValidIndex(requests: number[], windowStart: number): number {
  let low = 0;
  let high = requests.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = (low + high) >>> 1; // PERFORMANCE: Use bitwise shift for faster division
    if (requests[mid] >= windowStart) {
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return result;
}

/**
 * Core rate limit check with atomic operations.
 * This function is called within a lock to prevent race conditions.
 */
function checkRateLimitInternal(
  identifier: string,
  config: RateLimitConfig,
  now: number
): { allowed: boolean; info: RateLimitInfo } {
  const windowStart = now - config.windowMs;

  if (rateLimitStore.size >= RATE_LIMIT_STORE_CONFIG.MAX_STORE_SIZE) {
    cleanupOldestEntries(
      Math.floor(
        RATE_LIMIT_STORE_CONFIG.MAX_STORE_SIZE *
          RATE_LIMIT_STORE_CONFIG.CLEANUP_PERCENTAGE
      )
    );
  }

  const existingRequests = rateLimitStore.get(identifier);
  const requests = existingRequests || [];

  const firstValidIndex = findFirstValidIndex(requests, windowStart);

  let recentRequests: number[];
  if (firstValidIndex === -1) {
    recentRequests = [];
  } else if (firstValidIndex === 0) {
    recentRequests = requests;
  } else {
    recentRequests = requests.slice(firstValidIndex);
  }

  if (recentRequests.length > MAX_REQUESTS_PER_IDENTIFIER) {
    recentRequests = recentRequests.slice(-MAX_REQUESTS_PER_IDENTIFIER);
  }

  if (recentRequests.length >= config.limit) {
    return {
      allowed: false,
      info: {
        limit: config.limit,
        remaining: 0,
        reset:
          (recentRequests[recentRequests.length - 1] || now) + config.windowMs,
      },
    };
  }

  recentRequests.push(now);

  if (recentRequests !== existingRequests) {
    rateLimitStore.set(identifier, recentRequests);
  }

  return {
    allowed: true,
    info: {
      limit: config.limit,
      remaining: config.limit - recentRequests.length,
      reset: now + config.windowMs,
    },
  };
}

/**
 * Acquires a lock for the given identifier and executes the callback atomically.
 * Uses promise chaining to ensure sequential access per identifier.
 */
async function withRateLimitLock<T>(
  identifier: string,
  callback: () => T | Promise<T>
): Promise<T> {
  const previousLock = rateLimitLocks.get(identifier);

  const currentLock = (previousLock || Promise.resolve()).then(() => {
    return callback();
  });

  rateLimitLocks.set(
    identifier,
    currentLock.then(
      () => {},
      () => {}
    )
  );

  try {
    return await currentLock;
  } finally {
    if (rateLimitLocks.get(identifier) === currentLock) {
      rateLimitLocks.delete(identifier);
    }
  }
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; info: RateLimitInfo }> {
  const now = Date.now();
  return withRateLimitLock(identifier, () =>
    checkRateLimitInternal(identifier, config, now)
  );
}

// Helper function to remove oldest entries when store reaches capacity
function cleanupOldestEntries(count: number): void {
  // PERFORMANCE: Use Map's insertion order for O(K) eviction instead of O(N log N) sort.
  // In JS, Map preserves insertion order. Deleting the first K keys effectively
  // removes the oldest identifiers from the store. This avoids creating a large
  // temporary array and sorting it.
  const iterator = rateLimitStore.keys();
  let deletedCount = 0;

  while (deletedCount < count) {
    const { value, done } = iterator.next();
    if (done) break;
    rateLimitStore.delete(value);
    deletedCount++;
  }
}

export const rateLimitConfigs = {
  strict: {
    limit: RATE_LIMIT_CONFIG.ENDPOINT_PRESETS.STRICT,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
  moderate: {
    limit: RATE_LIMIT_CONFIG.ENDPOINT_PRESETS.MODERATE,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
  lenient: {
    limit: RATE_LIMIT_CONFIG.ENDPOINT_PRESETS.LENIENT,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
} as const;

export const tieredRateLimits: Record<UserRole, RateLimitConfig> = {
  anonymous: {
    limit: RATE_LIMIT_CONFIG.USER_TIER.ANONYMOUS,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
  authenticated: {
    limit: RATE_LIMIT_CONFIG.USER_TIER.AUTHENTICATED,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
  premium: {
    limit: RATE_LIMIT_CONFIG.USER_TIER.PREMIUM,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
  enterprise: {
    limit: RATE_LIMIT_CONFIG.USER_TIER.ENTERPRISE,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
};

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: Request) => {
    const identifier = getClientIdentifier(request);
    return checkRateLimit(identifier, config);
  };
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CLEANUP_CONFIG.CLEANUP_WINDOW_MS;

  for (const [key, requests] of rateLimitStore.entries()) {
    // PERFORMANCE: Use O(log N) binary search instead of O(N) linear scan
    // to find the first valid entry in the history.
    const firstValidIndex = findFirstValidIndex(requests, windowStart);

    if (firstValidIndex === -1) {
      // All requests in this entry have expired
      rateLimitStore.delete(key);
    } else if (firstValidIndex > 0) {
      // Some requests have expired, update with the remaining ones
      rateLimitStore.set(key, requests.slice(firstValidIndex));
    }
    // If firstValidIndex is 0, all requests are still valid; no action needed.
  }
}

// Store interval ID to allow cleanup (prevents memory leaks in tests/HMR)
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the cleanup interval for expired rate limit entries.
 * Idempotent - safe to call multiple times.
 */
export function startCleanupInterval(): void {
  if (cleanupIntervalId) {
    return; // Already running
  }
  cleanupIntervalId = setInterval(
    cleanupExpiredEntries,
    RATE_LIMIT_CLEANUP_CONFIG.CLEANUP_INTERVAL_MS
  );
}

/**
 * Stops the cleanup interval.
 * Call this in tests or during cleanup to prevent memory leaks.
 */
export function stopCleanupInterval(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

/**
 * Restarts the cleanup interval (useful for testing).
 */
export function restartCleanupInterval(): void {
  stopCleanupInterval();
  startCleanupInterval();
}

// Auto-start cleanup interval only in production, not during tests or HMR
// This prevents memory leaks in test environments and hot module reloading
if (
  typeof process !== 'undefined' &&
  ENV_ACCESSORS.PLATFORM.NODE_ENV() === 'production' &&
  !ENV_ACCESSORS.PLATFORM.JEST_WORKER_ID() &&
  !ENV_ACCESSORS.PLATFORM.VITEST_WORKER_ID()
) {
  startCleanupInterval();
  resourceCleanupManager.register('rate-limit-cleanup', () =>
    stopCleanupInterval()
  );
}

export function rateLimitResponse(
  rateLimitInfo: RateLimitInfo,
  requestId?: string
): Response {
  const resetTime = Math.max(rateLimitInfo.reset, Date.now());
  const responseBody = {
    error: API_ERROR_MESSAGES.VALIDATION_MESSAGES.TOO_MANY_REQUESTS,
    code: ERROR_CONFIG.RATE_LIMIT.ERROR_CODE,
    retryAfter: Math.ceil(
      (resetTime - Date.now()) / TIME_CONVERSIONS.MS_PER_SECOND
    ),
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
    retryable: true,
  };

  const headers: Record<string, string> = {
    [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
    'Retry-After': String(
      Math.ceil((resetTime - Date.now()) / TIME_CONVERSIONS.MS_PER_SECOND)
    ),
    'X-RateLimit-Limit': String(rateLimitInfo.limit),
    'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
    'X-RateLimit-Reset': String(new Date(resetTime).toISOString()),
    'X-Request-ID': responseBody.requestId,
    'X-Error-Code': ERROR_CONFIG.RATE_LIMIT.ERROR_CODE,
    'X-Retryable': 'true',
  };

  return new Response(JSON.stringify(responseBody), {
    status: ERROR_CONFIG.RATE_LIMIT.STATUS_CODE,
    headers,
  });
}

export function getRateLimitStats() {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_STATS_CONFIG.DEFAULT_STATS_WINDOW_MS;
  const stats = {
    totalEntries: 0,
    expiredEntries: 0,
    entriesByRole: {} as Record<string, number>,
    topUsers: [] as Array<{ identifier: string; count: number }>,
  };

  for (const [identifier, requests] of rateLimitStore.entries()) {
    // PERFORMANCE: Use O(log N) binary search for stats collection.
    // This provides a measurable speedup for admin dashboards when many requests are tracked.
    const firstValidIndex = findFirstValidIndex(requests, windowStart);

    const recentCount =
      firstValidIndex === -1 ? 0 : requests.length - firstValidIndex;
    stats.totalEntries += recentCount;

    if (recentCount === 0) {
      stats.expiredEntries++;
    }

    stats.topUsers.push({
      identifier,
      count: recentCount,
    });
  }

  stats.topUsers.sort((a, b) => b.count - a.count);
  stats.topUsers = stats.topUsers.slice(
    0,
    RATE_LIMIT_STATS_CONFIG.TOP_USERS_LIMIT
  );

  return stats;
}

export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
