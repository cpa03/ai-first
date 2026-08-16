import { NextRequest } from 'next/server';
import { buildApiUrl, TEST_CONFIG } from '../config/test-config';

jest.mock('@/lib/db', () => ({
  dbService: {
    healthCheck: jest.fn().mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      latency: 50,
    }),
  },
}));

jest.mock('@/lib/ai', () => ({
  aiService: {
    healthCheck: jest.fn().mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }),
  },
}));

jest.mock('@/lib/resilience', () => ({
  circuitBreakerManager: {
    getAllStatuses: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('@/lib/export-connectors', () => ({
  exportManager: {
    getConnectorsHealth: jest.fn().mockResolvedValue({}),
    validateAllConnectors: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAdminAuth: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/pii-redaction', () => ({
  redactPII: jest.fn((text) => text),
}));

jest.mock('@/lib/config/constants', () => ({
  API_CACHE_CONFIG: { DETAILED_HEALTH_TTL_SECONDS: 30 },
  HEALTH_CONFIG: {
    SCORES: { HEALTHY: 100, DEGRADED: 50, UNHEALTHY: 0 },
    RELIABILITY_WEIGHTS: {
      database: 0.3,
      ai: 0.3,
      exports: 0.2,
      circuitBreakers: 0.1,
      memory: 0.1,
    },
    RATE_LIMIT_THRESHOLDS: { WARNING: 50, CRITICAL: 20 },
  },
  MEMORY_CONFIG: {
    HEAP_WARNING_THRESHOLD: 80,
    HEAP_CRITICAL_THRESHOLD: 90,
    RSS_WARNING_MB: 500,
    RSS_CRITICAL_MB: 1000,
    EXTERNAL_WARNING_MB: 100,
    EXTERNAL_CRITICAL_MB: 200,
  },
  MEMORY_UNITS: { BYTES_PER_MB: 1024 * 1024 },
  STATUS_CODES: { OK: 200, SERVICE_UNAVAILABLE: 503 },
}));

jest.mock('@/lib/config', () => ({
  APP_CONFIG: { VERSION: '0.1.1' },
}));

jest.mock('@/lib/external-rate-limit', () => ({
  getExternalRateLimitTracker: jest.fn().mockReturnValue({
    getStats: jest.fn().mockReturnValue({
      servicesTracked: 0,
      services: [],
    }),
  }),
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    FALLBACK: { UNKNOWN_ERROR: 'Unknown error' },
  },
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

import { GET } from '@/app/api/health/detailed/route';

describe('/api/health/detailed', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return detailed health status', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/detailed'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBeDefined();
      expect(data.data.timestamp).toBeDefined();
      expect(data.data.version).toBeDefined();
      expect(data.data.uptime).toBeDefined();
      expect(data.data.reliabilityScore).toBeDefined();
      expect(data.data.checks).toBeDefined();
      expect(data.data.memory).toBeDefined();
      expect(data.data.connectors).toBeDefined();
      expect(data.data.circuitBreakers).toBeDefined();
      expect(data.data.externalRateLimits).toBeDefined();
    });

    it('should include database check', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/detailed'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.checks.database).toBeDefined();
      expect(data.data.checks.database.service).toBe('database');
      expect(data.data.checks.database.status).toBeDefined();
    });

    it('should include AI check', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/detailed'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.checks.ai).toBeDefined();
      expect(data.data.checks.ai.service).toBe('ai');
      expect(data.data.checks.ai.status).toBeDefined();
    });

    it('should include exports check', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/detailed'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.checks.exports).toBeDefined();
      expect(data.data.checks.exports.service).toBe('exports');
      expect(data.data.checks.exports.status).toBeDefined();
    });

    it('should include memory health', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/detailed'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.memory).toBeDefined();
      expect(data.data.memory.status).toBeDefined();
      expect(data.data.memory.metrics).toBeDefined();
      expect(data.data.memory.metrics.heapUsed).toBeDefined();
      expect(data.data.memory.metrics.heapTotal).toBeDefined();
      expect(data.data.memory.metrics.heapUsedPercent).toBeDefined();
    });
  });
});
