import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ideas/route';
import { dbService } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

jest.mock('@/lib/db');
jest.mock('@/lib/auth');
jest.mock('@/lib/embedding-service', () => ({ generateEmbedding: jest.fn().mockResolvedValue(new Float32Array(1536)) }));
jest.mock('@/lib/similarity-service', () => ({ storeIdeaEmbedding: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), infoWithContext: jest.fn(), errorWithContext: jest.fn(), warnWithContext: jest.fn() }),
  generateCorrelationId: () => 'test-id',
  setCorrelationId: jest.fn(),
}));

describe('Idea Creation XSS', () => {
  it('should sanitize title and raw_text', async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
    (dbService.createIdea as jest.Mock).mockImplementation(async (i) => ({ ...i, id: 'i1', created_at: '2026-01-01' }));

    const xss = '<img src=x onerror=alert(1)>';
    const req = { method: 'POST', url: 'http://loc/api/ideas', headers: new Headers(), json: async () => ({ idea: xss }) } as unknown as NextRequest;
    await POST(req);

    const call = (dbService.createIdea as jest.Mock).mock.calls[0][0];
    expect(call.title).not.toContain('onerror');
    expect(call.raw_text).not.toContain('onerror');
  });

  it('should sanitize before truncation', async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
    (dbService.createIdea as jest.Mock).mockImplementation(async (i) => ({ ...i, id: 'i1', created_at: '2026-01-01' }));

    // Long script tag that would be partially truncated if sanitized after truncation
    const longXss = '<script>alert("xss")</script>' + 'a'.repeat(100);
    const req = { method: 'POST', url: 'http://loc/api/ideas', headers: new Headers(), json: async () => ({ idea: longXss }) } as unknown as NextRequest;
    await POST(req);

    const call = (dbService.createIdea as jest.Mock).mock.calls[0][0];
    expect(call.title).not.toContain('<script');
    expect(call.title).not.toContain('alert');
  });
});
