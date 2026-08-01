/**
 * API Route Tests - Clarify Flow
 *
 * Tests for:
 * - POST /api/clarify (start clarification)
 * - POST /api/clarify/start (start clarification with ideaId)
 * - GET /api/clarify/start (get session by ideaId)
 * - POST /api/clarify/answer (submit answer)
 * - POST /api/clarify/complete (complete clarification)
 */

// Mock dependencies before imports
jest.mock('@/lib/db', () => ({
  dbService: {
    getIdea: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
}));

jest.mock('@/lib/agents/clarifier', () => ({
  clarifierAgent: {
    initialize: jest.fn().mockResolvedValue(undefined),
    startClarification: jest.fn(),
    submitAnswer: jest.fn(),
    completeClarification: jest.fn(),
    getSession: jest.fn(),
  },
}));

import { POST as clarifyPost } from '@/app/api/clarify/route';
import {
  POST as startPost,
  GET as startGet,
} from '@/app/api/clarify/start/route';
import { POST as answerPost } from '@/app/api/clarify/answer/route';
import { POST as completePost } from '@/app/api/clarify/complete/route';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { clarifierAgent } from '@/lib/agents/clarifier';
import { createMockRequest } from './utils/_testHelpers';

const mockGetIdea = dbService.getIdea as jest.MockedFunction<
  typeof dbService.getIdea
>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockVerifyResourceOwnership =
  verifyResourceOwnership as jest.MockedFunction<
    typeof verifyResourceOwnership
  >;
const mockStartClarification =
  clarifierAgent.startClarification as jest.MockedFunction<
    typeof clarifierAgent.startClarification
  >;
const mockSubmitAnswer = clarifierAgent.submitAnswer as jest.MockedFunction<
  typeof clarifierAgent.submitAnswer
>;
const mockCompleteClarification =
  clarifierAgent.completeClarification as jest.MockedFunction<
    typeof clarifierAgent.completeClarification
  >;
const mockGetSession = clarifierAgent.getSession as jest.MockedFunction<
  typeof clarifierAgent.getSession
>;
const mockInitialize = clarifierAgent.initialize as jest.MockedFunction<
  typeof clarifierAgent.initialize
>;

describe('Clarify API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Default auth mock
    mockRequireAuth.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
    });
  });

  // =========================================================================
  // POST /api/clarify
  // =========================================================================
  describe('POST /api/clarify', () => {
    const mockSession = {
      ideaId: 'idea-123',
      questions: [
        { id: 'q1', text: 'What is the target audience?', category: 'scope' },
      ],
      status: 'in_progress',
      confidence: 0.5,
    };

    it('should start clarification and return 200', async () => {
      mockStartClarification.mockResolvedValue(mockSession);

      const request = createMockRequest({
        json: async () => ({
          idea: 'Build a task management app',
        }),
      });

      const response = await clarifyPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.questions).toEqual(mockSession.questions);
      expect(data.data.ideaId).toBe('idea-123');
      expect(data.data.status).toBe('in_progress');
      expect(data.data.confidence).toBe(0.5);
      expect(mockStartClarification).toHaveBeenCalledTimes(1);
    });

    it('should use provided ideaId when given', async () => {
      mockStartClarification.mockResolvedValue(mockSession);

      const request = createMockRequest({
        json: async () => ({
          idea: 'Build a task management app',
          ideaId: 'existing-idea-id',
        }),
      });

      const response = await clarifyPost(request as never, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(200);
      expect(mockStartClarification).toHaveBeenCalledWith(
        'existing-idea-id',
        'Build a task management app'
      );
    });

    it('should reject empty idea', async () => {
      const request = createMockRequest({
        json: async () => ({
          idea: '',
        }),
      });

      const response = await clarifyPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject missing idea', async () => {
      const request = createMockRequest({
        json: async () => ({}),
      });

      const response = await clarifyPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/clarify/start
  // =========================================================================
  describe('POST /api/clarify/start', () => {
    const mockIdea = {
      id: 'idea-123',
      title: 'Test Idea',
      user_id: 'test-user-id',
      status: 'draft',
    };

    const mockSession = {
      ideaId: 'idea-123',
      questions: [
        { id: 'q1', text: 'What is the target audience?', category: 'scope' },
      ],
      status: 'in_progress',
      confidence: 0.5,
    };

    it('should start clarification session and return 200', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockStartClarification.mockResolvedValue(mockSession);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
          ideaText: 'Build a task management app',
        }),
      });

      const response = await startPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session).toEqual(mockSession);
      expect(mockInitialize).toHaveBeenCalledTimes(1);
      expect(mockStartClarification).toHaveBeenCalledWith(
        'idea-123',
        'Build a task management app'
      );
    });

    it('should reject invalid ideaId format', async () => {
      const request = createMockRequest({
        json: async () => ({
          ideaId: '',
          ideaText: 'Build a task management app',
        }),
      });

      const response = await startPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 404 when idea not found', async () => {
      mockGetIdea.mockResolvedValue(null);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'nonexistent-idea',
          ideaText: 'Build a task management app',
        }),
      });

      const response = await startPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should verify resource ownership', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockStartClarification.mockResolvedValue(mockSession);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
          ideaText: 'Build a task management app',
        }),
      });

      await startPost(request as never, {
        params: Promise.resolve({}),
      });

      expect(mockVerifyResourceOwnership).toHaveBeenCalledWith(
        'test-user-id',
        'test-user-id',
        'idea'
      );
    });
  });

  // =========================================================================
  // GET /api/clarify/start
  // =========================================================================
  describe('GET /api/clarify/start', () => {
    const mockIdea = {
      id: 'idea-123',
      title: 'Test Idea',
      user_id: 'test-user-id',
    };

    const mockSession = {
      ideaId: 'idea-123',
      questions: [],
      status: 'in_progress',
      confidence: 0.7,
    };

    it('should return session for valid ideaId', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockGetSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/clarify/start?ideaId=idea-123',
      });

      const response = await startGet(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session).toEqual(mockSession);
    });

    it('should reject missing ideaId query param', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/clarify/start',
      });

      const response = await startGet(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 404 when idea not found', async () => {
      mockGetIdea.mockResolvedValue(null);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/clarify/start?ideaId=nonexistent',
      });

      const response = await startGet(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return 404 when session not found', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockGetSession.mockResolvedValue(null);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/clarify/start?ideaId=idea-123',
      });

      const response = await startGet(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/clarify/answer
  // =========================================================================
  describe('POST /api/clarify/answer', () => {
    const mockIdea = {
      id: 'idea-123',
      title: 'Test Idea',
      user_id: 'test-user-id',
    };

    const mockSession = {
      ideaId: 'idea-123',
      questions: [],
      status: 'in_progress',
      confidence: 0.6,
    };

    it('should submit answer and return 200', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockSubmitAnswer.mockResolvedValue(mockSession);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
          questionId: 'q1',
          answer: 'Remote teams of 5-20 people',
        }),
      });

      const response = await answerPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session).toEqual(mockSession);
      expect(mockSubmitAnswer).toHaveBeenCalledWith(
        'idea-123',
        'q1',
        'Remote teams of 5-20 people'
      );
    });

    it('should reject missing questionId', async () => {
      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
          answer: 'Some answer',
        }),
      });

      const response = await answerPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject missing answer', async () => {
      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
          questionId: 'q1',
        }),
      });

      const response = await answerPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject empty answer string', async () => {
      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
          questionId: 'q1',
          answer: '',
        }),
      });

      const response = await answerPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 404 when idea not found', async () => {
      mockGetIdea.mockResolvedValue(null);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'nonexistent',
          questionId: 'q1',
          answer: 'Some answer',
        }),
      });

      const response = await answerPost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should verify resource ownership before submitting answer', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockSubmitAnswer.mockResolvedValue(mockSession);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
          questionId: 'q1',
          answer: 'Some answer',
        }),
      });

      await answerPost(request as never, {
        params: Promise.resolve({}),
      });

      expect(mockVerifyResourceOwnership).toHaveBeenCalledWith(
        'test-user-id',
        'test-user-id',
        'idea'
      );
    });
  });

  // =========================================================================
  // POST /api/clarify/complete
  // =========================================================================
  describe('POST /api/clarify/complete', () => {
    const mockIdea = {
      id: 'idea-123',
      title: 'Test Idea',
      user_id: 'test-user-id',
    };

    const mockResult = {
      ideaId: 'idea-123',
      refinedIdea: 'A refined task management app for remote teams',
      status: 'completed',
      confidence: 0.85,
    };

    it('should complete clarification and return 200', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockCompleteClarification.mockResolvedValue(mockResult);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
        }),
      });

      const response = await completePost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResult);
      expect(mockCompleteClarification).toHaveBeenCalledWith('idea-123');
    });

    it('should reject invalid ideaId', async () => {
      const request = createMockRequest({
        json: async () => ({
          ideaId: '',
        }),
      });

      const response = await completePost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 404 when idea not found', async () => {
      mockGetIdea.mockResolvedValue(null);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'nonexistent',
        }),
      });

      const response = await completePost(request as never, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should verify resource ownership before completing', async () => {
      mockGetIdea.mockResolvedValue(mockIdea as never);
      mockCompleteClarification.mockResolvedValue(mockResult);

      const request = createMockRequest({
        json: async () => ({
          ideaId: 'idea-123',
        }),
      });

      await completePost(request as never, {
        params: Promise.resolve({}),
      });

      expect(mockVerifyResourceOwnership).toHaveBeenCalledWith(
        'test-user-id',
        'test-user-id',
        'idea'
      );
    });
  });
});
