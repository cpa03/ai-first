// Mock all dependencies of withApiHandler wrapper FIRST
jest.mock('@/lib/validation', () => ({
  validateRequestSize: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  validateIdeaId: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  sanitizeHtml: jest.fn((s: string) => s),
  sanitizeObject: jest.fn((o: unknown) => o),
  validateIdea: jest.fn().mockReturnValue({ valid: true, errors: [] }),
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
    getIdea: jest.fn(),
    updateIdea: jest.fn(),
    softDeleteIdea: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
}));

import { GET, PUT, DELETE } from '@/app/api/ideas/[id]/route';
import { dbService } from '@/lib/db';
import { createMockRequest } from './utils/_testHelpers';
import { buildApiUrl } from './config/test-config';

const ideaId = 'idea-123';
const mockIdea = {
  id: ideaId,
  user_id: 'test-user-id',
  title: 'Test Idea',
  raw_text: 'Test idea content',
  status: 'draft',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('/api/ideas/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 200 with idea data', async () => {
      (dbService.getIdea as jest.Mock).mockResolvedValue(mockIdea);

      const request = createMockRequest({
        method: 'GET',
        url: buildApiUrl(`/ideas/${ideaId}`),
      });

      const response = await GET(request, {
        params: Promise.resolve({ id: ideaId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(ideaId);
      expect(dbService.getIdea).toHaveBeenCalledWith(ideaId);
    });

    it('should return 404 when idea not found', async () => {
      (dbService.getIdea as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'GET',
        url: buildApiUrl(`/ideas/${ideaId}`),
      });

      const response = await GET(request, {
        params: Promise.resolve({ id: ideaId }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('should update idea title', async () => {
      (dbService.getIdea as jest.Mock).mockResolvedValue(mockIdea);
      (dbService.updateIdea as jest.Mock).mockResolvedValue({
        ...mockIdea,
        title: 'Updated Title',
      });

      const request = createMockRequest({
        method: 'PUT',
        url: buildApiUrl(`/ideas/${ideaId}`),
        json: async () => ({ title: 'Updated Title' }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: ideaId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(dbService.updateIdea).toHaveBeenCalled();
    });

    it('should update idea status', async () => {
      (dbService.getIdea as jest.Mock).mockResolvedValue(mockIdea);
      (dbService.updateIdea as jest.Mock).mockResolvedValue({
        ...mockIdea,
        status: 'clarified',
      });

      const request = createMockRequest({
        method: 'PUT',
        url: buildApiUrl(`/ideas/${ideaId}`),
        json: async () => ({ status: 'clarified' }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: ideaId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 when idea not found for update', async () => {
      (dbService.getIdea as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'PUT',
        url: buildApiUrl(`/ideas/${ideaId}`),
        json: async () => ({ title: 'Updated' }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: ideaId }),
      });

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON body', async () => {
      const request = createMockRequest({
        method: 'PUT',
        url: buildApiUrl(`/ideas/${ideaId}`),
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: ideaId }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('should soft delete idea', async () => {
      (dbService.getIdea as jest.Mock).mockResolvedValue(mockIdea);
      (dbService.softDeleteIdea as jest.Mock).mockResolvedValue(undefined);

      const request = createMockRequest({
        method: 'DELETE',
        url: buildApiUrl(`/ideas/${ideaId}`),
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: ideaId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(dbService.softDeleteIdea).toHaveBeenCalledWith(ideaId);
    });

    it('should return 404 when idea not found for deletion', async () => {
      (dbService.getIdea as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'DELETE',
        url: buildApiUrl(`/ideas/${ideaId}`),
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: ideaId }),
      });

      expect(response.status).toBe(404);
    });
  });
});
