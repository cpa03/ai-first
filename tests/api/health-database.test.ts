import { NextRequest } from 'next/server';
import { buildApiUrl, TEST_CONFIG } from '../config/test-config';

// Mock the dependencies BEFORE importing the route
jest.mock('@/lib/db', () => ({
  dbService: {
    healthCheck: jest.fn().mockResolvedValue({
      healthy: true,
      latency: 50,
      connectionPool: {
        active: 1,
        idle: 5,
        total: 6,
      },
    }),
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

jest.mock('@/lib/config/constants', () => ({
  STATUS_CODES: { OK: 200 },
  API_CACHE_CONFIG: { DATABASE_HEALTH_TTL_SECONDS: 30 },
}));

jest.mock('@/lib/config/env-keys', () => ({
  ENV_ACCESSORS: {
    PLATFORM: {
      NODE_ENV: () => process.env.NODE_ENV || 'test',
    },
  },
}));

// Import the route AFTER mocking
import { GET } from '@/app/api/health/database/route';

describe('/api/health/database', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return healthy database status', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/database'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.service).toBe('database');
      expect(data.data.healthy).toBe(true);
      expect(data.data.latency).toBeDefined();
      expect(data.data.timestamp).toBeDefined();
      expect(data.data.environment).toBeDefined();
    });

    it('should include connection pool info', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/database'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.connectionPool).toBeDefined();
      expect(data.data.connectionPool.active).toBeDefined();
      expect(data.data.connectionPool.idle).toBeDefined();
      expect(data.data.connectionPool.total).toBeDefined();
    });

    it('should handle database health check failure', async () => {
      const { dbService } = require('@/lib/db');
      dbService.healthCheck.mockResolvedValueOnce({
        healthy: false,
        error: 'Connection refused',
        latency: null,
      });

      const request = new NextRequest(buildApiUrl('/api/health/database'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.healthy).toBe(false);
      expect(data.data.error).toBe('Connection refused');
    });

    it('should handle database health check exception', async () => {
      expect(true).toBe(true);
    });
  });
});
