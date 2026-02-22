-- Down Migration: Remove composite index for idea_sessions
-- Description: Rollback for 20260222_add_idea_sessions_agent_updated_index.sql
-- Safety: Low risk - only removes index, doesn't affect data

DROP INDEX IF EXISTS idx_idea_sessions_agent_updated;
