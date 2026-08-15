import { NextRequest } from 'next/server';

type RouteContext = { params: Promise<Record<string, string>> };

jest.mock('@/lib/api-handler', () => ({
  standardSuccessResponse: jest
    .fn()
    .mockImplementation((data, requestId, status) => {
      return new Response(JSON.stringify({ success: true, data, requestId }), {
        status: status || 201,
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
    getDeliverableWithIdea: jest.fn().mockResolvedValue({
      id: 'del-123',
      idea: { user_id: 'user-123' },
    }),
    createTask: jest.fn().mockResolvedValue({
      id: 'task-new',
      title: 'New Task',
      status: 'todo',
      deliverable_id: 'del-123',
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
  sanitizeHtml: jest.fn((val: string) => val),
}));

jest.mock('@/lib/config', () => ({
  TASK_CONFIG: {
    VALID_STATUSES: [
      'todo',
      'in_progress',
      'completed',
      'blocked',
      'cancelled',
    ],
    VALID_RISK_LEVELS: ['low', 'medium', 'high', 'critical'],
    STATUSES: { TODO: 'todo' },
    DEFAULTS: {
      ESTIMATE: 1,
      COMPLETION_PERCENTAGE: 0,
      PRIORITY_SCORE: 0,
      COMPLEXITY_SCORE: 0,
      RISK_LEVEL: 'low',
    },
  },
}));

jest.mock('@/lib/config/constants', () => ({
  TASK_VALIDATION: { MAX_TITLE_LENGTH: 200 },
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

jest.mock('@/lib/config/modular-constants', () => ({
  RESOURCE_TYPES: { DELIVERABLE: 'deliverable' },
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    NOT_FOUND: { DELIVERABLE: 'Deliverable not found' },
    VALIDATION: {
      INVALID_STATUS_WITH_VALUES: (v: string[]) =>
        `Invalid status. Valid: ${v.join(', ')}`,
      INVALID_RISK_LEVEL_WITH_VALUES: (v: string[]) =>
        `Invalid risk level. Valid: ${v.join(', ')}`,
      INVALID_ESTIMATE: 'Invalid estimate',
    },
    ROUTE_VALIDATION: {
      DELIVERABLE_ID_REQUIRED: 'Deliverable ID is required',
      INVALID_JSON_BODY: 'Invalid JSON body',
      TITLE_REQUIRED: 'Title is required',
    },
    ROUTE_SUCCESS: { TASK_CREATED: 'Task created' },
    INTERNAL: { CREATE_TASK_FAILED: 'Failed to create task' },
  },
}));

import { POST } from '@/app/api/deliverables/[id]/tasks/route';
import { dbService } from '@/lib/db';

const mockDbService = dbService as jest.Mocked<typeof dbService>;

function createPostRequest(body?: object) {
  return new NextRequest(
    'http://localhost:3000/api/deliverables/del-123/tasks',
    {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'content-type': 'application/json' },
    }
  );
}

describe('/api/deliverables/[id]/tasks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a task with valid data', async () => {
    const req = createPostRequest({ title: 'New Task', description: 'A task' });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(201);
    expect(mockDbService.createTask).toHaveBeenCalled();
  });

  it('creates a task with defaults when optional fields omitted', async () => {
    const req = createPostRequest({ title: 'Minimal Task' });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(201);
    const call = mockDbService.createTask.mock.calls[0][0];
    expect(call.status).toBe('todo');
    expect(call.estimate).toBe(1);
    expect(call.risk_level).toBe('low');
  });

  it('rejects missing title', async () => {
    const req = createPostRequest({ description: 'No title' });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects empty title', async () => {
    const req = createPostRequest({ title: '   ' });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects title exceeding max length', async () => {
    const req = createPostRequest({ title: 'x'.repeat(201) });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects invalid status', async () => {
    const req = createPostRequest({ title: 'Task', status: 'invalid' });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects invalid risk_level', async () => {
    const req = createPostRequest({ title: 'Task', risk_level: 'extreme' });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects negative estimate', async () => {
    const req = createPostRequest({ title: 'Task', estimate: -1 });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'del-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent deliverable', async () => {
    mockDbService.getDeliverableWithIdea.mockResolvedValueOnce(null);
    const req = createPostRequest({ title: 'Task' });
    const res = await POST(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    } as RouteContext);
    expect(res.status).toBe(404);
  });
});
