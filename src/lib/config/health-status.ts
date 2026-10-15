/**
 * Health Status Configuration
 *
 * Centralizes health check status strings and circuit breaker states.
 * Follows the "Flexy" principle: eliminate hardcoded values and make
 * everything modular and configurable.
 *
 * Usage:
 * ```typescript
 * import { HEALTH_STATUS, CIRCUIT_BREAKER_STATES, HEALTH_SERVICES } from '@/lib/config/health-status';
 *
 * // Instead of hardcoded status string:
 * if (status === 'healthy') { ... }
 *
 * // Use modular config:
 * if (status === HEALTH_STATUS.HEALTHY) { ... }
 * ```
 */

/**
 * Health check status values
 * Used in health check endpoints and monitoring
 */
export const HEALTH_STATUS = {
  /** Service is functioning normally */
  HEALTHY: 'healthy',
  /** Service is experiencing partial degradation */
  DEGRADED: 'degraded',
  /** Service is not functioning */
  UNHEALTHY: 'unhealthy',
  /** Service status is unknown */
  UNKNOWN: 'unknown',
  /** Service is up (alternative to healthy for export connectors) */
  UP: 'up',
  /** Service is down (alternative to unhealthy for export connectors) */
  DOWN: 'down',
  /** Service is ready (readiness probe) */
  READY: 'ready',
  /** Service is not ready (readiness probe) */
  NOT_READY: 'not_ready',
} as const;

/**
 * Health check warning/critical status values
 * Used in memory health checks and rate limit monitoring
 */
export const HEALTH_SEVERITY = {
  /** Normal operating state */
  HEALTHY: 'healthy',
  /** Warning threshold exceeded */
  WARNING: 'warning',
  /** Critical threshold exceeded */
  CRITICAL: 'critical',
} as const;

/**
 * Circuit breaker states
 * Used in resilience framework and health monitoring
 */
export const CIRCUIT_BREAKER_STATES = {
  /** Circuit is closed - requests flow normally */
  CLOSED: 'closed',
  /** Circuit is open - requests are blocked */
  OPEN: 'open',
  /** Circuit is half-open - testing if service recovered */
  HALF_OPEN: 'half-open',
} as const;

/**
 * Health check service names
 * Used in health check endpoints for consistent service identification
 */
export const HEALTH_SERVICES = {
  DATABASE: 'database',
  AI: 'ai',
  EXPORTS: 'exports',
  READINESS: 'readiness',
} as const;

/**
 * Circuit breaker to health status mapping
 * Maps circuit breaker states to corresponding health statuses
 */
export const CIRCUIT_BREAKER_HEALTH_MAP = {
  [CIRCUIT_BREAKER_STATES.CLOSED]: HEALTH_STATUS.HEALTHY,
  [CIRCUIT_BREAKER_STATES.HALF_OPEN]: HEALTH_STATUS.DEGRADED,
  [CIRCUIT_BREAKER_STATES.OPEN]: HEALTH_STATUS.UNHEALTHY,
} as const;

/**
 * Export connector health mapping
 * Maps export connector states to health statuses
 */
export const EXPORT_HEALTH_MAP = {
  HEALTHY: HEALTH_STATUS.HEALTHY,
  DEGRADED: HEALTH_STATUS.DEGRADED,
  UNHEALTHY: HEALTH_STATUS.UNHEALTHY,
  UNKNOWN: HEALTH_STATUS.UNKNOWN,
} as const;

/**
 * Overall health status determination
 * Priority order for determining overall status from individual checks
 */
export const HEALTH_STATUS_PRIORITY = {
  UNHEALTHY: 0,
  DEGRADED: 1,
  HEALTHY: 2,
} as const;

/**
 * Memory health thresholds
 * Used in memory health checks
 */
export const MEMORY_HEALTH_THRESHOLDS = {
  /** Heap usage warning threshold percentage */
  HEAP_WARNING: 70,
  /** Heap usage critical threshold percentage */
  HEAP_CRITICAL: 85,
  /** RSS warning threshold in MB */
  RSS_WARNING: 500,
  /** RSS critical threshold in MB */
  RSS_CRITICAL: 1000,
  /** External memory warning threshold in MB */
  EXTERNAL_WARNING: 100,
  /** External memory critical threshold in MB */
  EXTERNAL_CRITICAL: 200,
} as const;

/**
 * Export all health status constants
 */
export const HEALTH_STATUS_CONFIG = {
  STATUS: HEALTH_STATUS,
  SEVERITY: HEALTH_SEVERITY,
  CIRCUIT_BREAKER: CIRCUIT_BREAKER_STATES,
  SERVICES: HEALTH_SERVICES,
  CIRCUIT_BREAKER_HEALTH_MAP,
  EXPORT_HEALTH_MAP,
  STATUS_PRIORITY: HEALTH_STATUS_PRIORITY,
  MEMORY_THRESHOLDS: MEMORY_HEALTH_THRESHOLDS,
} as const;

export type HealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
export type HealthSeverity =
  (typeof HEALTH_SEVERITY)[keyof typeof HEALTH_SEVERITY];
export type CircuitBreakerState =
  (typeof CIRCUIT_BREAKER_STATES)[keyof typeof CIRCUIT_BREAKER_STATES];
export type HealthService =
  (typeof HEALTH_SERVICES)[keyof typeof HEALTH_SERVICES];
