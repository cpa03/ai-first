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
    getTaskWithOwnership: jest.fn().mockResolvedValue({
      id: 'task-123',
      title: 'Test Task',
      status: 'todo',
      idea: { user_id: 'user-123' },
    }),
    updateTask: jest
      .fn()
      .mockResolvedValue({
        id: 'task-123',
        status: 'completed',
        completion_percentage: 100,
      }),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
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
    STATUSES: {
      COMPLETED: 'completed',
      IN_PROGRESS: 'in_progress',
      TODO: 'todo',
    },
    COMPLETION: {
      PERCENTAGES: { COMPLETED: 100, IN_PROGRESS: 50, NOT_STARTED: 0 },
    },
  },
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

jest.mock('@/lib/config/modular-constants', () => ({
  RESOURCE_TYPES: { TASK: 'task' },
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    NOT_FOUND: { TASK: 'Task not found' },
    VALIDATION: {
      INVALID_STATUS_WITH_VALUES: (v: string[]) =>
        `Invalid status. Valid: ${v.join(', ')}`,
    },
    ROUTE_VALIDATION: {
      TASK_ID_REQUIRED: 'Task ID is required',
      INVALID_JSON_BODY: 'Invalid JSON body',
      STATUS_REQUIRED: 'Status is required',
    },
    INTERNAL: { UPDATE_TASK_STATUS_FAILED: 'Failed to update task status' },
  },
}));

import { PATCH } from '@/app/api/tasks/[id]/status/route';
import { dbService } from '@/lib/db';

const mockDbService = dbService as jest.Mocked<typeof dbService>;

function createPatchRequest(body?: object) {
  return new NextRequest('http://localhost:3000/api/tasks/task-123/status', {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  });
}

describe('/api/tasks/[id]/status', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates task status to completed', async () => {
    const req = createPatchRequest({ status: 'completed' });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'task-123' }),
    } as RouteContext);
    expect(res.status).toBe(200);
    expect(mockDbService.updateTask).toHaveBeenCalledWith('task-123', {
      status: 'completed',
      completion_percentage: 100,
    });
  });

  it('updates task status to in_progress', async () => {
    const req = createPatchRequest({ status: 'in_progress' });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'task-123' }),
    } as RouteContext);
    expect(res.status).toBe(200);
    expect(mockDbService.updateTask).toHaveBeenCalledWith('task-123', {
      status: 'in_progress',
      completion_percentage: 50,
    });
  });

  it('updates task status to todo', async () => {
    const req = createPatchRequest({ status: 'todo' });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'task-123' }),
    } as RouteContext);
    expect(res.status).toBe(200);
    expect(mockDbService.updateTask).toHaveBeenCalledWith('task-123', {
      status: 'todo',
      completion_percentage: 0,
    });
  });

  it('rejects missing status field', async () => {
    const req = createPatchRequest({});
    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'task-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('rejects invalid status', async () => {
    const req = createPatchRequest({ status: 'invalid' });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'task-123' }),
    } as RouteContext);
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent task', async () => {
    mockDbService.getTaskWithOwnership.mockResolvedValueOnce(null);
    const req = createPatchRequest({ status: 'completed' });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    } as RouteContext);
    expect(res.status).toBe(404);
  });
});
