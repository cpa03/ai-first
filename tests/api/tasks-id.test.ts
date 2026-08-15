import { NextRequest } from 'next/server';

// Helper type for route handler params (Next.js 15+ async params)
type RouteContext = { params: Promise<Record<string, string>> };

// Mock api-handler FIRST to avoid complex dependency chain
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
        const status = err.statusCode || err.status || 500;
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
      deliverable_id: 'del-123',
      estimate: 5,
      completion_percentage: 0,
      priority_score: 0,
      complexity_score: 0,
      risk_level: 'low',
      tags: null,
      custom_fields: null,
      milestone_id: null,
      created_at: '2026-01-01T00:00:00Z',
      idea: { user_id: 'user-123' },
    }),
    updateTask: jest.fn().mockResolvedValue({
      id: 'task-123',
      title: 'Updated Task',
      status: 'in_progress',
    }),
    softDeleteTask: jest.fn().mockResolvedValue(undefined),
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
  sanitizeObject: jest.fn((val: unknown) => val),
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
    COMPLETION: { MIN: 0, MAX: 100 },
    STATUSES: {
      COMPLETED: 'completed',
      IN_PROGRESS: 'in_progress',
      TODO: 'todo',
    },
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
      INVALID_RISK_LEVEL_WITH_VALUES: (v: string[]) =>
        `Invalid risk level. Valid: ${v.join(', ')}`,
      INVALID_ESTIMATE: 'Invalid estimate',
      COMPLETION_PERCENTAGE_RANGE:
        'Completion percentage must be between 0 and 100',
    },
    ROUTE_VALIDATION: {
      TASK_ID_REQUIRED: 'Task ID is required',
      INVALID_JSON_BODY: 'Invalid JSON body',
    },
    ROUTE_SUCCESS: { TASK_DELETED: 'Task deleted' },
    INTERNAL: {
      UPDATE_TASK_FAILED: 'Failed to update task',
      DELETE_TASK_FAILED: 'Failed to delete task',
      FETCH_TASK_FAILED: 'Failed to fetch task',
    },
  },
}));

import { GET, PUT, DELETE } from '@/app/api/tasks/[id]/route';
import { dbService } from '@/lib/db';

const mockDbService = dbService as jest.Mocked<typeof dbService>;

function createRequest(method: string, body?: object) {
  return new NextRequest('http://localhost:3000/api/tasks/task-123', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  });
}

describe('/api/tasks/[id]', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET', () => {
    it('returns task for authenticated owner', async () => {
      const req = createRequest('GET');
      const res = await GET(req, {
        params: Promise.resolve({ id: 'task-123' }),
      } as RouteContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.task.id).toBe('task-123');
    });

    it('returns 404 for non-existent task', async () => {
      mockDbService.getTaskWithOwnership.mockResolvedValueOnce(null);
      const req = createRequest('GET');
      const res = await GET(req, {
        params: Promise.resolve({ id: 'nonexistent' }),
      } as RouteContext);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('updates task with valid data', async () => {
      const req = createRequest('PUT', {
        title: 'Updated Task',
        status: 'in_progress',
      });
      const res = await PUT(req, {
        params: Promise.resolve({ id: 'task-123' }),
      } as RouteContext);
      expect(res.status).toBe(200);
      expect(mockDbService.updateTask).toHaveBeenCalled();
    });

    it('rejects invalid status', async () => {
      const req = createRequest('PUT', { status: 'invalid_status' });
      const res = await PUT(req, {
        params: Promise.resolve({ id: 'task-123' }),
      } as RouteContext);
      expect(res.status).toBe(400);
    });

    it('rejects invalid risk_level', async () => {
      const req = createRequest('PUT', { risk_level: 'extreme' });
      const res = await PUT(req, {
        params: Promise.resolve({ id: 'task-123' }),
      } as RouteContext);
      expect(res.status).toBe(400);
    });

    it('rejects negative estimate', async () => {
      const req = createRequest('PUT', { estimate: -5 });
      const res = await PUT(req, {
        params: Promise.resolve({ id: 'task-123' }),
      } as RouteContext);
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent task', async () => {
      mockDbService.getTaskWithOwnership.mockResolvedValueOnce(null);
      const req = createRequest('PUT', { title: 'Updated' });
      const res = await PUT(req, {
        params: Promise.resolve({ id: 'nonexistent' }),
      } as RouteContext);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('soft-deletes task for authenticated owner', async () => {
      const req = createRequest('DELETE');
      const res = await DELETE(req, {
        params: Promise.resolve({ id: 'task-123' }),
      } as RouteContext);
      expect(res.status).toBe(200);
      expect(mockDbService.softDeleteTask).toHaveBeenCalledWith('task-123');
    });

    it('returns 404 for non-existent task', async () => {
      mockDbService.getTaskWithOwnership.mockResolvedValueOnce(null);
      const req = createRequest('DELETE');
      const res = await DELETE(req, {
        params: Promise.resolve({ id: 'nonexistent' }),
      } as RouteContext);
      expect(res.status).toBe(404);
    });
  });
});
