import { AIModelConfig, aiService } from '@/lib/ai';
import { dbService, type Idea } from '@/lib/db';
import { configurationService, AgentConfig } from '@/lib/config-service';
import {
  QuestionGenerator,
  IdeaRefiner,
  SessionManager,
  ConfidenceCalculator,
} from './clarifier-engine';
import type {
  ClarificationSession,
  ClarifierQuestion,
} from './clarifier-engine';

export interface ClarifierConfig extends AgentConfig {
  functions: Array<{
    name: string;
    description: string;
    parameters: {
      type: object;
      properties: Record<string, unknown>;
    };
  }>;
}

export class ClarifierAgent {
  private config: ClarifierConfig | null = null;
  private aiConfig: AIModelConfig | null = null;
  private questionGenerator: QuestionGenerator | null = null;
  private ideaRefiner: IdeaRefiner | null = null;
  private sessionManager: SessionManager | null = null;
  private confidenceCalculator: ConfidenceCalculator | null = null;
  private injectedAiService: typeof aiService | null = null;

  constructor() {
    this.config =
      configurationService.loadAgentConfig<ClarifierConfig>('clarifier');
    this.aiConfig = configurationService.loadAIModelConfig('clarifier');
  }

  async initialize(): Promise<void> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    const aiServiceToUse = this.injectedAiService || aiService;

    this.questionGenerator = new QuestionGenerator(
      this.aiConfig,
      aiServiceToUse
    );
    this.ideaRefiner = new IdeaRefiner(this.aiConfig, aiServiceToUse);
    this.sessionManager = new SessionManager();
    this.confidenceCalculator = new ConfidenceCalculator();
  }

  async startClarification(
    ideaId: string,
    ideaText: string
  ): Promise<ClarificationSession> {
    try {
      await dbService.logAgentAction('clarifier', 'start-clarification', {
        ideaId,
        ideaText: ideaText.substring(0, 100) + '...',
      });

      const questions = await this.questionGenerator!.generate(ideaText);

      const session: ClarificationSession = {
        ideaId,
        originalIdea: ideaText,
        questions,
        answers: {},
        confidence: 0.5,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.sessionManager!.store(session);

      return session;
    } catch (error) {
      await dbService.logAgentAction('clarifier', 'start-clarification-error', {
        ideaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async submitAnswer(
    ideaId: string,
    questionId: string,
    answer: string
  ): Promise<ClarificationSession> {
    try {
      const session = await this.sessionManager!.get(ideaId);
      if (!session) {
        throw new Error('Clarification session not found');
      }

      session.answers[questionId] = answer;
      session.status = 'in_progress';
      session.updatedAt = new Date();

      session.confidence = this.confidenceCalculator!.calculateFromAnswers(
        session.answers,
        session.questions.length
      );

      await this.sessionManager!.store(session);

      await dbService.logAgentAction('clarifier', 'answer-submitted', {
        ideaId,
        questionId,
        answerLength: answer.length,
      });

      return session;
    } catch (error) {
      await dbService.logAgentAction('clarifier', 'answer-submitted-error', {
        ideaId,
        questionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async completeClarification(
    ideaId: string
  ): Promise<ClarificationSession & { refinedIdea: string }> {
    try {
      const session = await this.sessionManager!.get(ideaId);
      if (!session) {
        throw new Error('Clarification session not found');
      }

      const unansweredRequired = session.questions.filter(
        (q) => q.required && !session.answers[q.id]
      );

      if (unansweredRequired.length > 0) {
        throw new Error(
          `${unansweredRequired.length} required questions still unanswered`
        );
      }

      const refinedIdea = await this.ideaRefiner!.refine(session);

      session.refinedIdea = refinedIdea;
      session.status = 'completed';
      session.confidence = 0.9;
      session.updatedAt = new Date();

      await this.sessionManager!.store(session);

      await dbService.updateIdea(ideaId, { status: 'clarified' });

      await dbService.logAgentAction('clarifier', 'clarification-completed', {
        ideaId,
        questionsAnswered: Object.keys(session.answers).length,
        confidence: session.confidence,
      });

      return { ...session, refinedIdea };
    } catch (error) {
      await dbService.logAgentAction(
        'clarifier',
        'clarification-completed-error',
        {
          ideaId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      throw error;
    }
  }

  async getSession(ideaId: string): Promise<ClarificationSession | null> {
    return this.sessionManager!.get(ideaId);
  }

  async getClarificationHistory(
    userId: string
  ): Promise<Array<{ idea: Idea; session: ClarificationSession }>> {
    return this.sessionManager!.getHistory(userId);
  }

  async healthCheck(): Promise<{ status: string; config: boolean }> {
    return {
      status: 'healthy',
      config: !!this.config,
    };
  }

  get aiService() {
    return (
      this.injectedAiService || this.questionGenerator?.aiService || aiService
    );
  }

  set aiService(value) {
    this.injectedAiService = value;
    if (this.questionGenerator) {
      this.questionGenerator.aiService = value;
    }
    if (this.ideaRefiner) {
      this.ideaRefiner.aiService = value;
    }
  }

  async generateQuestions(ideaText: string): Promise<ClarifierQuestion[]> {
    return this.questionGenerator!.generate(ideaText);
  }

  async generateRefinedIdea(session: ClarificationSession): Promise<string> {
    return this.ideaRefiner!.refine(session);
  }
}

export { ClarifierQuestion, ClarificationSession };
export const clarifierAgent = new ClarifierAgent();
