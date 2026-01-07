import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

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
  created_at: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
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
  created_at: string;
}

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

export interface Vector {
  id: string;
  idea_id: string;
  vector_data: Record<string, any>;
  reference_type: string;
  reference_id?: string;
  created_at: string;
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
  private client = supabaseClient;
  private admin = supabaseAdmin;
  private static instance: DatabaseService;

  private constructor() {
    this.client = supabaseClient;
    this.admin = supabaseAdmin;

    if (!this.client || !this.admin) {
      console.warn(
        'Supabase clients not initialized. Check environment variables.'
      );
    }
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Ideas CRUD operations
  async createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('ideas')
      .insert(idea as any)
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await this.admin
      .from('ideas')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Idea;
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
      } as any)
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
      .insert(deliverable as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getIdeaDeliverables(ideaId: string): Promise<Deliverable[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('deliverables')
      .select('*')
      .eq('idea_id', ideaId)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateDeliverable(
    id: string,
    updates: Partial<Deliverable>
  ): Promise<Deliverable> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await this.admin
      .from('deliverables')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Deliverable;
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
      .insert(task as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDeliverableTasks(deliverableId: string): Promise<Task[]> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('deliverable_id', deliverableId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { data, error } = await this.admin
      .from('tasks')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('tasks').delete().eq('id', id);

    if (error) throw error;
  }

  // Vector operations for embeddings and context
  async storeVector(
    vector: Omit<Vector, 'id' | 'created_at'>
  ): Promise<Vector> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('vectors')
      .insert(vector as any)
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

  async deleteVector(id: string): Promise<void> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('vectors').delete().eq('id', id);

    if (error) throw error;
  }

  // Agent logging
  async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, any>
  ): Promise<void> {
    if (!this.admin) throw new Error('Supabase admin client not initialized');

    const { error } = await this.admin.from('agent_logs').insert({
      agent,
      action,
      payload,
      timestamp: new Date().toISOString(),
    } as any);

    if (error) throw error;
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
      .select('id, status')
      .eq('user_id', userId);

    const ideaIds = (ideas as any[])?.map((i) => i.id) || [];

    const ideasByStatus =
      (ideas as any[])?.reduce(
        (acc, idea) => {
          acc[idea.status] = (acc[idea.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {};

    let totalDeliverables = 0;
    let totalTasks = 0;

    if (ideaIds.length > 0) {
      const { count: deliverableCount } = await this.client
        .from('deliverables')
        .select('*', { count: 'exact', head: true })
        .in('idea_id', ideaIds);

      totalDeliverables = deliverableCount || 0;

      const { data: deliverables } = await this.client
        .from('deliverables')
        .select('id')
        .in('idea_id', ideaIds);

      const deliverableIds = (deliverables as any[])?.map((d) => d.id) || [];

      if (deliverableIds.length > 0) {
        const { count: taskCount } = await this.client
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('deliverable_id', deliverableIds);

        totalTasks = taskCount || 0;
      }
    }

    return {
      totalIdeas: ideas?.length || 0,
      ideasByStatus,
      totalDeliverables,
      totalTasks,
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
