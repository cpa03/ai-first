import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  created_at: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
  deleted_at?: string;
}

export interface IdeaSession {
  idea_id: string;
  state: Record<string, unknown>;
  last_agent: string;
  metadata: Record<string, unknown>;
  updated_at: string;
}

export class IdeaRepository extends BaseRepository {
  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    super(client, admin);
  }

  async createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea> {
    this.checkClient();

    const { data, error } = await this.client!.from('ideas')
      .insert(idea)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'createIdea');
    }

    return data as Idea;
  }

  async getIdea(id: string): Promise<Idea | null> {
    this.checkClient();

    const { data, error } = await this.client!.from('ideas')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  }

  async getUserIdeas(userId: string): Promise<Idea[]> {
    this.checkClient();

    const { data, error } = await this.client!.from('ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      this.handleError(error, 'getUserIdeas');
    }

    return data || [];
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    this.checkAdmin();

    const { data, error } = await this.admin!.from('ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'updateIdea');
    }

    return data as Idea;
  }

  async deleteIdea(id: string): Promise<void> {
    this.checkClient();

    const { error } = await this.client!.from('ideas').delete().eq('id', id);

    if (error) {
      this.handleError(error, 'deleteIdea');
    }
  }

  async softDeleteIdea(id: string): Promise<void> {
    this.requireAdmin();

    const { error } = await this.requireAdmin()
      .from('ideas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  async upsertIdeaSession(
    session: Omit<IdeaSession, 'updated_at'>
  ): Promise<IdeaSession> {
    this.checkClient();

    const { data, error } = await this.client!.from('idea_sessions')
      .upsert({
        ...session,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.handleError(error, 'upsertIdeaSession');
    }

    return data;
  }

  async getIdeaSession(ideaId: string): Promise<IdeaSession | null> {
    this.checkClient();

    const { data, error } = await this.client!.from('idea_sessions')
      .select('*')
      .eq('idea_id', ideaId)
      .single();

    if (error) return null;
    return data;
  }

  async createClarificationSession(ideaId: string): Promise<unknown> {
    this.checkClient();

    const { data, error } = await this.client!.from('clarification_sessions')
      .insert({
        idea_id: ideaId,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      this.handleError(error, 'createClarificationSession');
    }

    return data;
  }

  async saveAnswers(
    sessionId: string,
    answers: Record<string, string>
  ): Promise<unknown> {
    this.checkClient();

    const entries = Object.entries(answers).map(([questionId, answer]) => ({
      session_id: sessionId,
      question_id: questionId,
      answer,
    }));

    const { data, error } = await this.client!.from('clarification_answers')
      .insert(entries)
      .select();

    if (error) {
      this.handleError(error, 'saveAnswers');
    }

    return data;
  }
}
