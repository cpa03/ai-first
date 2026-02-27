import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { redactPIIInObject } from './pii-redaction';
import { createLogger } from './logger';
import { resourceCleanupManager } from './resource-cleanup';
import { AGENT_CONFIG, VALIDATION_LIMITS } from './config/constants';

const logger = createLogger('DatabaseService');
const { DATABASE } = AGENT_CONFIG;

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// SECURITY: Service role key is NEVER accessed at module level
// to prevent accidental bundling in client-side code.
// Use getSupabaseAdmin() function instead for server-side operations.

// Client for browser-side operations (with RLS)
export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

// SECURITY: Lazy-loaded admin client to prevent client-side bundle exposure
// This ensures the service role key is only accessed in server-side contexts
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get the Supabase admin client (server-side only)
 *
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * This function accesses the SUPABASE_SERVICE_ROLE_KEY which bypasses ALL Row Level Security (RLS) policies.
 * It MUST ONLY be called in server-side contexts (API routes, server components, server actions).
 *
 * NEVER call this function from:
 * - Client components (use 'use client' directive)
 * - Browser-side code
 * - Any code that may be bundled for the client
 *
 * The service role key grants FULL ADMIN ACCESS to the database. Exposing it to clients
 * would allow anyone to read/modify/delete any data, bypassing all security policies.
 *
 * @returns Supabase admin client or null if not in server context
 * @throws Error if called in browser context
 */
export function getSupabaseAdmin(): ReturnType<
  typeof createClient<Database>
> | null {
  // SECURITY: Runtime check to ensure we're on the server
  // This prevents accidental usage in client components
  if (typeof window !== 'undefined') {
    throw new Error(
      'CRITICAL SECURITY VIOLATION: getSupabaseAdmin() was called in browser context.\n' +
        'The Supabase service role key bypasses RLS and must NEVER be exposed to clients.\n' +
        'Use API routes for admin operations instead.'
    );
  }

  // Lazy initialization to prevent key from being accessed during module load
  // This ensures the key is only accessed when the function is actually called
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      logger.warn(
        'Supabase admin client not initialized: missing URL or service role key'
      );
      return null;
    }

    _supabaseAdmin = createClient<Database>(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return _supabaseAdmin;
}

// SECURITY NOTE: The previous supabaseAdmin export has been REMOVED
// to prevent any risk of the service role key being bundled in client code.
// Always use getSupabaseAdmin() function instead.

// Database types and utilities
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
  deleted_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface IdeaSession {
  idea_id: string;
  state: Record<string, unknown>;
  last_agent: string;
  metadata: Record<string, unknown>;
  updated_at: string;
}

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
  updated_at?: string;
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
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Vector {
  id: string;
  idea_id: string;
  vector_data?: Record<string, unknown>;
  reference_type: string;
  reference_id?: string;
  created_at: string;
  embedding?: number[];
}

