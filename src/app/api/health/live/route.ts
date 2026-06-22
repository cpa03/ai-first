import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';
import { STATUS_CODES, API_CACHE_CONFIG } from '@/lib/config/constants';
import { ENV_ACCESSORS } from '@/lib/config/env-keys';

async function handleGet(context: ApiContext) {
  const { rateLimit: _rateLimit } = context;

  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'liveness',
    environment: ENV_ACCESSORS.PLATFORM.NODE_ENV() || 'development',
  };

  return standardSuccessResponse(
    response,
    context.requestId,
    STATUS_CODES.OK,
    _rateLimit
  );
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
  cacheTtlSeconds: API_CACHE_CONFIG.LIVE_TTL_SECONDS,
  cacheScope: 'public',
});
