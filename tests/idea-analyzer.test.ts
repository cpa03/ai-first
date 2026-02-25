/**
 * IdeaAnalyzer Module Unit Tests
 *
 * Tests the IdeaAnalyzer module which handles AI-based idea analysis
 * and validation.
 */

import { IdeaAnalyzer } from '@/lib/agents/breakdown-engine/IdeaAnalyzer';
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

describe('IdeaAnalyzer', () => {
  let analyzer: IdeaAnalyzer;
  let mockAiConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAiConfig = {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    };
    analyzer = new IdeaAnalyzer({ aiConfig: mockAiConfig });
  });

  describe('analyzeIdea', () => {
    it('should generate comprehensive idea analysis', async () => {
      const { aiService } = require('@/lib/ai');

      const mockAnalysis: IdeaAnalysis = {
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

      const analysis = await analyzer.analyzeIdea(
        'Build a real-time collaboration tool',
        { audience: 'remote teams' },
        { complexity: 'complex' }
      );

      expect(analysis).toEqual(mockAnalysis);
      expect(analysis.objectives).toHaveLength(1);
      expect(analysis.deliverables).toHaveLength(1);
      expect(analysis.complexity.level).toBe('complex');
      expect(analysis.overallConfidence).toBe(0.8);
    });

    it('should validate and fix incomplete analysis', async () => {
      const { aiService } = require('@/lib/ai');

      const incompleteAnalysis = {
        objectives: [],
        deliverables: [],
        complexity: {},
        scope: {},
        riskFactors: [],
        successCriteria: [],
      };

      aiService.callModel.mockResolvedValue(JSON.stringify(incompleteAnalysis));

      const analysis = await analyzer.analyzeIdea('Test idea', {}, {});

      expect(analysis.objectives).toEqual([]);
      expect(analysis.deliverables).toEqual([]);
      expect(analysis.complexity).toBeDefined();
      expect(analysis.scope).toBeDefined();
      expect(analysis.riskFactors).toEqual([]);
      expect(analysis.successCriteria).toEqual([]);
      expect(analysis.overallConfidence).toBe(0.7);
    });

    it('should handle malformed JSON response with fallback', async () => {
      const { aiService } = require('@/lib/ai');

      aiService.callModel.mockResolvedValue('Invalid JSON {{{');

      const analysis = await analyzer.analyzeIdea('Test idea', {}, {});

      expect(analysis).toBeDefined();
      expect(analysis.objectives).toEqual([]);
      expect(analysis.deliverables).toEqual([]);
      expect(analysis.overallConfidence).toBe(0.7);
    });

    it('should handle null analysis response', async () => {
      const { aiService } = require('@/lib/ai');

      aiService.callModel.mockResolvedValue('null');

      const analysis = await analyzer.analyzeIdea('Test idea', {}, {});

      expect(analysis).toBeDefined();
      expect(analysis.objectives).toEqual([]);
      expect(analysis.deliverables).toEqual([]);
      expect(analysis.overallConfidence).toBe(0.7);
    });

    it('should handle AI service errors', async () => {
      const { aiService } = require('@/lib/ai');

      aiService.callModel.mockRejectedValue(new Error('AI service error'));

      await expect(analyzer.analyzeIdea('Test idea', {}, {})).rejects.toThrow(
        'Idea analysis failed'
      );
    });

    it('should handle missing required fields with defaults', async () => {
      const { aiService } = require('@/lib/ai');

      const partialAnalysis = {
        objectives: [{ title: 'Test', description: 'Test', confidence: 0.8 }],
        deliverables: [],
      };

      aiService.callModel.mockResolvedValue(JSON.stringify(partialAnalysis));

      const analysis = await analyzer.analyzeIdea('Test idea', {}, {});

      expect(analysis.complexity).toEqual({
        score: 5,
        factors: [],
        level: 'medium',
      });
      expect(analysis.scope).toEqual({
        size: 'medium',
        estimatedWeeks: 8,
        teamSize: 2,
      });
      expect(analysis.riskFactors).toEqual([]);
      expect(analysis.successCriteria).toEqual([]);
      expect(analysis.overallConfidence).toBe(0.7);
    });

    it('should pass options to prompt generation', async () => {
      const { aiService } = require('@/lib/ai');
      const { promptService } = require('@/lib/prompt-service');

      const mockAnalysis: IdeaAnalysis = {
        objectives: [],
        deliverables: [],
        complexity: { score: 5, factors: [], level: 'medium' },
        scope: { size: 'medium', estimatedWeeks: 8, teamSize: 2 },
        riskFactors: [],
        successCriteria: [],
        overallConfidence: 0.75,
      };

      aiService.callModel.mockResolvedValue(JSON.stringify(mockAnalysis));

      const options = {
        complexity: 'complex' as const,
        teamSize: 4,
        timelineWeeks: 12,
        constraints: ['Budget limit', 'Quick delivery'],
      };

      await analyzer.analyzeIdea(
        'Test idea',
        { audience: 'developers' },
        options
      );

      expect(promptService.getUserPrompt).toHaveBeenCalledWith(
        'breakdown',
        'analyze-idea',
        expect.objectContaining({
          options: JSON.stringify(options, null, 2),
        })
      );
    });
  });
});
