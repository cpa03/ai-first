import { VALIDATION_LIMITS } from '../config/constants';
import { API_ERROR_MESSAGES } from '../config/error-messages';
import { DB_TABLES } from '../config/database-tables';
import type {
  Idea,
  IdeaSession,
  PaginationOptions,
  PaginatedResult,
} from './types';

/**
 * Interface for accessing database clients
 * Implemented by DatabaseService to provide client/admin access
 *
 * Using 'any' for the generic type parameter to allow flexibility
 * while maintaining type safety for the methods that use it
 */
export interface ClientProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Flexible type for client compatibility
  getClient(): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Flexible type for client compatibility
  getAdmin(): any;
}

/**
 * IdeaService handles all idea-related database operations
 * Extracted from DatabaseService for better modularity and testability
 */
export class IdeaService {
  constructor(private readonly clientProvider: ClientProvider) {}

  /**
   * Create a new idea
   */
  async createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.IDEAS)
      .insert(idea as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get an idea by ID (excludes soft-deleted)
   */
  async getIdea(id: string): Promise<Idea | null> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.IDEAS)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get all ideas for a user (excludes soft-deleted)
   */
  async getUserIdeas(userId: string): Promise<Idea[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.IDEAS)
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get paginated ideas for a user with optional status filtering
   *
   * PERFORMANCE: Uses database-level pagination and filtering instead of
   * in-memory operations. Supports filtering by status at the query level
   * for optimal performance.
   *
   * @param userId - The user ID to get ideas for
   * @param pagination - Pagination options (page, pageSize)
   * @param filters - Optional filters (status, search)
   * @returns Paginated result with ideas and metadata
   */
  async getUserIdeasPaginated(
    userId: string,
    pagination: PaginationOptions = {},
    filters?: { status?: Idea['status'] | 'all'; search?: string }
  ): Promise<PaginatedResult<Idea>> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(
      pagination.pageSize || VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT,
      VALIDATION_LIMITS.PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * pageSize;

    // Build the base query with common filters
    // PERFORMANCE OPTIMIZATION: Combine count and data queries into a single request
    // using Supabase's select('*', { count: 'exact' }). This reduces database
    // round-trips from 2 to 1.
    let query = client
      .from(DB_TABLES.IDEAS)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Apply status filter if provided and not 'all'
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Apply search filter if provided (searches in title and raw_text)
    if (filters?.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim().toLowerCase()}%`;
      // Use OR filter for searching across multiple columns
      query = query.or(`title.ilike.${searchTerm},raw_text.ilike.${searchTerm}`);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    const total = count || 0;

    return {
      data: data || [],
      total,
      page,
      pageSize,
      hasMore: offset + (data?.length || 0) < total,
    };
  }

  /**
   * Update an idea by ID
   */
  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);

    const { data, error } = await admin
      .from(DB_TABLES.IDEAS)
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Idea;
  }

  /**
   * Soft delete an idea (sets deleted_at timestamp)
   */
  async softDeleteIdea(id: string): Promise<void> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);

    const { error } = await admin
      .from(DB_TABLES.IDEAS)
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Permanently delete an idea
   */
  async deleteIdea(id: string): Promise<void> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { error } = await client.from(DB_TABLES.IDEAS).delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Upsert an idea session
   */
  async upsertIdeaSession(
    session: Omit<IdeaSession, 'updated_at'>
  ): Promise<IdeaSession> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.IDEA_SESSIONS)
      .upsert({
        ...session,
        updated_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get an idea session by idea ID
   */
  async getIdeaSession(ideaId: string): Promise<IdeaSession | null> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.IDEA_SESSIONS)
      .select('*')
      .eq('idea_id', ideaId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get aggregated statistics for a user's ideas, deliverables, and tasks.
   *
   * PERFORMANCE OPTIMIZATION (Issue #1927 - N+1 Query Resolution):
   * ===========================================================================
   * This method uses 4 efficient SQL queries instead of the previous N+1 pattern:
   *
   * OLD (N+1):
   * - 1 query for ideas
   * - N queries for deliverables (iterative per idea chunk)
   * - N*M queries for tasks (iterative per deliverable chunk)
   * - Total: 1 + N + N*M queries (potentially 1000+ for active users)
   *
   * NEW (Optimized):
   * - 1 query for ideas with IDs and status
   * - 1 query for total deliverables count using .in() filter
   * - 1 query for deliverable IDs using .in() filter
   * - 1 query for total tasks count using .in() filter
   * - Total: 4 queries (constant, regardless of data size)
   *
   * Performance Characteristics:
   * - Old: O(N*M) queries where N=ideas, M=deliverables per idea
   * - New: O(1) = 4 queries constant time
   * - For 100 ideas with 10 deliverables each: 1000+ queries → 4 queries
   * - Query reduction: ~99.6% decrease in database round trips
   *
   * @param userId - The user ID to get stats for
   * @returns Aggregated stats object with counts
   */
  async getIdeaStats(userId: string): Promise<{
    totalIdeas: number;
    ideasByStatus: Record<string, number>;
    totalDeliverables: number;
    totalTasks: number;
  }> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    // Query 1: Get all ideas with status (needed for ideasByStatus)
    const { data: ideasData, error: ideasError } = await client
      .from(DB_TABLES.IDEAS)
      .select('id, status')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (ideasError) throw ideasError;

    const typedIdeas =
      (ideasData as { id: string; status: string }[] | null) ?? [];
    const totalIdeas = typedIdeas.length;

    // Count ideas by status in JavaScript (fast for small result sets)
    const ideasByStatus = typedIdeas.reduce(
      (acc, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Early return if no ideas
    if (totalIdeas === 0) {
      return {
        totalIdeas: 0,
        ideasByStatus,
        totalDeliverables: 0,
        totalTasks: 0,
      };
    }

    const ideaIds = typedIdeas.map((i) => i.id);

    // Query 2: Single optimized query using RPC for all aggregations
    // Falls back to two queries if RPC doesn't exist
    let totalDeliverables = 0;
    let totalTasks = 0;

    // Try to use RPC for efficient single-query aggregation
    const { data: statsData, error: statsError } = await client.rpc(
      'get_user_idea_stats',
      { p_user_id: userId } as never
    );

    if (!statsError && statsData) {
      // RPC returned result - use it
      totalDeliverables =
        (statsData as { total_deliverables: number }).total_deliverables ?? 0;
      totalTasks = (statsData as { total_tasks: number }).total_tasks ?? 0;
    } else {
      // Fallback: Use optimized two-query approach
      // Query 2a: Get deliverable count and IDs in single query using count + select
      const { data: deliverablesData, error: deliverablesError } = await client
        .from(DB_TABLES.DELIVERABLES)
        .select('id', { count: 'exact', head: false })
        .in('idea_id', ideaIds)
        .is('deleted_at', null);

      if (deliverablesError) throw deliverablesError;
      const deliverables = (deliverablesData as { id: string }[] | null) ?? [];
      totalDeliverables = deliverables.length;

      // Query 2b: Get task count directly using deliverable IDs (only if needed)
      if (deliverables.length > 0) {
        const deliverableIds = deliverables.map((d) => d.id);
        const { count: taskCount, error: taskError } = await client
          .from(DB_TABLES.TASKS)
          .select('*', { count: 'exact', head: true })
          .in('deliverable_id', deliverableIds)
          .is('deleted_at', null);

        if (taskError) throw taskError;
        totalTasks = taskCount || 0;
      }
    }

    return {
      totalIdeas,
      ideasByStatus,
      totalDeliverables,
      totalTasks,
    };
  }
}
