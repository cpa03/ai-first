import { NextRequest } from 'next/server';

type RouteContext = { params: Promise<Record<string, string>> };

jest.mock('@/lib/api-handler', () => ({
  standardSuccessResponse: jest
    .fn()
    .mockImplementation((data, requestId, status) => {
      return new Response(JSON.stringify({ success: true, data, requestId }), {
        status: status || 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  withApiHandler: jest.fn().mockImplementation((handler) => {
    return async (
      request: NextRequest,
      context: { params: Promise<Record<string, string>> }
    ) => {
      const params = await context.params;
      const rateLimit = {
        remaining: 100,
        reset: Date.now() + 60000,
        limit: 100,
      };
      try {
        return await handler({
          request,
          params,
          rateLimit,
          requestId: 'test-request-id',
        });
      } catch (error: unknown) {
        const err = error as {
          statusCode?: number;
          status?: number;
          message?: string;
        };
        const status = err.statusCode || err.status || 400;
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status, headers: { 'Content-Type': 'application/json' } }
        );
      }
    };
  }),
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
}));

jest.mock('@/lib/similarity-service', () => ({
  findSimilarIdeas: jest
    .fn()
    .mockResolvedValue([
      { id: 'idea-456', title: 'Similar Idea', similarity: 0.85 },
    ]),
}));

jest.mock('@/lib/config/app', () => ({
  APP_CONFIG: {
    PAGINATION: { MIN_LIMIT: 1, MAX_LIMIT: 100 },
  },
}));

jest.mock('@/lib/config/similarity-config', () => ({
  SIMILARITY_CONFIG: {
    DEFAULT_LIMIT: 5,
    DEFAULT_THRESHOLD: 0.7,
    MIN_THRESHOLD: 0,
    MAX_THRESHOLD: 1,
  },
}));

jest.mock('@/lib/config/http', () => ({
  STATUS_CODES: { OK: 200, BAD_REQUEST: 400 },
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    VALIDATION: { IDEA_ID_REQUIRED: 'Idea ID is required' },
    ROUTE_VALIDATION: {
      INVALID_LIMIT: 'Invalid limit',
      INVALID_THRESHOLD: 'Invalid threshold',
    },
  },
}));

import { GET } from '@/app/api/ideas/[id]/similar/route';
import { findSimilarIdeas } from '@/lib/similarity-service';

const mockFindSimilarIdeas = findSimilarIdeas as jest.MockedFunction<
  typeof findSimilarIdeas
>;

function createGetRequest(params?: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/ideas/idea-123/similar');
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url.toString(), { method: 'GET' });
}

describe('/api/ideas/[id]/similar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns similar ideas with default params', async () => {
    const req = createGetRequest();
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.similarIdeas).toHaveLength(1);
    expect(data.data.count).toBe(1);
    expect(mockFindSimilarIdeas).toHaveBeenCalledWith(
      'idea-123',
      'user-123',
      5,
      0.7
    );
  });

  it('respects custom limit and threshold', async () => {
    const req = createGetRequest({ limit: '10', threshold: '0.5' });
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(200);
    expect(mockFindSimilarIdeas).toHaveBeenCalledWith(
      'idea-123',
      'user-123',
      10,
      0.5
    );
  });

  it('rejects limit below minimum', async () => {
    const req = createGetRequest({ limit: '0' });
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects limit above maximum', async () => {
    const req = createGetRequest({ limit: '200' });
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects non-numeric limit', async () => {
    const req = createGetRequest({ limit: 'abc' });
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects threshold below minimum', async () => {
    const req = createGetRequest({ threshold: '-0.5' });
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects threshold above maximum', async () => {
    const req = createGetRequest({ threshold: '1.5' });
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });
});
