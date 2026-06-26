import { redactPIIInObject } from '../pii-redaction';
import { VALIDATION_LIMITS } from '../config/constants';
import { API_ERROR_MESSAGES } from '../config/error-messages';
import { DB_TABLES } from '../config/database-tables';
import type { ClientProvider } from './ideas';
import type {
  ClarificationSessionRow,
  ClarificationAnswerRow,
  AgentLog,
  PaginationOptions,
  PaginatedResult,
} from './types';

/**
 * ClarificationService handles clarification sessions and agent logging
 * Extracted from DatabaseService for better modularity and testability
 */
export class ClarificationService {
  constructor(private readonly clientProvider: ClientProvider) {}

  /**
   * Create a new clarification session
   */
  async createClarificationSession(
    ideaId: string
  ): Promise<ClarificationSessionRow> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.CLARIFICATION_SESSIONS)
      .insert({
        idea_id: ideaId,
        status: 'active',
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Save answers for a clarification session
   */
  async saveAnswers(
    sessionId: string,
    answers: Record<string, string>
  ): Promise<ClarificationAnswerRow[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const entries = Object.entries(answers).map(([questionId, answer]) => ({
      session_id: sessionId,
      question_id: questionId,
      answer,
    }));

    const { data, error } = await client
      .from(DB_TABLES.CLARIFICATION_ANSWERS)
      .insert(entries as never)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Log an agent action with PII redaction
   */
  async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);

    // Redact sensitive information before logging to database
    const sanitizedPayload = redactPIIInObject(payload);

    const { error } = await admin.from(DB_TABLES.AGENT_LOGS).insert({
      agent,
      action,
      payload: sanitizedPayload,
      timestamp: new Date().toISOString(),
    } as never);

    if (error) throw error;
  }

  /**
   * Get agent logs, optionally filtered by agent name
   */
  async getAgentLogs(
    agent?: string,
    limit: number = VALIDATION_LIMITS.PAGINATION.AGENT_LOGS_DEFAULT
  ): Promise<AgentLog[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    let query = client
      .from(DB_TABLES.AGENT_LOGS)
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

  /**
   * Get paginated agent logs
   */
  async getAgentLogsPaginated(
    agent?: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<AgentLog>> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(
      pagination.pageSize || VALIDATION_LIMITS.PAGINATION.AGENT_LOGS_DEFAULT,
      VALIDATION_LIMITS.PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * pageSize;

    // PERFORMANCE OPTIMIZATION: Combine count and data queries into a single request
    // using Supabase's select('*', { count: 'exact' }). This reduces database
    // round-trips from 2 to 1.
    let query = client
      .from(DB_TABLES.AGENT_LOGS)
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (agent) {
      query = query.eq('agent', agent);
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
}
