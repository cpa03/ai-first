-- Down Migration: Revert Schema Optimization and Data Integrity Constraints
-- Consolidated from: 002_data_integrity_constraints.down.sql + 002b_schema_optimization.down.sql

-- ============================================================================
-- PART 3: Remove Data Integrity Constraints (reverse order)
-- ============================================================================

ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_priority_valid;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_business_value_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_actual_hours_non_negative;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_completion_percentage_valid;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_completion_percentage_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_score_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_complexity_score_valid;
ALTER TABLE risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_risk_score_valid;
ALTER TABLE time_tracking DROP CONSTRAINT IF EXISTS time_tracking_hours_logged_valid;
ALTER TABLE task_assignments DROP CONSTRAINT IF EXISTS task_assignments_allocation_percentage_valid;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_priority_valid;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_estimate_hours_non_negative;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_estimate_non_negative;

-- Remove NOT NULL constraints from critical fields
ALTER TABLE tasks ALTER COLUMN title DROP NOT NULL;
ALTER TABLE deliverables ALTER COLUMN title DROP NOT NULL;
ALTER TABLE ideas ALTER COLUMN raw_text DROP NOT NULL;
ALTER TABLE ideas ALTER COLUMN title DROP NOT NULL;

-- ============================================================================
-- PART 2: Remove Soft-Delete Mechanism (reverse order)
-- ============================================================================

-- Remove deleted_at column from core tables
ALTER TABLE tasks DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE deliverables DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE ideas DROP COLUMN IF EXISTS deleted_at;

-- ============================================================================
-- PART 1: Remove Performance Indexes (reverse order)
-- ============================================================================

DROP INDEX IF EXISTS idx_task_dependencies_both;
DROP INDEX IF EXISTS idx_agent_logs_agent_timestamp;
DROP INDEX IF EXISTS idx_agent_logs_timestamp;
DROP INDEX IF EXISTS idx_agent_logs_agent;
DROP INDEX IF EXISTS idx_vectors_reference_type;
DROP INDEX IF EXISTS idx_vectors_idea_id;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_deliverable_id;
DROP INDEX IF EXISTS idx_deliverables_priority;
DROP INDEX IF EXISTS idx_deliverables_idea_id;
DROP INDEX IF EXISTS idx_idea_sessions_updated_at;
DROP INDEX IF EXISTS idx_idea_sessions_last_agent;
DROP INDEX IF EXISTS idx_ideas_user_status;
DROP INDEX IF EXISTS idx_ideas_created_at;
DROP INDEX IF EXISTS idx_ideas_status;
DROP INDEX IF EXISTS idx_ideas_user_id;
