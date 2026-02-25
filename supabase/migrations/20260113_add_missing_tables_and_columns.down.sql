-- Down Migration: Revert Schema Synchronization
-- Purpose: Rollback changes from migration: 20260113_add_missing_tables_and_columns.sql
-- Reverses: All tables and columns added in up migration

-- =====================================================
-- PHASE 1: Drop Policies for New Tables
-- =====================================================

-- Milestone policies
DROP POLICY IF EXISTS "Users can view their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can create their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can update their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can delete their own milestones" ON milestones;

-- Breakdown sessions policies
DROP POLICY IF EXISTS "Users can view their own breakdown sessions" ON breakdown_sessions;
DROP POLICY IF EXISTS "Users can create their own breakdown sessions" ON breakdown_sessions;
DROP POLICY IF EXISTS "Users can update their own breakdown sessions" ON breakdown_sessions;

-- Timeline policies
DROP POLICY IF EXISTS "Users can view their own timelines" ON timelines;
DROP POLICY IF EXISTS "Users can create their own timelines" ON timelines;
DROP POLICY IF EXISTS "Users can update their own timelines" ON timelines;

-- Task dependencies policies
DROP POLICY IF EXISTS "Users can view task dependencies for their tasks" ON task_dependencies;
DROP POLICY IF EXISTS "Users can create task dependencies for their tasks" ON task_dependencies;
DROP POLICY IF EXISTS "Users can delete task dependencies for their tasks" ON task_dependencies;

-- Task assignments policies
DROP POLICY IF EXISTS "Users can view task assignments for their tasks" ON task_assignments;
DROP POLICY IF EXISTS "Users can create task assignments for their tasks" ON task_assignments;
DROP POLICY IF EXISTS "Users can update task assignments for their tasks" ON task_assignments;
DROP POLICY IF EXISTS "Users can delete task assignments for their tasks" ON task_assignments;

-- Time tracking policies
DROP POLICY IF EXISTS "Users can view their own time tracking" ON time_tracking;
DROP POLICY IF EXISTS "Users can create their own time tracking" ON time_tracking;
DROP POLICY IF EXISTS "Users can update their own time tracking" ON time_tracking;
DROP POLICY IF EXISTS "Users can delete their own time tracking" ON time_tracking;

-- Task comments policies
DROP POLICY IF EXISTS "Users can view comments for their tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments for their tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON task_comments;

-- Risk assessments policies
DROP POLICY IF EXISTS "Users can view risk assessments for their ideas/tasks" ON risk_assessments;
DROP POLICY IF EXISTS "Users can create risk assessments for their ideas/tasks" ON risk_assessments;
DROP POLICY IF EXISTS "Users can update risk assessments for their ideas/tasks" ON risk_assessments;
DROP POLICY IF EXISTS "Users can delete risk assessments for their ideas/tasks" ON risk_assessments;

-- =====================================================
-- PHASE 2: Drop Foreign Keys
-- =====================================================

-- Drop milestone foreign keys
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS fk_deliverables_milestone;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_tasks_milestone;

-- =====================================================
-- PHASE 3: Drop Performance Indexes
-- =====================================================

-- Milestone indexes
DROP INDEX IF EXISTS idx_milestones_idea_id;
DROP INDEX IF EXISTS idx_milestones_status;
DROP INDEX IF EXISTS idx_milestones_target_date;
DROP INDEX IF EXISTS idx_milestones_idea_status;

-- Breakdown sessions indexes
DROP INDEX IF EXISTS idx_breakdown_sessions_idea_id;
DROP INDEX IF EXISTS idx_breakdown_sessions_status;
DROP INDEX IF EXISTS idx_breakdown_sessions_idea_status;

-- Timeline indexes
DROP INDEX IF EXISTS idx_timelines_idea_id;
DROP INDEX IF EXISTS idx_timelines_dates;

-- Task dependencies indexes
DROP INDEX IF EXISTS idx_task_dependencies_predecessor;
DROP INDEX IF EXISTS idx_task_dependencies_successor;

-- Task assignments indexes
DROP INDEX IF EXISTS idx_task_assignments_task_id;
DROP INDEX IF EXISTS idx_task_assignments_user_id;
DROP INDEX IF EXISTS idx_task_assignments_task_user;

-- Time tracking indexes
DROP INDEX IF EXISTS idx_time_tracking_task_id;
DROP INDEX IF EXISTS idx_time_tracking_user_id;
DROP INDEX IF EXISTS idx_time_tracking_date_logged;
DROP INDEX IF EXISTS idx_time_tracking_task_date;

-- Task comments indexes
DROP INDEX IF EXISTS idx_task_comments_task_id;
DROP INDEX IF EXISTS idx_task_comments_parent_id;
DROP INDEX IF EXISTS idx_task_comments_created_at;

-- Risk assessments indexes
DROP INDEX IF EXISTS idx_risk_assessments_idea_id;
DROP INDEX IF EXISTS idx_risk_assessments_task_id;
DROP INDEX IF EXISTS idx_risk_assessments_status;
DROP INDEX IF EXISTS idx_risk_assessments_idea_task;

-- =====================================================
-- PHASE 4: Drop New Tables
-- =====================================================

-- Drop tables in order of dependencies (child tables first)

DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS time_tracking CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS timelines CASCADE;
DROP TABLE IF EXISTS breakdown_sessions CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;

-- =====================================================
-- PHASE 5: Remove Added Columns from Existing Tables
-- =====================================================

-- Remove columns from deliverables table
ALTER TABLE deliverables DROP COLUMN IF EXISTS milestone_id;
ALTER TABLE deliverables DROP COLUMN IF EXISTS completion_percentage;
ALTER TABLE deliverables DROP COLUMN IF EXISTS business_value;
ALTER TABLE deliverables DROP COLUMN IF EXISTS risk_factors;
ALTER TABLE deliverables DROP COLUMN IF EXISTS acceptance_criteria;
ALTER TABLE deliverables DROP COLUMN IF EXISTS deliverable_type;

-- Remove columns from tasks table
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
