-- Down Migration: Remove updated_at Column and Trigger from task_assignments Table
-- Purpose: Rollback migration 20260219_add_task_assignments_updated_at
-- Date: 2026-02-19
-- Safety: Destructive - removes column and data

-- Drop trigger first
DROP TRIGGER IF EXISTS update_task_assignments_updated_at ON task_assignments;

-- Drop index
DROP INDEX IF EXISTS idx_task_assignments_updated_at;

-- Drop column
ALTER TABLE task_assignments DROP COLUMN IF EXISTS updated_at;
