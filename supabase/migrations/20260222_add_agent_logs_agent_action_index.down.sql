-- Down Migration: Remove composite index for agent_logs(agent, action, timestamp)
-- Description: Rollback migration 20260222_add_agent_logs_agent_action_index.sql
-- Safety: Low risk - only removes an index, doesn't modify data
-- Author: database-architect specialist

-- Drop the composite index
DROP INDEX IF EXISTS idx_agent_logs_agent_action_timestamp;

