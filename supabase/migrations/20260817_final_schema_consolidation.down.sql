-- Migration: 20260817_final_schema_consolidation (ROLLBACK)
-- Description: Rollback final schema consolidation
-- Purpose: Remove added indexes and constraints
-- Date: 2026-08-17
-- Related Issue: #1816

-- ============================================================================
-- ROLLBACK PART 1: REMOVE ADDED INDEXES
-- ============================================================================

-- Ideas table indexes
DROP INDEX IF EXISTS idx_ideas_status_created;

-- Tasks table indexes
DROP INDEX IF EXISTS idx_tasks_priority_status;
DROP INDEX IF EXISTS idx_tasks_milestone_id;

-- Deliverables table indexes
DROP INDEX IF EXISTS idx_deliverables_type_priority;

-- Task dependencies indexes
DROP INDEX IF EXISTS idx_task_dependencies_predecessor;
DROP INDEX IF EXISTS idx_task_dependencies_successor;

-- Task assignments indexes
DROP INDEX IF EXISTS idx_task_assignments_task_id;
DROP INDEX IF EXISTS idx_task_assignments_user_id;

-- Time tracking indexes
DROP INDEX IF EXISTS idx_time_tracking_task_id;
DROP INDEX IF EXISTS idx_time_tracking_user_id;

-- Task comments indexes
DROP INDEX IF EXISTS idx_task_comments_task_id;

-- Breakdown sessions indexes
DROP INDEX IF EXISTS idx_breakdown_sessions_idea_id;

-- Timelines indexes
DROP INDEX IF EXISTS idx_timelines_idea_id;

-- Clarification sessions indexes
DROP INDEX IF EXISTS idx_clarification_sessions_idea_id;

-- Clarification answers indexes
DROP INDEX IF EXISTS idx_clarification_answers_session_id;

-- Risk assessments indexes
DROP INDEX IF EXISTS idx_risk_assessments_idea_id;

-- ============================================================================
-- ROLLBACK PART 2: REMOVE ADDED CONSTRAINTS
-- ============================================================================

-- Remove foreign key constraints
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS fk_deliverables_milestone;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_tasks_milestone;

-- ============================================================================
-- ROLLBACK PART 3: REMOVE ADDED COLUMNS
-- ============================================================================

-- Remove added columns from ideas table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'idea_type'
  ) THEN
    ALTER TABLE ideas DROP COLUMN IF EXISTS idea_type;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'source'
  ) THEN
    ALTER TABLE ideas DROP COLUMN IF EXISTS source;
  END IF;
END $$;

-- ============================================================================
-- ROLLBACK PART 4: REMOVE TRIGGERS
-- ============================================================================

-- Drop triggers
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
      'DROP TRIGGER IF EXISTS update_%s_updated_at ON %I',
      t.table_name,
      t.table_name
    );
  END LOOP;
END $$;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
