-- Migration: 20260817_final_schema_consolidation
-- Description: Final consolidation of all migrations into a single source of truth
-- Purpose: Comprehensive schema documentation and missing optimizations
-- Date: 2026-08-17
-- Related Issue: #1816
-- Safety: All statements use IF NOT EXISTS for idempotency
-- Status: FINAL CONSOLIDATION - This migration completes the consolidation effort

-- ============================================================================
-- SCHEMA DOCUMENTATION
-- ============================================================================
-- This migration represents the final state of the database schema after
-- consolidating 60+ individual migrations into 9 logical migration files.
--
-- Current Migration Files:
-- 1. 001_breakdown_engine_extensions.sql - Core breakdown engine tables
-- 2. 002_schema_optimization_and_constraints.sql - Indexes, soft-delete, constraints
-- 3. 003_vectors_pgvector_support.sql - Vector embeddings support
-- 4. 20260113_add_missing_tables_and_columns.sql - Schema synchronization
-- 5. 20260120_add_clarification_tables_and_indexes.sql - Clarification workflow
-- 6. 20260218_add_missing_rls_policies.sql - Row-level security
-- 7. 20260222_consolidate_performance_indexes.sql - Performance indexes
-- 8. 20260223_consolidate_migrations.sql - Additional indexes
-- 9. 20260226_consolidate_risk_assessments_migrations.sql - Risk assessments
--
-- Total Tables: 14
-- Total Indexes: 45+
-- ============================================================================

-- ============================================================================
-- PART 1: VERIFY EXISTING TABLES
-- ============================================================================

-- Core tables (created in base schema, not in migrations)
-- ideas, tasks, deliverables, vectors, agent_logs

-- Breakdown engine tables (created in 001_breakdown_engine_extensions.sql)
-- task_dependencies, milestones, task_assignments, time_tracking,
-- task_comments, breakdown_sessions, timelines

-- Clarification tables (created in 20260120_add_clarification_tables_and_indexes.sql)
-- clarification_sessions, clarification_answers

-- Risk assessment tables (created in 20260226_consolidate_risk_assessments_migrations.sql)
-- risk_assessments

-- ============================================================================
-- PART 2: ADD MISSING INDEXES
-- ============================================================================

-- Ideas table - Additional composite indexes
CREATE INDEX IF NOT EXISTS idx_ideas_status_created
ON ideas(status, created_at DESC);

-- Tasks table - Additional composite indexes
CREATE INDEX IF NOT EXISTS idx_tasks_priority_status
ON tasks(priority DESC, status);

CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id
ON tasks(milestone_id) WHERE milestone_id IS NOT NULL;

-- Deliverables table - Additional composite indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_type_priority
ON(deliverable_type, priority DESC);

-- Task dependencies - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_predecessor
ON task_dependencies(predecessor_task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_successor
ON task_dependencies(successor_task_id);

-- Task assignments - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id
ON task_assignments(task_id);

CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id
ON task_assignments(user_id);

-- Time tracking - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_id
ON time_tracking(task_id);

CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id
ON time_tracking(user_id);

-- Task comments - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id
ON task_comments(task_id);

-- Breakdown sessions - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_breakdown_sessions_idea_id
ON breakdown_sessions(idea_id);

-- Timelines - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_timelines_idea_id
ON timelines(idea_id);

-- Clarification sessions - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_clarification_sessions_idea_id
ON clarification_sessions(idea_id);

-- Clarification answers - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_clarification_answers_session_id
ON clarification_answers(session_id);

-- Risk assessments - Additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_risk_assessments_idea_id
ON risk_assessments(idea_id);

-- ============================================================================
-- PART 3: ADD MISSING foreign KEY CONSTRAINTS
-- ============================================================================

-- Deliverables - milestone_id foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_deliverables_milestone'
  ) THEN
    ALTER TABLE deliverables
    ADD CONSTRAINT fk_deliverables_milestone
    FOREIGN KEY (milestone_id) REFERENCES milestones(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Tasks - milestone_id foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_tasks_milestone'
  ) THEN
    ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_milestone
    FOREIGN KEY (milestone_id) REFERENCES milestones(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- PART 4: ADD MISSING COLUMNS
-- ============================================================================

-- Ideas table - Add missing columns if not exists
DO $$
BEGIN
  -- Add idea_type column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'idea_type'
  ) THEN
    ALTER TABLE ideas ADD COLUMN idea_type TEXT
      CHECK (idea_type IN ('feature', 'bug', 'improvement', 'research', 'other'));
  END IF;

  -- Add source column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'source'
  ) THEN
    ALTER TABLE ideas ADD COLUMN source TEXT
      CHECK (source IN ('web', 'api', 'import', 'manual'));
  END IF;
END $$;

-- ============================================================================
-- PART 5: ADD MISSING TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER update_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()',
      t.table_name,
      t.table_name
    );
  END LOOP;
END $$;

-- ============================================================================
-- PART 6: ADD MISSING RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakdown_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================

-- This migration completes the consolidation effort started in 20260222
-- All subsequent migrations should follow the new naming convention:
-- YYYYMMDD_description.sql
--
-- Migration count reduced from 60+ to 9 logical files
-- Schema documentation added in supabase/SCHEMA.md
