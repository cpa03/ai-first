import { NextRequest } from 'next/server';
import { POST } from '@/app/api/clarify/answer/route';
import { clarifierAgent } from '@/lib/clarifier';

// Mock the dependencies
jest.mock('@/lib/clarifier');

const mockClarifierAgent = clarifierAgent as jest.Mocked<typeof clarifierAgent>;

describe('/api/clarify/answer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should submit answer successfully', async () => {
      const mockUpdatedSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q1',
            question: 'What is your target audience?',
            type: 'open',
            required: true,
          },
        ],
        answers: { q1: 'Developers' },
        confidence: 0.7,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClarifierAgent.submitAnswer.mockResolvedValue(mockUpdatedSession);

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            ideaId: 'idea-123',
            questionId: 'q1',
            answer: 'Developers',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.session).toEqual(mockUpdatedSession);
      expect(mockClarifierAgent.submitAnswer).toHaveBeenCalledWith(
        'idea-123',
        'q1',
        'Developers'
      );
    });

    it('should return 400 when ideaId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            questionId: 'q1',
            answer: 'Developers',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ideaId is required');
    });

    it('should return 400 when questionId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            ideaId: 'idea-123',
            answer: 'Developers',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('questionId is required');
    });

    it('should return 400 when answer is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            ideaId: 'idea-123',
            questionId: 'q1',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('answer is required');
    });

    it('should handle empty answer', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            ideaId: 'idea-123',
            questionId: 'q1',
            answer: '',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('answer is required');
    });

    it('should handle clarifier agent errors', async () => {
      mockClarifierAgent.submitAnswer.mockRejectedValue(
        new Error('Session not found')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            ideaId: 'idea-123',
            questionId: 'q1',
            answer: 'Developers',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to submit answer');
      expect(data.details).toBe('Session not found');
    });

    it('should handle long answers', async () => {
      const longAnswer = 'a'.repeat(5000);
      const mockUpdatedSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q1',
            question: 'What is your target audience?',
            type: 'open',
            required: true,
          },
        ],
        answers: { q1: longAnswer },
        confidence: 0.7,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClarifierAgent.submitAnswer.mockResolvedValue(mockUpdatedSession);

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            ideaId: 'idea-123',
            questionId: 'q1',
            answer: longAnswer,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockClarifierAgent.submitAnswer).toHaveBeenCalledWith(
        'idea-123',
        'q1',
        longAnswer
      );
    });

    it('should handle special characters in answers', async () => {
      const specialAnswer = 'Developers & Designers 🚀 with "special" chars!';
      const mockUpdatedSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q1',
            question: 'What is your target audience?',
            type: 'open',
            required: true,
          },
        ],
        answers: { q1: specialAnswer },
        confidence: 0.7,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClarifierAgent.submitAnswer.mockResolvedValue(mockUpdatedSession);

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/answer',
        {
          method: 'POST',
          body: JSON.stringify({
            ideaId: 'idea-123',
            questionId: 'q1',
            answer: specialAnswer,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockClarifierAgent.submitAnswer).toHaveBeenCalledWith(
        'idea-123',
        'q1',
        specialAnswer
      );
    });
  });
});
