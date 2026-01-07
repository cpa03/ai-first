interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export type UserRole = 'anonymous' | 'authenticated' | 'premium' | 'enterprise';

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
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

export const rateLimitConfigs = {
  strict: { windowMs: 60 * 1000, maxRequests: 10 },
  moderate: { windowMs: 60 * 1000, maxRequests: 30 },
  lenient: { windowMs: 60 * 1000, maxRequests: 60 },
} as const;

export const tieredRateLimits: Record<UserRole, RateLimitConfig> = {
  anonymous: { windowMs: 60 * 1000, maxRequests: 30 },
  authenticated: { windowMs: 60 * 1000, maxRequests: 60 },
  premium: { windowMs: 60 * 1000, maxRequests: 120 },
  enterprise: { windowMs: 60 * 1000, maxRequests: 300 },
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

export function rateLimitResponse(
  resetTime: number,
  limit: number = 60
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(new Date(resetTime).toISOString()),
      },
    }
  );
}
