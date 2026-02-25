/**
 * Comprehensive Breakdown Engine Tests
 *
 * Tests critical business logic for idea breakdown into deliverables,
 * tasks, dependencies, and timeline.
 *
 * Note: Following God Class Refactoring (Task 1), individual methods
 * like analyzeIdea, decomposeTasks, analyzeDependencies, generateTimeline,
 * and calculateOverallConfidence have been extracted to separate modules.
 *
 * This file tests the BreakdownEngine orchestrator only.
 * For unit tests of individual modules, see:
 * - tests/idea-analyzer.test.ts
 * - tests/task-decomposer.test.ts
 * - tests/dependency-analyzer.test.ts
 * - tests/timeline-generator.test.ts
 * - tests/session-manager.test.ts
 * - tests/confidence-calculator.test.ts
 */

import { breakdownEngine } from '@/lib/agents/breakdown-engine';

jest.mock('@/lib/ai', () => ({
  aiService: {
    initialize: jest.fn(),
    callModel: jest.fn(),
  },
}));

jest.mock('@/lib/db', () => ({
  dbService: {
    logAgentAction: jest.fn(),
    storeVector: jest.fn(),
    getVectors: jest.fn(),
    createDeliverable: jest.fn(),
    createDeliverables: jest.fn(),
    getIdeaDeliverables: jest.fn(),
    createTask: jest.fn(),
    createTasks: jest.fn(),
    updateIdea: jest.fn(),
  },
}));

jest.mock('js-yaml', () => ({
  load: jest.fn(() => ({
    name: 'breakdown-engine',
    description: 'Test breakdown engine',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    estimation_model: 'gpt-4',
    dependency_threshold: 0.5,
  })),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'test config'),
}));

