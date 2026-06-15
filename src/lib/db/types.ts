import type { IdeaStatus } from '@/lib/config';

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  status: IdeaStatus;
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

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ConnectionHealth {
  client: boolean;
  admin: boolean;
}
