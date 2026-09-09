import {
  ApiContext,
  withApiHandler,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { circuitBreakerManager } from '@/lib/resilience';
import { exportManager } from '@/lib/export-connectors';
import { APP_CONFIG, EXTERNAL_RATE_LIMIT_CONFIG } from '@/lib/config';
import { STATUS_CODES, API_CACHE_CONFIG } from '@/lib/config/constants';
import { getExternalRateLimitTracker } from '@/lib/external-rate-limit';
import {
  HEALTH_STATUS,
  CIRCUIT_BREAKER_STATES,
  CIRCUIT_BREAKER_HEALTH_MAP,
} from '@/lib/config/health-status';

interface IntegrationStatus {
  service: string;
  status: (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
  state?: (typeof CIRCUIT_BREAKER_STATES)[keyof typeof CIRCUIT_BREAKER_STATES];
  configured: boolean;
  lastChecked: string;
}

interface IntegrationsHealthResponse {
  status: (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
  timestamp: string;
  version: string;
  integrations: IntegrationStatus[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
  rateLimits: {
    servicesTracked: number;
    services: Array<{
      service: string;
      remaining: number;
      limit: number;
      approaching: boolean;
    }>;
  };
}

function mapCircuitBreakerStateToHealth(
  state: (typeof CIRCUIT_BREAKER_STATES)[keyof typeof CIRCUIT_BREAKER_STATES]
): (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS] {
  return CIRCUIT_BREAKER_HEALTH_MAP[state] || HEALTH_STATUS.UNHEALTHY;
}

function determineOverallStatus(summary: {
  unhealthy: number;
  degraded: number;
  total: number;
}): (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS] {
  if (summary.unhealthy > 0) return HEALTH_STATUS.UNHEALTHY;
  if (summary.degraded > 0) return HEALTH_STATUS.DEGRADED;
  return HEALTH_STATUS.HEALTHY;
}

async function handleGet(context: ApiContext): Promise<Response> {
  const { rateLimit } = context;
  const timestamp = new Date().toISOString();
  const integrations: IntegrationStatus[] = [];

  const circuitBreakerStatuses = circuitBreakerManager.getAllStatuses();

  for (const [service, status] of Object.entries(circuitBreakerStatuses)) {
    integrations.push({
      service,
      status: mapCircuitBreakerStateToHealth(status.state),
      state: status.state,
      configured: true,
      lastChecked: timestamp,
    });
  }

  const connectorHealth = await exportManager.getConnectorsHealth();
  const existingServices = new Set(integrations.map((i) => i.service));

  for (const [name, info] of Object.entries(connectorHealth)) {
    if (existingServices.has(name)) continue;

    integrations.push({
      service: name,
      status: info.error
        ? HEALTH_STATUS.UNHEALTHY
        : info.configured
          ? HEALTH_STATUS.HEALTHY
          : HEALTH_STATUS.UNKNOWN,
      configured: info.configured,
      lastChecked: info.lastChecked,
    });
  }

  const summary = {
    total: integrations.length,
    healthy: integrations.filter((i) => i.status === HEALTH_STATUS.HEALTHY)
      .length,
    degraded: integrations.filter((i) => i.status === HEALTH_STATUS.DEGRADED)
      .length,
    unhealthy: integrations.filter((i) => i.status === HEALTH_STATUS.UNHEALTHY)
      .length,
    unknown: integrations.filter((i) => i.status === HEALTH_STATUS.UNKNOWN)
      .length,
  };

  const overallStatus = determineOverallStatus(summary);

  // Get external rate limit stats
  const rateLimitTracker = getExternalRateLimitTracker();
  const rateLimitStats = rateLimitTracker.getStats();
  const rateLimits = {
    servicesTracked: rateLimitStats.servicesTracked,
    services: rateLimitStats.services.map((s) => ({
      ...s,
      approaching:
        s.remaining / s.limit <= EXTERNAL_RATE_LIMIT_CONFIG.THROTTLE_THRESHOLD,
    })),
  };

  const response: IntegrationsHealthResponse = {
    status: overallStatus,
    timestamp,
    version: APP_CONFIG.VERSION,
    integrations,
    summary,
    rateLimits,
  };

  const statusCode =
    overallStatus === HEALTH_STATUS.UNHEALTHY
      ? STATUS_CODES.SERVICE_UNAVAILABLE
      : STATUS_CODES.OK;

  return standardSuccessResponse(
    response,
    context.requestId,
    statusCode,
    rateLimit
  );
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
  cacheTtlSeconds: API_CACHE_CONFIG.HEALTH_TTL_SECONDS,
  cacheScope: 'public',
});
