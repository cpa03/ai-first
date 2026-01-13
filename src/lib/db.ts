import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { createLogger } from './logger';
import {
  IdeaRepository,
  type Idea,
  type IdeaSession,
  DeliverableRepository,
  type Deliverable,
  TaskRepository,
  type Task,
  VectorRepository,
  type Vector,
  AgentLogRepository,
  type AgentLog,
  AnalyticsRepository,
} from './repositories';

const logger = createLogger('DatabaseService');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export class DatabaseService {
  private static instance: DatabaseService;

  private ideaRepo: IdeaRepository;
  private deliverableRepo: DeliverableRepository;
  private taskRepo: TaskRepository;
  private vectorRepo: VectorRepository;
  private agentLogRepo: AgentLogRepository;
  private analyticsRepo: AnalyticsRepository;

  private constructor() {
    this.ideaRepo = new IdeaRepository(supabaseClient, supabaseAdmin);
    this.deliverableRepo = new DeliverableRepository(
      supabaseClient,
      supabaseAdmin
    );
    this.taskRepo = new TaskRepository(supabaseClient, supabaseAdmin);
    this.vectorRepo = new VectorRepository(supabaseClient, supabaseAdmin);
    this.agentLogRepo = new AgentLogRepository(supabaseClient, supabaseAdmin);
    this.analyticsRepo = new AnalyticsRepository(supabaseClient, supabaseAdmin);

    if (!supabaseClient || !supabaseAdmin) {
      logger.warn(
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

  async createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea> {
    return this.ideaRepo.createIdea(idea);
  }

  async getIdea(id: string): Promise<Idea | null> {
    return this.ideaRepo.getIdea(id);
  }

  async getUserIdeas(userId: string): Promise<Idea[]> {
    return this.ideaRepo.getUserIdeas(userId);
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    return this.ideaRepo.updateIdea(id, updates);
  }

  async deleteIdea(id: string): Promise<void> {
    return this.ideaRepo.deleteIdea(id);
  }

  async upsertIdeaSession(
    session: Omit<IdeaSession, 'updated_at'>
  ): Promise<IdeaSession> {
    return this.ideaRepo.upsertIdeaSession(session);
  }

  async getIdeaSession(ideaId: string): Promise<IdeaSession | null> {
    return this.ideaRepo.getIdeaSession(ideaId);
  }

  async createDeliverable(
    deliverable: Omit<Deliverable, 'id' | 'created_at'>
  ): Promise<Deliverable> {
    return this.deliverableRepo.createDeliverable(deliverable);
  }

  async getIdeaDeliverables(ideaId: string): Promise<Deliverable[]> {
    return this.deliverableRepo.getIdeaDeliverables(ideaId);
  }

  async updateDeliverable(
    id: string,
    updates: Partial<Deliverable>
  ): Promise<Deliverable> {
    return this.deliverableRepo.updateDeliverable(id, updates);
  }

  async deleteDeliverable(id: string): Promise<void> {
    return this.deliverableRepo.deleteDeliverable(id);
  }

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    return this.taskRepo.createTask(task);
  }

  async getDeliverableTasks(deliverableId: string): Promise<Task[]> {
    return this.taskRepo.getDeliverableTasks(deliverableId);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.taskRepo.updateTask(id, updates);
  }

  async deleteTask(id: string): Promise<void> {
    return this.taskRepo.deleteTask(id);
  }

  async storeVector(
    vector: Omit<Vector, 'id' | 'created_at'>
  ): Promise<Vector> {
    return this.vectorRepo.storeVector(vector);
  }

  async getVectors(ideaId: string, referenceType?: string): Promise<Vector[]> {
    return this.vectorRepo.getVectors(ideaId, referenceType);
  }

  async deleteVector(id: string): Promise<void> {
    return this.vectorRepo.deleteVector(id);
  }

  async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    return this.agentLogRepo.logAgentAction(agent, action, payload);
  }

  async createClarificationSession(ideaId: string): Promise<unknown> {
    return this.ideaRepo.createClarificationSession(ideaId);
  }

  async saveAnswers(
    sessionId: string,
    answers: Record<string, string>
  ): Promise<unknown> {
    return this.ideaRepo.saveAnswers(sessionId, answers);
  }

  async getAgentLogs(agent?: string, limit: number = 100): Promise<AgentLog[]> {
    return this.agentLogRepo.getAgentLogs(agent, limit);
  }

  async getIdeaStats(userId: string): Promise<{
    totalIdeas: number;
    ideasByStatus: Record<string, number>;
    totalDeliverables: number;
    totalTasks: number;
  }> {
    return this.analyticsRepo.getIdeaStats(userId);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.analyticsRepo.healthCheck();
  }
}

export const dbService = DatabaseService.getInstance();

export type { Database };

export type { Idea, IdeaSession } from './repositories/idea-repository';
export type { Deliverable } from './repositories/deliverable-repository';
export type { Task } from './repositories/task-repository';
export type { Vector } from './repositories/vector-repository';
export type { AgentLog } from './repositories/agent-log-repository';
