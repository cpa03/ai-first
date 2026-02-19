-- Rollback Migration 003: Fix Vectors Table for pgvector Support
-- This script reverses the changes made in 003_vectors_pgvector_support.sql
-- Author: Data Architect
-- Date: 2025-01-07

-- ============================================================================
-- PART 1: Remove Additional RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Service role can update vectors" ON vectors;

-- Restore original RLS policy
DROP POLICY IF EXISTS "Users can create their own vectors" ON vectors;
CREATE POLICY "Users can create their own vectors" ON vectors
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = vectors.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- ============================================================================
-- PART 2: Remove pgvector Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_vectors_embedding_l2;
DROP INDEX IF EXISTS idx_vectors_embedding_cosine;

-- ============================================================================
-- PART 3: Remove Vector Similarity Search Function
-- ============================================================================

DROP FUNCTION IF EXISTS match_vectors;

-- ============================================================================
-- PART 4: Remove pgvector Column
-- ============================================================================

ALTER TABLE vectors DROP COLUMN IF EXISTS embedding;

-- ============================================================================
-- PART 4: Remove pgvector Extension
-- ============================================================================

-- Note: We keep the vector extension enabled as it may be used by other tables
-- Only drop the extension if no other tables are using it
-- DROP EXTENSION IF EXISTS vector;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

-- Note: DatabaseService class should be reverted to remove:
-- 1. Vector similarity search methods
-- 2. Updates to storeVector method
-- 3. SearchVectors method
