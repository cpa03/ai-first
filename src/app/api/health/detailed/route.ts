import { aiService } from '@/lib/ai';
import { dbService } from '@/lib/db';
import { circuitBreakerManager } from '@/lib/resilience';
import { exportManager } from '@/lib/export-connectors';
import {
  ApiContext,
  withApiHandler,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { requireAdminAuth } from '@/lib/auth';
import { redactPII } from '@/lib/pii-redaction';
import {
  API_CACHE_CONFIG,
  HEALTH_CONFIG,
  MEMORY_CONFIG,
  MEMORY_UNITS,
  STATUS_CODES,
} from '@/lib/config/constants';
import { APP_CONFIG, PROGRESS_PERCENTAGE } from '@/lib/config';
import { getExternalRateLimitTracker } from '@/lib/external-rate-limit';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import {
  HEALTH_STATUS,
  HEALTH_SEVERITY,
  CIRCUIT_BREAKER_STATES,
  HEALTH_SERVICES,
} from '@/lib/config/health-status';

interface HealthCheckResult {
  service: string;
  status: (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
  latency?: number;
  lastChecked: string;
  error?: string;
  metrics?: {
    totalConnections?: number;
    failedConnections?: number;
    lastSuccessfulConnection?: string | null;
    lastFailedConnection?: string | null;
    connectionHealthy?: boolean;
    connectionRetries?: number;
  };
}

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  heapUsedPercent: number;
  rss: number;
  external: number;
  arrayBuffers: number;
}

interface MemoryHealthResult {
  status: (typeof HEALTH_SEVERITY)[keyof typeof HEALTH_SEVERITY];
  metrics: MemoryMetrics;
  warnings: string[];
}

interface ConnectorHealthInfo {
  name: string;
  configured: boolean;
  isExternal: boolean;
  lastChecked: string;
  error?: string;
}

interface ExternalRateLimitStats {
  servicesTracked: number;
  services: Array<{
    service: string;
    remaining: number;
    limit: number;
    percentRemaining: number;
    status: (typeof HEALTH_SEVERITY)[keyof typeof HEALTH_SEVERITY];
  }>;
}

interface HealthResponse {
  status: (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
  timestamp: string;
  version: string;
  uptime: number;
  reliabilityScore: number;
  reliabilityFactors: {
    database: number;
    ai: number;
    exports: number;
    circuitBreakers: number;
    memory: number;
  };
  checks: {
    database: HealthCheckResult;
    ai: HealthCheckResult;
    exports: HealthCheckResult;
  };
  memory: MemoryHealthResult;
  connectors: Record<string, ConnectorHealthInfo>;
  circuitBreakers: Array<{
    service: string;
    state: (typeof CIRCUIT_BREAKER_STATES)[keyof typeof CIRCUIT_BREAKER_STATES];
    failures: number;
    nextAttemptTime?: string;
  }>;
  externalRateLimits: ExternalRateLimitStats;
}

function getMemoryHealth(): MemoryHealthResult {
  const memUsage = process.memoryUsage();
  const warnings: string[] = [];

  const metrics: MemoryMetrics = {
    heapUsed: Math.round(memUsage.heapUsed / MEMORY_UNITS.BYTES_PER_MB),
    heapTotal: Math.round(memUsage.heapTotal / MEMORY_UNITS.BYTES_PER_MB),
    heapUsedPercent: Math.round(
      (memUsage.heapUsed / memUsage.heapTotal) * PROGRESS_PERCENTAGE.MAX
    ),
    rss: Math.round(memUsage.rss / MEMORY_UNITS.BYTES_PER_MB),
    external: Math.round(memUsage.external / MEMORY_UNITS.BYTES_PER_MB),
    arrayBuffers: Math.round(memUsage.arrayBuffers / MEMORY_UNITS.BYTES_PER_MB),
  };

  let status: (typeof HEALTH_SEVERITY)[keyof typeof HEALTH_SEVERITY] =
    HEALTH_SEVERITY.HEALTHY;

  if (metrics.heapUsedPercent >= MEMORY_CONFIG.HEAP_CRITICAL_THRESHOLD) {
    status = HEALTH_SEVERITY.CRITICAL;
    warnings.push(
      `Heap usage at ${metrics.heapUsedPercent}% (critical: ${MEMORY_CONFIG.HEAP_CRITICAL_THRESHOLD}%)`
    );
  } else if (metrics.heapUsedPercent >= MEMORY_CONFIG.HEAP_WARNING_THRESHOLD) {
    status = HEALTH_SEVERITY.WARNING;
    warnings.push(
      `Heap usage at ${metrics.heapUsedPercent}% (warning: ${MEMORY_CONFIG.HEAP_WARNING_THRESHOLD}%)`
    );
  }

  if (metrics.rss >= MEMORY_CONFIG.RSS_CRITICAL_MB) {
    status = HEALTH_SEVERITY.CRITICAL;
    warnings.push(
      `RSS at ${metrics.rss}MB (critical: ${MEMORY_CONFIG.RSS_CRITICAL_MB}MB)`
    );
  } else if (
    metrics.rss >= MEMORY_CONFIG.RSS_WARNING_MB &&
    status !== HEALTH_SEVERITY.CRITICAL
  ) {
    status = HEALTH_SEVERITY.WARNING;
    warnings.push(
      `RSS at ${metrics.rss}MB (warning: ${MEMORY_CONFIG.RSS_WARNING_MB}MB)`
    );
  }

  if (metrics.external >= MEMORY_CONFIG.EXTERNAL_CRITICAL_MB) {
    status = HEALTH_SEVERITY.CRITICAL;
    warnings.push(
      `External memory at ${metrics.external}MB (critical: ${MEMORY_CONFIG.EXTERNAL_CRITICAL_MB}MB)`
    );
  } else if (
    metrics.external >= MEMORY_CONFIG.EXTERNAL_WARNING_MB &&
    status !== HEALTH_SEVERITY.CRITICAL
  ) {
    status = HEALTH_SEVERITY.WARNING;
    warnings.push(
      `External memory at ${metrics.external}MB (warning: ${MEMORY_CONFIG.EXTERNAL_WARNING_MB}MB)`
    );
  }

  return { status, metrics, warnings };
}

/**
 * Get external rate limit stats for health monitoring
 * Addresses issue #874: Missing monitoring for external integrations
 */
function getExternalRateLimitStats(): ExternalRateLimitStats {
  const tracker = getExternalRateLimitTracker();
  const stats = tracker.getStats();

  const services = stats.services.map((s) => {
    const percentRemaining =
      s.limit > 0
        ? Math.round((s.remaining / s.limit) * PROGRESS_PERCENTAGE.MAX)
        : 0;
    let status: (typeof HEALTH_SEVERITY)[keyof typeof HEALTH_SEVERITY] =
      HEALTH_SEVERITY.HEALTHY;
    if (percentRemaining <= HEALTH_CONFIG.RATE_LIMIT_THRESHOLDS.CRITICAL) {
      status = HEALTH_SEVERITY.CRITICAL;
    } else if (
      percentRemaining <= HEALTH_CONFIG.RATE_LIMIT_THRESHOLDS.WARNING
    ) {
      status = HEALTH_SEVERITY.WARNING;
    }

    return {
      service: s.service,
      remaining: s.remaining,
      limit: s.limit,
      percentRemaining,
      status,
    };
  });

  return {
    servicesTracked: stats.servicesTracked,
    services,
  };
}

async function handleGet(context: ApiContext) {
  // Security: Detailed health information is restricted to administrators
  await requireAdminAuth(context.request);

  const circuitBreakerStatuses = circuitBreakerManager.getAllStatuses();

  const checks: {
    database: HealthCheckResult;
    ai: HealthCheckResult;
    exports: HealthCheckResult;
  } = {
    database: {
      service: HEALTH_SERVICES.DATABASE,
      status: HEALTH_STATUS.UNKNOWN,
      lastChecked: new Date().toISOString(),
    },
    ai: {
      service: HEALTH_SERVICES.AI,
      status: HEALTH_STATUS.UNKNOWN,
      lastChecked: new Date().toISOString(),
    },
    exports: {
      service: HEALTH_SERVICES.EXPORTS,
      status: HEALTH_STATUS.UNKNOWN,
      lastChecked: new Date().toISOString(),
    },
  };

  const circuitBreakers = (
    Object.entries(circuitBreakerStatuses) as [
      string,
      {
        state: (typeof CIRCUIT_BREAKER_STATES)[keyof typeof CIRCUIT_BREAKER_STATES];
        failures: number;
        nextAttemptTime?: string;
      },
    ][]
  ).map(([service, status]) => ({
    service,
    state: status.state,
    failures: status.failures,
    nextAttemptTime: status.nextAttemptTime,
  }));

  const connectors = await exportManager.getConnectorsHealth();

  // Run health checks concurrently with proper aggregate error handling
  const healthCheckPromises = [
    (async () => {
      const dbStart = Date.now();
      const dbHealth = await dbService.healthCheck();
      return {
        service: HEALTH_SERVICES.DATABASE,
        status:
          dbHealth.status as (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS],
        latency: Date.now() - dbStart,
        lastChecked: dbHealth.timestamp,
        metrics: dbHealth.metrics,
      };
    })(),
    (async () => {
      const aiStart = Date.now();
      const aiHealth = await aiService.healthCheck();
      return {
        service: HEALTH_SERVICES.AI,
        status:
          aiHealth.status as (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS],
        latency: Date.now() - aiStart,
        lastChecked: new Date().toISOString(),
      };
    })(),
    (async () => {
      const exportStart = Date.now();
      const exportStatuses = await exportManager.validateAllConnectors();
      const healthyExports = Object.values(exportStatuses).filter(
        (v) => v
      ).length;
      const totalExports = Object.keys(exportStatuses).length;
      return {
        service: HEALTH_SERVICES.EXPORTS,
        status:
          healthyExports === totalExports
            ? HEALTH_STATUS.UP
            : healthyExports > 0
              ? HEALTH_STATUS.DEGRADED
              : HEALTH_STATUS.DOWN,
        latency: Date.now() - exportStart,
        lastChecked: new Date().toISOString(),
        error:
          healthyExports < totalExports
            ? redactPII(
                `${totalExports - healthyExports}/${totalExports} connectors unavailable`
              )
            : undefined,
      };
    })(),
  ];

  const results = await Promise.allSettled(healthCheckPromises);

  // Process database check result
  const dbResult = results[0];
  if (dbResult.status === 'fulfilled') {
    checks.database = {
      ...checks.database,
      ...dbResult.value,
    };
  } else {
    checks.database = {
      ...checks.database,
      status: HEALTH_STATUS.UNHEALTHY,
      error: redactPII(
        dbResult.reason instanceof Error
          ? dbResult.reason.message
          : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR
      ),
    };
  }

  // Process AI check result
  const aiResult = results[1];
  if (aiResult.status === 'fulfilled') {
    checks.ai = {
      ...checks.ai,
      ...aiResult.value,
    };
  } else {
    checks.ai = {
      ...checks.ai,
      status: HEALTH_STATUS.UNHEALTHY,
      error: redactPII(
        aiResult.reason instanceof Error
          ? aiResult.reason.message
          : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR
      ),
    };
  }

  // Process exports check result
  const exportResult = results[2];
  if (exportResult.status === 'fulfilled') {
    checks.exports = {
      ...checks.exports,
      ...exportResult.value,
    };
  } else {
    checks.exports = {
      ...checks.exports,
      status: HEALTH_STATUS.UNHEALTHY,
      error: redactPII(
        exportResult.reason instanceof Error
          ? exportResult.reason.message
          : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR
      ),
    };
  }

  const overallStatus =
    checks.database.status === HEALTH_STATUS.HEALTHY &&
    checks.ai.status === HEALTH_STATUS.HEALTHY
      ? checks.exports.status === HEALTH_STATUS.UP
        ? HEALTH_STATUS.HEALTHY
        : HEALTH_STATUS.DEGRADED
      : HEALTH_STATUS.UNHEALTHY;

  const memoryHealth = getMemoryHealth();

  const { SCORES, RELIABILITY_WEIGHTS } = HEALTH_CONFIG;

  const reliabilityFactors = {
    database:
      checks.database.status === HEALTH_STATUS.HEALTHY
        ? SCORES.HEALTHY
        : checks.database.status === HEALTH_STATUS.UNHEALTHY
          ? SCORES.UNHEALTHY
          : SCORES.DEGRADED,
    ai:
      checks.ai.status === HEALTH_STATUS.HEALTHY
        ? SCORES.HEALTHY
        : checks.ai.status === HEALTH_STATUS.UNHEALTHY
          ? SCORES.UNHEALTHY
          : SCORES.DEGRADED,
    exports:
      checks.exports.status === HEALTH_STATUS.UP
        ? SCORES.HEALTHY
        : checks.exports.status === HEALTH_STATUS.DEGRADED
          ? SCORES.DEGRADED
          : SCORES.UNHEALTHY,
    circuitBreakers:
      circuitBreakers.length === 0
        ? SCORES.HEALTHY
        : (circuitBreakers.filter(
            (cb) => cb.state === CIRCUIT_BREAKER_STATES.CLOSED
          ).length /
            circuitBreakers.length) *
          SCORES.HEALTHY,
    memory:
      memoryHealth.status === HEALTH_SEVERITY.HEALTHY
        ? SCORES.HEALTHY
        : memoryHealth.status === HEALTH_SEVERITY.CRITICAL
          ? SCORES.UNHEALTHY
          : SCORES.DEGRADED,
  };

  const reliabilityScore = Math.round(
    reliabilityFactors.database * RELIABILITY_WEIGHTS.database +
      reliabilityFactors.ai * RELIABILITY_WEIGHTS.ai +
      reliabilityFactors.exports * RELIABILITY_WEIGHTS.exports +
      reliabilityFactors.circuitBreakers * RELIABILITY_WEIGHTS.circuitBreakers +
      reliabilityFactors.memory * RELIABILITY_WEIGHTS.memory
  );

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: APP_CONFIG.VERSION,
    uptime: process.uptime(),
    reliabilityScore,
    reliabilityFactors,
    checks,
    memory: memoryHealth,
    connectors,
    circuitBreakers,
    externalRateLimits: getExternalRateLimitStats(),
  };

  const statusCode =
    overallStatus === HEALTH_STATUS.HEALTHY
      ? STATUS_CODES.OK
      : STATUS_CODES.SERVICE_UNAVAILABLE;

  return standardSuccessResponse(
    response,
    context.requestId,
    statusCode,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
  cacheTtlSeconds: API_CACHE_CONFIG.DETAILED_HEALTH_TTL_SECONDS,
  cacheScope: 'private',
});
