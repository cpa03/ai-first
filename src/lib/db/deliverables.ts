import { API_ERROR_MESSAGES } from '../config/error-messages';
import { DB_TABLES } from '../config/database-tables';
import type { ClientProvider } from './ideas';
import type { Deliverable, Task, Idea } from './types';

/**
 * DeliverableService handles all deliverable-related database operations
 * Extracted from DatabaseService for better modularity and testability
 */
export class DeliverableService {
  constructor(private readonly clientProvider: ClientProvider) {}

  /**
   * Create a single deliverable
   */
  async createDeliverable(
    deliverable: Omit<Deliverable, 'id' | 'created_at'>
  ): Promise<Deliverable> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.DELIVERABLES)
      .insert(deliverable as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create multiple deliverables in a single query
   */
  async createDeliverables(
    deliverables: Omit<Deliverable, 'id' | 'created_at'>[]
  ): Promise<Deliverable[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.DELIVERABLES)
      .insert(deliverables as never)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all deliverables for an idea (excludes soft-deleted)
   */
  async getIdeaDeliverables(ideaId: string): Promise<Deliverable[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.DELIVERABLES)
      .select('*')
      .eq('idea_id', ideaId)
      .is('deleted_at', null)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetches all deliverables for an idea with their associated tasks in a single optimized query.
   *
   * PERFORMANCE OPTIMIZATION (Issue #855 - N+1 Query Resolution):
   * ===========================================================================
   * This method uses a SINGLE database query with a JOIN (via Supabase's embedded select)
   * instead of the classic N+1 pattern that would fetch deliverables first, then
   * fetch tasks for each deliverable individually.
   *
   * Query Pattern Analysis:
   * - OLD (N+1): 1 query for deliverables + N queries for tasks = N+1 total queries
   * - NEW (Optimized): 1 query with embedded select = 1 total query
   *
   * Performance Characteristics:
   * - Best Case: 1 deliverable = 1 query
   * - Typical Case: 10 deliverables = 1 query (not 11)
   * - Worst Case: 100 deliverables = 1 query (not 101)
   * - Scaling: O(1) regardless of deliverable count
   *
   * Additional Optimizations:
   * - Server-side filtering via `.is('tasks.deleted_at', null)` eliminates
   *   client-side filtering and reduces network payload
   * - Deliverables ordered by priority (highest first)
   * - Tasks ordered by creation date (oldest first) for consistent UI display
   *
   * @param ideaId - The ID of the idea to fetch deliverables for
   * @returns Array of deliverables with their tasks, sorted by priority
   * @throws Error if Supabase client is not initialized
   *
   * @see https://supabase.com/docs/reference/javascript/select#query-foreign-tables
   */
  async getIdeaDeliverablesWithTasks(
    ideaId: string
  ): Promise<(Deliverable & { tasks: Task[] })[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.DELIVERABLES)
      .select(
        `
        *,
        tasks!tasks_deliverable_id_fkey (
          *
        )
      `
      )
      .eq('idea_id', ideaId)
      .is('deleted_at', null)
      .is('tasks.deleted_at', null)
      .order('priority', { ascending: false });

    if (error) throw error;

    const deliverables = (data || []) as (Deliverable & { tasks: Task[] })[];

    return deliverables.map((d) => ({
      ...d,
      tasks: (d.tasks || []).sort((a, b) =>
        a.created_at.localeCompare(b.created_at)
      ),
    }));
  }

  /**
   * Get a deliverable with its associated idea
   */
  async getDeliverableWithIdea(
    id: string
  ): Promise<(Deliverable & { idea: Idea }) | null> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.DELIVERABLES)
      .select(
        `
        *,
        idea:ideas!inner(*)
      `
      )
      .eq('id', id)
      .is('deliverables.deleted_at', null)
      .is('ideas.deleted_at', null)
      .single();

    if (error || !data) return null;

    return data as Deliverable & { idea: Idea };
  }

  /**
   * Update a deliverable by ID
   */
  async updateDeliverable(
    id: string,
    updates: Partial<Deliverable>
  ): Promise<Deliverable> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);

    const { data, error } = await admin
      .from(DB_TABLES.DELIVERABLES)
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Deliverable;
  }

  /**
   * Soft delete a deliverable (sets deleted_at timestamp)
   */
  async softDeleteDeliverable(id: string): Promise<void> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);

    const { error } = await admin
      .from(DB_TABLES.DELIVERABLES)
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Permanently delete a deliverable
   */
  async deleteDeliverable(id: string): Promise<void> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { error } = await client
      .from(DB_TABLES.DELIVERABLES)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
