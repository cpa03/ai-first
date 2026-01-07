interface RateLimitEntry {
  count: number;
  resetTime: number;
  identifier: string;
  role?: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export enum UserRole {
  ANONYMOUS = 'anonymous',
  AUTHENTICATED = 'authenticated',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  role?: UserRole
): { allowed: boolean; info: RateLimitInfo } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  const maxRequests = config.maxRequests;

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
      identifier,
      role,
    });

    return {
      allowed: true,
      info: {
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: now + config.windowMs,
      },
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      info: {
        limit: maxRequests,
        remaining: 0,
        reset: entry.resetTime,
      },
    };
  }

  entry.count++;
  return {
    allowed: true,
    info: {
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      reset: entry.resetTime,
    },
  };
}

export const rateLimitConfigs = {
  strict: { windowMs: 60 * 1000, maxRequests: 10 },
  moderate: { windowMs: 60 * 1000, maxRequests: 30 },
  lenient: { windowMs: 60 * 1000, maxRequests: 60 },
} as const;

export const tieredRateLimits: Record<UserRole, RateLimitConfig> = {
  [UserRole.ANONYMOUS]: { windowMs: 60 * 1000, maxRequests: 30 },
  [UserRole.AUTHENTICATED]: { windowMs: 60 * 1000, maxRequests: 60 },
  [UserRole.PREMIUM]: { windowMs: 60 * 1000, maxRequests: 120 },
  [UserRole.ENTERPRISE]: { windowMs: 60 * 1000, maxRequests: 300 },
};

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (request: Request) => {
    const identifier = getClientIdentifier(request);
    return checkRateLimit(identifier, config);
  };
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 1000);

export interface RateLimitStats {
  totalEntries: number;
  entriesByRole: Record<string, number>;
  expiredEntries: number;
  topUsers: Array<{ identifier: string; count: number; role?: string }>;
}

export function getRateLimitStats(): RateLimitStats {
  const now = Date.now();
  const entriesByRole: Record<string, number> = {};
  let expiredEntries = 0;
  const userCounts: Array<{
    identifier: string;
    count: number;
    role?: string;
  }> = [];

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      expiredEntries++;
    } else {
      userCounts.push({
        identifier: key,
        count: entry.count,
        role: entry.role,
      });

      if (entry.role) {
        entriesByRole[entry.role] = (entriesByRole[entry.role] || 0) + 1;
      } else {
        entriesByRole['anonymous'] = (entriesByRole['anonymous'] || 0) + 1;
      }
    }
  }

  userCounts.sort((a, b) => b.count - a.count);

  return {
    totalEntries: rateLimitStore.size,
    entriesByRole,
    expiredEntries,
    topUsers: userCounts.slice(0, 10),
  };
}

export function rateLimitResponse(info: RateLimitInfo): Response {
  const retryAfter = Math.ceil((info.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(info.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(new Date(info.reset).toISOString()),
      },
    }
  );
}

export function addRateLimitHeaders(
  response: Response,
  info: RateLimitInfo
): Response {
  response.headers.set('X-RateLimit-Limit', String(info.limit));
  response.headers.set('X-RateLimit-Remaining', String(info.remaining));
  response.headers.set(
    'X-RateLimit-Reset',
    String(new Date(info.reset).toISOString())
  );
  return response;
}
