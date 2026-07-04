-- Migration 002: Schema Optimization and Data Integrity Constraints
-- Consolidated from: 002_data_integrity_constraints.sql + 002b_schema_optimization.sql
-- Description: Indexes for performance, soft-delete mechanism, and data integrity constraints
-- Date: 2025-01-07 (original) / 2026-07-04 (consolidated)
-- Status: Consolidated - replaces 002_data_integrity_constraints.sql and 002b_schema_optimization.sql

-- ============================================================================
-- PART 1: Performance Indexes
-- ============================================================================

-- Indexes for ideas table (frequently queried by user_id, status, and created_at)
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_user_status ON ideas(user_id, status);

-- Indexes for idea_sessions table
CREATE INDEX IF NOT EXISTS idx_idea_sessions_last_agent ON idea_sessions(last_agent);
CREATE INDEX IF NOT EXISTS idx_idea_sessions_updated_at ON idea_sessions(updated_at);

-- Indexes for deliverables table (frequently joined with ideas)
CREATE INDEX IF NOT EXISTS idx_deliverables_idea_id ON deliverables(idea_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_priority ON deliverables(priority);

-- Indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_deliverable_id ON tasks(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Indexes for vectors table
CREATE INDEX IF NOT EXISTS idx_vectors_idea_id ON vectors(idea_id);
CREATE INDEX IF NOT EXISTS idx_vectors_reference_type ON vectors(reference_type);

-- Indexes for agent_logs table
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent);
CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_timestamp ON agent_logs(agent, timestamp);

-- Composite index for task_dependencies (improves dependency query performance)
CREATE INDEX IF NOT EXISTS idx_task_dependencies_both ON task_dependencies(predecessor_task_id, successor_task_id);

-- ============================================================================
-- PART 2: Soft-Delete Mechanism
-- ============================================================================

-- Add deleted_at column to core tables for soft-delete support
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update existing RLS policies to filter out soft-deleted records
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (
        (auth.uid() = user_id OR auth.role() = 'service_role') AND
        deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Users can view their own idea sessions" ON idea_sessions;
CREATE POLICY "Users can view their own idea sessions" ON idea_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_sessions.idea_id AND user_id = auth.uid() AND deleted_at IS NULL)
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can view their own deliverables" ON deliverables;
CREATE POLICY "Users can view their own deliverables" ON deliverables
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = deliverables.idea_id AND user_id = auth.uid() AND deleted_at IS NULL)
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deliverables d
            JOIN ideas i ON d.idea_id = i.id
            WHERE d.id = tasks.deliverable_id AND i.user_id = auth.uid() AND i.deleted_at IS NULL AND d.deleted_at IS NULL
        )
        OR auth.role() = 'service_role'
    );

-- Create index on deleted_at columns for efficient soft-delete queries
CREATE INDEX IF NOT EXISTS idx_ideas_deleted_at ON ideas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deliverables_deleted_at ON deliverables(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);

-- ============================================================================
-- PART 3: Data Integrity Constraints
-- ============================================================================

-- Ensure task estimates are non-negative
ALTER TABLE tasks 
ADD CONSTRAINT tasks_estimate_non_negative 
CHECK (estimate >= 0);

-- Ensure task priority is within reasonable range
ALTER TABLE tasks 
ADD CONSTRAINT tasks_priority_valid 
CHECK (priority >= 0 AND priority <= 100);

-- Ensure deliverable estimate_hours is non-negative
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_estimate_hours_non_negative 
CHECK (estimate_hours >= 0);

-- Ensure deliverable priority is within reasonable range
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_priority_valid 
CHECK (priority >= 0 AND priority <= 100);

-- Ensure task allocation_percentage is valid
ALTER TABLE task_assignments 
ADD CONSTRAINT task_assignments_allocation_percentage_valid 
CHECK (allocation_percentage > 0 AND allocation_percentage <= 100);

-- Ensure time tracking hours_logged is valid
ALTER TABLE time_tracking 
ADD CONSTRAINT time_tracking_hours_logged_valid 
CHECK (hours_logged > 0);

-- Ensure risk score is within valid range (0-100 scale)
ALTER TABLE risk_assessments 
ADD CONSTRAINT risk_assessments_risk_score_valid 
CHECK (risk_score >= 0 AND risk_score <= 100);

-- Ensure task complexity_score is valid
ALTER TABLE tasks 
ADD CONSTRAINT tasks_complexity_score_valid 
CHECK (complexity_score >= 1 AND complexity_score <= 10);

-- Ensure task priority_score is non-negative
ALTER TABLE tasks 
ADD CONSTRAINT tasks_priority_score_valid 
CHECK (priority_score >= 0);

-- Ensure deliverable completion_percentage is valid
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_completion_percentage_valid 
CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Ensure task completion_percentage is valid
ALTER TABLE tasks 
ADD CONSTRAINT tasks_completion_percentage_valid 
CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Ensure task actual_hours is non-negative
ALTER TABLE tasks 
ADD CONSTRAINT tasks_actual_hours_non_negative 
CHECK (actual_hours >= 0);

-- Ensure deliverable business_value is non-negative
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_business_value_valid 
CHECK (business_value >= 0);

-- Ensure milestone priority is within reasonable range
ALTER TABLE milestones 
ADD CONSTRAINT milestones_priority_valid 
CHECK (priority >= 0 AND priority <= 100);

-- Add NOT NULL constraints to critical fields
ALTER TABLE ideas ALTER COLUMN title SET NOT NULL;
ALTER TABLE ideas ALTER COLUMN raw_text SET NOT NULL;
ALTER TABLE deliverables ALTER COLUMN title SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN title SET NOT NULL;

-- ============================================================================
-- PART 4: Update Database Service Methods
-- ============================================================================

-- NOTE: The DatabaseService class in src/lib/db.ts needs to be updated to:
-- 1. Use .is('deleted_at', null) filter in SELECT queries
-- 2. Implement softDelete methods that set deleted_at instead of hard deletes
-- 3. Update getIdeaStats to properly handle soft-deleted records

-- Example updated queries (implementation in TypeScript):
-- - getUserIdeas: add .is('deleted_at', null) to filter
-- - getIdeaDeliverables: add .is('deleted_at', null) to filter
-- - getDeliverableTasks: add .is('deleted_at', null) to filter
-- - getIdeaStats: use JOINs to properly count non-deleted records
