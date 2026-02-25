-- Migration: Add composite index for idea_sessions(last_agent, updated_at DESC)
-- Description: Optimizes queries that filter by agent AND order by recency
-- Addresses: GitHub Issues #1189 and #1172 (Database schema quality)
-- Safety: Low risk - adding indexes doesn't modify data
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The idea_sessions table currently has:
--   - idx_idea_sessions_last_agent (last_agent)
--   - idx_idea_sessions_updated_at (updated_at)
--
-- However, queries that filter by last_agent AND order by updated_at DESC
-- cannot efficiently use either of these indexes alone.
--
-- Common query pattern this optimizes:
--   SELECT * FROM idea_sessions
--   WHERE last_agent = 'clarifier'
--   ORDER BY updated_at DESC;
--
-- This composite index allows the query planner to:
--   1. Filter efficiently on last_agent
--   2. Return results already ordered by updated_at

CREATE INDEX IF NOT EXISTS idx_idea_sessions_agent_updated
ON idea_sessions(last_agent, updated_at DESC);

-- ============================================================================
-- Performance Impact
-- ============================================================================
-- Before: Uses idx_idea_sessions_last_agent, then sorts by updated_at in memory
-- After: Uses composite index for both filtering AND ordering
-- Expected: 30-50% faster for agent-filtered recency queries
