-- Up Migration
-- Description: Add index on agent_logs.action column for improved query performance
-- Issue: #1189, #1172 - Database schema quality improvements
-- Purpose: Optimize queries that filter agent logs by action type

-- Add index on action column for filtering by action type
-- This enables efficient queries like: "find all 'create' actions"
CREATE INDEX IF NOT EXISTS idx_agent_logs_action ON agent_logs(action);

-- Add composite index for common query pattern: filter by action + timestamp
-- Useful for queries like: "find all 'error' actions in the last hour"
CREATE INDEX IF NOT EXISTS idx_agent_logs_action_timestamp ON agent_logs(action, timestamp DESC);
