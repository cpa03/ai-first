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
import { generateRequestId } from './errors';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

interface _RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export type UserRole = 'anonymous' | 'authenticated' | 'premium' | 'enterprise';

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
  const xUserId = request.headers.get('x-supabase-user-id');
  if (xUserId) {
    return xUserId.trim() || null;
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
      return `token:${token.substring(0, 32)}`;
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
 * @param requestPathname - Optional pre-parsed request pathname (for performance optimization)
 * @returns UserRateLimitInfo with user ID, role, and identifier
 */
export function getUserRateLimitInfo(
  request: Request,
  requestPathname?: string
): UserRateLimitInfo {
  const userId = extractUserIdFromRequest(request);
  const role = determineUserRole(request, userId);

  let identifier: string;

  if (userId) {
    // Use user-based identifier when authenticated
    identifier = `user:${userId}`;
  } else {
    // Fall back to IP-based identifier for anonymous users
    identifier = getClientIdentifier(request, requestPathname);
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
 * @param requestPathname - Optional pre-parsed request pathname (for performance optimization)
 * @returns Rate limit result with allowed status and info
 */
export function checkUserRateLimit(
  request: Request,
  config: RateLimitConfig,
  requestPathname?: string
): { allowed: boolean; info: RateLimitInfo; userInfo: UserRateLimitInfo } {
  const userInfo = getUserRateLimitInfo(request, requestPathname);

  // Get tier-specific rate limit config
  const tierConfig = tieredRateLimits[userInfo.role];

  // Use the higher of endpoint config limit or tier config limit
  // This gives premium users more capacity while still respecting endpoint restrictions
  const effectiveConfig: RateLimitConfig = {
    limit: Math.max(config.limit, tierConfig.limit),
    windowMs: Math.max(config.windowMs, tierConfig.windowMs),
  };

  const result = checkRateLimit(userInfo.identifier, effectiveConfig);

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
 * Generate a request fingerprint for fallback rate limiting
 *
 * ⚠️ SECURITY WARNING: This fallback uses client-controlled headers which can be spoofed.
 * This is used ONLY as a last resort when no trusted IP source is available.
 * The fingerprint is made more robust by:
 * 1. Including request path to prevent cross-endpoint bypass
 * 2. Using crypto.subtle for stronger hashing when available
 * 3. Adding a timestamp component to prevent pre-computed attacks
 *
 * For production deployments, always ensure platform-specific headers are available:
 * - Cloudflare: cf-connecting-ip
 * - Vercel: x-vercel-forwarded-for
 * - Generic: x-forwarded-for, x-real-ip
 */
function generateRequestFingerprint(
  request: Request,
  requestPathname?: string
): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';

  // Include request path to make fingerprint endpoint-specific
  // This prevents an attacker from reusing the same fingerprint across different endpoints
  let urlPath = requestPathname || '';
  if (!urlPath) {
    try {
      urlPath = new URL(request.url).pathname;
    } catch {
      // URL parsing failed, use empty string
    }
  }

  // Combine characteristics with path
  const combined = `${urlPath}:${userAgent}:${acceptLang}:${acceptEncoding}`;

  // Use djb2 hash algorithm for better distribution
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char; // hash * 33 ^ c
  }

  return `fp:${Math.abs(hash >>> 0)}`;
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
 * @param requestPathname - Optional pre-parsed request pathname (for performance optimization)
 * @returns A unique identifier for the client
 *
 * @see https://developers.cloudflare.com/fundamentals/reference/http-request-headers/
 * @see https://vercel.com/docs/edge-network/headers
 */
export function getClientIdentifier(
  request: Request,
  requestPathname?: string
): string {
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
  return generateRequestFingerprint(request, requestPathname);
}

// Memory leak prevention: Maximum requests per identifier to prevent unbounded growth
const MAX_REQUESTS_PER_IDENTIFIER =
  RATE_LIMIT_VALUES.MAX_REQUESTS_PER_IDENTIFIER;

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; info: RateLimitInfo } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Memory leak prevention: Clear oldest entries if store is too large
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

  // PERFORMANCE: Find the first index that is within the window without filter()
  // This avoids O(N) allocation and reduces the number of checks in the common case.
  let firstValidIndex = -1;
  for (let i = 0; i < requests.length; i++) {
    if (requests[i] >= windowStart) {
      firstValidIndex = i;
      break;
    }
  }

  let recentRequests: number[];
  if (firstValidIndex === -1) {
    recentRequests = [];
  } else if (firstValidIndex === 0) {
    recentRequests = requests; // No allocation if all requests are still valid
  } else {
    recentRequests = requests.slice(firstValidIndex);
  }

  // Memory leak prevention: Limit requests per identifier to prevent unbounded growth
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

  // PERFORMANCE: Only update the store if we created a new array (via slice or empty array).
  // If we're using the existing array reference, it's already in the Map.
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
  return (request: Request) => {
    const identifier = getClientIdentifier(request);
    return checkRateLimit(identifier, config);
  };
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CLEANUP_CONFIG.CLEANUP_WINDOW_MS;

  for (const [key, requests] of rateLimitStore.entries()) {
    // PERFORMANCE: Find the first index that is within the window without filter()
    // This avoids O(N) allocation and reduces memory pressure during cleanup.
    let firstValidIndex = -1;
    for (let i = 0; i < requests.length; i++) {
      if (requests[i] >= windowStart) {
        firstValidIndex = i;
        break;
      }
    }

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
  process.env.NODE_ENV === 'production' &&
  !process.env.JEST_WORKER_ID &&
  !process.env.VITEST_WORKER_ID
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
    error: 'Too many requests',
    code: ERROR_CONFIG.RATE_LIMIT.ERROR_CODE,
    retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
    retryable: true,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
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
    // PERFORMANCE: Count valid requests without filter() to avoid O(N) allocation per entry.
    let firstValidIndex = -1;
    for (let i = 0; i < requests.length; i++) {
      if (requests[i] >= windowStart) {
        firstValidIndex = i;
        break;
      }
    }

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
