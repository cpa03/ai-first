-- Migration: Add composite index for time_tracking task_id + user_id
-- Purpose: Optimize queries filtering by both task and user
-- Addresses: GitHub Issues #1189 and #1172 (Database schema quality)
-- Safe: Non-destructive, adds index only
-- Reversible: Down migration removes the index

-- ============================================================================
-- Performance Enhancement
-- ============================================================================

-- Add composite index for time_tracking queries filtering by task and user
-- This optimizes common query patterns:
-- 1. "Get all time entries for a specific user on a specific task"
-- 2. "Calculate time totals per user per task"
-- 3. "Generate reports by task and user"
--
-- Example queries optimized:
-- SELECT * FROM time_tracking WHERE task_id = X AND user_id = Y;
-- SELECT SUM(hours_logged) FROM time_tracking WHERE task_id = X AND user_id = Y;
-- SELECT * FROM time_tracking WHERE task_id = X AND user_id = Y ORDER BY date_logged DESC;

CREATE INDEX IF NOT EXISTS idx_time_tracking_task_user 
    ON time_tracking(task_id, user_id);

-- Add comment to document the index purpose
COMMENT ON INDEX idx_time_tracking_task_user IS 
    'Composite index for optimizing time_tracking queries filtering by task and user together';
