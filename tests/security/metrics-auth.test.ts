import { NextRequest } from 'next/server';
import { GET } from '@/app/api/metrics/route';

// Mock the dependencies
jest.mock('@/lib/metrics', () => ({
  register: {
    metrics: jest.fn().mockResolvedValue('test_metric 1.0'),
    contentType: 'text/plain',
  },
  httpRequestDuration: { observe: jest.fn() },
  httpRequestErrors: { inc: jest.fn() },
  httpRequestTotal: { inc: jest.fn() },
}));

describe('Metrics API Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('FIX VERIFICATION: should NOT return metrics when ADMIN_API_KEY is NOT set', async () => {
    // In production, if ADMIN_API_KEY is missing, it should FAIL CLOSED.
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/metrics', {
      method: 'GET',
    });

    const response = await GET(request);

    // Should be 401 Unauthorized
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });

  it('should require authentication when ADMIN_API_KEY IS set', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_API_KEY = 'super-secret-key';

    const request = new NextRequest('http://localhost:3000/api/metrics', {
      method: 'GET',
      headers: {
        // No authorization header
      },
    });

    const response = await GET(request);

    // Should be 401 Unauthorized
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });
});
