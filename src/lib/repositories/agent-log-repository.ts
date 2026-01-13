import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AgentLog {
  id: string;
  agent: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export class AgentLogRepository extends BaseRepository {
  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    super(client, admin);
  }

  async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    this.checkAdmin();

    const { error } = await this.admin!.from('agent_logs').insert({
      agent,
      action,
      payload,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      this.handleError(error, 'logAgentAction');
    }
  }

  async getAgentLogs(agent?: string, limit: number = 100): Promise<AgentLog[]> {
    this.checkClient();

    let query = this.client!.from('agent_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (agent) {
      query = query.eq('agent', agent);
    }

    const { data, error } = await query;

    if (error) {
      this.handleError(error, 'getAgentLogs');
    }

    return data || [];
  }
}
