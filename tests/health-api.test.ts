import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';
import { buildApiUrl } from './config/test-config';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  // Set all required env vars for health check
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.COST_LIMIT_DAILY = '100';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
});

afterAll(() => {
  process.env = originalEnv;
});

describe('/api/health', () => {
  describe('GET', () => {
    it('should return healthy status when all required env vars are set', async () => {
      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status', 'healthy');
      expect(data.data).toHaveProperty('environment');
      expect(data.data).toHaveProperty('checks');
      expect(data.data).toHaveProperty('summary');
      expect(data.data.summary).toHaveProperty('requiredVarsSet');
      expect(data.data.summary).toHaveProperty('totalRequiredVars');
      expect(data.data.summary).toHaveProperty('hasAIProvider');
    });

    it('should include request ID in response headers', async () => {
      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.headers.get('X-Request-ID')).toBeTruthy();
    });

    it('should include rate limit headers', async () => {
      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should include API version header', async () => {
      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.headers.get('X-API-Version')).toBeTruthy();
    });

    it('should include response time header', async () => {
      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });

      const responseTime = response.headers.get('X-Response-Time');
      expect(responseTime).toBeTruthy();
      expect(responseTime).toMatch(/^\d+ms$/);
    });

    it('should return unhealthy status when required env vars are missing', async () => {
      // Remove required env vars
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status', 'unhealthy');
      expect(data.data).toHaveProperty('error');
    });

    it('should return warning status when no AI provider is configured', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.COST_LIMIT_DAILY = '100';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status', 'warning');
      expect(data.data).toHaveProperty('warning', 'No AI provider configured');
    });

    it('should include Cloudflare information when available', async () => {
      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
        headers: {
          'CF-Ray': 'test-ray-id',
          'CF-IPCountry': 'US',
        },
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('cloudflare');
      expect(data.data.cloudflare).toHaveProperty('isCloudflare');
      expect(data.data.cloudflare).toHaveProperty('rayId');
    });

    it('should have correct response structure', async () => {
      const request = new NextRequest(buildApiUrl('/health'), {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('requestId');
      expect(data).toHaveProperty('timestamp');

      // Verify data structure
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('environment');
      expect(data.data).toHaveProperty('checks');
      expect(data.data).toHaveProperty('summary');

      // Verify summary structure
      expect(data.data.summary).toHaveProperty('requiredVarsSet');
      expect(data.data.summary).toHaveProperty('totalRequiredVars');
      expect(data.data.summary).toHaveProperty('hasAIProvider');
      expect(data.data.summary).toHaveProperty('environment');
    });
  });
});
