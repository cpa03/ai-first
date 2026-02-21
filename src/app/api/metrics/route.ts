import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';
import { withApiHandler, ApiContext } from '@/lib/api-handler';
import { AppError, ErrorCode } from '@/lib/errors';
import { STATUS_CODES } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import { isAdminAuthenticated } from '@/lib/auth';

const logger = createLogger('MetricsAPI');

/**
 * SECURITY: The metrics endpoint exposes operational telemetry data.
 * In production (when ADMIN_API_KEY is set), this endpoint requires admin authentication.
 * In development (when ADMIN_API_KEY is not set), access is allowed for DX.
 *
 * This prevents unauthorized access to potentially sensitive metrics data
 * while maintaining developer experience during local development.
 */
const register = new Registry();

collectDefaultMetrics({ register });

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const circuitBreakerState = new Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=half-open, 2=open)',
  labelNames: ['name'],
  registers: [register],
});

export const rateLimiterHits = new Counter({
  name: 'rate_limiter_hits_total',
  help: 'Total number of rate limiter hits',
  labelNames: ['method', 'route'],
  registers: [register],
});

export { register };

async function handleGet(context: ApiContext) {
  if (process.env.ADMIN_API_KEY) {
    const authenticated = await isAdminAuthenticated(context.request);
    if (!authenticated) {
      throw new AppError(
        'Unauthorized. Admin authentication required for metrics endpoint.',
        ErrorCode.AUTHENTICATION_ERROR,
        STATUS_CODES.UNAUTHORIZED
      );
    }
  }

  const metrics = await register.metrics();

  logger.debug('Metrics requested', {
    requestId: context.requestId,
    contentType: register.contentType,
  });

  if (!metrics) {
    throw new AppError(
      'Failed to generate metrics',
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR,
      undefined,
      false
    );
  }

  return new Response(metrics, {
    status: STATUS_CODES.OK,
    headers: {
      'Content-Type': register.contentType,
      'X-Request-ID': context.requestId,
      'X-RateLimit-Limit': String(context.rateLimit.limit),
      'X-RateLimit-Remaining': String(context.rateLimit.remaining),
      'X-RateLimit-Reset': String(
        new Date(context.rateLimit.reset).toISOString()
      ),
    },
  });
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
