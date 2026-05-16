-- Migration: 20260222_consolidate_performance_indexes.sql
-- Description: Consolidated index additions from Feb 2026 for query performance optimization
-- Tables affected: ideas, task_comments, task_dependencies, task_assignments, tasks,
--                 clarification_answers, time_tracking, risk_assessments,
--                 idea_sessions, deliverables, agent_logs
-- Rollback: Each index can be dropped individually if needed
-- Related issue: #1816
-- Consolidation: Combined 17 independent index-only migrations from 20260218-20260222

-- =====================================================
-- IDEA SESSION INDEXES
-- =====================================================

-- Originally from: 20260222_add_idea_sessions_agent_updated_index.sql
CREATE INDEX IF NOT EXISTS idx_idea_sessions_agent_updated
ON idea_sessions(last_agent, updated_at DESC);

-- =====================================================
-- TASKS INDEXES
-- =====================================================

-- Originally from: 20260221_add_tasks_updated_at.sql
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at
ON tasks(updated_at DESC);

-- =====================================================
-- TASK COMMENTS INDEXES
-- =====================================================

-- Originally from: 20260218_add_task_comments_soft_delete.sql
CREATE INDEX IF NOT EXISTS idx_task_comments_deleted_at
ON task_comments(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- TASK DEPENDENCIES INDEXES
-- =====================================================

-- Originally from: 20260218_add_task_dependencies_updated_at.sql
CREATE INDEX IF NOT EXISTS idx_task_dependencies_updated_at
ON task_dependencies(updated_at DESC);

-- =====================================================
-- TASK ASSIGNMENTS INDEXES
-- =====================================================

-- Originally from: 20260219_add_task_assignments_updated_at.sql
CREATE INDEX IF NOT EXISTS idx_task_assignments_updated_at
ON task_assignments(updated_at DESC);

-- Originally from: 20260220_add_task_assignments_indexes.sql
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by
ON task_assignments(assigned_by);

CREATE INDEX IF NOT EXISTS idx_task_assignments_user_assigned_by
ON task_assignments(user_id, assigned_by);

-- =====================================================
-- CLARIFICATION ANSWERS INDEXES
-- =====================================================

-- Originally from: 20260221_add_clarification_question_index.sql
CREATE INDEX IF NOT EXISTS idx_clarification_answers_question_id
ON clarification_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_clarification_answers_session_question
ON clarification_answers(session_id, question_id);

-- Originally from: 20260221_add_missing_fk_indexes.sql
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id
ON task_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_user
ON task_comments(task_id, user_id);

CREATE INDEX IF NOT EXISTS idx_idea_sessions_idea_id
ON idea_sessions(idea_id);

-- =====================================================
-- TIME TRACKING INDEXES
-- =====================================================

-- Originally from: 20260221_add_time_tracking_task_user_index.sql
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_user
ON time_tracking(task_id, user_id);

-- Originally from: 20260222_add_time_tracking_user_date_index.sql
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_date
ON time_tracking(user_id, date_logged);

-- =====================================================
-- RISK ASSESSMENTS INDEXES
-- =====================================================

-- Originally from: 20260221_add_risk_assessments_risk_score_index.sql
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_score
ON risk_assessments(risk_score) WHERE risk_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_risk_assessments_idea_risk_score
ON risk_assessments(idea_id, risk_score DESC) WHERE risk_score IS NOT NULL;

-- Originally from: 20260222_add_risk_assessments_status_score_index.sql
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status_risk_score
ON risk_assessments(status, risk_score DESC);

-- =====================================================
-- IDEAS INDEXES
-- =====================================================

-- Originally from: 20260218_add_ideas_updated_at.sql
CREATE INDEX IF NOT EXISTS idx_ideas_updated_at
ON ideas(updated_at DESC);

-- Originally from: 20260222_add_ideas_pagination_composite_index.sql
CREATE INDEX IF NOT EXISTS idx_ideas_user_deleted_created
ON ideas(user_id, deleted_at, created_at DESC)
WHERE deleted_at IS NULL;

-- =====================================================
-- DELIVERABLES INDEXES
-- =====================================================

-- Originally from: 20260222_add_deliverables_composite_priority_index.sql
CREATE INDEX IF NOT EXISTS idx_deliverables_idea_deleted_priority
ON deliverables(idea_id, deleted_at, priority DESC)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deliverables_idea_milestone_priority
ON deliverables(idea_id, milestone_id, priority DESC)
WHERE deleted_at IS NULL;

-- =====================================================
-- AGENT LOGS INDEXES
-- =====================================================

-- Originally from: 20260220_add_agent_logs_action_index.sql
CREATE INDEX IF NOT EXISTS idx_agent_logs_action
ON agent_logs(action);

CREATE INDEX IF NOT EXISTS idx_agent_logs_action_timestamp
ON agent_logs(action, timestamp DESC);

-- Originally from: 20260222_add_agent_logs_agent_action_index.sql
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_action_timestamp
ON agent_logs(agent, action, timestamp DESC);