import { NextRequest } from 'next/server';
import { buildApiUrl, TEST_CONFIG } from '../config/test-config';

// Mock the dependencies BEFORE importing the route
jest.mock('@/lib/config', () => ({
  APP_CONFIG: {
    HEALTH_STATUS: {
      HEALTHY: 'healthy',
      WARNING: 'warning',
      UNHEALTHY: 'unhealthy',
    },
    ENV_VARS: {
      REQUIRED: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
      AI_PROVIDERS: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
    },
  },
  ENV_ACCESSORS: {
    PLATFORM: {
      NODE_ENV: () => process.env.NODE_ENV || 'test',
    },
  },
}));

jest.mock('@/lib/config/constants', () => ({
  STATUS_CODES: { OK: 200 },
  API_CACHE_CONFIG: { HEALTH_TTL_SECONDS: 60 },
}));

jest.mock('@/lib/cloudflare', () => ({
  getCloudflareRequestInfo: jest.fn().mockReturnValue({
    isCloudflare: false,
    rayId: null,
    cacheStatus: null,
    country: null,
    isWorker: false,
  }),
}));

jest.mock('@/lib/security/env-validation', () => ({
  isSensitiveVar: jest.fn().mockReturnValue(false),
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    HEALTH: {
      MISSING_ENV_VARS: 'Missing required environment variables',
      NO_AI_PROVIDER: 'No AI provider configured',
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
  withApiHandler: jest.fn().mockImplementation((handler) => {
    return async (
      request: NextRequest,
      context: { params: Promise<Record<string, string>> }
    ) => {
      const rateLimit = { remaining: 100, reset: Date.now() + 60000 };
      return handler({ request, rateLimit, requestId: 'test-request-id' });
    };
  }),
}));

// Import the route AFTER mocking
import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // Set required env vars for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe('GET', () => {
    it('should return healthy status when all required vars are set', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.HEALTH),
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('healthy');
      expect(data.data.summary.hasAIProvider).toBe(true);
      expect(data.data.summary.requiredVarsSet).toBe(2);
      expect(data.data.summary.totalRequiredVars).toBe(2);
    });

    it('should return warning when no AI provider is configured', async () => {
      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.HEALTH),
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('warning');
      expect(data.data.warning).toBe('No AI provider configured');
      expect(data.data.summary.hasAIProvider).toBe(false);
    });

    it('should return unhealthy when required vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.HEALTH),
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('unhealthy');
      expect(data.data.error).toBe('Missing required environment variables');
      expect(data.data.summary.requiredVarsSet).toBe(0);
    });

    it('should include cloudflare info in response', async () => {
      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.HEALTH),
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.cloudflare).toBeDefined();
      expect(data.data.cloudflare.isCloudflare).toBe(false);
      expect(data.data.cloudflare.isWorker).toBe(false);
    });

    it('should include environment in response', async () => {
      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.HEALTH),
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.environment).toBeDefined();
    });
  });
});
