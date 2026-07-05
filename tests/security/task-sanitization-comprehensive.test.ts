import { NextRequest } from 'next/server';
import { POST as createTaskPOST } from '@/app/api/deliverables/[id]/tasks/route';
import { PUT as updateTaskPUT } from '@/app/api/tasks/[id]/route';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

jest.mock('@/lib/db');
jest.mock('@/lib/auth');
jest.mock('openai', () => jest.fn());
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    infoWithContext: jest.fn(),
    errorWithContext: jest.fn(),
    warnWithContext: jest.fn(),
  }),
  generateCorrelationId: () => 'test-id',
  setCorrelationId: jest.fn(),
}));

describe('Task Sanitization Comprehensive', () => {
  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  const sanitized = 'alert("xss")'; // Script content remains but tags are gone, and event handlers are removed

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task Creation', () => {
    it('should sanitize title, description, and tags on creation', async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
      (dbService.getDeliverableWithIdea as jest.Mock).mockResolvedValue({
        id: 'd1',
        idea: { user_id: 'u1' },
      });
      (dbService.createTask as jest.Mock).mockImplementation(async (t) => ({
        ...t,
        id: 't1',
      }));

      const req = {
        method: 'POST',
        url: 'http://loc/api/deliverables/d1/tasks',
        headers: new Headers(),
        json: async () => ({
          title: xssPayload,
          description: xssPayload,
          tags: [xssPayload, 'safe-tag'],
        }),
      } as unknown as NextRequest;

      await createTaskPOST(req);

      const createTaskCall = (dbService.createTask as jest.Mock).mock.calls[0][0];

      expect(createTaskCall.title).not.toContain('<script');
      expect(createTaskCall.title).not.toContain('onerror');
      expect(createTaskCall.description).not.toContain('<script');
      expect(createTaskCall.description).not.toContain('onerror');
      expect(createTaskCall.tags[0]).not.toContain('<script');
      expect(createTaskCall.tags[0]).not.toContain('onerror');
      expect(createTaskCall.tags[1]).toBe('safe-tag');
    });
  });

  describe('Task Update', () => {
    it('should sanitize tags on update', async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
      (verifyResourceOwnership as jest.Mock).mockReturnValue(undefined);
      (dbService.getTaskWithOwnership as jest.Mock).mockResolvedValue({
        id: 't1',
        idea: { user_id: 'u1' },
      });
      (dbService.updateTask as jest.Mock).mockImplementation(async (id, u) => ({
        id,
        ...u,
      }));

      const req = {
        method: 'PUT',
        url: 'http://loc/api/tasks/t1',
        headers: new Headers(),
        json: async () => ({
          tags: [xssPayload, 'another-safe-tag'],
        }),
      } as unknown as NextRequest;

      await updateTaskPUT(req);

      const updateTaskCall = (dbService.updateTask as jest.Mock).mock.calls[0][1];

      expect(updateTaskCall.tags[0]).not.toContain('<script');
      expect(updateTaskCall.tags[0]).not.toContain('onerror');
      expect(updateTaskCall.tags[1]).toBe('another-safe-tag');
    });
  });
});
