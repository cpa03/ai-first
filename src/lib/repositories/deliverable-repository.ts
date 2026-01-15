import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Deliverable {
  id: string;
  idea_id: string;
  title: string;
  description?: string;
  priority: number;
  estimate_hours: number;
  milestone_id: string | null;
  completion_percentage: number;
  business_value: number;
  risk_factors: string[] | null;
  acceptance_criteria: Record<string, unknown> | null;
  deliverable_type:
    | 'feature'
    | 'documentation'
    | 'testing'
    | 'deployment'
    | 'research';
  created_at: string;
  deleted_at?: string | null;
}

export interface Task {
  id: string;
  deliverable_id: string;
  title: string;
  description?: string;
  assignee?: string;
  status: 'todo' | 'in_progress' | 'completed';
  estimate: number;
  start_date: string | null;
  end_date: string | null;
  actual_hours: number | null;
  completion_percentage: number;
  priority_score: number;
  complexity_score: number;
  risk_level: 'low' | 'medium' | 'high';
  tags: string[] | null;
  custom_fields: Record<string, unknown> | null;
  milestone_id: string | null;
  created_at: string;
  deleted_at?: string | null;
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
      .is('deleted_at', null)
      .order('priority', { ascending: false });

    if (error) {
      this.handleError(error, 'getIdeaDeliverables');
    }

    return data || [];
  }

  async getIdeaDeliverablesWithTasks(
    ideaId: string
  ): Promise<(Deliverable & { tasks: Task[] })[]> {
    this.checkClient();

    const { data, error } = await this.client!.from('deliverables')
      .select('*, tasks(*)')
      .eq('idea_id', ideaId)
      .is('deleted_at', null)
      .order('priority', { ascending: false });

    if (error) {
      this.handleError(error, 'getIdeaDeliverablesWithTasks');
    }

    const deliverables = (data || []) as (Deliverable & { tasks: Task[] })[];

    return deliverables.map((d) => ({
      ...d,
      tasks: (d.tasks || []).filter((t: Task) => !t.deleted_at),
    }));
  }

  async createDeliverables(
    deliverables: Omit<Deliverable, 'id' | 'created_at'>[]
  ): Promise<Deliverable[]> {
    this.checkClient();

    const { data, error } = await this.client!.from('deliverables')
      .insert(deliverables)
      .select();

    if (error) {
      this.handleError(error, 'createDeliverables');
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

  async softDeleteDeliverable(id: string): Promise<void> {
    this.requireAdmin();

    const { error } = await this.requireAdmin()
      .from('deliverables')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
