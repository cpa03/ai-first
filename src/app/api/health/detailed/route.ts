import { aiService } from '@/lib/ai';
import { dbService } from '@/lib/db';
import { resilienceManager } from '@/lib/resilience';
import { exportManager } from '@/lib/exports';
import { ApiContext, withApiHandler, successResponse } from '@/lib/api-handler';
import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: ServiceHealth;
    ai: ServiceHealth;
    exports: ServiceHealth;
    circuitBreakers: CircuitBreakerHealth[];
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
  lastChecked: string;
}

interface CircuitBreakerHealth {
  service: string;
  state: string;
  failures: number;
  nextAttemptTime?: string;
}

async function handleGet(context: ApiContext) {
  const checks = await Promise.all([
    checkDatabaseHealth(),
    checkAIHealth(),
    checkExportsHealth(),
  ]);

  const circuitBreakerStates = resilienceManager.getCircuitBreakerStates();
  const circuitBreakers = Object.entries(circuitBreakerStates).map(
    ([service, state]) => ({
      service,
      state: state.state,
      failures: state.failures,
      nextAttemptTime: state.nextAttemptTime
        ? new Date(state.nextAttemptTime).toISOString()
        : undefined,
    })
  );

  const overallStatus = determineOverallStatus(
    checks[0],
    checks[1],
    checks[2],
    circuitBreakers
  );

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: process.uptime(),
    checks: {
      database: checks[0],
      ai: checks[1],
      exports: checks[2],
      circuitBreakers,
    },
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  const response = NextResponse.json(
    {
      success: overallStatus === 'healthy',
      data: healthStatus,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/health+json',
        'X-Request-ID': context.requestId,
      },
    }
  );

  return response;
}

async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    const result = await dbService.healthCheck();
    const latency = Date.now() - startTime;

    if (result.status === 'healthy') {
      return {
        status: latency < 500 ? 'up' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'down',
      error: 'Database health check failed',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkAIHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    const result = await aiService.healthCheck();
    const latency = Date.now() - startTime;

    if (result.status === 'healthy' && result.providers.length > 0) {
      return {
        status: latency < 2000 ? 'up' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'down',
      error: 'AI service unhealthy or no providers available',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkExportsHealth(): Promise<ServiceHealth> {
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
        status: 'down',
        error: 'No export connectors configured',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    if (healthyConnectors < totalConnectors) {
      return {
        status: 'degraded',
        latency,
        error: `${healthyConnectors}/${totalConnectors} connectors available`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'up',
      latency,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

function determineOverallStatus(
  db: ServiceHealth,
  ai: ServiceHealth,
  exports: ServiceHealth,
  circuitBreakers: CircuitBreakerHealth[]
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
