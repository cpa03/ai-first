import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Task } from './deliverable-repository';

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
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      this.handleError(error, 'getDeliverableTasks');
    }

    return data || [];
  }

  async createTasks(tasks: Omit<Task, 'id' | 'created_at'>[]): Promise<Task[]> {
    this.checkClient();

    const { data, error } = await this.client!.from('tasks')
      .insert(tasks)
      .select();

    if (error) {
      this.handleError(error, 'createTasks');
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

  async softDeleteTask(id: string): Promise<void> {
    this.requireAdmin();

    const { error } = await this.requireAdmin()
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
