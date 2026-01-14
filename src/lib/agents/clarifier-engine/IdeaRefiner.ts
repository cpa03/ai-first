import { aiService, AIModelConfig } from '@/lib/ai';
import { promptService } from '@/lib/prompt-service';
import { createLogger } from '@/lib/logger';
import type { ClarifierQuestion } from './QuestionGenerator';

const logger = createLogger('IdeaRefiner');

export interface ClarificationSession {
  ideaId: string;
  originalIdea: string;
  questions: ClarifierQuestion[];
  answers: Record<string, string>;
  confidence: number;
  refinedIdea?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class IdeaRefiner {
  private aiConfig: AIModelConfig | null = null;
  public aiService = aiService;

  constructor(
    aiConfig: AIModelConfig | null,
    injectedAiService?: typeof aiService
  ) {
    this.aiConfig = aiConfig;
    if (injectedAiService) {
      this.aiService = injectedAiService;
    }
  }

  async refine(session: ClarificationSession): Promise<string> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    const answersText = this.formatAnswers(session);

    const prompt = promptService.getUserPrompt('clarifier', 'refine-idea', {
      originalIdea: session.originalIdea,
      answers: answersText,
    });

    try {
      const messages = [
        {
          role: 'system' as const,
          content: promptService.getSystemPrompt('clarifier', 'refine-idea'),
        },
        { role: 'user' as const, content: prompt },
      ];

      const response = await this.aiService.callModel(messages, this.aiConfig);
      return response.trim();
    } catch (error) {
      logger.error('Failed to generate refined idea', error);

      return this.getFallbackRefinement(session, answersText);
    }
  }

  private formatAnswers(session: ClarificationSession): string {
    return Object.entries(session.answers)
      .map(([questionId, answer]) => {
        const question = session.questions.find((q) => q.id === questionId);
        return `Q: ${question?.question || 'Unknown question'}\nA: ${answer}`;
      })
      .join('\n\n');
  }

  private getFallbackRefinement(
    session: ClarificationSession,
    answersText: string
  ): string {
    return `${session.originalIdea}\n\nAdditional Details:\n${answersText}`;
  }
}
