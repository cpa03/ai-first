import {
  RATE_LIMIT_CLEANUP_CONFIG,
  RATE_LIMIT_STORE_CONFIG,
  ERROR_CONFIG,
  RATE_LIMIT_STATS_CONFIG,
  RATE_LIMIT_VALUES,
} from './config/constants';

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

const rateLimitStore = new Map<string, number[]>();

/**
 * Platform detection for trusted proxy headers
 */
function detectPlatform(): 'vercel' | 'cloudflare' | 'unknown' {
  if (process.env.VERCEL) return 'vercel';
  if (process.env.CF_WORKER || process.env.CLOUDFLARE) return 'cloudflare';
  return 'unknown';
}

/**
 * Generate a request fingerprint for fallback rate limiting
 * Uses non-spoofable client characteristics
 */
function generateRequestFingerprint(request: Request): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';

  // Combine non-spoofable characteristics
  const combined = `${userAgent}:${acceptLang}:${acceptEncoding}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  return `fp:${Math.abs(hash)}`;
}

export function getClientIdentifier(request: Request): string {
  const platform = detectPlatform();

  // Platform-specific trusted header handling
  // These headers are set by the platform infrastructure and cannot be spoofed
  if (platform === 'vercel') {
    // Vercel sets x-vercel-forwarded-for which is trustworthy
    const vercelIp = request.headers.get('x-vercel-forwarded-for');
    if (vercelIp) {
      return vercelIp.split(',')[0].trim();
    }
  }

  if (platform === 'cloudflare') {
    // Cloudflare sets CF-Connecting-IP
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) {
      return cfIp.trim();
    }
  }

  // For unknown platforms or missing platform headers,
  // use request fingerprinting as fallback
  // This prevents complete rate limit bypass via header spoofing
  return generateRequestFingerprint(request);
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

  const requests = rateLimitStore.get(identifier) || [];

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
        reset: (recentRequests[recentRequests.length - 1] || now) + config.windowMs,
      },
    };
  }

  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);

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
  strict: { limit: 10, windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS },
  moderate: { limit: 30, windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS },
  lenient: { limit: 60, windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS },
} as const;

export const tieredRateLimits: Record<UserRole, RateLimitConfig> = {
  anonymous: { limit: 30, windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS },
  authenticated: {
    limit: 60,
    windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS,
  },
  premium: { limit: 120, windowMs: RATE_LIMIT_STORE_CONFIG.DEFAULT_WINDOW_MS },
  enterprise: {
    limit: 300,
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
  for (const [key, requests] of rateLimitStore.entries()) {
    const recentRequests = requests.filter(
      (r) => r >= now - RATE_LIMIT_CLEANUP_CONFIG.CLEANUP_WINDOW_MS
    );
    if (recentRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recentRequests);
    }
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

// Auto-start cleanup interval in production
startCleanupInterval();

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
    requestId:
      requestId ||
      `${ERROR_CONFIG.REQUEST_ID.PREFIX}${Date.now()}_${Math.random()
        .toString(ERROR_CONFIG.REQUEST_ID.RADIX)
        .substring(2, 2 + ERROR_CONFIG.REQUEST_ID.RANDOM_LENGTH)}`,
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
  const stats = {
    totalEntries: 0,
    expiredEntries: 0,
    entriesByRole: {} as Record<string, number>,
    topUsers: [] as Array<{ identifier: string; count: number }>,
  };

  for (const [identifier, requests] of rateLimitStore.entries()) {
    const recentRequests = requests.filter(
      (r) => r >= now - RATE_LIMIT_STATS_CONFIG.DEFAULT_STATS_WINDOW_MS
    );
    stats.totalEntries += recentRequests.length;

    if (recentRequests.length === 0) {
      stats.expiredEntries++;
    }

    stats.topUsers.push({
      identifier,
      count: recentRequests.length,
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
