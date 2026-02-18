-- Rollback Migration: Vector Index Maintenance Utilities
-- Description: Remove utility functions for pgvector index maintenance
-- Version: 20260218
-- Date: 2026-02-18
-- Issue: #1172

-- Drop functions in reverse order of creation
DROP FUNCTION IF EXISTS check_vector_index_health();
DROP FUNCTION IF EXISTS rebuild_vector_indexes();
DROP FUNCTION IF EXISTS get_vector_index_stats();
