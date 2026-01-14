-- Down Migration: Revert Breakdown Engine Extensions
-- Description: Remove tables, columns, indexes, and triggers added in migration 001
-- Version: 001
-- Date: 2026-01-08

-- Drop new tables (in reverse order of creation)
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS timelines CASCADE;
DROP TABLE IF EXISTS breakdown_sessions CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS time_tracking CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;

-- Remove columns added to tasks table
ALTER TABLE tasks DROP COLUMN IF EXISTS start_date;
ALTER TABLE tasks DROP COLUMN IF EXISTS end_date;
ALTER TABLE tasks DROP COLUMN IF EXISTS actual_hours;
ALTER TABLE tasks DROP COLUMN IF EXISTS completion_percentage;
ALTER TABLE tasks DROP COLUMN IF EXISTS priority_score;
ALTER TABLE tasks DROP COLUMN IF EXISTS complexity_score;
ALTER TABLE tasks DROP COLUMN IF EXISTS risk_level;
ALTER TABLE tasks DROP COLUMN IF EXISTS tags;
ALTER TABLE tasks DROP COLUMN IF EXISTS custom_fields;
ALTER TABLE tasks DROP COLUMN IF EXISTS milestone_id;

-- Remove columns added to deliverables table
ALTER TABLE deliverables DROP COLUMN IF EXISTS milestone_id;
ALTER TABLE deliverables DROP COLUMN IF EXISTS completion_percentage;
ALTER TABLE deliverables DROP COLUMN IF EXISTS business_value;
ALTER TABLE deliverables DROP COLUMN IF EXISTS risk_factors;
ALTER TABLE deliverables DROP COLUMN IF EXISTS acceptance_criteria;
ALTER TABLE deliverables DROP COLUMN IF EXISTS deliverable_type;

-- Drop indexes
DROP INDEX IF EXISTS idx_task_dependencies_predecessor;
DROP INDEX IF EXISTS idx_task_dependencies_successor;
DROP INDEX IF EXISTS idx_milestones_idea_id;
DROP INDEX IF EXISTS idx_milestones_target_date;
DROP INDEX IF EXISTS idx_task_assignments_task_id;
DROP INDEX IF EXISTS idx_task_assignments_user_id;
DROP INDEX IF EXISTS idx_time_tracking_task_id;
DROP INDEX IF EXISTS idx_time_tracking_date;
DROP INDEX IF EXISTS idx_task_comments_task_id;
DROP INDEX IF EXISTS idx_breakdown_sessions_idea_id;
DROP INDEX IF EXISTS idx_timelines_idea_id;
DROP INDEX IF EXISTS idx_risk_assessments_idea_id;
DROP INDEX IF EXISTS idx_risk_assessments_task_id;
DROP INDEX IF EXISTS idx_tasks_start_date;
DROP INDEX IF EXISTS idx_tasks_end_date;
DROP INDEX IF EXISTS idx_tasks_milestone_id;
DROP INDEX IF EXISTS idx_deliverables_milestone_id;

-- Drop triggers
DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
DROP TRIGGER IF EXISTS update_time_tracking_updated_at ON time_tracking;
DROP TRIGGER IF EXISTS update_breakdown_sessions_updated_at ON breakdown_sessions;
DROP TRIGGER IF EXISTS update_timelines_updated_at ON timelines;
DROP TRIGGER IF EXISTS update_risk_assessments_updated_at ON risk_assessments;

-- Drop trigger function (if no other triggers use it)
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
