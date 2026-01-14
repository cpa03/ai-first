import { dbService } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import { BreakdownSession } from '../breakdown-engine';

const logger = createLogger('SessionManager');

export class SessionManager {
  async storeSession(session: BreakdownSession): Promise<void> {
    await dbService.storeVector({
      idea_id: session.ideaId,
      vector_data: session as unknown as Record<string, unknown>,
      reference_type: 'breakdown_session',
      reference_id: session.id,
    });
  }

  async getBreakdownSession(ideaId: string): Promise<BreakdownSession | null> {
    try {
      const vectors = await dbService.getVectors(ideaId, 'breakdown_session');
      if (vectors.length === 0) return null;

      const session = vectors[0].vector_data as unknown as BreakdownSession;
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);

      return session;
    } catch (error) {
      logger.error('Failed to get breakdown session:', error);
      return null;
    }
  }

  async persistResults(session: BreakdownSession): Promise<void> {
    if (!session.analysis || !session.tasks) return;

    try {
      for (const deliverable of session.analysis.deliverables) {
        await dbService.createDeliverable({
          idea_id: session.ideaId,
          title: deliverable.title,
          description: deliverable.description,
          priority: deliverable.priority,
          estimate_hours: deliverable.estimatedHours,
          milestone_id: null,
          completion_percentage: 0,
          business_value: 50,
          risk_factors: [],
          acceptance_criteria: null,
          deliverable_type: 'feature',
          deleted_at: null,
        });
      }

      const deliverables = await dbService.getIdeaDeliverables(session.ideaId);
      const deliverableMap = new Map(deliverables.map((d) => [d.title, d.id]));

      for (const task of session.tasks.tasks) {
        const deliverableId = deliverableMap.get(task.deliverableId);
        if (deliverableId) {
          await dbService.createTask({
            deliverable_id: deliverableId,
            title: task.title,
            description: task.description,
            estimate: task.estimatedHours,
            status: 'todo',
            start_date: null,
            end_date: null,
            actual_hours: null,
            completion_percentage: 0,
            priority_score: 50,
            complexity_score: 50,
            risk_level: 'low',
            tags: [],
            custom_fields: null,
            milestone_id: null,
            deleted_at: null,
          });
        }
      }

      await dbService.updateIdea(session.ideaId, { status: 'breakdown' });
    } catch (error) {
      logger.error('Failed to persist breakdown results:', error);
      throw error;
    }
  }
}
