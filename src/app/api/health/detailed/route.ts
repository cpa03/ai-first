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
import { API_CACHE_CONFIG, STATUS_CODES } from '@/lib/config/constants';
import { APP_CONFIG } from '@/lib/config/app';

interface HealthCheckResult {
  service: string;
  status: string;
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

interface ConnectorHealthInfo {
  name: string;
  configured: boolean;
  isExternal: boolean;
  lastChecked: string;
  error?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    ai: HealthCheckResult;
    exports: HealthCheckResult;
  };
  connectors: Record<string, ConnectorHealthInfo>;
  circuitBreakers: Array<{
    service: string;
    state: string;
    failures: number;
  }>;
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
      service: 'database',
      status: 'unknown',
      lastChecked: new Date().toISOString(),
    },
    ai: {
      service: 'ai',
      status: 'unknown',
      lastChecked: new Date().toISOString(),
    },
    exports: {
      service: 'exports',
      status: 'unknown',
      lastChecked: new Date().toISOString(),
    },
  };

  const circuitBreakers = (
    Object.entries(circuitBreakerStatuses) as [
      string,
      {
        state: 'closed' | 'open' | 'half-open';
        failures: number;
        nextAttemptTime?: string;
      },
    ][]
  ).map(([service, status]) => ({
    service,
    state: status.state,
    failures: status.failures,
  }));

  const connectors = await exportManager.getConnectorsHealth();

  // Run health checks concurrently with proper aggregate error handling
  const healthCheckPromises = [
    (async () => {
      const dbStart = Date.now();
      const dbHealth = await dbService.healthCheck();
      return {
        service: 'database' as const,
        status: dbHealth.status,
        latency: Date.now() - dbStart,
        lastChecked: dbHealth.timestamp,
        metrics: dbHealth.metrics,
      };
    })(),
    (async () => {
      const aiStart = Date.now();
      const aiHealth = await aiService.healthCheck();
      return {
        service: 'ai' as const,
        status: aiHealth.status,
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
        service: 'exports' as const,
        status:
          healthyExports === totalExports
            ? 'up'
            : healthyExports > 0
              ? 'degraded'
              : 'down',
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
      status: 'unhealthy',
      error: redactPII(
        dbResult.reason instanceof Error
          ? dbResult.reason.message
          : 'Unknown error'
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
      status: 'unhealthy',
      error: redactPII(
        aiResult.reason instanceof Error
          ? aiResult.reason.message
          : 'Unknown error'
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
      status: 'unhealthy',
      error: redactPII(
        exportResult.reason instanceof Error
          ? exportResult.reason.message
          : 'Unknown error'
      ),
    };
  }

  const overallStatus =
    checks.database.status === 'healthy' && checks.ai.status === 'healthy'
      ? checks.exports.status === 'up'
        ? 'healthy'
        : 'degraded'
      : 'unhealthy';

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: APP_CONFIG.VERSION,
    uptime: process.uptime(),
    checks,
    connectors,
    circuitBreakers,
  };

  const statusCode =
    overallStatus === 'healthy'
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
