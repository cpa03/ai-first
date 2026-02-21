-- Migration: Add missing foreign key indexes
-- Description: Add indexes on foreign key columns that were missing indexes
-- Addresses: GitHub Issues #1189 and #1172 (Database schema quality)
-- Safety: Low risk - adding indexes doesn't modify data
-- Author: database-architect specialist

-- ============================================================================
-- Foreign Key Index: idea_sessions.idea_id
-- ============================================================================
-- This foreign key references ideas(id) but was missing an index
-- Benefits:
--   1. Faster CASCADE operations when an idea is deleted
--   2. Faster JOINs between idea_sessions and ideas tables
--   3. Better query performance when filtering sessions by idea_id
CREATE INDEX IF NOT EXISTS idx_idea_sessions_idea_id ON idea_sessions(idea_id);

-- ============================================================================
-- Foreign Key Index: task_comments.user_id
-- ============================================================================
-- This foreign key references auth.users(id) but was missing an index
-- Benefits:
--   1. Faster CASCADE operations when a user is deleted
--   2. Faster JOINs between task_comments and auth.users tables
--   3. Better query performance when filtering comments by user_id
--   4. Common use case: "Show all comments by this user"
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);

-- ============================================================================
-- Additional Composite Index for task_comments
-- ============================================================================
-- Composite index for the common query pattern: "Get all comments by a user on a task"
-- This optimizes queries like:
--   SELECT * FROM task_comments WHERE task_id = X AND user_id = Y
CREATE INDEX IF NOT EXISTS idx_task_comments_task_user ON task_comments(task_id, user_id);
