import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Deliverable {
  id: string;
  idea_id: string;
  title: string;
  description?: string;
  priority: number;
  estimate_hours: number;
  created_at: string;
}

export class DeliverableRepository extends BaseRepository {
  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    super(client, admin);
  }

  async createDeliverable(
    deliverable: Omit<Deliverable, 'id' | 'created_at'>
  ): Promise<Deliverable> {
    this.checkClient();

    const { data, error } = await this.client!.from('deliverables')
      .insert(deliverable)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'createDeliverable');
    }

    return data;
  }

  async getIdeaDeliverables(ideaId: string): Promise<Deliverable[]> {
    this.checkClient();

    const { data, error } = await this.client!.from('deliverables')
      .select('*')
      .eq('idea_id', ideaId)
      .order('priority', { ascending: false });

    if (error) {
      this.handleError(error, 'getIdeaDeliverables');
    }

    return data || [];
  }

  async updateDeliverable(
    id: string,
    updates: Partial<Deliverable>
  ): Promise<Deliverable> {
    this.checkAdmin();

    const { data, error } = await this.admin!.from('deliverables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'updateDeliverable');
    }

    return data as Deliverable;
  }

  async deleteDeliverable(id: string): Promise<void> {
    this.checkClient();

    const { error } = await this.client!.from('deliverables')
      .delete()
      .eq('id', id);

    if (error) {
      this.handleError(error, 'deleteDeliverable');
    }
  }
}
