-- Migration: Add composite index for vectors pagination optimization
-- Description: Optimize the common query pattern of getting paginated vectors for an idea
-- Date: 2026-02-23
-- Issues: #1189, #1172 (Database schema quality improvements)
-- Author: database-architect specialist
-- Safety: Low risk - adding indexes doesn't modify data

-- ============================================================================
-- Background
-- ============================================================================
-- The DatabaseService.getVectorsPaginated() method uses a query pattern:
--   SELECT * FROM vectors
--   WHERE idea_id = X
--   [AND reference_type = Y]
--   ORDER BY created_at DESC
--   LIMIT Z OFFSET W;
--
-- Current indexes used:
--   - idx_vectors_idea_id(idea_id) - for filtering by idea_id
--   - idx_vectors_idea_type(idea_id, reference_type) - for combined filtering
--   - Then sorts by created_at in memory after filtering
--
-- This migration adds composite indexes that cover both filtering AND ordering,
-- eliminating the need for an in-memory sort operation.

-- ============================================================================
-- Composite Index for Vectors Pagination (without reference_type filter)
-- ============================================================================
-- Optimizes: getVectorsPaginated() when reference_type is NOT provided
-- Query Pattern: WHERE idea_id = X ORDER BY created_at DESC
-- Performance Impact:
--   - Before: Index scan for filtering + sort operation
--   - After: Index-only scan (filtering + ordering in single operation)
--   - Estimated improvement: 20-40% faster for large result sets
CREATE INDEX IF NOT EXISTS idx_vectors_idea_created
    ON vectors(idea_id, created_at DESC);

-- ============================================================================
-- Composite Index for Vectors Pagination (with reference_type filter)
-- ============================================================================
-- Optimizes: getVectorsPaginated() when reference_type IS provided
-- Query Pattern: WHERE idea_id = X AND reference_type = Y ORDER BY created_at DESC
-- Performance Impact:
--   - Before: Uses idx_vectors_idea_type for filtering, then sorts
--   - After: Index-only scan (filtering + ordering in single operation)
--   - Estimated improvement: 20-40% faster for filtered pagination queries
CREATE INDEX IF NOT EXISTS idx_vectors_idea_type_created
    ON vectors(idea_id, reference_type, created_at DESC);

-- ============================================================================
-- Documentation Comments
-- ============================================================================
COMMENT ON INDEX idx_vectors_idea_created IS
    'Composite index for efficient vector pagination: filtering by idea_id, ordered by created_at. Optimizes getVectorsPaginated() queries without reference_type filter.';

COMMENT ON INDEX idx_vectors_idea_type_created IS
    'Composite index for efficient vector pagination: filtering by idea_id and reference_type, ordered by created_at. Optimizes getVectorsPaginated() queries with reference_type filter.';
