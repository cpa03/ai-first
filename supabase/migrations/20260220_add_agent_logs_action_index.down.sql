-- Down Migration
-- Description: Remove agent_logs action column indexes
-- Issue: #1189, #1172 - Database schema quality improvements

-- Drop composite index
DROP INDEX IF EXISTS idx_agent_logs_action_timestamp;

-- Drop action column index
DROP INDEX IF EXISTS idx_agent_logs_action;
