-- Down Migration: Revert Consolidated Indexes
-- Description: Drop indexes created in migration 20260223_consolidate_migrations
-- Related Issue: #1816

DROP INDEX IF EXISTS idx_ideas_updated_at;
DROP INDEX IF EXISTS idx_task_comments_deleted_at;
DROP INDEX IF EXISTS idx_task_dependencies_updated_at;
DROP INDEX IF EXISTS idx_task_assignments_updated_at;
DROP INDEX IF EXISTS idx_agent_logs_action;
DROP INDEX IF EXISTS idx_agent_logs_action_timestamp;
DROP INDEX IF EXISTS idx_task_assignments_assigned_by;
DROP INDEX IF EXISTS idx_task_assignments_user_assigned_by;
DROP INDEX IF EXISTS idx_clarification_answers_question_id;
DROP INDEX IF EXISTS idx_clarification_answers_session_question;
DROP INDEX IF EXISTS idx_task_comments_user_id;
DROP INDEX IF EXISTS idx_task_comments_task_user;
DROP INDEX IF EXISTS idx_idea_sessions_idea_id;
DROP INDEX IF EXISTS idx_risk_assessments_risk_score;
DROP INDEX IF EXISTS idx_risk_assessments_idea_risk_score;
DROP INDEX IF EXISTS idx_tasks_updated_at;
DROP INDEX IF EXISTS idx_time_tracking_task_user;
DROP INDEX IF EXISTS idx_ideas_user_created;
DROP INDEX IF EXISTS idx_tasks_deliverable_status;
DROP INDEX IF EXISTS idx_deliverables_idea_priority;
DROP INDEX IF EXISTS idx_agent_logs_agent_timestamp;