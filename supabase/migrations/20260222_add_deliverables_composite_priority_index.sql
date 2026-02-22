-- Up Migration
-- Description: Add composite index for deliverables query optimization
-- Addresses GitHub Issues #1189 and #1172 (Database schema quality)
-- 
-- Performance Enhancement:
-- This composite index optimizes the common query pattern in getIdeaDeliverablesWithTasks:
-- SELECT * FROM deliverables WHERE idea_id = ? AND deleted_at IS NULL ORDER BY priority DESC
--
-- Before: Uses idx_deliverables_idea_priority (filters idea_id, sorts priority) but still
--         scans all records including deleted ones, then filters in memory
-- After:  Uses this composite index to filter both idea_id AND deleted_at, then orders
--         by priority without additional sorting
--
-- Estimated improvement: 30-50% faster for deliverables list queries on large datasets

-- Composite index for: idea_id + deleted_at (filter) + priority DESC (sort)
-- This covers the query pattern: "get all non-deleted deliverables for an idea ordered by priority"
CREATE INDEX IF NOT EXISTS idx_deliverables_idea_deleted_priority 
    ON deliverables(idea_id, deleted_at, priority DESC);

-- Additional composite index for deliverables with milestone filtering
-- Common pattern: "get deliverables for idea with specific milestone, ordered by priority"
CREATE INDEX IF NOT EXISTS idx_deliverables_idea_milestone_priority
    ON deliverables(idea_id, milestone_id, priority DESC) 
    WHERE deleted_at IS NULL;
