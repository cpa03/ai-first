export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agent_logs: {
        Row: {
          action: string;
          agent: string;
          id: string;
          payload: Json;
          timestamp: string;
        };
        Insert: {
          action: string;
          agent: string;
          id?: string;
          payload: Json;
          timestamp?: string;
        };
        Update: {
          action?: string;
          agent?: string;
          id?: string;
          payload?: Json;
          timestamp?: string;
        };
      };
      deliverables: {
        Row: {
          created_at: string;
          description: string | null;
          estimate_hours: number;
          id: string;
          idea_id: string;
          priority: number;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          estimate_hours?: number;
          id?: string;
          idea_id: string;
          priority?: number;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          estimate_hours?: number;
          id?: string;
          idea_id?: string;
          priority?: number;
          title?: string;
        };
      };
      idea_sessions: {
        Row: {
          idea_id: string;
          last_agent: string | null;
          metadata: Json | null;
          state: Json | null;
          updated_at: string;
        };
        Insert: {
          idea_id: string;
          last_agent?: string | null;
          metadata?: Json | null;
          state?: Json | null;
          updated_at?: string;
        };
        Update: {
          idea_id?: string;
          last_agent?: string | null;
          metadata?: Json | null;
          state?: Json | null;
          updated_at?: string;
        };
      };
      ideas: {
        Row: {
          created_at: string;
          id: string;
          raw_text: string;
          status: 'draft' | 'clarified' | 'breakdown' | 'completed';
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          raw_text: string;
          status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          raw_text?: string;
          status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
          title?: string;
          user_id?: string;
        };
      };
      tasks: {
        Row: {
          assignee: string | null;
          created_at: string;
          deliverable_id: string;
          description: string | null;
          estimate: number;
          id: string;
          status: 'todo' | 'in_progress' | 'completed';
          title: string;
        };
        Insert: {
          assignee?: string | null;
          created_at?: string;
          deliverable_id: string;
          description?: string | null;
          estimate?: number;
          id?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          title: string;
        };
        Update: {
          assignee?: string | null;
          created_at?: string;
          deliverable_id?: string;
          description?: string | null;
          estimate?: number;
          id?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          title?: string;
        };
      };
      vectors: {
        Row: {
          created_at: string;
          id: string;
          idea_id: string;
          reference_id: string | null;
          reference_type: string;
          vector_data: Json | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          idea_id: string;
          reference_id?: string | null;
          reference_type: string;
          vector_data?: Json | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          idea_id?: string;
          reference_id?: string | null;
          reference_type?: string;
          vector_data?: Json | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
