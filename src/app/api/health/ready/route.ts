import { dbService } from '@/lib/db';
import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';
import { createLogger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { STATUS_CODES } from '@/lib/config';

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
    { status: 'ready' | 'not_ready'; responseTime?: number; error?: string }
  > = {};
  let allReady = true;

  // Check database connectivity
  const dbStartTime = Date.now();
  try {
    const dbHealthy = await dbService.checkConnection();
    checks.database = {
      status: dbHealthy ? 'ready' : 'not_ready',
      responseTime: Date.now() - dbStartTime,
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

  // Return 503 Service Unavailable if not ready
  const errorResponse = NextResponse.json(
    {
      success: false,
      error: 'Service not ready',
      code: 'NOT_READY',
      data: response,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    },
    { status: STATUS_CODES.SERVICE_UNAVAILABLE }
  );

  errorResponse.headers.set('X-Request-ID', context.requestId);

  if (_rateLimit) {
    errorResponse.headers.set('X-RateLimit-Limit', String(_rateLimit.limit));
    errorResponse.headers.set(
      'X-RateLimit-Remaining',
      String(_rateLimit.remaining)
    );
    errorResponse.headers.set(
      'X-RateLimit-Reset',
      new Date(_rateLimit.reset).toISOString()
    );
  }

  return errorResponse;
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
