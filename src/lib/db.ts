import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { redactPIIInObject } from './pii-redaction';
import { createLogger } from './logger';

const logger = createLogger('DatabaseService');

/* eslint-disable @typescript-eslint/no-explicit-any */
// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

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
  private maxConnectionRetries = 3;
  private connectionHealthy = false;
  private lastHealthCheck: Date | null = null;

  private constructor() {
    this._client = supabaseClient;
    this._admin = supabaseAdmin;

    if (!this._client || !this._admin) {
      logger.warn(
        'Supabase clients not initialized. Check environment variables.'
      );
    }
  }

  private get client() {
    return this._client;
  }

  private get admin() {
    return this._admin;
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // For testing purposes only - reinitialize clients with current environment
  reinitializeClients(): void {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && anonKey) {
      this._client = createClient<Database>(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }

    if (url && serviceKey) {
      this._admin = createClient<Database>(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }

  // For testing purposes only - reset the singleton instance
  static resetInstance(): void {
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
    // Check if last health check is within 30 seconds
    if (!this.lastHealthCheck) return false;
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    return this.connectionHealthy && this.lastHealthCheck > thirtySecondsAgo;
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
    limit: number = 10
  ): Promise<Vector[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const { data, error } = await this.client.rpc('match_vectors', {
      query_embedding: embeddingString,
      match_threshold: 0.78,
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

  async getAgentLogs(agent?: string, limit: number = 100): Promise<AgentLog[]> {
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
