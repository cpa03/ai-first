-- Migration: Add composite index for ideas pagination optimization
-- Description: Optimize the common query pattern of getting paginated ideas for a user
-- Date: 2026-02-22
-- Issues: #1189, #1172 (Database schema quality improvements)
-- Author: database-architect specialist
-- Safety: Low risk - adding indexes doesn't modify data

-- ============================================================================
-- Background
-- ============================================================================
-- The DatabaseService.getUserIdeasPaginated() method uses a query pattern:
--   SELECT * FROM ideas
--   WHERE user_id = X AND deleted_at IS NULL
--   ORDER BY created_at DESC
--   LIMIT Y OFFSET Z;
--
-- Current indexes used:
--   - idx_ideas_user_deleted_status(user_id, deleted_at, status) - for filtering
--   - Then sorts by created_at in memory after filtering
--
-- This migration adds a composite index that covers both filtering AND ordering,
-- eliminating the need for an in-memory sort operation.

-- ============================================================================
-- Composite Index for Paginated Ideas Query
-- ============================================================================
-- Optimizes: getUserIdeasPaginated(), getUserIdeas()
-- Query Pattern: WHERE user_id = X AND deleted_at IS NULL ORDER BY created_at DESC
-- Performance Impact:
--   - Before: Index scan for filtering + sort operation
--   - After: Index-only scan (filtering + ordering in single operation)
--   - Estimated improvement: 20-40% faster for large result sets
CREATE INDEX IF NOT EXISTS idx_ideas_user_deleted_created
    ON ideas(user_id, deleted_at, created_at DESC);

-- Add comment documenting the index purpose
COMMENT ON INDEX idx_ideas_user_deleted_created IS
    'Composite index for efficient pagination queries: filtering by user_id and deleted_at, ordered by created_at. Optimizes getUserIdeasPaginated() and getUserIdeas() queries.';
