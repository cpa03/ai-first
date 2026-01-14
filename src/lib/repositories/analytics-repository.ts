import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

interface IdeaRecord {
  id: string;
  status: string;
}

export class AnalyticsRepository extends BaseRepository {
  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    super(client, admin);
  }

  async getIdeaStats(userId: string): Promise<{
    totalIdeas: number;
    ideasByStatus: Record<string, number>;
    totalDeliverables: number;
    totalTasks: number;
  }> {
    this.checkClient();

    const { data: ideas } = await this.client!.from('ideas')
      .select('id, status')
      .eq('user_id', userId);

    const ideasByStatus =
      (ideas as IdeaRecord[] | null)?.reduce(
        (acc, idea) => {
          acc[idea.status] = (acc[idea.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {};

    const ideaIds = (ideas as IdeaRecord[] | null)?.map((i) => i.id) || [];

    let totalDeliverables = 0;
    let totalTasks = 0;

    if (ideaIds.length > 0) {
      const [{ count: deliverablesCount }, deliverablesIds] = await Promise.all(
        [
          this.client!.from('deliverables')
            .select('*', { count: 'exact', head: true })
            .in('idea_id', ideaIds),
          this.client!.from('deliverables').select('id').in('idea_id', ideaIds),
        ]
      );

      totalDeliverables = deliverablesCount || 0;

      const { count: tasksCount } = await this.client!.from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('deliverable_id', deliverablesIds.data?.map((d) => d.id) || []);

      totalTasks = tasksCount || 0;
    }

    return {
      totalIdeas: ideas?.length || 0,
      ideasByStatus,
      totalDeliverables,
      totalTasks,
    };
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      this.checkClient();

      const { error } = await this.client!.from('ideas').select('id').limit(1);

      if (error) throw error;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
