import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { createLogger } from '../logger';
import { resourceCleanupManager } from '../resource-cleanup';
import { AGENT_CONFIG } from '../config/constants';
import { IdeaService, type ClientProvider } from './ideas';
import { DeliverableService } from './deliverables';
import { TaskService } from './tasks';
import { VectorService } from './vectors';
import { ClarificationService } from './clarification';
import { ConnectionHealthMonitor } from './health';
import type {
  Idea,
  IdeaSession,
  Deliverable,
  Task,
  Vector,
  AgentLog,
  ClarificationSessionRow,
  ClarificationAnswerRow,
  PaginationOptions,
  PaginatedResult,
  ConnectionHealth,
} from './types';

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

// Re-export types for backward compatibility
export type {
  Idea,
  IdeaSession,
  Deliverable,
  Task,
  Vector,
  AgentLog,
  ClarificationSessionRow,
  ClarificationAnswerRow,
  PaginationOptions,
  PaginatedResult,
  ConnectionHealth,
} from './types';

// Re-export sub-services for direct access
export { IdeaService } from './ideas';
export { DeliverableService } from './deliverables';
export { TaskService } from './tasks';
export { VectorService } from './vectors';
export { ClarificationService } from './clarification';

/**
 * Database service class
 *
 * This is the main entry point for all database operations.
 * It delegates to domain-specific services for better modularity:
 * - IdeaService: Idea CRUD and statistics
 * - DeliverableService: Deliverable operations
 * - TaskService: Task operations
 * - VectorService: Vector/embedding operations
 * - ClarificationService: Clarification sessions and agent logging
 */
export class DatabaseService implements ClientProvider {
  private _client: ReturnType<typeof createClient<Database>> | null = null;
  private _admin: ReturnType<typeof createClient<Database>> | null = null;
  private static instance: DatabaseService;
  private _disposed = false;

  // Health monitor for connection tracking
  private _healthMonitor: ConnectionHealthMonitor | null = null;

  // Domain-specific services (initialized lazily)
  private _ideas: IdeaService | null = null;
  private _deliverables: DeliverableService | null = null;
  private _tasks: TaskService | null = null;
  private _vectors: VectorService | null = null;
  private _clarification: ClarificationService | null = null;

