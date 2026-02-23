-- Migration: Rollback vectors pagination composite index
-- Description: Remove the composite indexes added for vectors pagination optimization
-- Date: 2026-02-23
-- Safety: Low risk - removing indexes doesn't modify data

-- Drop the composite index for vectors pagination (without reference_type filter)
DROP INDEX IF EXISTS idx_vectors_idea_created;

-- Drop the composite index for vectors pagination (with reference_type filter)
DROP INDEX IF EXISTS idx_vectors_idea_type_created;
