import type { ClientProvider } from './ideas';
import type { Task, Deliverable, Idea } from './types';

/**
 * TaskService handles all task-related database operations
 * Extracted from DatabaseService for better modularity and testability
 */
export class TaskService {
  constructor(private readonly clientProvider: ClientProvider) {}

  /**
   * Create a single task
   */
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { data, error } = await client
      .from('tasks')
      .insert(task as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create multiple tasks in a single query
   */
  async createTasks(tasks: Omit<Task, 'id' | 'created_at'>[]): Promise<Task[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { data, error } = await client
      .from('tasks')
      .insert(tasks as never)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all tasks for a deliverable (excludes soft-deleted)
   */
  async getDeliverableTasks(deliverableId: string): Promise<Task[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { data, error } = await client
      .from('tasks')
      .select('*')
      .eq('deliverable_id', deliverableId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a task by ID (excludes soft-deleted)
   */
  async getTask(id: string): Promise<Task | null> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { data, error } = await client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Update a task by ID
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await admin
      .from('tasks')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  /**
   * Soft delete a task (sets deleted_at timestamp)
   */
  async softDeleteTask(id: string): Promise<void> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error('Supabase admin client not initialized');

    const { error } = await admin
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Permanently delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client.from('tasks').delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Get a task with its ownership chain (deliverable and idea)
   */
  async getTaskWithOwnership(
    id: string
  ): Promise<(Task & { deliverable: Deliverable; idea: Idea }) | null> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { data, error } = await client
      .from('tasks')
      .select(
        `
        *,
        deliverable:deliverables!inner(*),
        idea:deliverables!inner(idea:ideas!inner(*))
      `
      )
      .eq('id', id)
      .is('tasks.deleted_at', null)
      .is('deliverables.deleted_at', null)
      .is('ideas.deleted_at', null)
      .single();

    if (error || !data) return null;

    const typedData = data as Task & {
      deliverable: Deliverable;
      idea: { idea: Idea };
    };
    return {
      ...typedData,
      idea: typedData.idea.idea,
    };
  }
}
