import { NextRequest } from 'next/server';
import { PUT as updateTaskPUT } from '@/app/api/tasks/[id]/route';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

jest.mock('@/lib/db');
jest.mock('@/lib/auth');
jest.mock('openai', () => jest.fn());
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(),
    infoWithContext: jest.fn(), errorWithContext: jest.fn(), warnWithContext: jest.fn(),
  }),
  generateCorrelationId: () => 'test-id',
  setCorrelationId: jest.fn(),
}));

describe('Task Update Sanitization', () => {
  it('should sanitize task title and description', async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
    (verifyResourceOwnership as jest.Mock).mockReturnValue(undefined);
    (dbService.getTaskWithOwnership as jest.Mock).mockResolvedValue({ id: 't1', idea: { user_id: 'u1' } });
    (dbService.updateTask as jest.Mock).mockImplementation(async (id, u) => ({ id, ...u }));

    const xss = '<script>alert(1)</script><img src=x onerror=alert(1)>';
    const req = {
      method: 'PUT', url: 'http://loc/api/tasks/t1', headers: new Headers(),
      json: async () => ({ title: xss, description: xss })
    } as unknown as NextRequest;

    await updateTaskPUT(req);

    const call = (dbService.updateTask as jest.Mock).mock.calls[0][1];
    expect(call.title).not.toContain('<script');
    expect(call.title).not.toContain('onerror');
    expect(call.description).not.toContain('<script');
    expect(call.description).not.toContain('onerror');
  });
});
