import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Task {
  id: string;
  deliverable_id: string;
  title: string;
  description?: string;
  assignee?: string;
  status: 'todo' | 'in_progress' | 'completed';
  estimate: number;
  created_at: string;
}

export class TaskRepository extends BaseRepository {
  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    super(client, admin);
  }

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    this.checkClient();

    const { data, error } = await this.client!.from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'createTask');
    }

    return data;
  }

  async getDeliverableTasks(deliverableId: string): Promise<Task[]> {
    this.checkClient();

    const { data, error } = await this.client!.from('tasks')
      .select('*')
      .eq('deliverable_id', deliverableId)
      .order('created_at', { ascending: true });

    if (error) {
      this.handleError(error, 'getDeliverableTasks');
    }

    return data || [];
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    this.checkAdmin();

    const { data, error } = await this.admin!.from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'updateTask');
    }

    return data as Task;
  }

  async deleteTask(id: string): Promise<void> {
    this.checkClient();

    const { error } = await this.client!.from('tasks').delete().eq('id', id);

    if (error) {
      this.handleError(error, 'deleteTask');
    }
  }
}
