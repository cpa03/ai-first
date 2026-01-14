-- Migration 003: Fix Vectors Table for pgvector Support
-- This migration updates the vectors table to use pgvector for efficient similarity search
-- Author: Data Architect
-- Date: 2025-01-07

-- ============================================================================
-- PART 1: Enable pgvector Extension
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- PART 2: Add pgvector Column to vectors Table
-- ============================================================================

-- Add a new column for the actual vector embedding (using pgvector)
ALTER TABLE vectors ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Note: 1536 dimensions is standard for OpenAI's text-embedding-ada-002 model
-- Adjust dimension count based on the embedding model being used

-- Create index for efficient similarity search
CREATE INDEX IF NOT EXISTS idx_vectors_embedding_cosine
ON vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for efficient similarity search using L2 distance
CREATE INDEX IF NOT EXISTS idx_vectors_embedding_l2
ON vectors USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- ============================================================================
-- PART 3: Migration Notes
-- ============================================================================

-- IMPORTANT: The vector_data column (JSONB) is deprecated but kept for backward compatibility.
-- All new embeddings should be stored in the 'embedding' column using the pgvector type.
-- The vector_data column will be removed in a future migration after all data is migrated.

-- Migration strategy for existing data:
-- 1. New embeddings will be stored in the 'embedding' column
-- 2. Existing JSONB data in 'vector_data' should be migrated to 'embedding' column
-- 3. Update application code to use the 'embedding' column instead of 'vector_data'

-- Example of migrating existing data (run after updating application code):
-- UPDATE vectors SET embedding = vector_data::vector WHERE vector_data IS NOT NULL;

-- Update RLS policies to ensure service role can write vectors
-- (Service role needs to insert embeddings from AI models)
DROP POLICY IF EXISTS "Users can create their own vectors" ON vectors;
CREATE POLICY "Users can create their own vectors" ON vectors
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = vectors.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- Ensure service role can also update vectors (needed for embedding updates)
CREATE POLICY IF NOT EXISTS "Service role can update vectors" ON vectors
    FOR UPDATE USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 4: Create Vector Similarity Search Function
-- ============================================================================

-- Create a function to find similar vectors using cosine similarity
CREATE OR REPLACE FUNCTION match_vectors(
  query_embedding vector,
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10,
  idea_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  idea_id uuid,
  reference_type text,
  reference_id text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.idea_id,
    v.reference_type,
    v.reference_id,
    1 - (v.embedding <=> query_embedding) as similarity
  FROM vectors v
  WHERE
    v.embedding IS NOT NULL AND
    (idea_id_filter IS NULL OR v.idea_id = idea_id_filter) AND
    1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION match_vectors TO authenticated;
GRANT EXECUTE ON FUNCTION match_vectors TO service_role;

-- ============================================================================
-- PART 5: Database Service Updates Needed
-- ============================================================================

-- The DatabaseService class in src/lib/db.ts needs to be updated:
-- 1. Update Vector interface to include 'embedding' field
-- 2. Add methods for vector similarity search
-- 3. Update storeVector method to handle pgvector format
-- 4. Add searchVectors method for finding similar vectors

-- Example new methods to add:
-- - async searchSimilarVectors(ideaId: string, queryEmbedding: number[], limit?: number)
-- - async storeEmbedding(ideaId: string, referenceType: string, embedding: number[])
