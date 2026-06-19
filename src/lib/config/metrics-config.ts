/**
 * Metrics Configuration Module
 *
 * Centralized configuration for Prometheus metrics including metric names,
 * buckets, and labels. Extracted from metrics.ts for modularity.
 *
 * @module lib/config/metrics-config
 */

import { EnvLoader } from './environment';

/**
 * Metric Names
 * Centralized metric name constants for Prometheus metrics
 */
export const METRIC_NAMES = {
  HTTP_REQUEST_DURATION: 'http_request_duration_seconds',
  HTTP_REQUEST_ERRORS: 'http_request_errors_total',
  HTTP_REQUEST_TOTAL: 'http_requests_total',
  CIRCUIT_BREAKER_STATE: 'circuit_breaker_state',
  RATE_LIMITER_HITS: 'rate_limiter_hits_total',
} as const;

/**
 * Metric Help Text
 * Centralized help text for Prometheus metrics
 */
export const METRIC_HELP = {
  HTTP_REQUEST_DURATION: 'Duration of HTTP requests in seconds',
  HTTP_REQUEST_ERRORS: 'Total number of HTTP request errors',
  HTTP_REQUEST_TOTAL: 'Total number of HTTP requests',
  CIRCUIT_BREAKER_STATE:
    'Circuit breaker state (0=closed, 1=half-open, 2=open)',
  RATE_LIMITER_HITS: 'Total number of rate limiter hits',
} as const;

/**
 * Metric Label Names
 * Centralized label names for Prometheus metrics
 */
export const METRIC_LABELS = {
  HTTP_METHOD: 'method',
  HTTP_ROUTE: 'route',
  HTTP_STATUS_CODE: 'status_code',
  CIRCUIT_BREAKER_NAME: 'name',
} as const;

/**
 * Histogram Buckets
 * Configuration for HTTP request duration histogram buckets
 * Env: METRICS_HISTOGRAM_BUCKETS (default: '0.001,0.005,0.01,0.05,0.1,0.5,1,5')
 */
export const HISTOGRAM_BUCKETS = EnvLoader.string(
  'METRICS_HISTOGRAM_BUCKETS',
  '0.001,0.005,0.01,0.05,0.1,0.5,1,5'
)
  .split(',')
  .map(Number);

/**
 * Metrics Configuration
 * Complete metrics configuration object
 */
export const METRICS_CONFIG = {
  NAMES: METRIC_NAMES,
  HELP: METRIC_HELP,
  LABELS: METRIC_LABELS,
  HISTOGRAM_BUCKETS,
} as const;

// Type exports
export type MetricNames = typeof METRIC_NAMES;
export type MetricHelp = typeof METRIC_HELP;
export type MetricLabels = typeof METRIC_LABELS;
export type MetricsConfig = typeof METRICS_CONFIG;
