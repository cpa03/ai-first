import { NextRequest } from 'next/server';
import { POST as answerPOST } from '@/app/api/clarify/answer/route';
import { POST as breakdownPOST } from '@/app/api/breakdown/route';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { clarifierAgent } from '@/lib/agents/clarifier';
import { breakdownEngine } from '@/lib/agents/breakdown-engine';

jest.mock('@/lib/db');
jest.mock('@/lib/auth');
jest.mock('@/lib/agents/clarifier');
jest.mock('@/lib/agents/breakdown-engine');
jest.mock('@/lib/ai', () => ({
  aiService: { initialize: jest.fn(), callModel: jest.fn() },
}));

describe('API Sanitization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue({ id: 'u1' });
    (verifyResourceOwnership as jest.Mock).mockReturnValue(undefined);
  });

  it('sanitizes clarification answers', async () => {
    (dbService.getIdea as jest.Mock).mockResolvedValue({
      id: 'i1',
      user_id: 'u1',
    });
    const req = {
      method: 'POST',
      nextUrl: { pathname: '/api/clarify/answer' },
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        ideaId: 'i1',
        questionId: 'q1',
        answer: '<script>alert(1)</script>Ans',
      }),
    } as unknown as NextRequest;
    await answerPOST(req);
    expect((clarifierAgent.submitAnswer as jest.Mock).mock.calls[0][2]).toBe(
      'Ans'
    );
  });

  it('sanitizes breakdown input', async () => {
    (dbService.getIdea as jest.Mock).mockResolvedValue({
      id: 'i1',
      user_id: 'u1',
    });
    const req = {
      method: 'POST',
      nextUrl: { pathname: '/api/breakdown' },
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        ideaId: 'i1',
        refinedIdea: '<script>alert(1)</script>Refined',
        userResponses: { q1: '<script>alert(1)</script>X' },
      }),
    } as unknown as NextRequest;
    await breakdownPOST(req);
    const calls = (breakdownEngine.startBreakdown as jest.Mock).mock.calls[0];
    expect(calls[1]).toBe('Refined');
    expect(calls[2].q1).toBe('X');
  });
});