export interface AgentLog {
  id: string;
  agent: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface ClarificationSessionRow {
  id: string;
  idea_id: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ClarificationAnswerRow {
  id: string;
  session_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

/**
 * Pagination options for list queries
 * Prevents memory exhaustion by limiting result sets
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Database service class
export class DatabaseService {
  private _client: ReturnType<typeof createClient<Database>> | null = null;
  private _admin: ReturnType<typeof createClient<Database>> | null = null;
  private static instance: DatabaseService;
  private connectionRetries = 0;
  private maxConnectionRetries = DATABASE.MAX_CONNECTION_RETRIES;
  private connectionHealthy = false;
  private lastHealthCheck: Date | null = null;
  private _disposed = false;

  // Connection metrics for observability
  private connectionMetrics = {
    totalConnections: 0,
    failedConnections: 0,
    lastSuccessfulConnection: null as Date | null,
    lastFailedConnection: null as Date | null,
    totalQueries: 0,
    failedQueries: 0,
  };

  private constructor() {
    this._client = supabaseClient;
    // SECURITY: _admin is lazy-loaded via getter to prevent client-side exposure
    // The getSupabaseAdmin() function has runtime checks to prevent browser usage

    if (
      !this._client &&
      process.env.NODE_ENV === 'development' &&
      !process.env.CI
    ) {
      logger.warn(
        'Supabase client not initialized. Check environment variables.'
      );
    }

    if (DatabaseService.instance) {
      throw new Error(
        'DatabaseService is a singleton. Use DatabaseService.getInstance() instead of new DatabaseService()'
      );
    }
  }

  private get client() {
    this.ensureNotDisposed();
    return this._client;
  }

  /**
   * Get the admin client (lazy-loaded, server-side only)
   * SECURITY: This getter calls getSupabaseAdmin() which has runtime checks
   * to prevent usage in browser contexts
   */
  private get admin() {
    this.ensureNotDisposed();
    // Lazy initialization to prevent client-side bundling
    if (!this._admin) {
      this._admin = getSupabaseAdmin();
    }
    return this._admin;
  }

  /**
   * Ensure the service has not been disposed before allowing operations
   * @throws Error if the service has been disposed
   */
  private ensureNotDisposed(): void {
    if (this._disposed) {
      throw new Error(
        'DatabaseService has been disposed. Call resetInstance() and getInstance() to create a new instance.'
      );
    }
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
      resourceCleanupManager.register('database-service', () =>
        DatabaseService.instance?.dispose()
      );
    }
    return DatabaseService.instance;
  }

  /**
   * Check if the service has been disposed
   */
  isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Check if the service has been fully disposed with all cleanup complete
   * Returns detailed status for debugging and verification
   */
  isFullyDisposed(): {
    disposed: boolean;
    clientCleared: boolean;
    adminCleared: boolean;
    healthTrackingReset: boolean;
  } {
    return {
      disposed: this._disposed,
      clientCleared: this._client === null,
      adminCleared: this._admin === null,
      healthTrackingReset:
        !this.connectionHealthy &&
        this.lastHealthCheck === null &&
        this.connectionRetries === 0,
    };
  }

  /**
   * Properly dispose of database connections and cleanup resources
   * This prevents memory leaks in long-running processes
   *
   * IMPORTANT: Connection Cleanup Behavior
   * =====================================
   * The Supabase JS SDK uses HTTP/REST for database operations, which does not
   * maintain persistent TCP connections. Therefore:
   *
   * 1. There is no explicit "close" or "disconnect" method to call
   * 2. Each request opens and closes its own HTTP connection automatically
   * 3. The main cleanup concern is removing internal references and state
   *
   * This method handles:
   * - Clearing client and admin references for garbage collection
   * - Resetting connection health tracking state
   * - Marking the service as disposed to prevent further operations
   *
   * For PostgreSQL connection pooling (server-side), Supabase handles this
   * automatically through their infrastructure.
   *
   * References:
   * - https://supabase.com/docs/reference/javascript/initializing
   * - GitHub Issue #1147
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }

    logger.info('Disposing DatabaseService and cleaning up connections...');

    if (this._client) {
      try {
        // Remove auth state change listeners to prevent memory leaks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client internal access for cleanup
        const client = this._client as any;
        if (
          client.auth &&
          typeof client.auth.onAuthStateChange === 'function'
        ) {
          // Supabase client doesn't have explicit removeListener, but we can
          // mitigate by ensuring no references remain
          logger.debug('Cleaning up client auth listeners');
        }
      } catch (error) {
        logger.warn('Error during client cleanup:', error);
      }
      this._client = null;
    }

    // Clean up admin connections
    if (this._admin) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase admin internal access for cleanup
        const admin = this._admin as any;
        if (admin.auth && typeof admin.auth.onAuthStateChange === 'function') {
          logger.debug('Cleaning up admin auth listeners');
        }
      } catch (error) {
        logger.warn('Error during admin cleanup:', error);
      }
      this._admin = null;
    }

    if (typeof window === 'undefined') {
      _supabaseAdmin = null;
    }

    // Reset connection health tracking
    this.connectionHealthy = false;
    this.lastHealthCheck = null;
    this.connectionRetries = 0;

    // Mark as disposed
    this._disposed = true;

    logger.info('DatabaseService disposed successfully');
  }

  /**
   * For testing purposes only - reinitialize clients with current environment
   * Properly disposes old connections before creating new ones to prevent memory leaks
   *
   * ⚠️ CRITICAL SECURITY WARNING ⚠️
   * This method accesses SUPABASE_SERVICE_ROLE_KEY which bypasses ALL RLS policies.
   * It MUST ONLY be called in server-side contexts.
   */
  reinitializeClients(): void {
    // SECURITY: Runtime check to ensure we're on the server
    // This prevents accidental usage in client components
    if (typeof window !== 'undefined') {
      throw new Error(
        'CRITICAL SECURITY VIOLATION: reinitializeClients() was called in browser context.\n' +
          'This method accesses the Supabase service role key which bypasses RLS\n' +
          'and must NEVER be exposed to clients. Use API routes for admin operations instead.'
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    logger.info('Reinitializing database clients...');

    // Store old clients for cleanup
    const oldClient = this._client;
    const oldAdmin = this._admin;

    // Reset disposed flag to allow reinitialization
    this._disposed = false;

    // Create new clients first (to ensure we can connect before disposing old ones)
    let newClient: ReturnType<typeof createClient<Database>> | null = null;
    let newAdmin: ReturnType<typeof createClient<Database>> | null = null;

    if (url && anonKey) {
      newClient = createClient<Database>(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }

    if (url && serviceKey) {
      newAdmin = createClient<Database>(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    // Update module-level admin client to ensure consistency
    // SECURITY: Only update if we're in a server-side context
    if (typeof window === 'undefined') {
      _supabaseAdmin = newAdmin;
    }

    // Now safe to dispose old clients
    if (oldClient) {
      try {
        logger.debug('Cleaning up old client connection');
        // Supabase doesn't expose explicit connection cleanup, but we can
        // ensure no references remain for garbage collection
      } catch (error) {
        logger.warn('Error cleaning up old client:', error);
      }
    }

    if (oldAdmin) {
      try {
        logger.debug('Cleaning up old admin connection');
      } catch (error) {
        logger.warn('Error cleaning up old admin:', error);
      }
    }

    // Assign new clients
    this._client = newClient;
    this._admin = newAdmin;

    // Reset connection health
    this.connectionHealthy = false;
    this.lastHealthCheck = null;
    this.connectionRetries = 0;

    logger.info('Database clients reinitialized successfully');
  }

  /**
   * For testing purposes only - reset the singleton instance
   * Properly disposes the current instance before resetting
   */
  static resetInstance(): void {
    // Dispose the current instance if it exists
    if (DatabaseService.instance) {
      DatabaseService.instance.dispose();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Resetting private static property for testing
    (DatabaseService as any).instance = undefined;
  }

  // Connection health monitoring
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        this.connectionMetrics.failedConnections++;
        this.connectionMetrics.lastFailedConnection = new Date();
        return false;
      }

      this.connectionMetrics.totalConnections++;

      const healthCheckPromise = this.client
        .from('ideas')
        .select('id')
        .limit(1);

      const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Health check timeout'));
        }, DATABASE.HEALTH_CHECK_TIMEOUT_MS);
      });

      const { error } = await Promise.race([
        healthCheckPromise,
        timeoutPromise
          .then(() => ({ error: null }))
          .catch((err) => ({
            error: err,
          })),
      ]);

      const timedOut =
        error instanceof Error && error.message === 'Health check timeout';

      if (timedOut) {
        logger.warn(
          `Database health check timed out after ${DATABASE.HEALTH_CHECK_TIMEOUT_MS}ms`
        );
        this.connectionHealthy = false;
        this.connectionMetrics.failedConnections++;
        this.connectionMetrics.lastFailedConnection = new Date();
        this.lastHealthCheck = new Date();
        return false;
      }

      this.connectionHealthy = !error;
      this.lastHealthCheck = new Date();

      if (error) {
        this.connectionMetrics.failedConnections++;
        this.connectionMetrics.lastFailedConnection = new Date();
      } else {
        this.connectionMetrics.lastSuccessfulConnection = new Date();
      }

      return this.connectionHealthy;
    } catch {
      this.connectionHealthy = false;
      this.connectionMetrics.failedConnections++;
      this.connectionMetrics.lastFailedConnection = new Date();
      return false;
    }
  }

