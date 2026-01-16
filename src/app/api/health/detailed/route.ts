import { aiService } from '@/lib/ai';
import { dbService } from '@/lib/db';
import { circuitBreakerManager } from '@/lib/resilience';
import { exportManager } from '@/lib/export-connectors';
import {
  ApiContext,
  withApiHandler,
  standardSuccessResponse,
} from '@/lib/api-handler';

interface HealthCheckResult {
  service: string;
  status: string;
  latency?: number;
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
  circuitBreakers: Array<{
    service: string;
    state: string;
    failures: number;
  }>;
}

async function handleGet(context: ApiContext) {
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

  try {
    const dbStart = Date.now();
    const dbHealth = await dbService.healthCheck();
    checks.database = {
      ...checks.database,
      status: dbHealth.status,
      latency: Date.now() - dbStart,
      lastChecked: dbHealth.timestamp,
    };
  } catch (error) {
    checks.database = {
      ...checks.database,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  try {
    const aiStart = Date.now();
    const aiHealth = await aiService.healthCheck();
    checks.ai = {
      ...checks.ai,
      status: aiHealth.status,
      latency: Date.now() - aiStart,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    checks.ai = {
      ...checks.ai,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  try {
    const exportStart = Date.now();
    const exportStatuses = await exportManager.validateAllConnectors();
    const healthyExports = Object.values(exportStatuses).filter(
      (v) => v
    ).length;
    const totalExports = Object.keys(exportStatuses).length;
    checks.exports = {
      ...checks.exports,
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
          ? `${totalExports - healthyExports}/${totalExports} connectors unavailable`
          : undefined,
    };
  } catch (error) {
    checks.exports = {
      ...checks.exports,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
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
    version: '0.1.0',
    uptime: process.uptime(),
    checks,
    circuitBreakers,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  return standardSuccessResponse(response, context.requestId, statusCode);
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
