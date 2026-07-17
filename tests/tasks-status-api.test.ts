jest.mock('@/lib/validation', () => ({
  validateRequestSize: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  sanitizeHtml: jest.fn((s: string) => s),
  sanitizeObject: jest.fn((o: unknown) => o),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkUserRateLimit: jest.fn().mockReturnValue({
    userInfo: { userId: 'test-user', identifier: 'test', role: 'user' },
    info: {
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 60000).toISOString(),
    },
    allowed: true,
  }),
  rateLimitConfigs: {
    lenient: { maxRequests: 100, windowMs: 60000 },
    moderate: { maxRequests: 50, windowMs: 60000 },
    strict: { maxRequests: 20, windowMs: 60000 },
  },
  rateLimitResponse: jest.fn().mockReturnValue(null),
}));

jest.mock('@/lib/metrics', () => ({
  httpRequestDuration: {
    observe: jest.fn(),
    labels: jest.fn().mockReturnValue({ observe: jest.fn() }),
  },
  httpRequestErrors: { inc: jest.fn() },
  httpRequestTotal: { inc: jest.fn() },
}));

jest.mock('@/lib/security/suspicious-patterns', () => ({
  detectSuspiciousPatterns: jest
    .fn()
    .mockReturnValue({ detected: false, patterns: [] }),
}));

jest.mock('@/lib/security/audit-log', () => ({
  SecurityAuditLog: { log: jest.fn() },
}));

jest.mock('@/lib/security/csrf', () => ({
  validateCSRF: jest.fn().mockReturnValue({ valid: true }),
}));

jest.mock('@/lib/resilience/timeout-manager', () => ({
  TimeoutManager: {
    withTimeout: jest
      .fn()
      .mockImplementation((fn: () => Promise<unknown>) => fn()),
  },
}));

jest.mock('@/lib/db', () => ({
  dbService: {
    getTaskWithOwnership: jest.fn(),
    updateTask: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
}));

import { PATCH } from '@/app/api/tasks/[id]/status/route';
import { dbService } from '@/lib/db';
import { createMockRequest } from './utils/_testHelpers';
import { buildApiUrl } from './config/test-config';

const taskId = 'task-123';
const mockTaskWithOwnership = {
  id: taskId,
  title: 'Test Task',
  status: 'todo',
  completion_percentage: 0,
  idea: { user_id: 'test-user-id' },
};

describe('/api/tasks/[id]/status PATCH', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update task status to in_progress', async () => {
    (dbService.getTaskWithOwnership as jest.Mock).mockResolvedValue(
      mockTaskWithOwnership
    );
    (dbService.updateTask as jest.Mock).mockResolvedValue({
      ...mockTaskWithOwnership,
      status: 'in_progress',
      completion_percentage: 25,
    });

    const request = createMockRequest({
      method: 'PATCH',
      url: buildApiUrl(`/tasks/${taskId}/status`),
      json: async () => ({ status: 'in_progress' }),
    });

    const response = await PATCH(request, { params: { id: taskId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.message).toContain('in_progress');
    expect(dbService.updateTask).toHaveBeenCalledWith(taskId, {
      status: 'in_progress',
      completion_percentage: 50,
    });
  });

  it('should update task status to completed with 100% completion', async () => {
    (dbService.getTaskWithOwnership as jest.Mock).mockResolvedValue(
      mockTaskWithOwnership
    );
    (dbService.updateTask as jest.Mock).mockResolvedValue({
      ...mockTaskWithOwnership,
      status: 'completed',
      completion_percentage: 100,
    });

    const request = createMockRequest({
      method: 'PATCH',
      url: buildApiUrl(`/tasks/${taskId}/status`),
      json: async () => ({ status: 'completed' }),
    });

    const response = await PATCH(request, { params: { id: taskId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.message).toContain('completed');
    expect(dbService.updateTask).toHaveBeenCalledWith(taskId, {
      status: 'completed',
      completion_percentage: 100,
    });
  });

  it('should return 400 when status is missing', async () => {
    const request = createMockRequest({
      method: 'PATCH',
      url: buildApiUrl(`/tasks/${taskId}/status`),
      json: async () => ({}),
    });

    const response = await PATCH(request, { params: { id: taskId } });

    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid status', async () => {
    const request = createMockRequest({
      method: 'PATCH',
      url: buildApiUrl(`/tasks/${taskId}/status`),
      json: async () => ({ status: 'invalid_status' }),
    });

    const response = await PATCH(request, { params: { id: taskId } });

    expect(response.status).toBe(400);
  });

  it('should return 404 when task not found', async () => {
    (dbService.getTaskWithOwnership as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({
      method: 'PATCH',
      url: buildApiUrl(`/tasks/${taskId}/status`),
      json: async () => ({ status: 'completed' }),
    });

    const response = await PATCH(request, { params: { id: taskId } });

    expect(response.status).toBe(404);
  });

  it('should handle malformed JSON body', async () => {
    const request = createMockRequest({
      method: 'PATCH',
      url: buildApiUrl(`/tasks/${taskId}/status`),
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });

    const response = await PATCH(request, { params: { id: taskId } });

    expect(response.status).toBe(400);
  });
});
