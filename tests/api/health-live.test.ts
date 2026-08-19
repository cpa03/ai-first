import { NextRequest } from 'next/server';
import { buildApiUrl } from '../config/test-config';

jest.mock('@/lib/config/constants', () => ({
  STATUS_CODES: { OK: 200 },
  API_CACHE_CONFIG: { LIVE_TTL_SECONDS: 10 },
}));

jest.mock('@/lib/config/env-keys', () => ({
  ENV_ACCESSORS: {
    PLATFORM: {
      NODE_ENV: () => process.env.NODE_ENV || 'test',
    },
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

import { GET } from '@/app/api/health/live/route';

describe('/api/health/live', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return liveness status', async () => {
      const request = new NextRequest(buildApiUrl('/api/health/live'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('ok');
      expect(data.data.service).toBe('liveness');
      expect(data.data.timestamp).toBeDefined();
      expect(data.data.environment).toBeDefined();
    });
  });
});
