import { NextRequest } from 'next/server';

jest.mock('@/lib/api-handler', () => ({
  withApiHandler: jest.fn().mockImplementation((handler) => {
    return async (request: NextRequest) => {
      const rateLimit = {
        remaining: 100,
        reset: Date.now() + 60000,
        limit: 100,
      };
      return handler({
        request,
        rateLimit,
        requestId: 'test-request-id',
        params: {},
      });
    };
  }),
}));

jest.mock('@/lib/metrics', () => ({
  register: {
    metrics: jest
      .fn()
      .mockResolvedValue('# HELP test_metric Test metric\ntest_metric 1\n'),
    contentType: 'text/plain; version=0.0.4; charset=utf-8',
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAdminAuth: jest.fn().mockResolvedValue({ id: 'admin-123' }),
}));

jest.mock('@/lib/config/http', () => ({
  STATUS_CODES: { OK: 200, INTERNAL_ERROR: 500 },
  HTTP_HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    X_REQUEST_ID: 'X-Request-Id',
    X_RATELIMIT_LIMIT: 'X-RateLimit-Limit',
    X_RATELIMIT_REMAINING: 'X-RateLimit-Remaining',
    X_RATELIMIT_RESET: 'X-RateLimit-Reset',
  },
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    METRICS: { FAILED_TO_GENERATE: 'Failed to generate metrics' },
  },
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

import { GET } from '@/app/api/metrics/route';
import { requireAdminAuth } from '@/lib/auth';

const mockRequireAdminAuth = requireAdminAuth as jest.MockedFunction<
  typeof requireAdminAuth
>;

describe('/api/metrics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns metrics for admin user', async () => {
    const req = new NextRequest('http://localhost:3000/api/metrics');
    const res = await GET(req, {} as never);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('test_metric');
    expect(mockRequireAdminAuth).toHaveBeenCalled();
  });

  it('returns correct content type', async () => {
    const req = new NextRequest('http://localhost:3000/api/metrics');
    const res = await GET(req, {} as never);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });
});
