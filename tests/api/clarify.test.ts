import { NextRequest } from 'next/server';
import { POST } from '@/app/api/clarify/route';
import { clarifierAgent } from '@/lib/clarifier';
import { dbService } from '@/lib/db';

// Mock the dependencies
jest.mock('@/lib/clarifier');
jest.mock('@/lib/db');

const mockClarifierAgent = clarifierAgent as jest.Mocked<typeof clarifierAgent>;
const mockDbService = dbService as jest.Mocked<typeof dbService>;

describe('/api/clarify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return clarifying questions for valid idea', async () => {
      const mockResponse = {
        questions: [
          {
            id: 'q1',
            question: 'What is your target audience?',
            type: 'open',
            required: true,
          },
          {
            id: 'q2',
            question: 'What is the main problem?',
            type: 'open',
            required: true,
          },
        ],
      };

      mockClarifierAgent.generateClarifyingQuestions.mockResolvedValue(
        mockResponse
      );

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: 'Test idea' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResponse);
      expect(
        mockClarifierAgent.generateClarifyingQuestions
      ).toHaveBeenCalledWith('Test idea');
    });

    it('should store session when ideaId is provided', async () => {
      const mockResponse = {
        questions: [
          {
            id: 'q1',
            question: 'Test question?',
            type: 'open',
            required: true,
          },
        ],
      };

      mockClarifierAgent.generateClarifyingQuestions.mockResolvedValue(
        mockResponse
      );
      mockDbService.upsertIdeaSession.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: 'Test idea', ideaId: 'idea-123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockDbService.upsertIdeaSession).toHaveBeenCalledWith({
        idea_id: 'idea-123',
        state: {
          questions: mockResponse.questions,
          status: 'clarifying',
        },
        last_agent: 'clarifier',
        metadata: {
          agent: 'clarifier',
          timestamp: expect.any(String),
          question_count: 1,
        },
      });
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
      mockClarifierAgent.generateClarifyingQuestions.mockRejectedValue(
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

    it('should handle database errors gracefully', async () => {
      const mockResponse = {
        questions: [
          {
            id: 'q1',
            question: 'Test question?',
            type: 'open',
            required: true,
          },
        ],
      };

      mockClarifierAgent.generateClarifyingQuestions.mockResolvedValue(
        mockResponse
      );
      mockDbService.upsertIdeaSession.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: 'Test idea', ideaId: 'idea-123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate clarifying questions');
      expect(data.details).toBe('Database connection failed');
    });

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
      const mockResponse = {
        questions: [
          {
            id: 'q1',
            question: 'Test question?',
            type: 'open',
            required: true,
          },
        ],
      };

      mockClarifierAgent.generateClarifyingQuestions.mockResolvedValue(
        mockResponse
      );

      const request = new NextRequest('http://localhost:3000/api/clarify', {
        method: 'POST',
        body: JSON.stringify({ idea: longIdea }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(
        mockClarifierAgent.generateClarifyingQuestions
      ).toHaveBeenCalledWith(longIdea);
    });

    it('should include proper content-type headers', async () => {
      const mockResponse = {
        questions: [
          {
            id: 'q1',
            question: 'Test question?',
            type: 'open',
            required: true,
          },
        ],
      };

      mockClarifierAgent.generateClarifyingQuestions.mockResolvedValue(
        mockResponse
      );

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
