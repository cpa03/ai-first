import { aiService, AIModelConfig } from '@/lib/ai';
import { dbService } from '@/lib/db';
import { promptService } from '@/lib/prompts';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ClarifierQuestion {
  id: string;
  question: string;
  type: 'open' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
}

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

export interface ClarifierConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
  functions: Array<{
    name: string;
    description: string;
    parameters: {
      type: object;
      properties: Record<string, any>;
    };
  }>;
}

export class ClarifierAgent {
  private config: ClarifierConfig | null = null;
  private aiConfig: AIModelConfig | null = null;
  public aiService = aiService;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(
        process.cwd(),
        'ai',
        'agent-configs',
        'clarifier.yml'
      );
      const configContent = fs.readFileSync(configPath, 'utf8');
      this.config = yaml.load(configContent) as ClarifierConfig;

      this.aiConfig = {
        provider: 'openai',
        model: this.config.model,
        maxTokens: this.config.max_tokens,
        temperature: this.config.temperature,
      };
    } catch (error) {
      console.error('Failed to load clarifier config:', error);
      throw new Error('Clarifier configuration not found or invalid');
    }
  }

  async initialize(): Promise<void> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    await aiService.initialize(this.aiConfig);
  }

  async startClarification(
    ideaId: string,
    ideaText: string
  ): Promise<ClarificationSession> {
    try {
      // Log agent action
      await dbService.logAgentAction('clarifier', 'start-clarification', {
        ideaId,
        ideaText: ideaText.substring(0, 100) + '...',
      });

      // Generate clarifying questions using AI
      const questions = await this.generateQuestions(ideaText);

      // Create clarification session
      const session: ClarificationSession = {
        ideaId,
        originalIdea: ideaText,
        questions,
        answers: {},
        confidence: 0.5, // Initial confidence
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store session in database
      await this.storeSession(session);

      return session;
    } catch (error) {
      await dbService.logAgentAction('clarifier', 'start-clarification-error', {
        ideaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async generateQuestions(ideaText: string): Promise<ClarifierQuestion[]> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    const prompt = promptService.loadPrompt(
      'clarifier',
      'generate-questions.txt',
      {
        ideaText,
      }
    );

    try {
      const messages = [
        {
          role: 'system' as const,
          content: promptService.loadSystemPrompt('clarifier'),
        },
        { role: 'user' as const, content: prompt },
      ];

      const response = await aiService.callModel(messages, this.aiConfig);

      // Parse JSON response
      const questionsData = JSON.parse(response);

      // Validate and format questions
      return questionsData.map((q: any, index: number) => ({
        id: q.id || `q_${index + 1}`,
        question: q.question || `Question ${index + 1}`,
        type: q.type || 'open',
        options: q.options || [],
        required: q.required !== false, // Default to true
      })) as ClarifierQuestion[];
    } catch (error) {
      console.error('Failed to generate questions:', error);

      // Fallback questions
      return [
        {
          id: 'q_1',
          question:
            'What is the main problem you are trying to solve with this idea?',
          type: 'open' as const,
          required: true,
        },
        {
          id: 'q_2',
          question: 'Who is the target audience for this solution?',
          type: 'open' as const,
          required: true,
        },
        {
          id: 'q_3',
          question: 'What are the key features or functionality you envision?',
          type: 'open' as const,
          required: true,
        },
      ];
    }
  }

  async submitAnswer(
    ideaId: string,
    questionId: string,
    answer: string
  ): Promise<ClarificationSession> {
    try {
      // Get current session
      const session = await this.getSession(ideaId);
      if (!session) {
        throw new Error('Clarification session not found');
      }

      // Update answer
      session.answers[questionId] = answer;
      session.status = 'in_progress';
      session.updatedAt = new Date();

      // Calculate confidence based on answered questions
      const answeredQuestions = Object.keys(session.answers).length;
      const totalQuestions = session.questions.length;
      session.confidence = Math.min(
        0.9,
        0.3 + (answeredQuestions / totalQuestions) * 0.6
      );

      // Store updated session
      await this.storeSession(session);

      // Log agent action
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
      const session = await this.getSession(ideaId);
      if (!session) {
        throw new Error('Clarification session not found');
      }

      // Check if all required questions are answered
      const unansweredRequired = session.questions.filter(
        (q) => q.required && !session.answers[q.id]
      );

      if (unansweredRequired.length > 0) {
        throw new Error(
          `${unansweredRequired.length} required questions still unanswered`
        );
      }

      // Generate refined idea based on answers
      const refinedIdea = await this.generateRefinedIdea(session);

      // Update session
      session.refinedIdea = refinedIdea;
      session.status = 'completed';
      session.confidence = 0.9;
      session.updatedAt = new Date();

      // Store updated session
      await this.storeSession(session);

      // Update idea status in database
      await dbService.updateIdea(ideaId, { status: 'clarified' });

      // Log agent action
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

  async generateRefinedIdea(session: ClarificationSession): Promise<string> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    const answersText = Object.entries(session.answers)
      .map(([questionId, answer]) => {
        const question = session.questions.find((q) => q.id === questionId);
        return `Q: ${question?.question || 'Unknown question'}\nA: ${answer}`;
      })
      .join('\n\n');

    const prompt = promptService.loadPrompt('clarifier', 'refine-idea.txt', {
      originalIdea: session.originalIdea,
      answersText,
    });

    try {
      const messages = [
        {
          role: 'system' as const,
          content: promptService.loadPrompt(
            'clarifier',
            'refine-idea-system.txt'
          ),
        },
        { role: 'user' as const, content: prompt },
      ];

      const response = await aiService.callModel(messages, this.aiConfig);
      return response.trim();
    } catch (error) {
      console.error('Failed to generate refined idea:', error);

      // Fallback: combine original idea with answers
      return `${session.originalIdea}\n\nAdditional Details:\n${answersText}`;
    }
  }

  private async storeSession(session: ClarificationSession): Promise<void> {
    // Store session data in vectors table for flexibility
    await dbService.storeVector({
      idea_id: session.ideaId,
      vector_data: session,
      reference_type: 'clarification_session',
      reference_id: session.ideaId,
    });
  }

  async getSession(ideaId: string): Promise<ClarificationSession | null> {
    try {
      const vectors = await dbService.getVectors(
        ideaId,
        'clarification_session'
      );

      if (vectors.length === 0) {
        return null;
      }

      const sessionData = vectors[0].vector_data as ClarificationSession;

      // Convert date strings back to Date objects
      sessionData.createdAt = new Date(sessionData.createdAt);
      sessionData.updatedAt = new Date(sessionData.updatedAt);

      return sessionData;
    } catch (error) {
      console.error('Failed to get clarification session:', error);
      return null;
    }
  }

  async getClarificationHistory(
    userId: string
  ): Promise<Array<{ idea: any; session: ClarificationSession }>> {
    try {
      // Get user's ideas
      const ideas = await dbService.getUserIdeas(userId);

      const results = [];

      for (const idea of ideas) {
        const session = await this.getSession(idea.id);
        if (session) {
          results.push({ idea, session });
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to get clarification history:', error);
      return [];
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; config: boolean }> {
    return {
      status: 'healthy',
      config: !!this.config,
    };
  }
}

// Export singleton instance
export const clarifierAgent = new ClarifierAgent();
