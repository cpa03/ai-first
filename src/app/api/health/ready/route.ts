import { dbService } from '@/lib/db';
import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';
import { createLogger } from '@/lib/logger';
import { AppError, ErrorCode } from '@/lib/errors';
import { STATUS_CODES } from '@/lib/config/http';
import { API_CACHE_CONFIG } from '@/lib/config/constants';
import { ENV_ACCESSORS } from '@/lib/config/env-keys';

const logger = createLogger('readiness');

async function handleGet(context: ApiContext) {
  const { rateLimit: _rateLimit } = context;

  const checks: Record<
    string,
    {
      status: 'ready' | 'not_ready';
      responseTime?: number;
      error?: string;
      details?: unknown;
    }
  > = {};
  let allReady = true;

  const dbStartTime = Date.now();
  try {
    const connectionHealth = await dbService.checkConnection();
    const dbHealthy = connectionHealth.client && connectionHealth.admin;
    checks.database = {
      status: dbHealthy ? 'ready' : 'not_ready',
      responseTime: Date.now() - dbStartTime,
      details: connectionHealth,
    };
    if (!dbHealthy) {
      allReady = false;
    }
  } catch (error) {
    allReady = false;
    checks.database = {
      status: 'not_ready',
      responseTime: Date.now() - dbStartTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    logger.error('Readiness check failed: Database connection error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  const response = {
    status: allReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    service: 'readiness',
    environment: ENV_ACCESSORS.PLATFORM.NODE_ENV() || 'development',
    checks,
  };

  if (allReady) {
    return standardSuccessResponse(
      response,
      context.requestId,
      STATUS_CODES.OK,
      _rateLimit
    );
  }

  const notReadyChecks = Object.entries(checks)
    .filter(([, check]) => check.status === 'not_ready')
    .map(([name, check]) => ({
      field: name,
      message: check.error || `Service ${name} is not ready`,
    }));

  throw new AppError(
    'Service not ready',
    ErrorCode.NOT_READY,
    STATUS_CODES.SERVICE_UNAVAILABLE,
    notReadyChecks.map((check) => ({
      field: check.field,
      message: check.message,
    })),
    true,
    [
      'Wait briefly and retry the request',
      'Check /api/health/detailed for specific dependency status',
    ]
  );
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
  cacheTtlSeconds: API_CACHE_CONFIG.READY_TTL_SECONDS,
  cacheScope: 'public',
});
