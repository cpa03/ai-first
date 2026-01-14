/**
 * TaskDecomposer Module Unit Tests
 *
 * Tests TaskDecomposer module which breaks down deliverables into individual tasks.
 */

import { TaskDecomposer } from '@/lib/agents/breakdown-engine/TaskDecomposer';
import { IdeaAnalysis } from '@/lib/agents/breakdown-engine';

jest.mock('@/lib/ai', () => ({
  aiService: {
    callModel: jest.fn(),
  },
}));

jest.mock('@/lib/prompt-service', () => ({
  promptService: {
    getUserPrompt: jest.fn(() => 'test prompt'),
    getSystemPrompt: jest.fn(() => 'test system prompt'),
  },
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('TaskDecomposer', () => {
  let decomposer: TaskDecomposer;
  let mockAiConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAiConfig = {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    };
    decomposer = new TaskDecomposer({ aiConfig: mockAiConfig });
  });

  describe('decomposeTasks', () => {
    it('should decompose deliverables into tasks', async () => {
      const { aiService } = require('@/lib/ai');

      const mockAnalysis: IdeaAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'User Authentication',
            description: 'Implement login/signup',
            priority: 1,
            estimatedHours: 20,
            confidence: 0.9,
          },
          {
            title: 'Dashboard',
            description: 'Create dashboard UI',
            priority: 2,
            estimatedHours: 15,
            confidence: 0.85,
          },
        ],
        complexity: { score: 5, factors: [], level: 'medium' },
        scope: { size: 'small', estimatedWeeks: 4, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.8,
      };

      const mockTasks1 = [
        {
          id: 't1',
          title: 'Design auth UI',
          description: 'Create login/signup forms',
          estimatedHours: 8,
          complexity: 3,
          requiredSkills: ['UI/UX'],
          dependencies: [],
        },
      ];

      const mockTasks2 = [
        {
          id: 't2',
          title: 'Create dashboard layout',
          description: 'Build dashboard structure',
          estimatedHours: 10,
          complexity: 4,
          requiredSkills: ['Frontend'],
          dependencies: [],
        },
      ];

      aiService.callModel
        .mockResolvedValueOnce(JSON.stringify(mockTasks1))
        .mockResolvedValueOnce(JSON.stringify(mockTasks2));

      const decomposition = await decomposer.decomposeTasks(mockAnalysis);

      expect(decomposition.tasks).toHaveLength(2);
      expect(decomposition.tasks[0].deliverableId).toBe('User Authentication');
      expect(decomposition.tasks[1].deliverableId).toBe('Dashboard');
      expect(decomposition.totalEstimatedHours).toBe(18);
      expect(decomposition.confidence).toBeCloseTo(0.72, 2);
    });

    it('should create fallback task on decomposition error', async () => {
      const { aiService } = require('@/lib/ai');

      const mockAnalysis: IdeaAnalysis = {
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

      const decomposition = await decomposer.decomposeTasks(mockAnalysis);

      expect(decomposition.tasks).toHaveLength(1);
      expect(decomposition.tasks[0].title).toBe('Complete Documentation');
      expect(decomposition.tasks[0].deliverableId).toBe('Documentation');
      expect(decomposition.totalEstimatedHours).toBe(16);
      expect(decomposition.tasks[0].description).toBe('Write user guides');
      expect(decomposition.tasks[0].estimatedHours).toBe(16);
      expect(decomposition.tasks[0].complexity).toBe(5);
      expect(decomposition.tasks[0].requiredSkills).toEqual(['General']);
    });

    it('should calculate correct total hours', async () => {
      const { aiService } = require('@/lib/ai');

      const mockAnalysis: IdeaAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Feature A',
            description: 'Description A',
            priority: 1,
            estimatedHours: 10,
            confidence: 0.8,
          },
          {
            title: 'Feature B',
            description: 'Description B',
            priority: 1,
            estimatedHours: 15,
            confidence: 0.8,
          },
        ],
        complexity: { score: 3, factors: [], level: 'simple' },
        scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.8,
      };

      const mockTasks1 = [
        {
          id: 't1',
          title: 'Task A1',
          description: 'Task A1 description',
          estimatedHours: 5,
          complexity: 2,
          requiredSkills: ['Dev'],
          dependencies: [],
        },
      ];

      const mockTasks2 = [
        {
          id: 't2',
          title: 'Task B1',
          description: 'Task B1 description',
          estimatedHours: 8,
          complexity: 3,
          requiredSkills: ['Dev'],
          dependencies: [],
        },
      ];

      aiService.callModel
        .mockResolvedValueOnce(JSON.stringify(mockTasks1))
        .mockResolvedValueOnce(JSON.stringify(mockTasks2));

      const decomposition = await decomposer.decomposeTasks(mockAnalysis);

      expect(decomposition.totalEstimatedHours).toBe(13);
    });

    it('should assign unique task IDs', async () => {
      const { aiService } = require('@/lib/ai');

      const mockAnalysis: IdeaAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Deliverable 1',
            description: 'Description 1',
            priority: 1,
            estimatedHours: 10,
            confidence: 0.8,
          },
          {
            title: 'Deliverable 2',
            description: 'Description 2',
            priority: 1,
            estimatedHours: 15,
            confidence: 0.8,
          },
        ],
        complexity: { score: 3, factors: [], level: 'simple' },
        scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.8,
      };

      aiService.callModel.mockRejectedValue(new Error('Error'));

      const decomposition = await decomposer.decomposeTasks(mockAnalysis);

      const taskIds = decomposition.tasks.map((task) => task.id);
      const uniqueIds = new Set(taskIds);

      expect(uniqueIds.size).toBe(taskIds.length);
    });

    it('should calculate confidence based on analysis confidence', async () => {
      const { aiService } = require('@/lib/ai');

      const mockAnalysis: IdeaAnalysis = {
        objectives: [],
        deliverables: [
          {
            title: 'Test Deliverable',
            description: 'Test description',
            priority: 1,
            estimatedHours: 10,
            confidence: 0.9,
          },
        ],
        complexity: { score: 3, factors: [], level: 'simple' },
        scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.9,
      };

      const mockTasks = [
        {
          id: 't1',
          title: 'Test Task',
          description: 'Task description',
          estimatedHours: 5,
          complexity: 3,
          requiredSkills: ['Dev'],
          dependencies: [],
        },
      ];

      aiService.callModel.mockResolvedValue(JSON.stringify(mockTasks));

      const decomposition = await decomposer.decomposeTasks(mockAnalysis);

      expect(decomposition.confidence).toBeCloseTo(0.81, 2);
    });
  });
});
