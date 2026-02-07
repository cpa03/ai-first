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
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; info: RateLimitInfo } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

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

export const rateLimitConfigs = {
  strict: { limit: 10, windowMs: 60 * 1000 },
  moderate: { limit: 30, windowMs: 60 * 1000 },
  lenient: { limit: 60, windowMs: 60 * 1000 },
} as const;

export const tieredRateLimits: Record<UserRole, RateLimitConfig> = {
  anonymous: { limit: 30, windowMs: 60 * 1000 },
  authenticated: { limit: 60, windowMs: 60 * 1000 },
  premium: { limit: 120, windowMs: 60 * 1000 },
  enterprise: { limit: 300, windowMs: 60 * 1000 },
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
    const recentRequests = requests.filter((r) => r >= now - 60 * 1000);
    if (recentRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recentRequests);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 1000);

export function rateLimitResponse(
  rateLimitInfo: RateLimitInfo,
  requestId?: string
): Response {
  const resetTime = Math.max(rateLimitInfo.reset, Date.now());
  const responseBody = {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    timestamp: new Date().toISOString(),
    requestId:
      requestId ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    retryable: true,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
    'X-RateLimit-Limit': String(rateLimitInfo.limit),
    'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
    'X-RateLimit-Reset': String(new Date(resetTime).toISOString()),
    'X-Request-ID': responseBody.requestId,
    'X-Error-Code': 'RATE_LIMIT_EXCEEDED',
    'X-Retryable': 'true',
  };

  return new Response(JSON.stringify(responseBody), {
    status: 429,
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
