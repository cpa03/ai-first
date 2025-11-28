import { clarifierAgent, ClarifierQuestion } from '@/lib/agents/clarifier';
import { dbService } from '@/lib/db';

// Mock the database service
jest.mock('@/lib/db');
const mockDbService = dbService as jest.Mocked<typeof dbService>;

// Mock the AI service
jest.mock('@/lib/ai', () => ({
  aiService: {
    initialize: jest.fn(),
    callModel: jest.fn(),
  },
  AIModelConfig: {},
}));

jest.mock('js-yaml', () => ({
  load: jest.fn(() => ({
    name: 'clarifier',
    description: 'Test clarifier',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    functions: [],
  })),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'test config'),
}));

describe('ClarifierAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);

      await expect(clarifierAgent.initialize()).resolves.not.toThrow();
    });
  });

  describe('generateQuestions', () => {
    it('should generate questions from AI response', async () => {
      const { aiService } = require('@/lib/ai');
      const mockQuestions = [
        {
          id: 'q_1',
          question: 'What is the main problem you are trying to solve?',
          type: 'open',
          required: true,
        },
        {
          id: 'q_2',
          question: 'Who is your target audience?',
          type: 'open',
          required: true,
        },
      ];

      aiService.callModel.mockResolvedValue(JSON.stringify(mockQuestions));

      const questions = await clarifierAgent.generateQuestions('Test idea');

      expect(questions).toHaveLength(2);
      expect(questions[0].question).toBe(
        'What is the main problem you are trying to solve?'
      );
      expect(questions[0].type).toBe('open');
      expect(questions[0].required).toBe(true);
    });

    it('should return fallback questions on AI error', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.callModel.mockRejectedValue(new Error('AI service error'));

      const questions = await clarifierAgent.generateQuestions('Test idea');

      expect(questions).toHaveLength(3);
      expect(questions[0].question).toContain('main problem');
      expect(questions[1].question).toContain('target audience');
      expect(questions[2].question).toContain('key features');
    });
  });

  describe('startClarification', () => {
    it('should start a clarification session', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);
      aiService.callModel.mockResolvedValue(
        JSON.stringify([
          {
            id: 'q_1',
            question: 'Test question',
            type: 'open',
            required: true,
          },
        ])
      );

      mockDbService.logAgentAction.mockResolvedValue(undefined);
      mockDbService.storeVector.mockResolvedValue({} as any);

      const session = await clarifierAgent.startClarification(
        'idea-123',
        'Test idea'
      );

      expect(session.ideaId).toBe('idea-123');
      expect(session.originalIdea).toBe('Test idea');
      expect(session.questions).toHaveLength(1);
      expect(session.status).toBe('pending');
      expect(session.confidence).toBe(0.5);
    });
  });

  describe('submitAnswer', () => {
    it('should submit answer and update session', async () => {
      const mockSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q_1',
            question: 'Test question',
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

      mockDbService.getVectors.mockResolvedValue([
        {
          vector_data: mockSession,
        } as any,
      ]);

      mockDbService.storeVector.mockResolvedValue({} as any);
      mockDbService.logAgentAction.mockResolvedValue(undefined);

      jest.spyOn(clarifierAgent, 'getSession').mockResolvedValue(mockSession);

      const updatedSession = await clarifierAgent.submitAnswer(
        'idea-123',
        'q_1',
        'Test answer'
      );

      expect(updatedSession.answers['q_1']).toBe('Test answer');
      expect(updatedSession.status).toBe('in_progress');
      expect(updatedSession.confidence).toBeGreaterThan(0.5);
    });

    it('should throw error if session not found', async () => {
      jest.spyOn(clarifierAgent, 'getSession').mockResolvedValue(null);

      await expect(
        clarifierAgent.submitAnswer('idea-123', 'q_1', 'Test answer')
      ).rejects.toThrow('Clarification session not found');
    });
  });

  describe('completeClarification', () => {
    it('should complete clarification and generate refined idea', async () => {
      const mockSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q_1',
            question: 'Test question',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: { q_1: 'Test answer' },
        confidence: 0.8,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { aiService } = require('@/lib/ai');
      aiService.callModel.mockResolvedValue('Refined idea description');

      jest.spyOn(clarifierAgent, 'getSession').mockResolvedValue(mockSession);
      mockDbService.storeVector.mockResolvedValue({} as any);
      mockDbService.updateIdea.mockResolvedValue({} as any);
      mockDbService.logAgentAction.mockResolvedValue(undefined);

      const result = await clarifierAgent.completeClarification('idea-123');

      expect(result.refinedIdea).toBe('Refined idea description');
      expect(result.status).toBe('completed');
      expect(result.confidence).toBe(0.9);
      expect(mockDbService.updateIdea).toHaveBeenCalledWith('idea-123', {
        status: 'clarified',
      });
    });

    it('should throw error if required questions are unanswered', async () => {
      const mockSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q_1',
            question: 'Test question',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: {},
        confidence: 0.5,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(clarifierAgent, 'getSession').mockResolvedValue(mockSession);

      await expect(
        clarifierAgent.completeClarification('idea-123')
      ).rejects.toThrow('1 required questions still unanswered');
    });
  });

  describe('generateRefinedIdea', () => {
    it('should generate refined idea from session', async () => {
      const mockSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q_1',
            question: 'What problem are you solving?',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: { q_1: 'Solving communication issues' },
        confidence: 0.8,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { aiService } = require('@/lib/ai');
      aiService.callModel.mockResolvedValue('Generated refined idea');

      const refinedIdea = await clarifierAgent.generateRefinedIdea(mockSession);

      expect(refinedIdea).toBe('Generated refined idea');
      expect(aiService.callModel).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Test idea'),
          }),
        ]),
        expect.any(Object)
      );
    });

    it('should return fallback on AI error', async () => {
      const mockSession = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [
          {
            id: 'q_1',
            question: 'What problem are you solving?',
            type: 'open' as const,
            required: true,
          },
        ],
        answers: { q_1: 'Solving communication issues' },
        confidence: 0.8,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { aiService } = require('@/lib/ai');
      aiService.callModel.mockRejectedValue(new Error('AI service error'));

      const refinedIdea = await clarifierAgent.generateRefinedIdea(mockSession);

      expect(refinedIdea).toContain('Test idea');
      expect(refinedIdea).toContain('Solving communication issues');
    });
  });

  describe('getSession', () => {
    it('should retrieve session from database', async () => {
      const mockSessionData = {
        ideaId: 'idea-123',
        originalIdea: 'Test idea',
        questions: [],
        answers: {},
        confidence: 0.5,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockDbService.getVectors.mockResolvedValue([
        {
          vector_data: mockSessionData,
        } as any,
      ]);

      const session = await clarifierAgent.getSession('idea-123');

      expect(session).toBeTruthy();
      expect(session?.ideaId).toBe('idea-123');
      expect(session?.createdAt).toBeInstanceOf(Date);
      expect(session?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const health = await clarifierAgent.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.config).toBe(true);
    });
  });
});
