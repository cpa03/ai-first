-- Down Migration
-- Description: Rollback deliverables composite index optimization
-- Safe to run: Index removal is non-blocking and doesn't affect data

DROP INDEX IF EXISTS idx_deliverables_idea_deleted_priority;
DROP INDEX IF EXISTS idx_deliverables_idea_milestone_priority;
