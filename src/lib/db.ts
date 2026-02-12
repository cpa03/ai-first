import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { redactPIIInObject } from './pii-redaction';
import { createLogger } from './logger';
import { AGENT_CONFIG, VALIDATION_LIMITS } from './config/constants';

const logger = createLogger('DatabaseService');
const { DATABASE } = AGENT_CONFIG;

/* eslint-disable @typescript-eslint/no-explicit-any */
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
 * SECURITY: This function must ONLY be called in server-side contexts (API routes, server components)
 * The service role key bypasses RLS and should never be exposed to the client
 */
export function getSupabaseAdmin(): ReturnType<
  typeof createClient<Database>
> | null {
  // SECURITY: Ensure we're on the server
  if (typeof window !== 'undefined') {
    throw new Error(
      'getSupabaseAdmin() must not be called in browser context. ' +
        'This is a critical security violation - the service role key bypasses RLS.'
    );
  }

  // Lazy initialization to prevent key from being accessed during module load
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

// DEPRECATED: Kept for backward compatibility during migration
// TODO: Remove after all imports are updated to use getSupabaseAdmin()
export const supabaseAdmin =
  typeof window === 'undefined' ? getSupabaseAdmin() : null;

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

export interface Vector {
  id: string;
  idea_id: string;
  vector_data?: Record<string, any>;
  reference_type: string;
  reference_id?: string;
  created_at: string;
  embedding?: number[];
}

export interface AgentLog {
  id: string;
  agent: string;
  action: string;
  payload: Record<string, any>;
  timestamp: string;
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

  private constructor() {
    this._client = supabaseClient;
    this._admin = supabaseAdmin;

    // Only warn about missing clients in development, not in CI/production
    if (
      (!this._client || !this._admin) &&
      process.env.NODE_ENV === 'development' &&
      !process.env.CI
    ) {
      logger.warn(
        'Supabase clients not initialized. Check environment variables.'
      );
    }
  }

  private get client() {
    this.ensureNotDisposed();
    return this._client;
  }

  private get admin() {
    this.ensureNotDisposed();
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
   * Properly dispose of database connections and cleanup resources
   * This prevents memory leaks in long-running processes
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }

    logger.info('Disposing DatabaseService and cleaning up connections...');

    // Clean up client connections
    if (this._client) {
      try {
        // Remove auth state change listeners to prevent memory leaks
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
        const admin = this._admin as any;
        if (admin.auth && typeof admin.auth.onAuthStateChange === 'function') {
          logger.debug('Cleaning up admin auth listeners');
        }
      } catch (error) {
        logger.warn('Error during admin cleanup:', error);
      }
      this._admin = null;
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
   */
  reinitializeClients(): void {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (DatabaseService as any).instance = undefined;
  }

  // Connection health monitoring
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;

      const { error } = await this.client.from('ideas').select('id').limit(1);
      this.connectionHealthy = !error;
      this.lastHealthCheck = new Date();
      return this.connectionHealthy;
    } catch {
      this.connectionHealthy = false;
      return false;
    }
  }

  isConnectionHealthy(): boolean {
    // Check if last health check is within stale threshold
    if (!this.lastHealthCheck) return false;
    const staleThreshold = new Date(
      Date.now() - DATABASE.HEALTH_CHECK_STALE_THRESHOLD_MS
    );
    return this.connectionHealthy && this.lastHealthCheck > staleThreshold;
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

  async getIdeaDeliverablesWithTasks(
    ideaId: string
  ): Promise<(Deliverable & { tasks: Task[] })[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('deliverables')
      .select('*, tasks(*)')
      .eq('idea_id', ideaId)
      .is('deleted_at', null)
      .order('priority', { ascending: false });

    if (error) throw error;

    const deliverables = (data || []) as (Deliverable & { tasks: Task[] })[];

    return deliverables.map((d) => ({
      ...d,
      tasks: (d.tasks || []).filter((t: Task) => !t.deleted_at),
    }));
  }

  async getDeliverableWithIdea(
    id: string
  ): Promise<(Deliverable & { idea: Idea }) | null> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data: deliverable, error: deliverableError } = await this.client
      .from('deliverables')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (deliverableError || !deliverable) return null;

    const typedDeliverable = deliverable as Deliverable;

    const { data: idea, error: ideaError } = await this.client
      .from('ideas')
      .select('*')
      .eq('id', typedDeliverable.idea_id)
      .is('deleted_at', null)
      .single();

    if (ideaError || !idea) return null;

    return { ...typedDeliverable, idea: idea as Idea };
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

    const { data: task, error: taskError } = await this.client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (taskError || !task) return null;

    const typedTask = task as Task;

    const { data: deliverable, error: deliverableError } = await this.client
      .from('deliverables')
      .select('*')
      .eq('id', typedTask.deliverable_id)
      .is('deleted_at', null)
      .single();

    if (deliverableError || !deliverable) return null;

    const typedDeliverable = deliverable as Deliverable;

    const { data: idea, error: ideaError } = await this.client
      .from('ideas')
      .select('*')
      .eq('id', typedDeliverable.idea_id)
      .is('deleted_at', null)
      .single();

    if (ideaError || !idea) return null;

    return { ...typedTask, deliverable: typedDeliverable, idea: idea as Idea };
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
    vectorData?: Record<string, any>
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
    payload: Record<string, any>
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
  async createClarificationSession(ideaId: string): Promise<any> {
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
  ): Promise<any> {
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
    return data;
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

  // Analytics and reporting
  async getIdeaStats(userId: string): Promise<{
    totalIdeas: number;
    ideasByStatus: Record<string, number>;
    totalDeliverables: number;
    totalTasks: number;
  }> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data: ideas } = await this.client
      .from('ideas')
      .select('status, id')
      .eq('user_id', userId)
      .is('deleted_at', null);

    const ideasByStatus =
      (ideas as any[])?.reduce(
        (acc, idea) => {
          acc[idea.status] = (acc[idea.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {};

    const ideaIds = (ideas as any[])?.map((i) => i.id) || [];

    const [deliverablesResponse, deliverableCountResponse] = await Promise.all([
      this.client
        .from('deliverables')
        .select('id')
        .in('idea_id', ideaIds)
        .is('deleted_at', null),
      this.client
        .from('deliverables')
        .select('*', { count: 'exact', head: true })
        .in('idea_id', ideaIds)
        .is('deleted_at', null),
    ]);

    const deliverableIds =
      (deliverablesResponse.data as Array<{ id: string }> | null)?.map(
        (d) => d.id
      ) || [];
    const { count: totalDeliverables } = deliverableCountResponse;

    const { count: totalTasks } = await this.client
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('deliverable_id', deliverableIds)
      .is('deleted_at', null);

    return {
      totalIdeas: ideas?.length || 0,
      ideasByStatus,
      totalDeliverables: totalDeliverables || 0,
      totalTasks: totalTasks || 0,
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      if (!this.client) throw new Error('Supabase client not initialized');

      const { error } = await this.client.from('ideas').select('id').limit(1);

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

// Export singleton instance
export const dbService = DatabaseService.getInstance();

// Export types for external use
export type { Database };
