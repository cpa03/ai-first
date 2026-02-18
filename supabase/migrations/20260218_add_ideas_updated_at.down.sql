-- Down Migration: Remove updated_at column from ideas table
-- Purpose: Rollback migration 20260218_add_ideas_updated_at
-- Date: 2026-02-18

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;

-- Drop the index
DROP INDEX IF EXISTS idx_ideas_updated_at;

-- Remove the column
ALTER TABLE ideas DROP COLUMN IF EXISTS updated_at;
