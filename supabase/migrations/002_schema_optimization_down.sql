-- Rollback Migration 002: Database Schema Optimization
-- This script reverses the changes made in 002_schema_optimization.sql
-- Author: Data Architect
-- Date: 2025-01-07

-- ============================================================================
-- PART 1: Remove Additional Constraints
-- ============================================================================

-- Remove CHECK constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_estimate_positive;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS check_estimate_hours_positive;

-- Note: We keep NOT NULL constraints as they don't break functionality

-- ============================================================================
-- PART 2: Remove Soft-Delete Mechanism
-- ============================================================================

-- Remove deleted_at columns from core tables
ALTER TABLE tasks DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE deliverables DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE ideas DROP COLUMN IF EXISTS deleted_at;

-- Restore original RLS policies
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view their own idea sessions" ON idea_sessions;
CREATE POLICY "Users can view their own idea sessions" ON idea_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can view their own deliverables" ON deliverables;
CREATE POLICY "Users can view their own deliverables" ON deliverables
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = deliverables.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deliverables d
            JOIN ideas i ON d.idea_id = i.id
            WHERE d.id = tasks.deliverable_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

-- Remove soft-delete indexes
DROP INDEX IF EXISTS idx_tasks_deleted_at;
DROP INDEX IF EXISTS idx_deliverables_deleted_at;
DROP INDEX IF EXISTS idx_ideas_deleted_at;

-- ============================================================================
-- PART 3: Remove Performance Indexes
-- ============================================================================

-- Remove indexes from agent_logs
DROP INDEX IF EXISTS idx_agent_logs_agent_timestamp;
DROP INDEX IF EXISTS idx_agent_logs_timestamp;
DROP INDEX IF EXISTS idx_agent_logs_agent;

-- Remove indexes from vectors
DROP INDEX IF EXISTS idx_vectors_reference_type;
DROP INDEX IF EXISTS idx_vectors_idea_id;

-- Remove indexes from tasks
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_deliverable_id;

-- Remove indexes from deliverables
DROP INDEX IF EXISTS idx_deliverables_priority;
DROP INDEX IF EXISTS idx_deliverables_idea_id;

-- Remove indexes from idea_sessions
DROP INDEX IF EXISTS idx_idea_sessions_updated_at;
DROP INDEX IF EXISTS idx_idea_sessions_last_agent;

-- Remove indexes from ideas
DROP INDEX IF EXISTS idx_ideas_user_status;
DROP INDEX IF EXISTS idx_ideas_created_at;
DROP INDEX IF EXISTS idx_ideas_status;
DROP INDEX IF EXISTS idx_ideas_user_id;

-- Remove composite index for task_dependencies
DROP INDEX IF EXISTS idx_task_dependencies_both;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

-- Note: DatabaseService class should be reverted to previous version if changes were made
