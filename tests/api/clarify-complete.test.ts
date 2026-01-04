import { NextRequest } from 'next/server';
import { POST } from '@/app/api/clarify/complete/route';
import { clarifierAgent } from '@/lib/clarifier';

// Mock the dependencies
jest.mock('@/lib/clarifier');

const mockClarifierAgent = clarifierAgent as jest.Mocked<typeof clarifierAgent>;

describe('/api/clarify/complete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should complete clarification successfully', async () => {
      const mockResult = {
        refinedIdea: 'Refined idea description based on answers',
        status: 'completed' as const,
        confidence: 0.9,
      };

      mockClarifierAgent.completeClarification.mockResolvedValue(mockResult);

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'idea-123' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result).toEqual(mockResult);
      expect(mockClarifierAgent.completeClarification).toHaveBeenCalledWith(
        'idea-123'
      );
    });

    it('should return 400 when ideaId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ideaId is required');
    });

    it('should return 400 when ideaId is empty string', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: '' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ideaId is required');
    });

    it('should handle clarifier agent errors', async () => {
      mockClarifierAgent.completeClarification.mockRejectedValue(
        new Error('Required questions not answered')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'idea-123' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to complete clarification');
      expect(data.details).toBe('Required questions not answered');
    });

    it('should handle session not found error', async () => {
      mockClarifierAgent.completeClarification.mockRejectedValue(
        new Error('Clarification session not found')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'nonexistent-idea' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to complete clarification');
      expect(data.details).toBe('Clarification session not found');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to complete clarification');
    });

    it('should handle validation errors', async () => {
      mockClarifierAgent.completeClarification.mockRejectedValue(
        new Error('2 required questions still unanswered')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'idea-123' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to complete clarification');
      expect(data.details).toBe('2 required questions still unanswered');
    });

    it('should include proper content-type headers', async () => {
      const mockResult = {
        refinedIdea: 'Refined idea',
        status: 'completed' as const,
        confidence: 0.9,
      };

      mockClarifierAgent.completeClarification.mockResolvedValue(mockResult);

      const request = new NextRequest(
        'http://localhost:3000/api/clarify/complete',
        {
          method: 'POST',
          body: JSON.stringify({ ideaId: 'idea-123' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