  private constructor() {
    this._client = supabaseClient;
    // SECURITY: _admin is lazy-loaded via getter to prevent client-side exposure
    // The getSupabaseAdmin() function has runtime checks to prevent browser usage

    if (
      !this._client &&
      process.env.NODE_ENV === 'development' &&
      !process.env.CI &&
      typeof window === 'undefined'
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

  // ClientProvider implementation
  getClient(): ReturnType<typeof createClient<Database>> | null {
    this.ensureNotDisposed();
    return this._client;
  }

  getAdmin(): ReturnType<typeof createClient<Database>> | null {
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
   * Get the IdeaService instance
   */
  get ideas(): IdeaService {
    if (!this._ideas) {
      this._ideas = new IdeaService(this);
    }
    return this._ideas;
  }

  /**
   * Get the DeliverableService instance
   */
  get deliverables(): DeliverableService {
    if (!this._deliverables) {
      this._deliverables = new DeliverableService(this);
    }
    return this._deliverables;
  }

  /**
   * Get the TaskService instance
   */
  get tasks(): TaskService {
    if (!this._tasks) {
      this._tasks = new TaskService(this);
    }
    return this._tasks;
  }

  /**
   * Get the VectorService instance
   */
  get vectors(): VectorService {
    if (!this._vectors) {
      this._vectors = new VectorService(this);
    }
    return this._vectors;
  }

  /**
   * Get the ClarificationService instance
   */
  get clarification(): ClarificationService {
    if (!this._clarification) {
      this._clarification = new ClarificationService(this);
    }
    return this._clarification;
  }

  /**
   * Check if the service has been disposed
   */
  isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Get the health monitor instance
   */
  get healthMonitor(): ConnectionHealthMonitor {
    if (!this._healthMonitor) {
      this._healthMonitor = new ConnectionHealthMonitor();
    }
    return this._healthMonitor;
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
    const healthStatus = this._healthMonitor?.getHealthStatus();
    return {
      disposed: this._disposed,
      clientCleared: this._client === null,
      adminCleared: this._admin === null,
      healthTrackingReset: healthStatus
        ? !healthStatus.healthy &&
          healthStatus.lastCheck === null &&
          healthStatus.retries === 0
        : true,
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
    this._healthMonitor?.resetHealthTracking();

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
    this._healthMonitor?.resetHealthTracking();

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
  async checkConnection(): Promise<ConnectionHealth> {
    return this.healthMonitor.checkConnection(this._client, () =>
      this.getAdmin()
    );
  }

  isConnectionHealthy(): boolean {
    return this.healthMonitor.isConnectionHealthy();
  }

  getConnectionMetrics() {
    return this.healthMonitor.getConnectionMetrics();
  }

  // ============================================================================
  // Backward-compatible delegates to sub-services
  // These methods delegate to the domain-specific services while maintaining
  // the existing API for backward compatibility.
  // ============================================================================

  // Ideas CRUD operations
  async createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea> {
    return this.ideas.createIdea(idea);
  }

  async getIdea(id: string): Promise<Idea | null> {
    return this.ideas.getIdea(id);
  }

  async getUserIdeas(userId: string): Promise<Idea[]> {
    return this.ideas.getUserIdeas(userId);
  }

  async getUserIdeasPaginated(
    userId: string,
    pagination: PaginationOptions = {},
    filters?: { status?: Idea['status'] | 'all'; search?: string }
  ): Promise<PaginatedResult<Idea>> {
    return this.ideas.getUserIdeasPaginated(userId, pagination, filters);
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    return this.ideas.updateIdea(id, updates);
  }

  async softDeleteIdea(id: string): Promise<void> {
    return this.ideas.softDeleteIdea(id);
  }

  async deleteIdea(id: string): Promise<void> {
    return this.ideas.deleteIdea(id);
  }

  // Idea sessions operations
  async upsertIdeaSession(
    session: Omit<IdeaSession, 'updated_at'>
  ): Promise<IdeaSession> {
    return this.ideas.upsertIdeaSession(session);
  }

  async getIdeaSession(ideaId: string): Promise<IdeaSession | null> {
    return this.ideas.getIdeaSession(ideaId);
  }

  // Deliverables operations
  async createDeliverable(
    deliverable: Omit<Deliverable, 'id' | 'created_at'>
  ): Promise<Deliverable> {
    return this.deliverables.createDeliverable(deliverable);
  }

  async createDeliverables(
    deliverables: Omit<Deliverable, 'id' | 'created_at'>[]
  ): Promise<Deliverable[]> {
    return this.deliverables.createDeliverables(deliverables);
  }

  async getIdeaDeliverables(ideaId: string): Promise<Deliverable[]> {
    return this.deliverables.getIdeaDeliverables(ideaId);
  }

  async getIdeaDeliverablesWithTasks(
    ideaId: string
  ): Promise<(Deliverable & { tasks: Task[] })[]> {
    return this.deliverables.getIdeaDeliverablesWithTasks(ideaId);
  }

  async getDeliverableWithIdea(
    id: string
  ): Promise<(Deliverable & { idea: Idea }) | null> {
    return this.deliverables.getDeliverableWithIdea(id);
  }

  async updateDeliverable(
    id: string,
    updates: Partial<Deliverable>
  ): Promise<Deliverable> {
    return this.deliverables.updateDeliverable(id, updates);
  }

  async softDeleteDeliverable(id: string): Promise<void> {
    return this.deliverables.softDeleteDeliverable(id);
  }

  async deleteDeliverable(id: string): Promise<void> {
    return this.deliverables.deleteDeliverable(id);
  }

  // Tasks operations
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    return this.tasks.createTask(task);
  }

  async createTasks(tasks: Omit<Task, 'id' | 'created_at'>[]): Promise<Task[]> {
    return this.tasks.createTasks(tasks);
  }

  async getDeliverableTasks(deliverableId: string): Promise<Task[]> {
    return this.tasks.getDeliverableTasks(deliverableId);
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.getTask(id);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.tasks.updateTask(id, updates);
  }

  async softDeleteTask(id: string): Promise<void> {
    return this.tasks.softDeleteTask(id);
  }

  async deleteTask(id: string): Promise<void> {
    return this.tasks.deleteTask(id);
  }

  async getTaskWithOwnership(
    id: string
  ): Promise<(Task & { deliverable: Deliverable; idea: Idea }) | null> {
    return this.tasks.getTaskWithOwnership(id);
  }

  // Vector operations for embeddings and context
  async storeVector(
    vector: Omit<Vector, 'id' | 'created_at'>
  ): Promise<Vector> {
    return this.vectors.storeVector(vector);
  }

  async getVectors(ideaId: string, referenceType?: string): Promise<Vector[]> {
    return this.vectors.getVectors(ideaId, referenceType);
  }

  async getVectorsPaginated(
    ideaId: string,
    referenceType?: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<Vector>> {
    return this.vectors.getVectorsPaginated(ideaId, referenceType, pagination);
  }

  async getVectorsByIdeaIds(
    ideaIds: string[],
    referenceType?: string
  ): Promise<Map<string, Vector[]>> {
    return this.vectors.getVectorsByIdeaIds(ideaIds, referenceType);
  }

  async deleteVector(id: string): Promise<void> {
    return this.vectors.deleteVector(id);
  }

  async storeEmbedding(
    ideaId: string,
    referenceType: string,
    embedding: number[],
    referenceId?: string,
    vectorData?: Record<string, unknown>
  ): Promise<Vector> {
    return this.vectors.storeEmbedding(
      ideaId,
      referenceType,
      embedding,
      referenceId,
      vectorData
    );
  }

  async searchSimilarVectors(
    ideaId: string,
    queryEmbedding: number[],
    limit: number = DATABASE.DEFAULT_SEARCH_LIMIT
  ): Promise<Vector[]> {
    return this.vectors.searchSimilarVectors(ideaId, queryEmbedding, limit);
  }

  // Agent logging
  async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    return this.clarification.logAgentAction(agent, action, payload);
  }

  // Clarification session operations
  async createClarificationSession(
    ideaId: string
  ): Promise<ClarificationSessionRow> {
    return this.clarification.createClarificationSession(ideaId);
  }

  async saveAnswers(
    sessionId: string,
    answers: Record<string, string>
  ): Promise<ClarificationAnswerRow[]> {
    return this.clarification.saveAnswers(sessionId, answers);
  }

  async getAgentLogs(agent?: string, limit?: number): Promise<AgentLog[]> {
    return this.clarification.getAgentLogs(agent, limit);
  }

  async getAgentLogsPaginated(
    agent?: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<AgentLog>> {
    return this.clarification.getAgentLogsPaginated(agent, pagination);
  }

  // Delegate to IdeaService for stats
  async getIdeaStats(userId: string): Promise<{
    totalIdeas: number;
    ideasByStatus: Record<string, number>;
    totalDeliverables: number;
    totalTasks: number;
  }> {
    return this.ideas.getIdeaStats(userId);
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    metrics?: ReturnType<DatabaseService['getConnectionMetrics']>;
    connections?: ConnectionHealth;
  }> {
    try {
      // Check both client and admin connections for consistency
      const connectionHealth = await this.checkConnection();

      const allHealthy = connectionHealth.client && connectionHealth.admin;

      if (!allHealthy) {
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          metrics: this.getConnectionMetrics(),
          connections: connectionHealth,
        };
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: this.getConnectionMetrics(),
        connections: connectionHealth,
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
