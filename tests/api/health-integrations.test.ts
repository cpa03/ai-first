import { NextRequest } from 'next/server';
import { buildApiUrl } from '../config/test-config';

jest.mock('@/lib/resilience', () => ({
  circuitBreakerManager: {
    getAllStatuses: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('@/lib/export-connectors', () => ({
  exportManager: {
    getConnectorsHealth: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@/lib/config', () => ({
  APP_CONFIG: { VERSION: '0.1.1' },
  EXTERNAL_RATE_LIMIT_CONFIG: { THROTTLE_THRESHOLD: 0.2 },
}));

jest.mock('@/lib/config/constants', () => ({
  STATUS_CODES: { OK: 200, SERVICE_UNAVAILABLE: 503 },
  API_CACHE_CONFIG: { HEALTH_TTL_SECONDS: 30 },
}));

jest.mock('@/lib/external-rate-limit', () => ({
  getExternalRateLimitTracker: jest.fn().mockReturnValue({
    getStats: jest.fn().mockReturnValue({
      servicesTracked: 0,
      services: [],
    }),
  }),
}));

jest.mock('@/lib/api-handler', () => ({
  standardSuccessResponse: jest
    .fn()
    .mockImplementation((data, requestId, status, rateLimit) => {
      return new Response(
        JSON.stringify({
          success: true,
          data,
          requestId,
          timestamp: new Date().toISOString(),
        }),
        {
          status: status || 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }),
  withApiHandler: jest.fn().mockImplementation((handler, options) => {
    return async (
      request: NextRequest,
      context: { params: Promise<Record<string, string>> }
    ) => {
      const rateLimit = { remaining: 100, reset: Date.now() + 60000 };
      return handler({ request, rateLimit, requestId: 'test-request-id' });
    };
  }),
}));

import { GET } from '@/app/api/health/integrations/route';

describe('/api/health/integrations', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return integrations health status', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/integrations'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBeDefined();
      expect(data.data.timestamp).toBeDefined();
      expect(data.data.version).toBeDefined();
      expect(data.data.integrations).toBeDefined();
      expect(Array.isArray(data.data.integrations)).toBe(true);
      expect(data.data.summary).toBeDefined();
      expect(data.data.summary.total).toBeDefined();
      expect(data.data.summary.healthy).toBeDefined();
      expect(data.data.summary.degraded).toBeDefined();
      expect(data.data.summary.unhealthy).toBeDefined();
      expect(data.data.summary.unknown).toBeDefined();
      expect(data.data.rateLimits).toBeDefined();
    });

    it('should include circuit breaker integrations', async () => {
      const { circuitBreakerManager } = require('@/lib/resilience');
      circuitBreakerManager.getAllStatuses.mockReturnValue({
        'test-service': {
          state: 'closed',
          failures: 0,
        },
      });

      const request = new NextRequest(buildApiUrl('/api/health/integrations'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.integrations.length).toBeGreaterThan(0);
      expect(data.data.integrations[0].service).toBe('test-service');
      expect(data.data.integrations[0].status).toBe('healthy');
      expect(data.data.integrations[0].state).toBe('closed');
    });

    it('should include export connector integrations', async () => {
      const { exportManager } = require('@/lib/export-connectors');
      exportManager.getConnectorsHealth.mockResolvedValue({
        notion: {
          configured: true,
          lastChecked: new Date().toISOString(),
        },
      });

      const request = new NextRequest(buildApiUrl('/api/health/integrations'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.integrations.length).toBeGreaterThan(0);
      const notionIntegration = data.data.integrations.find(
        (i: { service: string }) => i.service === 'notion'
      );
      expect(notionIntegration).toBeDefined();
      expect(notionIntegration.status).toBe('healthy');
    });
  });
});
