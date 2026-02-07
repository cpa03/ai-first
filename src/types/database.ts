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
      clarification_sessions: {
        Row: {
          created_at: string;
          id: string;
          idea_id: string;
          status: 'active' | 'completed' | 'cancelled';
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          idea_id: string;
          status?: 'active' | 'completed' | 'cancelled';
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          idea_id?: string;
          status?: 'active' | 'completed' | 'cancelled';
          updated_at?: string;
        };
      };
      clarification_answers: {
        Row: {
          answer: string;
          created_at: string;
          id: string;
          question_id: string;
          session_id: string;
          updated_at: string;
        };
        Insert: {
          answer: string;
          created_at?: string;
          id?: string;
          question_id: string;
          session_id: string;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          id?: string;
          question_id?: string;
          session_id?: string;
          updated_at?: string;
        };
      };
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
          milestone_id: string | null;
          completion_percentage: number;
          business_value: number;
          risk_factors: string[] | null;
          acceptance_criteria: Json | null;
          deliverable_type:
            | 'feature'
            | 'documentation'
            | 'testing'
            | 'deployment'
            | 'research';
          deleted_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          estimate_hours?: number;
          id?: string;
          idea_id: string;
          priority?: number;
          title: string;
          milestone_id?: string | null;
          completion_percentage?: number;
          business_value?: number;
          risk_factors?: string[] | null;
          acceptance_criteria?: Json | null;
          deliverable_type?:
            | 'feature'
            | 'documentation'
            | 'testing'
            | 'deployment'
            | 'research';
          deleted_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          estimate_hours?: number;
          id?: string;
          idea_id?: string;
          priority?: number;
          title?: string;
          milestone_id?: string | null;
          completion_percentage?: number;
          business_value?: number;
          risk_factors?: string[] | null;
          acceptance_criteria?: Json | null;
          deliverable_type?:
            | 'feature'
            | 'documentation'
            | 'testing'
            | 'deployment'
            | 'research';
          deleted_at?: string | null;
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
          deleted_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          raw_text: string;
          status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
          title: string;
          user_id: string;
          deleted_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          raw_text?: string;
          status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
          title?: string;
          user_id?: string;
          deleted_at?: string | null;
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
          start_date: string | null;
          end_date: string | null;
          actual_hours: number | null;
          completion_percentage: number;
          priority_score: number;
          complexity_score: number;
          risk_level: 'low' | 'medium' | 'high';
          tags: string[] | null;
          custom_fields: Json | null;
          milestone_id: string | null;
          deleted_at: string | null;
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
          start_date?: string | null;
          end_date?: string | null;
          actual_hours?: number | null;
          completion_percentage?: number;
          priority_score?: number;
          complexity_score?: number;
          risk_level?: 'low' | 'medium' | 'high';
          tags?: string[] | null;
          custom_fields?: Json | null;
          milestone_id?: string | null;
          deleted_at?: string | null;
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
          start_date?: string | null;
          end_date?: string | null;
          actual_hours?: number | null;
          completion_percentage?: number;
          priority_score?: number;
          complexity_score?: number;
          risk_level?: 'low' | 'medium' | 'high';
          tags?: string[] | null;
          custom_fields?: Json | null;
          milestone_id?: string | null;
          deleted_at?: string | null;
        };
      };
      task_dependencies: {
        Row: {
          created_at: string;
          dependency_type:
            | 'finish_to_start'
            | 'start_to_start'
            | 'finish_to_finish'
            | 'start_to_finish';
          id: string;
          lag_days: number;
          predecessor_task_id: string;
          successor_task_id: string;
        };
        Insert: {
          created_at?: string;
          dependency_type?:
            | 'finish_to_start'
            | 'start_to_start'
            | 'finish_to_finish'
            | 'start_to_finish';
          id?: string;
          lag_days?: number;
          predecessor_task_id: string;
          successor_task_id: string;
        };
        Update: {
          created_at?: string;
          dependency_type?:
            | 'finish_to_start'
            | 'start_to_start'
            | 'finish_to_finish'
            | 'start_to_finish';
          id?: string;
          lag_days?: number;
          predecessor_task_id?: string;
          successor_task_id?: string;
        };
      };
      milestones: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          idea_id: string;
          priority: number;
          status: 'pending' | 'completed' | 'delayed' | 'cancelled';
          target_date: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          idea_id: string;
          priority?: number;
          status?: 'pending' | 'completed' | 'delayed' | 'cancelled';
          target_date?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          idea_id?: string;
          priority?: number;
          status?: 'pending' | 'completed' | 'delayed' | 'cancelled';
          target_date?: string | null;
          title?: string;
          updated_at?: string;
        };
      };
      task_assignments: {
        Row: {
          allocation_percentage: number;
          assigned_at: string;
          assigned_by: string | null;
          id: string;
          role: 'assignee' | 'reviewer' | 'contributor';
          task_id: string;
          user_id: string;
        };
        Insert: {
          allocation_percentage?: number;
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          role?: 'assignee' | 'reviewer' | 'contributor';
          task_id: string;
          user_id: string;
        };
        Update: {
          allocation_percentage?: number;
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          role?: 'assignee' | 'reviewer' | 'contributor';
          task_id?: string;
          user_id?: string;
        };
      };
      time_tracking: {
        Row: {
          created_at: string;
          date_logged: string;
          hours_logged: number;
          id: string;
          notes: string | null;
          task_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date_logged: string;
          hours_logged: number;
          id?: string;
          notes?: string | null;
          task_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          date_logged?: string;
          hours_logged?: number;
          id?: string;
          notes?: string | null;
          task_id?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      task_comments: {
        Row: {
          comment: string;
          created_at: string;
          id: string;
          parent_comment_id: string | null;
          task_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment: string;
          created_at?: string;
          id?: string;
          parent_comment_id?: string | null;
          task_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string;
          created_at?: string;
          id?: string;
          parent_comment_id?: string | null;
          task_id?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      breakdown_sessions: {
        Row: {
          ai_model_version: string | null;
          confidence_score: number | null;
          created_at: string;
          id: string;
          idea_id: string;
          processing_time_ms: number | null;
          session_data: Json;
          status:
            | 'analyzing'
            | 'decomposing'
            | 'scheduling'
            | 'completed'
            | 'failed';
          updated_at: string;
        };
        Insert: {
          ai_model_version?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          id?: string;
          idea_id: string;
          processing_time_ms?: number | null;
          session_data: Json;
          status?:
            | 'analyzing'
            | 'decomposing'
            | 'scheduling'
            | 'completed'
            | 'failed';
          updated_at?: string;
        };
        Update: {
          ai_model_version?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          id?: string;
          idea_id?: string;
          processing_time_ms?: number | null;
          session_data?: Json;
          status?:
            | 'analyzing'
            | 'decomposing'
            | 'scheduling'
            | 'completed'
            | 'failed';
          updated_at?: string;
        };
      };
      timelines: {
        Row: {
          created_at: string;
          critical_path: Json | null;
          end_date: string;
          id: string;
          idea_id: string;
          milestone_data: Json | null;
          phase_data: Json | null;
          resource_allocation: Json | null;
          start_date: string;
          total_weeks: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          critical_path?: Json | null;
          end_date: string;
          id?: string;
          idea_id: string;
          milestone_data?: Json | null;
          phase_data?: Json | null;
          resource_allocation?: Json | null;
          start_date: string;
          total_weeks: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          critical_path?: Json | null;
          end_date?: string;
          id?: string;
          idea_id?: string;
          milestone_data?: Json | null;
          phase_data?: Json | null;
          resource_allocation?: Json | null;
          start_date?: string;
          total_weeks?: number;
          updated_at?: string;
        };
      };
      risk_assessments: {
        Row: {
          created_at: string;
          id: string;
          idea_id: string;
          impact_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
          mitigation_strategy: string | null;
          probability_level:
            | 'very_low'
            | 'low'
            | 'medium'
            | 'high'
            | 'very_high';
          risk_factor: string;
          risk_score: number | null;
          status: 'open' | 'mitigated' | 'accepted' | 'closed';
          task_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          idea_id: string;
          impact_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
          mitigation_strategy?: string | null;
          probability_level:
            | 'very_low'
            | 'low'
            | 'medium'
            | 'high'
            | 'very_high';
          risk_factor: string;
          risk_score?: number | null;
          status?: 'open' | 'mitigated' | 'accepted' | 'closed';
          task_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          idea_id?: string;
          impact_level?: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
          mitigation_strategy?: string | null;
          probability_level?:
            | 'very_low'
            | 'low'
            | 'medium'
            | 'high'
            | 'very_high';
          risk_factor?: string;
          risk_score?: number | null;
          status?: 'open' | 'mitigated' | 'accepted' | 'closed';
          task_id?: string;
          updated_at?: string;
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
          embedding: number[];
        };
        Insert: {
          created_at?: string;
          id?: string;
          idea_id: string;
          reference_id?: string | null;
          reference_type: string;
          vector_data?: Json | null;
          embedding?: number[];
        };
        Update: {
          created_at?: string;
          id?: string;
          idea_id?: string;
          reference_id?: string | null;
          reference_type?: string;
          vector_data?: Json | null;
          embedding?: number[];
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_vectors: {
        Args: {
          idea_id_filter?: string | null;
          match_count?: number;
          match_threshold?: number;
          query_embedding: number[];
        };
        Returns: {
          id: string;
          idea_id: string;
          reference_id: string | null;
          reference_type: string;
          similarity: number;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
