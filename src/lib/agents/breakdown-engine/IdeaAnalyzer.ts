import { AIModelConfig } from '@/lib/ai';
import { promptService } from '@/lib/prompt-service';
import { safeJsonParse, isIdeaAnalysis } from '@/lib/validation';
import { createLogger } from '@/lib/logger';
import { IdeaAnalysis } from '../breakdown-engine';

const logger = createLogger('IdeaAnalyzer');

export interface IdeaAnalyzerConfig {
  aiConfig: AIModelConfig;
}

export class IdeaAnalyzer {
  constructor(private config: IdeaAnalyzerConfig) {}

  async analyzeIdea(
    refinedIdea: string,
    userResponses: Record<string, string>,
    options: {
      complexity?: 'simple' | 'medium' | 'complex';
      teamSize?: number;
      timelineWeeks?: number;
      constraints?: string[];
    }
  ): Promise<IdeaAnalysis> {
    const prompt = promptService.getUserPrompt('breakdown', 'analyze-idea', {
      refinedIdea,
      userResponses: JSON.stringify(userResponses, null, 2),
      options: JSON.stringify(options, null, 2),
    });

    try {
      const messages = [
        {
          role: 'system' as const,
          content: promptService.getSystemPrompt('breakdown', 'analyze-idea'),
        },
        { role: 'user' as const, content: prompt },
      ];

      const { aiService } = await import('@/lib/ai');
      const response = await aiService.callModel(
        messages,
        this.config.aiConfig
      );
      const analysis = safeJsonParse<IdeaAnalysis | null>(
        response,
        null,
        isIdeaAnalysis
      );

      return this.validateAnalysis(analysis);
    } catch (error) {
      logger.error('Failed to analyze idea:', error);
      throw new Error('Idea analysis failed');
    }
  }

  private validateAnalysis(analysis: any): IdeaAnalysis {
    if (!analysis.objectives || !Array.isArray(analysis.objectives)) {
      analysis.objectives = [];
    }
    if (!analysis.deliverables || !Array.isArray(analysis.deliverables)) {
      analysis.deliverables = [];
    }
    if (!analysis.complexity) {
      analysis.complexity = { score: 5, factors: [], level: 'medium' };
    }
    if (!analysis.scope) {
      analysis.scope = { size: 'medium', estimatedWeeks: 8, teamSize: 2 };
    }
    if (!analysis.riskFactors || !Array.isArray(analysis.riskFactors)) {
      analysis.riskFactors = [];
    }
    if (!analysis.successCriteria || !Array.isArray(analysis.successCriteria)) {
      analysis.successCriteria = [];
    }
    if (typeof analysis.overallConfidence !== 'number') {
      analysis.overallConfidence = 0.7;
    }

    return analysis as IdeaAnalysis;
  }
}
