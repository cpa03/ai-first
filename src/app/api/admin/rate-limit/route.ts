import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { getRateLimitStats } from '@/lib/rate-limit';

async function handleGet(context: ApiContext) {
  const stats = getRateLimitStats();

  const data = {
    timestamp: new Date().toISOString(),
    ...stats,
    rateLimitConfigs: {
      strict: { windowMs: 60 * 1000, maxRequests: 10 },
      moderate: { windowMs: 60 * 1000, maxRequests: 30 },
      lenient: { windowMs: 60 * 1000, maxRequests: 60 },
    },
    tieredRateLimits: {
      anonymous: { windowMs: 60 * 1000, maxRequests: 30 },
      authenticated: { windowMs: 60 * 1000, maxRequests: 60 },
      premium: { windowMs: 60 * 1000, maxRequests: 120 },
      enterprise: { windowMs: 60 * 1000, maxRequests: 300 },
    },
  };

  return standardSuccessResponse(
    data,
    context.requestId,
    200,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'strict' });
