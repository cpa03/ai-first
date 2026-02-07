import { AIModelConfig, aiService } from '@/lib/ai';
import { promptService } from '@/lib/prompt-service';
import { safeJsonParse } from '@/lib/validation';
import { isIdeaAnalysis } from '@/lib/type-guards';
import { createLogger } from '@/lib/logger';
import { IdeaAnalysis } from '../breakdown-engine';

const logger = createLogger('IdeaAnalyzer');

export interface IdeaAnalyzerConfig {
  aiConfig: AIModelConfig;
  aiService?: typeof aiService;
}

export class IdeaAnalyzer {
  private readonly injectedAiService: typeof aiService;

  constructor(private config: IdeaAnalyzerConfig) {
    this.injectedAiService = config.aiService || aiService;
  }

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
    const prompt = await promptService.getUserPrompt(
      'breakdown',
      'analyze-idea',
      {
        refinedIdea,
        userResponses: JSON.stringify(userResponses, null, 2),
        options: JSON.stringify(options, null, 2),
      }
    );

    try {
      const systemPrompt = await promptService.getSystemPrompt(
        'breakdown',
        'analyze-idea'
      );
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        { role: 'user' as const, content: prompt },
      ];

      const response = await this.injectedAiService.callModel(
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

  private validateAnalysis(
    analysis: Partial<IdeaAnalysis> | unknown
  ): IdeaAnalysis {
    if (!analysis || typeof analysis !== 'object') {
      return this.getFallbackAnalysis();
    }

    const typedAnalysis = analysis as Partial<IdeaAnalysis>;

    if (!typedAnalysis.objectives || !Array.isArray(typedAnalysis.objectives)) {
      typedAnalysis.objectives = [];
    }
    if (
      !typedAnalysis.deliverables ||
      !Array.isArray(typedAnalysis.deliverables)
    ) {
      typedAnalysis.deliverables = [];
    }
    if (!typedAnalysis.complexity) {
      typedAnalysis.complexity = { score: 5, factors: [], level: 'medium' };
    }
    if (!typedAnalysis.scope) {
      typedAnalysis.scope = { size: 'medium', estimatedWeeks: 8, teamSize: 2 };
    }
    if (
      !typedAnalysis.riskFactors ||
      !Array.isArray(typedAnalysis.riskFactors)
    ) {
      typedAnalysis.riskFactors = [];
    }
    if (
      !typedAnalysis.successCriteria ||
      !Array.isArray(typedAnalysis.successCriteria)
    ) {
      typedAnalysis.successCriteria = [];
    }
    if (typeof typedAnalysis.overallConfidence !== 'number') {
      typedAnalysis.overallConfidence = 0.7;
    }

    return typedAnalysis as IdeaAnalysis;
  }

  private getFallbackAnalysis(): IdeaAnalysis {
    return {
      objectives: [],
      deliverables: [],
      complexity: { score: 5, factors: [], level: 'medium' },
      scope: { size: 'medium', estimatedWeeks: 8, teamSize: 2 },
      riskFactors: [],
      successCriteria: [],
      overallConfidence: 0.7,
    };
  }
}
