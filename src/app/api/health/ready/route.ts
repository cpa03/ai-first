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
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { HEALTH_STATUS, HEALTH_SERVICES } from '@/lib/config/health-status';

const logger = createLogger('readiness');

async function handleGet(context: ApiContext) {
  const { rateLimit: _rateLimit } = context;

  const checks: Record<
    string,
    {
      status: (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
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
    checks[HEALTH_SERVICES.DATABASE] = {
      status: dbHealthy ? HEALTH_STATUS.READY : HEALTH_STATUS.NOT_READY,
      responseTime: Date.now() - dbStartTime,
      details: connectionHealth,
    };
    if (!dbHealthy) {
      allReady = false;
    }
  } catch (error) {
    allReady = false;
    checks[HEALTH_SERVICES.DATABASE] = {
      status: HEALTH_STATUS.NOT_READY,
      responseTime: Date.now() - dbStartTime,
      error:
        error instanceof Error
          ? error.message
          : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR,
    };
    logger.error('Readiness check failed: Database connection error', {
      error:
        error instanceof Error
          ? error.message
          : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR,
    });
  }

  const response = {
    status: allReady ? HEALTH_STATUS.READY : HEALTH_STATUS.NOT_READY,
    timestamp: new Date().toISOString(),
    service: HEALTH_SERVICES.READINESS,
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
    .filter(([, check]) => check.status === HEALTH_STATUS.NOT_READY)
    .map(([name, check]) => ({
      field: name,
      message: check.error || `Service ${name} is not ready`,
    }));

  throw new AppError(
    API_ERROR_MESSAGES.HEALTH.SERVICE_NOT_READY,
    ErrorCode.NOT_READY,
    STATUS_CODES.SERVICE_UNAVAILABLE,
    notReadyChecks.map((check) => ({
      field: check.field,
      message: check.message,
    })),
    true,
    [
      API_ERROR_MESSAGES.HEALTH.SERVICE_NOT_READY_RETRY,
      API_ERROR_MESSAGES.HEALTH.SERVICE_NOT_READY_CHECK_DETAILED,
    ]
  );
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
  cacheTtlSeconds: API_CACHE_CONFIG.READY_TTL_SECONDS,
  cacheScope: 'public',
});
