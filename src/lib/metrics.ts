/**
 * HTTP Metrics
 *
 * Prometheus metrics for HTTP request monitoring.
 * Shared between route handlers and API utilities.
 *
 * Safe for both Node.js and Edge runtimes.
 */

import {
  METRIC_NAMES,
  METRIC_HELP,
  METRIC_LABELS,
  HISTOGRAM_BUCKETS,
} from '@/lib/config/metrics-config';

interface Register {
  metrics: () => Promise<string>;
  contentType: string;
  clear: () => void;
}

interface Metric {
  inc: (labels?: Record<string, string | number>) => void;
  observe: (labels: Record<string, string | number>, value: number) => void;
  set: (labels?: Record<string, string | number>, value?: number) => void;
  labels: (labels: Record<string, string>) => Metric;
}

let register: Register;
let httpRequestDuration: Metric;
let httpRequestErrors: Metric;
let httpRequestTotal: Metric;
let circuitBreakerState: Metric;
let rateLimiterHits: Metric;
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
      name: METRIC_NAMES.HTTP_REQUEST_DURATION,
      help: METRIC_HELP.HTTP_REQUEST_DURATION,
      labelNames: [
        METRIC_LABELS.HTTP_METHOD,
        METRIC_LABELS.HTTP_ROUTE,
        METRIC_LABELS.HTTP_STATUS_CODE,
      ],
      buckets: HISTOGRAM_BUCKETS,
      registers: [register],
    });

    httpRequestErrors = new promClient.Counter({
      name: METRIC_NAMES.HTTP_REQUEST_ERRORS,
      help: METRIC_HELP.HTTP_REQUEST_ERRORS,
      labelNames: [
        METRIC_LABELS.HTTP_METHOD,
        METRIC_LABELS.HTTP_ROUTE,
        METRIC_LABELS.HTTP_STATUS_CODE,
      ],
      registers: [register],
    });

    httpRequestTotal = new promClient.Counter({
      name: METRIC_NAMES.HTTP_REQUEST_TOTAL,
      help: METRIC_HELP.HTTP_REQUEST_TOTAL,
      labelNames: [
        METRIC_LABELS.HTTP_METHOD,
        METRIC_LABELS.HTTP_ROUTE,
        METRIC_LABELS.HTTP_STATUS_CODE,
      ],
      registers: [register],
    });

    circuitBreakerState = new promClient.Gauge({
      name: METRIC_NAMES.CIRCUIT_BREAKER_STATE,
      help: METRIC_HELP.CIRCUIT_BREAKER_STATE,
      labelNames: [METRIC_LABELS.CIRCUIT_BREAKER_NAME],
      registers: [register],
    });

    rateLimiterHits = new promClient.Counter({
      name: METRIC_NAMES.RATE_LIMITER_HITS,
      help: METRIC_HELP.RATE_LIMITER_HITS,
      labelNames: [METRIC_LABELS.HTTP_METHOD, METRIC_LABELS.HTTP_ROUTE],
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
