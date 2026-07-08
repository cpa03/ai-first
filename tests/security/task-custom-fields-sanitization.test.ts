import { NextRequest } from 'next/server';
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

describe('Task Custom Fields Sanitization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
    (verifyResourceOwnership as jest.Mock).mockReturnValue(undefined);
  });

  it('should recursively sanitize custom_fields on update', async () => {
    (dbService.getTaskWithOwnership as jest.Mock).mockResolvedValue({
      id: 't1',
      idea: { user_id: 'u1' },
    });
    (dbService.updateTask as jest.Mock).mockImplementation(async (id, u) => ({
      id,
      ...u,
    }));

    const body = {
      custom_fields: {
        meta: '<script>alert("xss")</script>',
        nested: {
          key: '<img src=x onerror=alert(1)>',
          list: ['<iframe src="javascript:alert(1)"></iframe>', 'safe'],
        },
        number: 123,
        bool: true
      },
    };

    const req = {
      method: 'PUT',
      url: 'http://localhost/api/tasks/t1',
      nextUrl: { pathname: '/api/tasks/t1' },
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => body,
    } as unknown as NextRequest;

    await PUT(req);

    const call = (dbService.updateTask as jest.Mock).mock.calls[0][1];
    expect(call.custom_fields.meta).not.toContain('<script');
    expect(call.custom_fields.nested.key).not.toContain('onerror');
    expect(call.custom_fields.nested.list[0]).not.toContain('<iframe');
    expect(call.custom_fields.nested.list[1]).toBe('safe');
    expect(call.custom_fields.number).toBe(123);
    expect(call.custom_fields.bool).toBe(true);
  });
});