describe('BreakdownEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);

      await expect(breakdownEngine.initialize()).resolves.not.toThrow();
      expect(aiService.initialize).toHaveBeenCalled();
    });

    it('should throw error when AI service not available', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockRejectedValue(
        new Error('AI service not available')
      );

      await expect(breakdownEngine.initialize()).rejects.toThrow(
        'AI service not available'
      );
    });
  });

  describe('startBreakdown', () => {
    it('should complete full breakdown workflow', async () => {
      const { aiService } = require('@/lib/ai');
      const { dbService } = require('@/lib/db');

      const mockAnalysis = {
        objectives: [
          {
            title: 'Build MVP',
            description: 'Create minimum viable product',
            confidence: 0.9,
          },
        ],
        deliverables: [
          {
            title: 'User Interface',
            description: 'Design and implement UI',
            priority: 1,
            estimatedHours: 40,
            confidence: 0.85,
          },
        ],
        complexity: {
          score: 6,
          factors: ['requires authentication', 'real-time updates'],
          level: 'medium',
        },
        scope: {
          size: 'medium',
          estimatedWeeks: 8,
          teamSize: 2,
        },
        riskFactors: [
          { factor: 'Scope creep', impact: 'medium', probability: 0.4 },
        ],
        successCriteria: ['Launch to 100 beta users'],
        overallConfidence: 0.8,
      };

      const mockTasks = {
        tasks: [
          {
            id: 't1',
            title: 'Design wireframes',
            description: 'Create initial UI mockups',
            estimatedHours: 8,
            complexity: 3,
            requiredSkills: ['UI/UX Design'],
            dependencies: [],
            deliverableId: 'User Interface',
          },
        ],
        totalEstimatedHours: 8,
        confidence: 0.7200000000000001,
      };

      aiService.callModel
        .mockResolvedValueOnce(JSON.stringify(mockAnalysis))
        .mockResolvedValueOnce(JSON.stringify(mockTasks.tasks));

      dbService.storeVector.mockResolvedValue({} as any);
      dbService.createDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'User Interface' } as any,
      ]);
      dbService.createTasks.mockResolvedValue([{ id: 'task-1' } as any]);
      dbService.updateIdea.mockResolvedValue({} as any);
      dbService.logAgentAction.mockResolvedValue(undefined);

      const session = await breakdownEngine.startBreakdown(
        'idea-123',
        'Build a task management app',
        {
          audience: 'remote teams',
        },
        {
          teamSize: 2,
          timelineWeeks: 8,
        }
      );

      expect(session.ideaId).toBe('idea-123');
      expect(session.status).toBe('completed');
      expect(session.analysis).toEqual(mockAnalysis);
      expect(session.tasks).toEqual(mockTasks);
      expect(session.dependencies).toBeDefined();
      expect(session.timeline).toBeDefined();
      expect(session.confidence).toBeGreaterThan(0);
      expect(session.processingTime).toBeGreaterThan(0);
      expect(dbService.createDeliverables).toHaveBeenCalled();
      expect(dbService.createTasks).toHaveBeenCalled();
      expect(dbService.updateIdea).toHaveBeenCalledWith('idea-123', {
        status: 'breakdown',
      });
    });

    it('should handle analysis step errors gracefully', async () => {
      const { aiService } = require('@/lib/ai');
      const { dbService } = require('@/lib/db');

      aiService.callModel.mockRejectedValue(new Error('AI analysis failed'));
      dbService.storeVector.mockResolvedValue({} as any);
      dbService.logAgentAction.mockResolvedValue(undefined);

      await expect(
        breakdownEngine.startBreakdown('idea-123', 'Test idea', {}, {})
      ).rejects.toThrow('Idea analysis failed');

      expect(dbService.logAgentAction).toHaveBeenCalledWith(
        'breakdown-engine',
        'breakdown-error',
        expect.objectContaining({
          ideaId: 'idea-123',
          error: expect.any(String),
        })
      );
    });

    it('should handle task decomposition errors with fallback', async () => {
      const { aiService } = require('@/lib/ai');
      const { dbService } = require('@/lib/db');

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Test Deliverable',
            description: 'Test description',
            priority: 1,
            estimatedHours: 10,
            confidence: 0.8,
          },
        ],
        complexity: { score: 5, factors: [], level: 'medium' },
        scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.75,
      };

      aiService.callModel
        .mockResolvedValueOnce(JSON.stringify(mockAnalysis))
        .mockRejectedValueOnce(new Error('Task decomposition failed'));

      dbService.storeVector.mockResolvedValue({} as any);
      dbService.createDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Test Deliverable' } as any,
      ]);
      dbService.createTasks.mockResolvedValue([{ id: 'task-1' } as any]);
      dbService.updateIdea.mockResolvedValue({} as any);
      dbService.logAgentAction.mockResolvedValue(undefined);

      const session = await breakdownEngine.startBreakdown(
        'idea-123',
        'Test idea',
        {},
        {}
      );

      expect(session.tasks).toBeDefined();
      expect(session.tasks?.tasks).toHaveLength(1);
      expect(session.tasks?.tasks[0].title).toContain('Test Deliverable');
    });
  });

  describe('getBreakdownSession', () => {
    it('should retrieve existing breakdown session', async () => {
      const { dbService } = require('@/lib/db');

      const mockSession = {
        ideaId: 'idea-123',
        analysis: {
          objectives: [],
          deliverables: [],
          complexity: { score: 5, factors: [], level: 'medium' },
          scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
          riskFactors: [],
          successCriteria: [],
          overallConfidence: 0.8,
        },
        tasks: null,
        dependencies: null,
        timeline: null,
        status: 'analyzing' as const,
        confidence: 0.5,
        processingTime: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dbService.getVectors.mockResolvedValue([
        { vector_data: mockSession } as any,
      ]);

      const session = await breakdownEngine.getBreakdownSession('idea-123');

      expect(session).toBeDefined();
      expect(session?.ideaId).toBe('idea-123');
      expect(session?.createdAt).toBeInstanceOf(Date);
      expect(session?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent session', async () => {
      const { dbService } = require('@/lib/db');

      dbService.getVectors.mockResolvedValue([]);

      const session = await breakdownEngine.getBreakdownSession('non-existent');

      expect(session).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const { dbService } = require('@/lib/db');

      dbService.getVectors.mockRejectedValue(new Error('Database error'));

      const session = await breakdownEngine.getBreakdownSession('idea-123');

      expect(session).toBeNull();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when config loaded', async () => {
      const health = await breakdownEngine.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.config).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty user responses', async () => {
      const { aiService } = require('@/lib/ai');
      const { dbService } = require('@/lib/db');

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Task',
            description: 'Test',
            priority: 1,
            estimatedHours: 8,
            confidence: 0.8,
          },
        ],
        complexity: { score: 3, factors: [], level: 'simple' },
        scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.75,
      };

      aiService.callModel.mockResolvedValue(JSON.stringify(mockAnalysis));
      dbService.storeVector.mockResolvedValue({} as any);
      dbService.createDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Task' } as any,
      ]);
      dbService.createTasks.mockResolvedValue([{ id: 'task-1' } as any]);
      dbService.updateIdea.mockResolvedValue({} as any);
      dbService.logAgentAction.mockResolvedValue(undefined);

      const session = await breakdownEngine.startBreakdown(
        'idea-123',
        'Test idea',
        {},
        {}
      );

      expect(session.status).toBe('completed');
    });

    it('should handle deliverable with zero estimated hours', async () => {
      const { aiService } = require('@/lib/ai');
      const { dbService } = require('@/lib/db');

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Task',
            description: 'Test',
            priority: 1,
            estimatedHours: 0,
            confidence: 0.8,
          },
        ],
        complexity: { score: 2, factors: [], level: 'simple' },
        scope: { size: 'small', estimatedWeeks: 1, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.75,
      };

      aiService.callModel
        .mockResolvedValueOnce(JSON.stringify(mockAnalysis))
        .mockResolvedValueOnce(JSON.stringify([]));

      dbService.storeVector.mockResolvedValue({} as any);
      dbService.createDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Task' } as any,
      ]);
      dbService.updateIdea.mockResolvedValue({} as any);
      dbService.logAgentAction.mockResolvedValue(undefined);

      const session = await breakdownEngine.startBreakdown(
        'idea-123',
        'Test idea',
        {},
        {}
      );

      expect(session.status).toBe('completed');
    });

    it('should handle very large number of deliverables', async () => {
      const { aiService } = require('@/lib/ai');
      const { dbService } = require('@/lib/db');

      const manyDeliverables = Array.from({ length: 50 }, (_, i) => ({
        title: `Deliverable ${i}`,
        description: `Description ${i}`,
        priority: (i % 5) + 1,
        estimatedHours: (i % 8) + 1,
        confidence: 0.8,
      }));

      const mockAnalysis = {
        objectives: [],
        deliverables: manyDeliverables,
        complexity: { score: 7, factors: [], level: 'complex' },
        scope: { size: 'large', estimatedWeeks: 20, teamSize: 5 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.8,
      };

      aiService.callModel
        .mockResolvedValueOnce(JSON.stringify(mockAnalysis))
        .mockResolvedValue(
          JSON.stringify([
            {
              id: 't1',
              title: 'Task 1',
              estimatedHours: 4,
              complexity: 3,
              requiredSkills: [],
              dependencies: [],
            },
          ])
        );

      dbService.storeVector.mockResolvedValue({} as any);
      dbService.createDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Deliverable 0' } as any,
      ]);
      dbService.createTasks.mockResolvedValue([{ id: 'task-1' } as any]);
      dbService.updateIdea.mockResolvedValue({} as any);
      dbService.logAgentAction.mockResolvedValue(undefined);

      const session = await breakdownEngine.startBreakdown(
        'idea-123',
        'Test idea',
        {},
        {}
      );

      expect(session.status).toBe('completed');
    });
  });

  describe('Performance and Scalability', () => {
    it('should process multiple concurrent breakdowns', async () => {
      const { aiService } = require('@/lib/ai');
      const { dbService } = require('@/lib/db');

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Task',
            description: 'Test',
            priority: 1,
            estimatedHours: 8,
            confidence: 0.8,
          },
        ],
        complexity: { score: 3, factors: [], level: 'simple' },
        scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.75,
      };

      aiService.callModel.mockResolvedValue(JSON.stringify(mockAnalysis));
      dbService.storeVector.mockResolvedValue({} as any);
      dbService.createDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Task' } as any,
      ]);
      dbService.createTasks.mockResolvedValue([{ id: 'task-1' } as any]);
      dbService.updateIdea.mockResolvedValue({} as any);
      dbService.logAgentAction.mockResolvedValue(undefined);

      const startTime = Date.now();
      const promises = Array.from({ length: 5 }, (_, i) =>
        breakdownEngine.startBreakdown(`idea-${i}`, 'Test idea', {}, {})
      );
      const sessions = await Promise.all(promises);
      const endTime = Date.now();

      expect(sessions).toHaveLength(5);
      sessions.forEach((session) => {
        expect(session.status).toBe('completed');
      });
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });
});
