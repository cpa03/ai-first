-- Down Migration: Remove ideas pagination composite index
-- Description: Rollback migration 20260222_add_ideas_pagination_composite_index
-- Safety: Safe to run - only removes an index, doesn't affect data

-- Drop the composite index added by the up migration
DROP INDEX IF EXISTS idx_ideas_user_deleted_created;
