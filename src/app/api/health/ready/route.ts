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

const logger = createLogger('readiness');

/**
 * Readiness probe endpoint for container orchestration (Kubernetes, Docker)
 *
 * Purpose: Should the container receive traffic?
 * Returns: 200 OK if all dependencies are ready, 503 if not ready
 *
 * This checks that all required dependencies (database, etc.) are healthy
 * and the application is ready to serve traffic.
 */
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

  // Check database connectivity
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
    environment: process.env.NODE_ENV || 'development',
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
