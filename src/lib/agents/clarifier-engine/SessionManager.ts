import { dbService, type Idea } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import type { ClarifierQuestion } from './QuestionGenerator';

const logger = createLogger('ClarifierSessionManager');

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

export class SessionManager {
  async store(session: ClarificationSession): Promise<void> {
    try {
      await dbService.storeVector({
        idea_id: session.ideaId,
        vector_data: session as unknown as Record<string, unknown>,
        reference_type: 'clarification_session',
        reference_id: session.ideaId,
      });
    } catch (error) {
      logger.error('Failed to store clarification session', error);
      throw error;
    }
  }

  async get(ideaId: string): Promise<ClarificationSession | null> {
    try {
      const vectors = await dbService.getVectors(
        ideaId,
        'clarification_session'
      );

      if (vectors.length === 0) {
        return null;
      }

      const sessionData = vectors[0]
        .vector_data as unknown as ClarificationSession;

      sessionData.createdAt = new Date(sessionData.createdAt);
      sessionData.updatedAt = new Date(sessionData.updatedAt);

      return sessionData;
    } catch (error) {
      logger.error('Failed to get clarification session', error);
      return null;
    }
  }

  async getHistory(
    userId: string
  ): Promise<Array<{ idea: Idea; session: ClarificationSession }>> {
    try {
      const ideas = await dbService.getUserIdeas(userId);

      if (ideas.length === 0) {
        return [];
      }

      const sessionMap = new Map<string, ClarificationSession>();
      const ideaIds = ideas.map((idea) => idea.id);

      const vectorsByIdeaId = await dbService.getVectorsByIdeaIds(
        ideaIds,
        'clarification_session'
      );

      for (const ideaId of ideaIds) {
        const vectors = vectorsByIdeaId.get(ideaId) || [];
        for (const vector of vectors) {
          const sessionData =
            vector.vector_data as unknown as ClarificationSession;
          sessionData.createdAt = new Date(sessionData.createdAt);
          sessionData.updatedAt = new Date(sessionData.updatedAt);
          sessionMap.set(vector.idea_id, sessionData);
        }
      }

      const results = [];
      for (const idea of ideas) {
        const session = sessionMap.get(idea.id);
        if (session) {
          results.push({ idea, session });
        }
      }

      return results;
    } catch (error) {
      logger.error('Failed to get clarification history', error);
      return [];
    }
  }
}
