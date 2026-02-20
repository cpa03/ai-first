-- Down Migration: Remove task_assignments indexes
-- Date: 2026-02-20
-- Description: Rollback the added indexes on task_assignments table

-- Drop the assigned_by index
DROP INDEX IF EXISTS idx_task_assignments_assigned_by;

-- Drop the composite user_id + assigned_by index
DROP INDEX IF EXISTS idx_task_assignments_user_assigned_by;
