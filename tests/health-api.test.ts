import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';
import { GET as readyHandler } from '@/app/api/health/ready/route';
import { GET as liveHandler } from '@/app/api/health/live/route';
import { buildApiUrl, BASE_URL } from './config/test-config';

// Mock dependencies
jest.mock('@/lib/cloudflare', () => ({
  getCloudflareRequestInfo: jest.fn().mockReturnValue({
    isCloudflare: false,
    rayId: null,
    cacheStatus: null,
    country: null,
    isWorker: false,
  }),
  detectPlatform: jest.fn().mockReturnValue({
    isCloudflare: false,
    isVercel: false,
    isNode: true,
  }),
}));

jest.mock('@/lib/security/env-validation', () => ({
  isSensitiveVar: jest.fn().mockReturnValue(false),
}));

jest.mock('@/lib/db', () => ({
  dbService: {
    checkConnection: jest.fn().mockResolvedValue({
      client: true,
      admin: true,
    }),
  },
}));

describe('/api/health endpoints', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Set all required env vars for testing
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    process.env.COST_LIMIT_DAILY = '1000';
    process.env.NEXT_PUBLIC_APP_URL = BASE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('GET /api/health', () => {
    it('should return healthy status when all required vars are set', async () => {
      const request = new NextRequest(buildApiUrl('/health'));
      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('healthy');
      expect(data.data).toHaveProperty('environment');
      expect(data.data).toHaveProperty('checks');
      expect(data.data).toHaveProperty('summary');
      expect(data.data.summary.requiredVarsSet).toBeGreaterThan(0);
    });

    it('should return unhealthy status when required vars are missing', async () => {
      // Remove required env vars
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const request = new NextRequest(buildApiUrl('/health'));
      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.status).toBe('unhealthy');
      expect(data.data).toHaveProperty('error');
    });

    it('should include cloudflare info in response', async () => {
      const request = new NextRequest(buildApiUrl('/health'));
      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data).toHaveProperty('cloudflare');
      expect(data.data.cloudflare).toHaveProperty('isCloudflare');
      expect(data.data.cloudflare).toHaveProperty('rayId');
    });

    it('should include summary with env var counts', async () => {
      const request = new NextRequest(buildApiUrl('/health'));
      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data.data.summary).toHaveProperty('requiredVarsSet');
      expect(data.data.summary).toHaveProperty('totalRequiredVars');
      expect(data.data.summary).toHaveProperty('hasAIProvider');
      expect(data.data.summary).toHaveProperty('environment');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return ready status when database is healthy', async () => {
      const request = new NextRequest(buildApiUrl('/health/ready'));
      const response = await readyHandler(request, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('status');
      expect(data.data.status).toBe('ready');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return ok status', async () => {
      const request = new NextRequest(buildApiUrl('/health/live'));
      const response = await liveHandler(request, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('status');
      expect(data.data.status).toBe('ok');
    });
  });
});
