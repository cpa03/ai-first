import { NextRequest } from 'next/server';
import { POST } from '@/app/api/clarify/start/route';
import { clarifierAgent, ClarificationSession } from '@/lib/agents/clarifier';
import { dbService } from '@/lib/db';

// Mock the dependencies
jest.mock('@/lib/agents/clarifier');
jest.mock('@/lib/db');

const mockClarifierAgent = clarifierAgent as jest.Mocked<typeof clarifierAgent>;
const mockDbService = dbService as jest.Mocked<typeof dbService>;

describe('/api/clarify/start', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should start clarification session successfully', async () => {
      const mockSession: ClarificationSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q1',
            question: 'What is your target audience?',
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

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/start',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'idea-123', idea: 'Test idea' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.session).toEqual(mockSession);
      expect(mockClarifierAgent.startClarification).toHaveBeenCalledWith(
        'idea-123',
        'Test idea'
      );
    });

    it('should return 400 when ideaId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/start',
        {
          method: 'POST',
          body: JSON.stringify({ idea: 'Test idea' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ideaId is required');
    });

    it('should return 400 when idea is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/start',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'idea-123' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('idea is required');
    });

    it('should handle clarifier agent errors', async () => {
      mockClarifierAgent.startClarification.mockRejectedValue(
        new Error('Failed to start clarification')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/start',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'idea-123', idea: 'Test idea' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to start clarification session');
      expect(data.details).toBe('Failed to start clarification');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/start',
        {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to start clarification session');
    });
  });
});
