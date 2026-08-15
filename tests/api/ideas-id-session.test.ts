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

jest.mock('@/lib/db', () => ({
  dbService: {
    getIdea: jest
      .fn()
      .mockResolvedValue({
        id: 'idea-123',
        user_id: 'user-123',
        title: 'Test Idea',
      }),
    getIdeaSession: jest.fn().mockResolvedValue({
      id: 'session-123',
      idea_id: 'idea-123',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
    }),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
}));

jest.mock('@/lib/validation', () => ({
  validateIdeaId: jest.fn((id: string) => ({
    valid: id.length > 0,
    errors:
      id.length === 0 ? [{ field: 'ideaId', message: 'Invalid idea ID' }] : [],
  })),
}));

jest.mock('@/lib/config/constants', () => ({
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
  },
  PLATFORM_ENV_VARS: {
    VERCEL: { VERCEL: 'VERCEL' },
    CLOUDFLARE: { CF_WORKER: 'CF_WORKER', CLOUDFLARE: 'CLOUDFLARE' },
  },
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    NOT_FOUND: { IDEA: 'Idea not found' },
  },
}));

import { GET } from '@/app/api/ideas/[id]/session/route';
import { dbService } from '@/lib/db';

const mockDbService = dbService as jest.Mocked<typeof dbService>;

describe('/api/ideas/[id]/session', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns session for authenticated idea owner', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/ideas/idea-123/session'
    );
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe('session-123');
    expect(data.data.status).toBe('active');
  });

  it('returns 404 for non-existent idea', async () => {
    mockDbService.getIdea.mockResolvedValueOnce(null);
    const req = new NextRequest(
      'http://localhost:3000/api/ideas/nonexistent/session'
    );
    const res = await GET(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    } as RouteContext);
    expect(res.status).toBe(404);
  });
});
