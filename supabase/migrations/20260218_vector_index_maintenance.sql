-- Migration: Vector Index Maintenance Utilities
-- Description: Add utility functions for pgvector index maintenance and monitoring
-- Version: 20260218
-- Date: 2026-02-18
-- Issue: #1172 - Vector Search: Missing vector index maintenance strategy
-- Author: Database Architect

-- ============================================================================
-- PART 1: Vector Index Statistics Function
-- ============================================================================

-- Create a function to get vector index statistics
-- This helps monitor when indexes need maintenance
CREATE OR REPLACE FUNCTION get_vector_index_stats()
RETURNS TABLE (
    index_name text,
    table_name text,
    index_size text,
    index_type text,
    lists_count integer,
    estimated_rows bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.relname::text AS index_name,
        t.relname::text AS table_name,
        pg_size_pretty(pg_relation_size(i.oid))::text AS index_size,
        am.amname::text AS index_type,
        CASE 
            WHEN am.amname = 'ivfflat' THEN 
                (regexp_match(pg_get_indexdef(i.oid), 'lists = (\d+)'))[1]::integer
            ELSE NULL
        END AS lists_count,
        c.reltuples::bigint AS estimated_rows
    FROM pg_index ix
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_am am ON am.oid = i.relam
    JOIN pg_class c ON c.oid = ix.indrelid
    WHERE am.amname = 'ivfflat'
    AND t.relname = 'vectors';
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_vector_index_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_vector_index_stats TO service_role;

-- ============================================================================
-- PART 2: Vector Index Rebuild Function
-- ============================================================================

-- Create a function to rebuild vector indexes
-- Call this when index performance degrades due to data growth
-- Recommended: Rebuild when row count exceeds lists * 1000
CREATE OR REPLACE FUNCTION rebuild_vector_indexes()
RETURNS TABLE (
    index_name text,
    status text,
    message text
)
LANGUAGE plpgsql
AS $$
DECLARE
    idx_record RECORD;
    rows_in_table bigint;
    recommended_lists integer;
BEGIN
    -- Get current row count
    SELECT COUNT(*) INTO rows_in_table FROM vectors WHERE embedding IS NOT NULL;
    
    -- For each ivfflat index, rebuild with optimal lists parameter
    FOR idx_record IN
        SELECT 
            i.relname AS index_name,
            i.oid AS index_oid,
            ix.indrelid AS table_oid,
            (regexp_match(pg_get_indexdef(i.oid), 'lists = (\d+)'))[1]::integer AS current_lists
        FROM pg_index ix
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_am am ON am.oid = i.relam
        WHERE am.amname = 'ivfflat'
        AND i.relname LIKE 'idx_vectors_embedding%'
    LOOP
        -- Calculate optimal lists: sqrt(rows) is a good starting point
        -- Minimum 100 for small tables, maximum 1000 for very large tables
        recommended_lists := GREATEST(100, LEAST(1000, FLOOR(SQRT(rows_in_table))::integer));
        
        -- Only rebuild if current lists is significantly different
        IF idx_record.current_lists IS NULL OR 
           ABS(idx_record.current_lists - recommended_lists) > 50 THEN
            
            -- Reindex with new lists parameter
            EXECUTE format('DROP INDEX IF EXISTS %I', idx_record.index_name);
            
            -- Recreate based on index name pattern
            IF idx_record.index_name LIKE '%cosine%' THEN
                EXECUTE format('
                    CREATE INDEX %I ON vectors 
                    USING ivfflat (embedding vector_cosine_ops) 
                    WITH (lists = %s)',
                    idx_record.index_name, recommended_lists
                );
            ELSIF idx_record.index_name LIKE '%l2%' THEN
                EXECUTE format('
                    CREATE INDEX %I ON vectors 
                    USING ivfflat (embedding vector_l2_ops) 
                    WITH (lists = %s)',
                    idx_record.index_name, recommended_lists
                );
            END IF;
            
            index_name := idx_record.index_name;
            status := 'rebuild';
            message := format('Rebuilt with lists=%s (was %s, rows=%s)', 
                             recommended_lists, 
                             COALESCE(idx_record.current_lists::text, 'NULL'),
                             rows_in_table);
            RETURN NEXT;
        ELSE
            index_name := idx_record.index_name;
            status := 'skipped';
            message := format('Lists parameter optimal (%s), no rebuild needed', idx_record.current_lists);
            RETURN NEXT;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$;

-- Grant execute permission to service role only (admin operation)
GRANT EXECUTE ON FUNCTION rebuild_vector_indexes TO service_role;

-- ============================================================================
-- PART 3: Vector Index Health Check Function
-- ============================================================================

-- Create a function to check if index maintenance is needed
-- Returns recommendations for when to rebuild
CREATE OR REPLACE FUNCTION check_vector_index_health()
RETURNS TABLE (
    metric text,
    current_value text,
    threshold text,
    recommendation text
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows bigint;
    v_lists integer;
    v_index_size bigint;
BEGIN
    -- Get current statistics
    SELECT COUNT(*) INTO v_rows FROM vectors WHERE embedding IS NOT NULL;
    
    SELECT (regexp_match(
        pg_get_indexdef((SELECT oid FROM pg_class WHERE relname = 'idx_vectors_embedding_cosine')),
        'lists = (\d+)'
    ))[1]::integer INTO v_lists;
    
    SELECT pg_relation_size('idx_vectors_embedding_cosine') INTO v_index_size;
    
    -- Check 1: Lists to rows ratio
    metric := 'lists_to_rows_ratio';
    current_value := format('%s lists for %s rows', v_lists, v_rows);
    threshold := format('Optimal: sqrt(%s) = %s lists', v_rows, FLOOR(SQRT(v_rows)));
    
    IF v_rows > 0 AND (v_rows::float / NULLIF(v_lists, 0)) > 2000 THEN
        recommendation := 'REBUILD: Row-to-lists ratio too high. Consider rebuilding index.';
    ELSIF v_rows > 0 AND (v_rows::float / NULLIF(v_lists, 0)) < 500 THEN
        recommendation := 'REBUILD: Row-to-lists ratio too low. Consider rebuilding index.';
    ELSE
        recommendation := 'OK: Index configuration is optimal.';
    END IF;
    RETURN NEXT;
    
    -- Check 2: Index size
    metric := 'index_size';
    current_value := pg_size_pretty(v_index_size);
    threshold := 'N/A';
    
    IF v_index_size > 1073741824 THEN -- 1GB
        recommendation := 'LARGE: Index is over 1GB. Monitor performance.';
    ELSE
        recommendation := 'OK: Index size is reasonable.';
    END IF;
    RETURN NEXT;
    
    -- Check 3: Data freshness
    metric := 'embedding_coverage';
    current_value := format('%s / %s vectors have embeddings', 
        (SELECT COUNT(*) FROM vectors WHERE embedding IS NOT NULL),
        (SELECT COUNT(*) FROM vectors));
    threshold := '100% coverage ideal';
    
    IF (SELECT COUNT(*) FROM vectors WHERE embedding IS NULL) > 0 THEN
        recommendation := 'INCOMPLETE: Some vectors missing embeddings.';
    ELSE
        recommendation := 'OK: All vectors have embeddings.';
    END IF;
    RETURN NEXT;
    
    RETURN;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION check_vector_index_health TO authenticated;
GRANT EXECUTE ON FUNCTION check_vector_index_health TO service_role;

-- ============================================================================
-- PART 4: Maintenance Notes
-- ============================================================================

-- WHEN TO RUN MAINTENANCE:
-- 
-- 1. After bulk data imports:
--    SELECT * FROM rebuild_vector_indexes();
--
-- 2. Periodically (monthly/quarterly) check health:
--    SELECT * FROM check_vector_index_health();
--
-- 3. Monitor index statistics:
--    SELECT * FROM get_vector_index_stats();
--
-- 4. Best practices for IVFFlat indexes:
--    - Optimal lists parameter ≈ sqrt(row_count)
--    - Rebuild when data grows 2x since last rebuild
--    - Consider HNSW indexes for larger datasets (>1M vectors)
--
-- PERFORMANCE TIPS:
-- - For < 100K vectors: lists = 100-300
-- - For 100K-1M vectors: lists = 300-1000
-- - For > 1M vectors: consider HNSW or increase lists to 1000+
