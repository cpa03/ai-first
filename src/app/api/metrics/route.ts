import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { STATUS_CODES } from '@/lib/config';
import { createLogger } from '@/lib/logger';

const logger = createLogger('MetricsAPI');
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
  try {
    const metrics = await register.metrics();

    logger.debug('Metrics requested', {
      requestId: context.requestId,
      contentType: register.contentType,
    });

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
  } catch (error) {
    logger.error('Failed to generate metrics', {
      requestId: context.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return standardSuccessResponse(
      {
        error: 'Failed to generate metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      context.requestId,
      STATUS_CODES.INTERNAL_ERROR,
      context.rateLimit
    );
  }
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
