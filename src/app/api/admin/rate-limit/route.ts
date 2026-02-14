import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import {
  getRateLimitStats,
  rateLimitConfigs,
  tieredRateLimits,
} from '@/lib/rate-limit';
import { requireAdminAuth } from '@/lib/auth';

async function handleGet(context: ApiContext) {
  await requireAdminAuth(context.request);

  const stats = getRateLimitStats();

  // Transform rate limit configs to API response format
  const formattedConfigs = Object.entries(rateLimitConfigs).reduce(
    (acc, [key, config]) => ({
      ...acc,
      [key]: { windowMs: config.windowMs, maxRequests: config.limit },
    }),
    {}
  );

  const formattedTieredLimits = Object.entries(tieredRateLimits).reduce(
    (acc, [key, config]) => ({
      ...acc,
      [key]: { windowMs: config.windowMs, maxRequests: config.limit },
    }),
    {}
  );

  const data = {
    timestamp: new Date().toISOString(),
    ...stats,
    rateLimitConfigs: formattedConfigs,
    tieredRateLimits: formattedTieredLimits,
  };

  return standardSuccessResponse(
    data,
    context.requestId,
    200,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'strict' });
