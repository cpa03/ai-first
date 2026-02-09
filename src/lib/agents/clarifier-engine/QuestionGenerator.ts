import { aiService, AIModelConfig } from '@/lib/ai';
import { promptService } from '@/lib/prompt-service';
import {
  safeJsonParse,
  isArrayOf,
  isClarifierQuestion,
} from '@/lib/validation';
import { createLogger } from '@/lib/logger';
import { AGENT_CONFIG } from '@/lib/config/constants';

const logger = createLogger('QuestionGenerator');
const { QUESTION_GENERATOR } = AGENT_CONFIG;

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

    const prompt = await promptService.getUserPrompt(
      'clarifier',
      'generate-questions',
      {
        idea: ideaText,
      }
    );

    try {
      const systemPrompt = await promptService.getSystemPrompt(
        'clarifier',
        'generate-questions'
      );
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt,
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

      const mappedQuestions = questionsData.map((q, index: number) => ({
        id: q.id || `q_${index + 1}`,
        question: q.question || `Question ${index + 1}`,
        type: q.type || QUESTION_GENERATOR.DEFAULT_QUESTION_TYPE,
        options: q.options || [],
        required:
          q.required !== false ? QUESTION_GENERATOR.REQUIRED_DEFAULT : false,
      })) as ClarifierQuestion[];

      if (
        mappedQuestions.length < QUESTION_GENERATOR.MIN_QUESTIONS ||
        mappedQuestions.length > QUESTION_GENERATOR.MAX_QUESTIONS
      ) {
        logger.warn(
          `Invalid question count: ${mappedQuestions.length}, using fallback`
        );
        return this.getFallbackQuestions();
      }

      return mappedQuestions;
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
