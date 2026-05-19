-- Migration: 20260223_consolidate_migrations
-- Description: Consolidated migration for Phase 2 improvements
-- Purpose: Reduce migration file count by consolidating index-only and minor fix migrations
-- Date: 2026-02-23
-- Related Issue: #1816
-- Consolidation Applied:
--   - 20260218 index migrations (4 files)
--   - 20260219 index migrations (2 files)
--   - 20260220 index migrations (3 files)
--   - 20260221 index migrations (6 files)
--
-- Safety: All statements use IF NOT EXISTS / IF EXISTS for idempotency
-- Reversibility: Down migration drops only the consolidated indexes (not earlier ones)

-- ============================================================================
-- CONSOLIDATED INDEXES FROM 20260218
-- ============================================================================

-- [From 20260218_add_ideas_updated_at.sql]
CREATE INDEX IF NOT EXISTS idx_ideas_updated_at
ON ideas(updated_at DESC);

-- [From 20260218_add_missing_rls_policies.sql] - Already applied, no action needed

-- [From 20260218_add_task_comments_soft_delete.sql]
CREATE INDEX IF NOT EXISTS idx_task_comments_deleted_at
ON task_comments(deleted_at) WHERE deleted_at IS NOT NULL;

-- [From 20260218_add_task_dependencies_updated_at.sql]
CREATE INDEX IF NOT EXISTS idx_task_dependencies_updated_at
ON task_dependencies(updated_at DESC);

-- [From 20260218_vector_index_maintenance.sql]
-- Vector index maintenance already completed in migration 003

-- ============================================================================
-- CONSOLIDATED INDEXES FROM 20260219
-- ============================================================================

-- [From 20260219_add_date_integrity_constraints.sql]
-- Constraints already applied via migration 005

-- [From 20260219_add_idea_sessions_updated_at_trigger.sql]
-- Trigger already applied via migration 001

-- [From 20260219_add_task_assignments_updated_at.sql]
CREATE INDEX IF NOT EXISTS idx_task_assignments_updated_at
ON task_assignments(updated_at DESC);

-- ============================================================================
-- CONSOLIDATED INDEXES FROM 20260220
-- ============================================================================

-- [From 20260220_add_agent_logs_action_index.sql]
CREATE INDEX IF NOT EXISTS idx_agent_logs_action
ON agent_logs(action);

CREATE INDEX IF NOT EXISTS idx_agent_logs_action_timestamp
ON agent_logs(action, timestamp DESC);

-- [From 20260220_add_task_assignments_indexes.sql]
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by
ON task_assignments(assigned_by);

CREATE INDEX IF NOT EXISTS idx_task_assignments_user_assigned_by
ON task_assignments(user_id, assigned_by);

-- [From 20260220_fix_risk_score_data_type.sql]
-- Data type fix already applied

-- ============================================================================
-- CONSOLIDATED INDEXES FROM 20260221
-- ============================================================================

-- [From 20260221_add_clarification_question_index.sql]
CREATE INDEX IF NOT EXISTS idx_clarification_answers_question_id
ON clarification_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_clarification_answers_session_question
ON clarification_answers(session_id, question_id);

-- [From 20260221_add_missing_fk_indexes.sql]
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id
ON task_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_user
ON task_comments(task_id, user_id);

CREATE INDEX IF NOT EXISTS idx_idea_sessions_idea_id
ON idea_sessions(idea_id);

-- [From 20260221_add_risk_assessments_risk_score_index.sql]
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_score
ON risk_assessments(risk_score) WHERE risk_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_risk_assessments_idea_risk_score
ON risk_assessments(idea_id, risk_score DESC) WHERE risk_score IS NOT NULL;

-- [From 20260221_add_tasks_updated_at.sql]
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at
ON tasks(updated_at DESC);

-- [From 20260221_add_time_tracking_task_user_index.sql]
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_user
ON time_tracking(task_id, user_id);

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Additional indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_ideas_user_created
ON ideas(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_deliverable_status
ON tasks(deliverable_id, status);

CREATE INDEX IF NOT EXISTS idx_deliverables_idea_priority
ON deliverables(idea_id, priority DESC);

CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_timestamp
ON agent_logs(agent, timestamp DESC);

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================

-- This migration consolidates 15+ individual index-only migrations
-- Original files can be safely removed after verification:
--   - 20260218_add_ideas_updated_at.sql (consolidated)
--   - 20260218_add_task_comments_soft_delete.sql (consolidated)
--   - 20260218_add_task_dependencies_updated_at.sql (consolidated)
--   - 20260219_add_task_assignments_updated_at.sql (consolidated)
--   - 20260220_add_agent_logs_action_index.sql (consolidated)
--   - 20260220_add_task_assignments_indexes.sql (consolidated)
--   - 20260221_add_clarification_question_index.sql (consolidated)
--   - 20260221_add_missing_fk_indexes.sql (consolidated)
--   - 20260221_add_risk_assessments_risk_score_index.sql (consolidated)
--   - 20260221_add_tasks_updated_at.sql (consolidated)
--   - 20260221_add_time_tracking_task_user_index.sql (consolidated)