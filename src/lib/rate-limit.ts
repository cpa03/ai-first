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

export function getClientIdentifier(request: Request): string {
  // First, try x-real-ip which is set by trusted proxies (Vercel, etc.)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fall back to x-forwarded-for, but use the LAST IP in the chain
  // (closest to the server) to prevent client spoofing
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    // Use the last IP which is added by the closest proxy
    return ips[ips.length - 1] || 'unknown';
  }

  return 'unknown';
}

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
  const recentRequests = requests.filter((r) => r >= windowStart);

  if (recentRequests.length >= config.limit) {
    return {
      allowed: false,
      info: {
        limit: config.limit,
        remaining: 0,
        reset: Math.max(...recentRequests) + config.windowMs,
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
  const entries = Array.from(rateLimitStore.entries());
  entries.sort((a, b) => {
    const aOldest = a[1].length > 0 ? Math.min(...a[1]) : Infinity;
    const bOldest = b[1].length > 0 ? Math.min(...b[1]) : Infinity;
    return aOldest - bOldest;
  });

  for (let i = 0; i < Math.min(count, entries.length); i++) {
    rateLimitStore.delete(entries[i][0]);
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

import {
  RATE_LIMIT_CLEANUP_CONFIG,
  RATE_LIMIT_STORE_CONFIG,
  ERROR_CONFIG,
} from './config/constants';

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

setInterval(
  cleanupExpiredEntries,
  RATE_LIMIT_CLEANUP_CONFIG.CLEANUP_INTERVAL_MS
);

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
    const recentRequests = requests.filter((r) => r >= now - 60 * 1000);
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
  stats.topUsers = stats.topUsers.slice(0, 10);

  return stats;
}

export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
