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
    getIdea: jest.fn().mockResolvedValue({
      id: 'idea-123',
      user_id: 'user-123',
      title: 'Test Idea',
    }),
    getIdeaDeliverablesWithTasks: jest.fn().mockResolvedValue([
      {
        id: 'del-1',
        title: 'Deliverable 1',
        tasks: [
          { id: 'task-1', title: 'Task 1', status: 'completed', estimate: 5 },
          { id: 'task-2', title: 'Task 2', status: 'todo', estimate: 3 },
        ],
      },
    ]),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
}));

jest.mock('@/lib/config', () => ({
  IDEA_STATUS_CONFIG: { TYPES: { COMPLETED: 'completed' } },
  PRECISION_CONFIG: { HOURS_MULTIPLIER: 100 },
  PROGRESS_PERCENTAGE: { MAX: 100, MIN: 0, COMPLETE: 100, ZERO: 0 },
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
    VALIDATION: { IDEA_ID_REQUIRED: 'Idea ID is required' },
    DELIVERABLE: { NO_DELIVERABLES_FOUND: 'No deliverables found' },
    INTERNAL: { FETCH_TASKS_FAILED: 'Failed to fetch tasks' },
  },
}));

import { GET } from '@/app/api/ideas/[id]/tasks/route';
import { dbService } from '@/lib/db';

const mockDbService = dbService as jest.Mocked<typeof dbService>;

describe('/api/ideas/[id]/tasks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns deliverables with tasks and summary', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/ideas/idea-123/tasks'
    );
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.deliverables).toHaveLength(1);
    expect(data.data.summary.totalTasks).toBe(2);
    expect(data.data.summary.completedTasks).toBe(1);
    expect(data.data.summary.overallProgress).toBe(50);
  });

  it('returns 404 for non-existent idea', async () => {
    mockDbService.getIdea.mockResolvedValueOnce(null);
    const req = new NextRequest(
      'http://localhost:3000/api/ideas/nonexistent/tasks'
    );
    const res = await GET(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    } as RouteContext);
    expect(res.status).toBe(404);
  });

  it('returns 404 when no deliverables exist', async () => {
    mockDbService.getIdeaDeliverablesWithTasks.mockResolvedValueOnce([]);
    const req = new NextRequest(
      'http://localhost:3000/api/ideas/idea-123/tasks'
    );
    const res = await GET(req, {
      params: Promise.resolve({ id: 'idea-123' }),
    } as RouteContext);
    expect(res.status).toBe(404);
  });
});
