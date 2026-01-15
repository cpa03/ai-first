import { createClient } from '@supabase/supabase-js';
import { IdeaRepository, type Idea, type IdeaSession } from './idea-repository';
import {
  DeliverableRepository,
  type Deliverable,
  type Task,
} from './deliverable-repository';
import { TaskRepository } from './task-repository';
import { VectorRepository, type Vector } from './vector-repository';
import { AgentLogRepository, type AgentLog } from './agent-log-repository';
import { AnalyticsRepository } from './analytics-repository';

export type { Database } from '@/types/database';

export type { Idea, IdeaSession, Deliverable, Task, Vector, AgentLog };

export class RepositoryManager {
  private static instance: RepositoryManager;

  private client: ReturnType<typeof createClient> | null;
  private admin: ReturnType<typeof createClient> | null;

  public idea: IdeaRepository;
  public deliverable: DeliverableRepository;
  public task: TaskRepository;
  public vector: VectorRepository;
  public agentLog: AgentLogRepository;
  public analytics: AnalyticsRepository;

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.client =
      supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
            },
          })
        : null;

    this.admin =
      supabaseUrl && supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          })
        : null;

    this.idea = new IdeaRepository(this.client, this.admin);
    this.deliverable = new DeliverableRepository(this.client, this.admin);
    this.task = new TaskRepository(this.client, this.admin);
    this.vector = new VectorRepository(this.client, this.admin);
    this.agentLog = new AgentLogRepository(this.client, this.admin);
    this.analytics = new AnalyticsRepository(this.client, this.admin);

    if (!this.client || !this.admin) {
      console.warn(
        'Supabase clients not initialized. Check environment variables.'
      );
    }
  }

  static getInstance(): RepositoryManager {
    if (!RepositoryManager.instance) {
      RepositoryManager.instance = new RepositoryManager();
    }
    return RepositoryManager.instance;
  }
}

export const repositories = RepositoryManager.getInstance();

export const supabaseClient = repositories['client'];
export const supabaseAdmin = repositories['admin'];
