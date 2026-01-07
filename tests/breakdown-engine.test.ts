/**
 * Comprehensive Breakdown Engine Tests
 *
 * Tests critical business logic for idea breakdown into deliverables,
 * tasks, dependencies, and timeline.
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
    getIdeaDeliverables: jest.fn(),
    createTask: jest.fn(),
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
        totalEstimatedHours: 40,
        confidence: 0.75,
      };

      aiService.callModel
        .mockResolvedValueOnce(JSON.stringify(mockAnalysis))
        .mockResolvedValueOnce(JSON.stringify(mockTasks.tasks));

      dbService.storeVector.mockResolvedValue({} as any);
      dbService.createDeliverable.mockResolvedValue({ id: 'del-1' } as any);
      dbService.getIdeaDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'User Interface' } as any,
      ]);
      dbService.createTask.mockResolvedValue({ id: 'task-1' } as any);
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
      expect(dbService.createDeliverable).toHaveBeenCalled();
      expect(dbService.createTask).toHaveBeenCalled();
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
      ).rejects.toThrow('AI analysis failed');

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
      dbService.createDeliverable.mockResolvedValue({ id: 'del-1' } as any);
      dbService.getIdeaDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Test Deliverable' } as any,
      ]);
      dbService.createTask.mockResolvedValue({ id: 'task-1' } as any);
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

  describe('analyzeIdea', () => {
    it('should generate comprehensive idea analysis', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);

      const mockAnalysis = {
        objectives: [
          {
            title: 'Create MVP',
            description: 'Launch basic version',
            confidence: 0.9,
          },
        ],
        deliverables: [
          {
            title: 'Backend API',
            description: 'REST API endpoints',
            priority: 1,
            estimatedHours: 40,
            confidence: 0.85,
          },
        ],
        complexity: {
          score: 7,
          factors: ['Authentication', 'Real-time features'],
          level: 'complex',
        },
        scope: {
          size: 'large',
          estimatedWeeks: 12,
          teamSize: 3,
        },
        riskFactors: [
          { factor: 'Technical complexity', impact: 'high', probability: 0.5 },
        ],
        successCriteria: ['Launch to production', '1000 users'],
        overallConfidence: 0.8,
      };

      aiService.callModel.mockResolvedValue(JSON.stringify(mockAnalysis));

      const session = await breakdownEngine.initialize();
      const analysis = await (breakdownEngine as any).analyzeIdea(
        'Build a real-time collaboration tool',
        { audience: 'remote teams' },
        {}
      );

      expect(analysis).toEqual(mockAnalysis);
      expect(analysis.objectives).toHaveLength(1);
      expect(analysis.deliverables).toHaveLength(1);
      expect(analysis.complexity.level).toBe('complex');
      expect(analysis.overallConfidence).toBe(0.8);
    });

    it('should validate and fix incomplete analysis', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);

      const incompleteAnalysis = {
        objectives: [],
        deliverables: [],
        missingFields: 'should be added',
      };

      aiService.callModel.mockResolvedValue(JSON.stringify(incompleteAnalysis));

      const analysis = await (breakdownEngine as any).analyzeIdea(
        'Test idea',
        {},
        {}
      );

      expect(analysis.objectives).toEqual([]);
      expect(analysis.deliverables).toEqual([]);
      expect(analysis.complexity).toBeDefined();
      expect(analysis.scope).toBeDefined();
      expect(analysis.riskFactors).toEqual([]);
      expect(analysis.successCriteria).toEqual([]);
      expect(analysis.overallConfidence).toBe(0.7);
    });

    it('should handle malformed JSON response', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);

      aiService.callModel.mockResolvedValue('Invalid JSON {{{');

      await expect(
        (breakdownEngine as any).analyzeIdea('Test idea', {}, {})
      ).rejects.toThrow();
    });
  });

  describe('decomposeTasks', () => {
    it('should decompose deliverable into tasks', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'User Authentication',
            description: 'Implement login/signup',
            priority: 1,
            estimatedHours: 20,
            confidence: 0.9,
          },
        ],
        complexity: { score: 5, factors: [], level: 'medium' },
        scope: { size: 'small', estimatedWeeks: 4, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.8,
      };

      const mockTasks = [
        {
          id: 't1',
          title: 'Design auth UI',
          description: 'Create login/signup forms',
          estimatedHours: 8,
          complexity: 3,
          requiredSkills: ['UI/UX'],
          dependencies: [],
        },
        {
          id: 't2',
          title: 'Implement auth API',
          description: 'Create auth endpoints',
          estimatedHours: 12,
          complexity: 5,
          requiredSkills: ['Backend'],
          dependencies: ['t1'],
        },
      ];

      aiService.callModel.mockResolvedValue(JSON.stringify(mockTasks));

      const decomposition = await (breakdownEngine as any).decomposeTasks(
        mockAnalysis
      );

      expect(decomposition.tasks).toHaveLength(2);
      expect(decomposition.tasks[0].deliverableId).toBe('User Authentication');
      expect(decomposition.tasks[1].deliverableId).toBe('User Authentication');
      expect(decomposition.totalEstimatedHours).toBe(20);
      expect(decomposition.confidence).toBe(0.72);
    });

    it('should create fallback task on decomposition error', async () => {
      const { aiService } = require('@/lib/ai');
      aiService.initialize.mockResolvedValue(undefined);

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Documentation',
            description: 'Write user guides',
            priority: 2,
            estimatedHours: 16,
            confidence: 0.85,
          },
        ],
        complexity: { score: 3, factors: [], level: 'simple' },
        scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.75,
      };

      aiService.callModel.mockRejectedValue(new Error('AI error'));

      const decomposition = await (breakdownEngine as any).decomposeTasks(
        mockAnalysis
      );

      expect(decomposition.tasks).toHaveLength(1);
      expect(decomposition.tasks[0].title).toContain('Documentation');
      expect(decomposition.tasks[0].deliverableId).toBe('Documentation');
      expect(decomposition.totalEstimatedHours).toBe(16);
    });
  });

  describe('analyzeDependencies', () => {
    it('should analyze task dependencies correctly', async () => {
      const { aiService } = require('@/lib/ai');
      await breakdownEngine.initialize();

      const mockTasks = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            estimatedHours: 4,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
          {
            id: 't2',
            title: 'Task 2',
            estimatedHours: 8,
            complexity: 5,
            requiredSkills: [],
            dependencies: ['t1'],
            deliverableId: 'd1',
          },
          {
            id: 't3',
            title: 'Task 3',
            estimatedHours: 6,
            complexity: 4,
            requiredSkills: [],
            dependencies: ['t2'],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 18,
        confidence: 0.8,
      };

      const dependencies = await (breakdownEngine as any).analyzeDependencies(
        mockTasks
      );

      expect(dependencies.nodes).toHaveLength(3);
      expect(dependencies.edges).toHaveLength(2);
      expect(dependencies.edges[0]).toEqual({
        from: 't1',
        to: 't2',
        type: 'finish_to_start',
        lag: 0,
      });
      expect(dependencies.criticalPath).toBeDefined();
      expect(dependencies.criticalPath.length).toBeGreaterThan(0);
    });

    it('should handle tasks without dependencies', async () => {
      const { aiService } = require('@/lib/ai');
      await breakdownEngine.initialize();

      const mockTasks = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            estimatedHours: 4,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
          {
            id: 't2',
            title: 'Task 2',
            estimatedHours: 8,
            complexity: 5,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 12,
        confidence: 0.8,
      };

      const dependencies = await (breakdownEngine as any).analyzeDependencies(
        mockTasks
      );

      expect(dependencies.edges).toHaveLength(0);
      expect(dependencies.criticalPath).toEqual(['t1', 't2']);
    });
  });

  describe('generateTimeline', () => {
    it('should generate project timeline', async () => {
      const { aiService } = require('@/lib/ai');
      await breakdownEngine.initialize();

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Phase 1',
            description: 'MVP',
            priority: 1,
            estimatedHours: 40,
            confidence: 0.9,
          },
          {
            title: 'Phase 2',
            description: 'Enhancements',
            priority: 2,
            estimatedHours: 40,
            confidence: 0.85,
          },
          {
            title: 'Phase 3',
            description: 'Testing',
            priority: 3,
            estimatedHours: 20,
            confidence: 0.8,
          },
        ],
        complexity: { score: 5, factors: [], level: 'medium' },
        scope: { size: 'medium', estimatedWeeks: 8, teamSize: 2 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.85,
      };

      const mockTasks = {
        tasks: [],
        totalEstimatedHours: 100,
        confidence: 0.75,
      };

      const mockDependencies = {
        nodes: [],
        edges: [],
        criticalPath: [],
      };

      const timeline = await (breakdownEngine as any).generateTimeline(
        mockAnalysis,
        mockTasks,
        mockDependencies,
        { teamSize: 2 }
      );

      expect(timeline.startDate).toBeInstanceOf(Date);
      expect(timeline.endDate).toBeInstanceOf(Date);
      expect(timeline.totalWeeks).toBeGreaterThan(0);
      expect(timeline.milestones).toHaveLength(3);
      expect(timeline.phases).toHaveLength(3);
      expect(timeline.phases[0].name).toBe('Planning & Design');
      expect(timeline.phases[1].name).toBe('Development');
      expect(timeline.phases[2].name).toBe('Testing & Deployment');
      expect(timeline.criticalPath).toBeDefined();
      expect(timeline.resourceAllocation).toEqual({ default: 2 });
    });

    it('should adjust timeline based on team size', async () => {
      const { aiService } = require('@/lib/ai');
      await breakdownEngine.initialize();

      const mockAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Task',
            description: 'Test',
            priority: 1,
            estimatedHours: 80,
            confidence: 0.9,
          },
        ],
        complexity: { score: 5, factors: [], level: 'medium' },
        scope: { size: 'medium', estimatedWeeks: 8, teamSize: 4 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.85,
      };

      const mockTasks = {
        tasks: [],
        totalEstimatedHours: 80,
        confidence: 0.75,
      };
      const mockDependencies = { nodes: [], edges: [], criticalPath: [] };

      const timeline1 = await (breakdownEngine as any).generateTimeline(
        mockAnalysis,
        mockTasks,
        mockDependencies,
        { teamSize: 1 }
      );

      const timeline2 = await (breakdownEngine as any).generateTimeline(
        mockAnalysis,
        mockTasks,
        mockDependencies,
        { teamSize: 4 }
      );

      expect(timeline1.totalWeeks).toBeGreaterThan(timeline2.totalWeeks);
    });
  });

  describe('calculateOverallConfidence', () => {
    it('should calculate weighted confidence', () => {
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
        tasks: { tasks: [], totalEstimatedHours: 40, confidence: 0.75 },
        dependencies: { nodes: [], edges: [], criticalPath: [] },
        timeline: {
          startDate: new Date(),
          endDate: new Date(),
          totalWeeks: 2,
          milestones: [],
          phases: [],
          criticalPath: [],
          resourceAllocation: {},
        },
        status: 'completed' as const,
        confidence: 0,
        processingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const confidence = (breakdownEngine as any).calculateOverallConfidence(
        mockSession
      );

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should handle missing components gracefully', () => {
      const incompleteSession = {
        ideaId: 'idea-123',
        analysis: null,
        tasks: null,
        dependencies: null,
        timeline: null,
        status: 'analyzing' as const,
        confidence: 0,
        processingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const confidence = (breakdownEngine as any).calculateOverallConfidence(
        incompleteSession
      );

      expect(confidence).toBe(0);
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
      dbService.createDeliverable.mockResolvedValue({ id: 'del-1' } as any);
      dbService.getIdeaDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Task' } as any,
      ]);
      dbService.createTask.mockResolvedValue({ id: 'task-1' } as any);
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
      dbService.createDeliverable.mockResolvedValue({ id: 'del-1' } as any);
      dbService.getIdeaDeliverables.mockResolvedValue([
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

    it('should handle circular dependencies gracefully', async () => {
      const { aiService } = require('@/lib/ai');
      await breakdownEngine.initialize();

      const mockTasks = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            estimatedHours: 4,
            complexity: 3,
            requiredSkills: [],
            dependencies: ['t2'],
            deliverableId: 'd1',
          },
          {
            id: 't2',
            title: 'Task 2',
            estimatedHours: 8,
            complexity: 5,
            requiredSkills: [],
            dependencies: ['t1'],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 12,
        confidence: 0.8,
      };

      const dependencies = await (breakdownEngine as any).analyzeDependencies(
        mockTasks
      );

      expect(dependencies).toBeDefined();
      expect(dependencies.criticalPath).toBeDefined();
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
      dbService.createDeliverable.mockResolvedValue({ id: 'del-1' } as any);
      dbService.getIdeaDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Deliverable 0' } as any,
      ]);
      dbService.createTask.mockResolvedValue({ id: 'task-1' } as any);
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
    it('should handle complex dependencies efficiently', async () => {
      const { aiService } = require('@/lib/ai');
      await breakdownEngine.initialize();

      const manyTasks = {
        tasks: Array.from({ length: 100 }, (_, i) => ({
          id: `t${i}`,
          title: `Task ${i}`,
          estimatedHours: (i % 8) + 1,
          complexity: (i % 5) + 1,
          requiredSkills: [],
          dependencies: i > 0 ? [`t${i - 1}`] : [],
          deliverableId: 'd1',
        })),
        totalEstimatedHours: 450,
        confidence: 0.75,
      };

      const startTime = Date.now();
      const dependencies = await (breakdownEngine as any).analyzeDependencies(
        manyTasks
      );
      const endTime = Date.now();

      expect(dependencies.nodes).toHaveLength(100);
      expect(dependencies.edges).toHaveLength(99);
      expect(endTime - startTime).toBeLessThan(5000);
    });

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
      dbService.createDeliverable.mockResolvedValue({ id: 'del-1' } as any);
      dbService.getIdeaDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Task' } as any,
      ]);
      dbService.createTask.mockResolvedValue({ id: 'task-1' } as any);
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
