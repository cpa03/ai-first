import { aiService, AIModelConfig } from '@/lib/ai';
import { promptService } from '@/lib/prompt-service';
import {
  safeJsonParse,
  isArrayOf,
  isClarifierQuestion,
} from '@/lib/validation';
import { createLogger } from '@/lib/logger';

const logger = createLogger('QuestionGenerator');

export interface ClarifierQuestion {
  id: string;
  question: string;
  type: 'open' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
}

export class QuestionGenerator {
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

  async generate(ideaText: string): Promise<ClarifierQuestion[]> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    const prompt = promptService.getUserPrompt(
      'clarifier',
      'generate-questions',
      {
        idea: ideaText,
      }
    );

    try {
      const messages = [
        {
          role: 'system' as const,
          content: promptService.getSystemPrompt(
            'clarifier',
            'generate-questions'
          ),
        },
        { role: 'user' as const, content: prompt },
      ];

      const response = await this.aiService.callModel(messages, this.aiConfig);

      const questionsData = safeJsonParse<ClarifierQuestion[]>(
        response,
        [],
        (data): data is ClarifierQuestion[] =>
          isArrayOf(data, isClarifierQuestion)
      );

      return questionsData.map((q, index: number) => ({
        id: q.id || `q_${index + 1}`,
        question: q.question || `Question ${index + 1}`,
        type: q.type || 'open',
        options: q.options || [],
        required: q.required !== false,
      })) as ClarifierQuestion[];
    } catch (error) {
      logger.error('Failed to generate questions', error);

      return this.getFallbackQuestions();
    }
  }

  private getFallbackQuestions(): ClarifierQuestion[] {
    return [
      {
        id: 'q_1',
        question:
          'What is main problem you are trying to solve with this idea?',
        type: 'open',
        options: [],
        required: true,
      },
      {
        id: 'q_2',
        question: 'Who is target audience for this solution?',
        type: 'open',
        options: [],
        required: true,
      },
      {
        id: 'q_3',
        question: 'What are key features or functionality you envision?',
        type: 'open',
        options: [],
        required: true,
      },
    ];
  }
}
