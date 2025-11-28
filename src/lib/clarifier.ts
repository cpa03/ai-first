import { aiService, AIModelConfig } from './ai';
import { dbService, Idea, IdeaSession } from './db';

export interface ClarifierConfig {
  model: string;
  temperature: number;
  max_tokens: number;
}

export interface ClarifierResponse {
  questions: string[];
  refined_idea: string;
}

export class ClarifierAgent {
  private config: ClarifierConfig;
  private aiService = aiService;
  private dbService = dbService;

  constructor(
    config: ClarifierConfig = {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000,
    }
  ) {
    this.config = config;
  }

  async generateClarifyingQuestions(idea: string): Promise<ClarifierResponse> {
    // Create AI model configuration
    const aiConfig: AIModelConfig = {
      provider: 'openai',
      model: this.config.model,
      maxTokens: this.config.max_tokens,
      temperature: this.config.temperature,
    };

    // Prepare system message to guide the AI on generating clarifying questions
    const systemMessage = {
      role: 'system' as const,
      content: `You are an AI assistant specialized in helping users clarify their ideas. 
      Your role is to ask clarifying questions that will help refine and expand on the user's initial idea.
      Focus on aspects like target audience, goals, timeline, budget, technical requirements, and constraints.
      Provide up to 5 thoughtful questions that would help clarify the idea.`,
    };

    const userMessage = {
      role: 'user' as const,
      content: `Based on this idea: "${idea}", generate 3-5 clarifying questions that would help refine and understand the requirements better. 
      Return the questions in a structured format with a refined version of the idea based on common requirements.`,
    };

    try {
      // Call the AI model
      const response = await this.aiService.callModel(
        [systemMessage, userMessage],
        aiConfig
      );

      // Parse the response to extract questions and refined idea
      // This is a simplified parsing - in a real implementation, we would use proper parsing
      const lines = response.split('\n').filter((line) => line.trim() !== '');
      const questions: string[] = [];
      let refinedIdea = '';

      let isQuestionSection = false;
      let isRefinedIdeaSection = false;

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (
          trimmedLine.includes('Questions:') ||
          trimmedLine.includes('Clarifying Questions:')
        ) {
          isQuestionSection = true;
          isRefinedIdeaSection = false;
          continue;
        }

        if (
          trimmedLine.includes('Refined Idea:') ||
          trimmedLine.includes('Revised Idea:')
        ) {
          isRefinedIdeaSection = true;
          isQuestionSection = false;
          continue;
        }

        if (
          isQuestionSection &&
          (trimmedLine.startsWith('- ') ||
            trimmedLine.startsWith('1.') ||
            trimmedLine.startsWith('2.') ||
            trimmedLine.startsWith('3.') ||
            trimmedLine.startsWith('4.') ||
            trimmedLine.startsWith('5.'))
        ) {
          // Extract question from the line
          const question = trimmedLine.replace(/^[0-9]+\. |- /, '').trim();
          if (question) {
            questions.push(question);
          }
        }

        if (isRefinedIdeaSection) {
          refinedIdea += trimmedLine + ' ';
        }
      }

      // If we couldn't parse properly, use a fallback approach
      if (questions.length === 0) {
        // Find question-like sentences in the response
        const questionRegex = /[^.!?]*\?/g;
        const foundQuestions = response.match(questionRegex) || [];
        for (const q of foundQuestions) {
          const cleanQ = q.trim();
          if (cleanQ && !cleanQ.toLowerCase().includes('questions:')) {
            questions.push(cleanQ);
          }
        }

        // Use the entire response as refined idea if not found
        if (!refinedIdea) {
          refinedIdea = response;
        }
      }

      // Limit to 5 questions max
      return {
        questions: questions.slice(0, 5),
        refined_idea: refinedIdea.trim(),
      };
    } catch (error) {
      console.error('Error generating clarifying questions:', error);
      throw error;
    }
  }

  async storeClarificationSession(
    ideaId: string,
    answers: Record<string, string>,
    questions: string[]
  ): Promise<IdeaSession> {
    const sessionData: Omit<IdeaSession, 'updated_at'> = {
      idea_id: ideaId,
      state: {
        answers,
        questions,
        status: 'clarified',
      },
      last_agent: 'clarifier',
      metadata: {
        agent: 'clarifier',
        timestamp: new Date().toISOString(),
        question_count: questions.length,
      },
    };

    return await this.dbService.upsertIdeaSession(sessionData);
  }
}

// Export a singleton instance
export const clarifierAgent = new ClarifierAgent();
