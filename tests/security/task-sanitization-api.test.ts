import { NextRequest } from 'next/server';
import { POST } from '@/app/api/deliverables/[id]/tasks/route';
import { PUT } from '@/app/api/tasks/[id]/route';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

jest.mock('@/lib/db');
jest.mock('@/lib/auth');
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

describe('Task API Sanitization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
    (verifyResourceOwnership as jest.Mock).mockReturnValue(undefined);
  });

  describe('POST /api/deliverables/[id]/tasks', () => {
    it('should sanitize task title, description, assignee, and tags on creation', async () => {
      (dbService.getDeliverableWithIdea as jest.Mock).mockResolvedValue({
        id: 'd1',
        idea: { user_id: 'u1' },
      });
      (dbService.createTask as jest.Mock).mockImplementation(async (t) => ({
        ...t,
        id: 't1',
        created_at: new Date().toISOString(),
      }));

      const body = {
        title: '<script>alert("title")</script>Task',
        description: '<img src=x onerror=alert("desc")>',
        assignee: 'John <iframe src="javascript:alert(1)"></iframe>',
        tags: ['<svg onload=alert(1)>', 'safe-tag'],
      };

      const req = {
        method: 'POST',
        url: 'http://localhost/api/deliverables/d1/tasks',
        nextUrl: { pathname: '/api/deliverables/d1/tasks' },
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => body,
      } as unknown as NextRequest;

      await POST(req, { params: { id: 'd1' } });

      const call = (dbService.createTask as jest.Mock).mock.calls[0][0];
      expect(call.title).not.toContain('<script');
      expect(call.description).not.toContain('onerror');
      expect(call.assignee).not.toContain('<iframe');
      expect(call.tags[0]).not.toContain('onload');
      expect(call.tags[1]).toBe('safe-tag');
    });
  });

  describe('PUT /api/tasks/[id]', () => {
    it('should sanitize task title, description, assignee, and tags on update', async () => {
      (dbService.getTaskWithOwnership as jest.Mock).mockResolvedValue({
        id: 't1',
        idea: { user_id: 'u1' },
      });
      (dbService.updateTask as jest.Mock).mockImplementation(async (id, u) => ({
        id,
        ...u,
      }));

      const body = {
        title: '<script>alert("new-title")</script>',
        description: '<img src=x onerror=alert("new-desc")>',
        assignee: 'Malicious <script>alert(1)</script>',
        tags: ['<body onload=alert(1)>'],
      };

      const req = {
        method: 'PUT',
        url: 'http://localhost/api/tasks/t1',
        nextUrl: { pathname: '/api/tasks/t1' },
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => body,
      } as unknown as NextRequest;

      await PUT(req, { params: { id: 't1' } });

      const call = (dbService.updateTask as jest.Mock).mock.calls[0][1];
      expect(call.title).not.toContain('<script');
      expect(call.description).not.toContain('onerror');
      expect(call.assignee).not.toContain('<script');
      expect(call.tags[0]).not.toContain('onload');
    });
  });
});
