import { NextRequest } from 'next/server';
import { POST } from '@/app/api/clarify/route';
import { clarifierAgent, ClarificationSession } from '@/lib/agents/clarifier';
import { dbService } from '@/lib/db';

// Mock the dependencies
jest.mock('@/lib/agents/clarifier');
jest.mock('@/lib/db');

const mockClarifierAgent = clarifierAgent as jest.Mocked<typeof clarifierAgent>;
const mockDbService = dbService as jest.Mocked<typeof dbService>;

describe('/api/clarify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return clarifying questions for valid idea', async () => {
      const mockSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q1',
            question: 'What is your target audience?',
            type: 'open' as const,
            required: true,
          },
          {
            id: 'q2',
            question: 'What is the main problem?',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: {},
        confidence: 0.5,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClarifierAgent.startClarification.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: 'Test idea' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        questions: mockSession.questions,
        ideaId: mockSession.ideaId,
        status: mockSession.status,
        confidence: mockSession.confidence,
      });
      expect(mockClarifierAgent.startClarification).toHaveBeenCalled();
    });

    it('should use provided ideaId when given', async () => {
      const mockSession = {
        ideaId: 'provided-idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q1',
            question: 'Test question?',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: {},
        confidence: 0.5,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClarifierAgent.startClarification.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({
          idea: 'Test idea',
          ideaId: 'provided-idea-123',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockClarifierAgent.startClarification).toHaveBeenCalledWith(
        'provided-idea-123',
        'Test idea'
      );
    });

    it('should return 400 when idea is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Idea is required');
    });

    it('should return 400 when idea is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Idea is required');
    });

    it('should handle clarifier agent errors', async () => {
      mockClarifierAgent.startClarification.mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: 'Test idea' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate clarifying questions');
      expect(data.details).toBe('AI service unavailable');
    });

    // Removed database error test as the new agent handles its own database operations

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate clarifying questions');
    });

    it('should handle very long ideas', async () => {
      const longIdea = 'a'.repeat(10000);
      const mockSession: ClarificationSession = {
        ideaId: 'idea-123',
        originalIdea: longIdea,
        questions: [
          {
            id: 'q1',
            question: 'Test question?',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: {},
        confidence: 0.5,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClarifierAgent.startClarification.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: longIdea }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockClarifierAgent.startClarification).toHaveBeenCalled();
    });

    it('should include proper content-type headers', async () => {
      const mockSession: ClarificationSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q1',
            question: 'Test question?',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: {},
        confidence: 0.5,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClarifierAgent.startClarification.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: 'Test idea' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
