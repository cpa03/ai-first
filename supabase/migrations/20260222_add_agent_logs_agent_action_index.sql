-- Migration: Add composite index for agent_logs(agent, action, timestamp)
-- Description: Optimizes queries that filter by both agent AND action simultaneously
-- Addresses: GitHub Issues #1189 and #1172 (Database schema quality)
-- Safety: Low risk - adding indexes doesn't modify data
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The agent_logs table currently has:
--   - idx_agent_logs_agent_timestamp (agent, timestamp DESC)
--   - idx_agent_logs_action_timestamp (action, timestamp DESC)
--
-- However, queries that filter by BOTH agent AND action together cannot
-- efficiently use either of these indexes alone.
--
-- Common query pattern this optimizes:
--   SELECT * FROM agent_logs 
--   WHERE agent = 'clarifier' AND action = 'process_idea' 
--   ORDER BY timestamp DESC;
--
-- This composite index allows the query planner to:
--   1. Filter efficiently on agent
--   2. Further filter on action within that agent
--   3. Return results already ordered by timestamp

CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_action_timestamp 
ON agent_logs(agent, action, timestamp DESC);

-- ============================================================================
-- Performance Impact
-- ============================================================================
-- Before: Uses idx_agent_logs_agent_timestamp, then filters action in memory
-- After: Uses composite index for all three conditions in one pass
-- Expected: 30-50% faster for agent+action filtered queries
