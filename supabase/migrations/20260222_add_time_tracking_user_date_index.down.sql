-- Down Migration: Remove composite index for time_tracking user_id + date_logged
-- Purpose: Rollback changes from migration: 20260222_add_time_tracking_user_date_index.sql
-- Reverses: Composite index on time_tracking(user_id, date_logged DESC)
-- Author: database-architect specialist
-- Date: 2026-02-22

-- ============================================================================
-- Rollback
-- ============================================================================

-- Remove the composite index
DROP INDEX IF EXISTS idx_time_tracking_user_date;

-- Remove the comment (automatically removed with the index, but explicit for documentation)
-- Note: COMMENT ON INDEX is automatically removed when the index is dropped
