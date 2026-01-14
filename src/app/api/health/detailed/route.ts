import { aiService } from '@/lib/ai';
import { dbService } from '@/lib/db';
import { circuitBreakerManager } from '@/lib/resilience';
import { exportManager } from '@/lib/exports';
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

async function _checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const result = await dbService.healthCheck();
    const latency = Date.now() - startTime;

    if (result.status === 'healthy') {
      return {
        service: 'database',
        status: latency < 500 ? 'up' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      service: 'database',
      status: 'down',
      error: 'Database health check failed',
      lastChecked: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down',
      error: err instanceof Error ? err.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
      service: 'database',
    };
  }
}

async function _checkAIHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const result = await aiService.healthCheck();
    const latency = Date.now() - startTime;

    if (result.status === 'healthy' && result.providers.length > 0) {
      return {
        service: 'ai',
        status: latency < 2000 ? 'up' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      service: 'ai',
      status: 'down',
      error: 'AI service check failed',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      service: 'ai',
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

async function _checkExportsHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const validationResults = await exportManager.validateAllConnectors();
    const healthyConnectors = Object.values(validationResults).filter(
      (valid) => valid
    ).length;
    const totalConnectors = Object.keys(validationResults).length;

    const latency = Date.now() - startTime;

    if (healthyConnectors === 0) {
      return {
        service: 'exports',
        status: 'down',
        error: 'No export connectors configured',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    if (healthyConnectors < totalConnectors) {
      return {
        service: 'exports',
        status: 'degraded',
        latency,
        error: `${healthyConnectors}/${totalConnectors} connectors available`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      service: 'exports',
      status: 'up',
      latency,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      service: 'exports',
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

function _determineOverallStatus(
  db: HealthCheckResult,
  ai: HealthCheckResult,
  exports: HealthCheckResult,
  circuitBreakers: Array<{
    service: string;
    state: string;
    failures: number;
  }>
): 'healthy' | 'degraded' | 'unhealthy' {
  const criticalServices = [db, ai];

  const criticalDown = criticalServices.some(
    (service) => service.status === 'down'
  );

  const openCircuitBreakers = circuitBreakers.filter(
    (cb) => cb.state === 'open'
  );

  if (criticalDown || openCircuitBreakers.length > 2) {
    return 'unhealthy';
  }

  const degradedServices = [db, ai, exports].filter(
    (service) => service.status === 'degraded'
  );

  if (degradedServices.length > 0 || openCircuitBreakers.length > 0) {
    return 'degraded';
  }

  return 'healthy';
}

export const GET = withApiHandler(handleGet, { validateSize: false });
