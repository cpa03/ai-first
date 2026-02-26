/**
 * HTTP Metrics
 *
 * Prometheus metrics for HTTP request monitoring.
 * Shared between route handlers and API utilities.
 *
 * Safe for both Node.js and Edge runtimes.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
let register: any;
let httpRequestDuration: any;
let httpRequestErrors: any;
let httpRequestTotal: any;
let circuitBreakerState: any;
let rateLimiterHits: any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// Detect runtime
const isEdge =
  typeof process !== 'undefined' &&
  (process.env.NEXT_RUNTIME === 'edge' ||
    process.env.CF_PAGES === 'true' ||
    process.env.CF_WORKER === 'true');
const createNoOpMetric = () => ({
  inc: () => {},
  observe: () => {},
  set: () => {},
  labels: () => createNoOpMetric(),
});

if (isEdge) {
  register = {
    metrics: async () => '',
    contentType: 'text/plain',
    clear: () => {},
  };
  httpRequestDuration = createNoOpMetric();
  httpRequestErrors = createNoOpMetric();
  httpRequestTotal = createNoOpMetric();
  circuitBreakerState = createNoOpMetric();
  rateLimiterHits = createNoOpMetric();
} else {
  try {
    // Dynamic require to avoid bundling issues in Edge
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const promClient = require('prom-client');

    register = new promClient.Registry();
    promClient.collectDefaultMetrics({ register });

    httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
      registers: [register],
    });

    httpRequestErrors = new promClient.Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    circuitBreakerState = new promClient.Gauge({
      name: 'circuit_breaker_state',
      help: 'Circuit breaker state (0=closed, 1=half-open, 2=open)',
      labelNames: ['name'],
      registers: [register],
    });

    rateLimiterHits = new promClient.Counter({
      name: 'rate_limiter_hits_total',
      help: 'Total number of rate limiter hits',
      labelNames: ['method', 'route'],
      registers: [register],
    });
  } catch {
    // Fallback to no-op
    register = {
      metrics: async () => '',
      contentType: 'text/plain',
      clear: () => {},
    };
    httpRequestDuration = createNoOpMetric();
    httpRequestErrors = createNoOpMetric();
    httpRequestTotal = createNoOpMetric();
    circuitBreakerState = createNoOpMetric();
    rateLimiterHits = createNoOpMetric();
  }
}

export {
  register,
  httpRequestDuration,
  httpRequestErrors,
  httpRequestTotal,
  circuitBreakerState,
  rateLimiterHits,
};
