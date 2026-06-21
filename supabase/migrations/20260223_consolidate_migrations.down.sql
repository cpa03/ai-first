-- Down Migration: Revert Additional Indexes from 20260223
-- Description: Drop indexes created in migration 20260223_consolidate_migrations
-- Related Issue: #1816

DROP INDEX IF EXISTS idx_ideas_user_created;
DROP INDEX IF EXISTS idx_tasks_deliverable_status;
DROP INDEX IF EXISTS idx_deliverables_idea_priority;
DROP INDEX IF EXISTS idx_agent_logs_agent_timestamp;
