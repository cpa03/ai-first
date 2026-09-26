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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
            'feature' | 'documentation' | 'testing' | 'deployment' | 'research';
          deleted_at: string | null;
          updated_at: string;
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
            'feature' | 'documentation' | 'testing' | 'deployment' | 'research';
          deleted_at?: string | null;
          updated_at?: string;
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
            'feature' | 'documentation' | 'testing' | 'deployment' | 'research';
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deliverables_idea_id_fkey';
            columns: ['idea_id'];
            referencedRelation: 'ideas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deliverables_milestone_id_fkey';
            columns: ['milestone_id'];
            referencedRelation: 'milestones';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [];
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
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          raw_text: string;
          status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
          title: string;
          user_id: string;
          deleted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          raw_text?: string;
          status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
          title?: string;
          user_id?: string;
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
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
          updated_at: string;
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
          updated_at?: string;
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
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_deliverable_id_fkey';
            columns: ['deliverable_id'];
            referencedRelation: 'deliverables';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_milestone_id_fkey';
            columns: ['milestone_id'];
            referencedRelation: 'milestones';
            referencedColumns: ['id'];
          }
        ];
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
          updated_at: string;
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
          updated_at?: string;
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
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      task_assignments: {
        Row: {
          allocation_percentage: number;
          assigned_at: string;
          assigned_by: string | null;
          id: string;
          role: 'assignee' | 'reviewer' | 'contributor';
          task_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          allocation_percentage?: number;
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          role?: 'assignee' | 'reviewer' | 'contributor';
          task_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          allocation_percentage?: number;
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          role?: 'assignee' | 'reviewer' | 'contributor';
          task_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      task_comments: {
        Row: {
          comment: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          parent_comment_id: string | null;
          task_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          parent_comment_id?: string | null;
          task_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          parent_comment_id?: string | null;
          task_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
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
            'analyzing' | 'decomposing' | 'scheduling' | 'completed' | 'failed';
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
            'analyzing' | 'decomposing' | 'scheduling' | 'completed' | 'failed';
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
            'analyzing' | 'decomposing' | 'scheduling' | 'completed' | 'failed';
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      risk_assessments: {
        Row: {
          created_at: string;
          id: string;
          idea_id: string;
          impact_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
          mitigation_strategy: string | null;
          probability_level:
            'very_low' | 'low' | 'medium' | 'high' | 'very_high';
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
            'very_low' | 'low' | 'medium' | 'high' | 'very_high';
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
            'very_low' | 'low' | 'medium' | 'high' | 'very_high';
          risk_factor?: string;
          risk_score?: number | null;
          status?: 'open' | 'mitigated' | 'accepted' | 'closed';
          task_id?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      admin_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'moderator' | 'super_admin';
          granted_by: string | null;
          granted_at: string;
          expires_at: string | null;
          is_active: boolean | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'moderator' | 'super_admin';
          granted_by?: string | null;
          granted_at?: string;
          expires_at?: string | null;
          is_active?: boolean | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'moderator' | 'super_admin';
          granted_by?: string | null;
          granted_at?: string;
          expires_at?: string | null;
          is_active?: boolean | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          target_user_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          request_id: string | null;
          correlation_id: string | null;
          severity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          target_user_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          request_id?: string | null;
          correlation_id?: string | null;
          severity?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          target_user_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          request_id?: string | null;
          correlation_id?: string | null;
          severity?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      admin_user_view: {
        Row: {
          id: string;
          email: string;
          user_created_at: string;
          last_sign_in_at: string | null;
          email_confirmed_at: string | null;
          banned_until: string | null;
          active_roles: string[];
          super_admin_expires: string | null;
          admin_expires: string | null;
          moderator_expires: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      pg_database_size: {
        Args: {
          db_name: string;
        };
        Returns: number;
      };
      match_vectors: {
        Args: {
          idea_id_filter?: string | null;
          match_count?: number;
          match_threshold?: number;
          /**
           * PostgREST accepts the pgvector parameter either as a serialized
           * vector string (`'[0.1,0.2,...]'`) or as a JSON number array.
           */
          query_embedding: string | number[];
        };
        /**
         * `RETURNS TABLE` from `match_vectors` (see
         * supabase/migrations/003_vectors_pgvector_support.sql): a
         * similarity projection, not a full `vectors` row.
         */
        Returns: Array<{
          id: string;
          idea_id: string;
          reference_id: string | null;
          reference_type: string;
          similarity: number;
        }>;
      };
      /**
       * Per-user idea aggregates (deliverable/task counts).
       *
       * The RPC is optional: `src/lib/db/ideas.ts` falls back to two count
       * queries when the function is missing at runtime, so declaring it here
       * only affects typing, not behaviour.
       */
      get_user_idea_stats: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          total_deliverables: number;
          total_tasks: number;
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
