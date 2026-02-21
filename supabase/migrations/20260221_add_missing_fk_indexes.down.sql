-- Down Migration: Remove foreign key indexes
-- Description: Rollback migration 20260221_add_missing_fk_indexes
-- Safety: Safe to run - only removes indexes, doesn't affect data

-- Drop the indexes added by the up migration
DROP INDEX IF EXISTS idx_idea_sessions_idea_id;
DROP INDEX IF EXISTS idx_task_comments_user_id;
DROP INDEX IF EXISTS idx_task_comments_task_user;