  isConnectionHealthy(): boolean {
    if (!this.lastHealthCheck) return false;
    const staleThreshold = new Date(
      Date.now() - DATABASE.HEALTH_CHECK_STALE_THRESHOLD_MS
    );
    return this.connectionHealthy && this.lastHealthCheck > staleThreshold;
  }

  getConnectionMetrics() {
    return {
      ...this.connectionMetrics,
      lastSuccessfulConnection:
        this.connectionMetrics.lastSuccessfulConnection?.toISOString() ?? null,
      lastFailedConnection:
        this.connectionMetrics.lastFailedConnection?.toISOString() ?? null,
      connectionHealthy: this.connectionHealthy,
      lastHealthCheck: this.lastHealthCheck?.toISOString() ?? null,
      connectionRetries: this.connectionRetries,
    };
  }

  // Ideas CRUD operations
  async createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('ideas')
      .insert(idea as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getIdea(id: string): Promise<Idea | null> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('ideas')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  }

  async getUserIdeas(userId: string): Promise<Idea[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('ideas')
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
   * @param filters - Optional filters (status)
   * @returns Paginated result with ideas and metadata
   */
  async getUserIdeasPaginated(
    userId: string,
    pagination: PaginationOptions = {},
    filters?: { status?: Idea['status'] | 'all' }
  ): Promise<PaginatedResult<Idea>> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(
      pagination.pageSize || VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT,
      VALIDATION_LIMITS.PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * pageSize;

    // Build the base query with common filters
    let countQuery = this.client
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null);

    let dataQuery = this.client
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Apply status filter if provided and not 'all'
    if (filters?.status && filters.status !== 'all') {
      countQuery = countQuery.eq('status', filters.status);
      dataQuery = dataQuery.eq('status', filters.status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    const { data, error } = await dataQuery;

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

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await this.admin
      .from('ideas')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Idea;
  }

  async softDeleteIdea(id: string): Promise<void> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { error } = await this.admin
      .from('ideas')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteIdea(id: string): Promise<void> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('ideas').delete().eq('id', id);

    if (error) throw error;
  }

  // Idea sessions operations
  async upsertIdeaSession(
    session: Omit<IdeaSession, 'updated_at'>
  ): Promise<IdeaSession> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('idea_sessions')
      .upsert({
        ...session,
        updated_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getIdeaSession(ideaId: string): Promise<IdeaSession | null> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('idea_sessions')
      .select('*')
      .eq('idea_id', ideaId)
      .single();

    if (error) return null;
    return data;
  }

  // Deliverables operations
  async createDeliverable(
    deliverable: Omit<Deliverable, 'id' | 'created_at'>
  ): Promise<Deliverable> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('deliverables')
      .insert(deliverable as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createDeliverables(
    deliverables: Omit<Deliverable, 'id' | 'created_at'>[]
  ): Promise<Deliverable[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('deliverables')
      .insert(deliverables as never)
      .select();

    if (error) throw error;
    return data || [];
  }

  async getIdeaDeliverables(ideaId: string): Promise<Deliverable[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('deliverables')
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
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('deliverables')
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

  async getDeliverableWithIdea(
    id: string
  ): Promise<(Deliverable & { idea: Idea }) | null> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('deliverables')
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

  async updateDeliverable(
    id: string,
    updates: Partial<Deliverable>
  ): Promise<Deliverable> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await this.admin
      .from('deliverables')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Deliverable;
  }

  async softDeleteDeliverable(id: string): Promise<void> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { error } = await this.admin
      .from('deliverables')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteDeliverable(id: string): Promise<void> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client
      .from('deliverables')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Tasks operations
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('tasks')
      .insert(task as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createTasks(tasks: Omit<Task, 'id' | 'created_at'>[]): Promise<Task[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('tasks')
      .insert(tasks as never)
      .select();

    if (error) throw error;
    return data || [];
  }

  async getDeliverableTasks(deliverableId: string): Promise<Task[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('deliverable_id', deliverableId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getTask(id: string): Promise<Task | null> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await this.admin
      .from('tasks')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  async softDeleteTask(id: string): Promise<void> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { error } = await this.admin
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('tasks').delete().eq('id', id);

    if (error) throw error;
  }

  async getTaskWithOwnership(
    id: string
  ): Promise<(Task & { deliverable: Deliverable; idea: Idea }) | null> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
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

  // Vector operations for embeddings and context
  async storeVector(
    vector: Omit<Vector, 'id' | 'created_at'>
  ): Promise<Vector> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('vectors')
      .insert(vector as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getVectors(ideaId: string, referenceType?: string): Promise<Vector[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    let query = this.client.from('vectors').select('*').eq('idea_id', ideaId);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async getVectorsPaginated(
    ideaId: string,
    referenceType?: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<Vector>> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(
      pagination.pageSize || VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT,
      VALIDATION_LIMITS.PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * pageSize;

    let countQuery = this.client
      .from('vectors')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (referenceType) {
      countQuery = countQuery.eq('reference_type', referenceType);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    let query = this.client
      .from('vectors')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query;

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

  async getVectorsByIdeaIds(
    ideaIds: string[],
    referenceType?: string
  ): Promise<Map<string, Vector[]>> {
    if (!this.client) throw new Error('Supabase client not initialized');
    if (ideaIds.length === 0) return new Map();

    let query = this.client.from('vectors').select('*').in('idea_id', ideaIds);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    const vectors = (data || []) as Vector[];
    const resultMap = new Map<string, Vector[]>();

    for (const vector of vectors) {
      const ideaId = vector.idea_id;
      if (!resultMap.has(ideaId)) {
        resultMap.set(ideaId, []);
      }
      resultMap.get(ideaId)!.push(vector);
    }

    return resultMap;
  }

  async deleteVector(id: string): Promise<void> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('vectors').delete().eq('id', id);

    if (error) throw error;
  }

  async storeEmbedding(
    ideaId: string,
    referenceType: string,
    embedding: number[],
    referenceId?: string,
    vectorData?: Record<string, unknown>
  ): Promise<Vector> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await this.admin
      .from('vectors')
      .insert({
        idea_id: ideaId,
        embedding: `[${embedding.join(',')}]`,
        reference_type: referenceType,
        reference_id: referenceId,
        vector_data: vectorData,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async searchSimilarVectors(
    ideaId: string,
    queryEmbedding: number[],
    limit: number = DATABASE.DEFAULT_SEARCH_LIMIT
  ): Promise<Vector[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const { data, error } = await this.client.rpc('match_vectors', {
      query_embedding: embeddingString,
      match_threshold: DATABASE.VECTOR_SIMILARITY_THRESHOLD,
      match_count: limit,
      idea_id_filter: ideaId,
    } as never);

    if (error) throw error;
    return data || [];
  }

  // Agent logging
  async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    // Redact sensitive information before logging to database
    const sanitizedPayload = redactPIIInObject(payload);

    const { error } = await this.admin.from('agent_logs').insert({
      agent,
      action,
      payload: sanitizedPayload,
      timestamp: new Date().toISOString(),
    } as never);

    if (error) throw error;
  }

  // Clarification session operations
  async createClarificationSession(
    ideaId: string
  ): Promise<ClarificationSessionRow> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('clarification_sessions')
      .insert({
        idea_id: ideaId,
        status: 'active',
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async saveAnswers(
    sessionId: string,
    answers: Record<string, string>
  ): Promise<ClarificationAnswerRow[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const entries = Object.entries(answers).map(([questionId, answer]) => ({
      session_id: sessionId,
      question_id: questionId,
      answer,
    }));

    const { data, error } = await this.client
      .from('clarification_answers')
      .insert(entries as never)
      .select();

    if (error) throw error;
    return data || [];
  }

  async getAgentLogs(
    agent?: string,
    limit: number = VALIDATION_LIMITS.PAGINATION.AGENT_LOGS_DEFAULT
  ): Promise<AgentLog[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    let query = this.client
      .from('agent_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (agent) {
      query = query.eq('agent', agent);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getAgentLogsPaginated(
    agent?: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<AgentLog>> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(
      pagination.pageSize || VALIDATION_LIMITS.PAGINATION.AGENT_LOGS_DEFAULT,
      VALIDATION_LIMITS.PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * pageSize;

    let countQuery = this.client
      .from('agent_logs')
      .select('*', { count: 'exact', head: true });

    if (agent) {
      countQuery = countQuery.eq('agent', agent);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    let query = this.client
      .from('agent_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (agent) {
      query = query.eq('agent', agent);
    }

    const { data, error } = await query;

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
   * Helper method to chunk array into smaller batches
   * Prevents query parameter overflow and memory exhaustion
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
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
    if (!this.client) throw new Error('Supabase client not initialized');

    // Query 1: Get all ideas with status (needed for ideasByStatus)
    const { data: ideasData, error: ideasError } = await this.client
      .from('ideas')
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
    const { data: statsData, error: statsError } = await this.client.rpc(
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
      const { data: deliverablesData, error: deliverablesError } =
        await this.client
          .from('deliverables')
          .select('id', { count: 'exact', head: false })
          .in('idea_id', ideaIds)
          .is('deleted_at', null);

      if (deliverablesError) throw deliverablesError;
      const deliverables = (deliverablesData as { id: string }[] | null) ?? [];
      totalDeliverables = deliverables.length;

      // Query 2b: Get task count directly using deliverable IDs (only if needed)
      if (deliverables.length > 0) {
        const deliverableIds = deliverables.map((d) => d.id);
        const { count: taskCount, error: taskError } = await this.client
          .from('tasks')
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

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    metrics?: ReturnType<DatabaseService['getConnectionMetrics']>;
  }> {
    try {
      if (!this.client) throw new Error('Supabase client not initialized');

      const { error } = await this.client.from('ideas').select('id').limit(1);

      if (error) throw error;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: this.getConnectionMetrics(),
      };
    } catch {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        metrics: this.getConnectionMetrics(),
      };
    }
  }
}

// Export singleton instance
export const dbService = DatabaseService.getInstance();

// Export types for external use
export type { Database };
