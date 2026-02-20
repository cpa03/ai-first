import {
  ApiContext,
  withApiHandler,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { circuitBreakerManager } from '@/lib/resilience';
import { exportManager } from '@/lib/export-connectors';
import { APP_CONFIG } from '@/lib/config';
import { STATUS_CODES, API_CACHE_CONFIG } from '@/lib/config/constants';

interface IntegrationStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  state?: 'closed' | 'open' | 'half-open';
  configured: boolean;
  lastChecked: string;
}

interface IntegrationsHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
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
}

function mapCircuitBreakerStateToHealth(
  state: 'closed' | 'open' | 'half-open'
): 'healthy' | 'degraded' | 'unhealthy' {
  if (state === 'closed') return 'healthy';
  if (state === 'half-open') return 'degraded';
  return 'unhealthy';
}

function determineOverallStatus(summary: {
  unhealthy: number;
  degraded: number;
  total: number;
}): 'healthy' | 'degraded' | 'unhealthy' {
  if (summary.unhealthy > 0) return 'unhealthy';
  if (summary.degraded > 0) return 'degraded';
  return 'healthy';
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
        ? 'unhealthy'
        : info.configured
          ? 'healthy'
          : 'unknown',
      configured: info.configured,
      lastChecked: info.lastChecked,
    });
  }

  const summary = {
    total: integrations.length,
    healthy: integrations.filter((i) => i.status === 'healthy').length,
    degraded: integrations.filter((i) => i.status === 'degraded').length,
    unhealthy: integrations.filter((i) => i.status === 'unhealthy').length,
    unknown: integrations.filter((i) => i.status === 'unknown').length,
  };

  const overallStatus = determineOverallStatus(summary);

  const response: IntegrationsHealthResponse = {
    status: overallStatus,
    timestamp,
    version: APP_CONFIG.VERSION,
    integrations,
    summary,
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : STATUS_CODES.OK;

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
