-- Down Migration: Remove composite index for time_tracking task_id + user_id
-- Purpose: Rollback changes from migration: 20260221_add_time_tracking_task_user_index.sql
-- Reverses: Composite index on time_tracking(task_id, user_id)

-- ============================================================================
-- Rollback
-- ============================================================================

-- Remove the composite index
DROP INDEX IF EXISTS idx_time_tracking_task_user;
