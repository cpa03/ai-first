-- Migration: Add missing foreign key indexes for task_assignments
-- Date: 2026-02-20
-- Issue: #1189, #1172 - Database schema quality improvements
-- Description: Add missing index on assigned_by column in task_assignments table
--              to improve query performance for "who assigned this task" lookups

-- Add index on assigned_by for efficient filtering by who assigned tasks
-- This improves queries like "show all tasks assigned by user X"
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by ON task_assignments(assigned_by);

-- Add composite index for common query pattern: tasks assigned to a user by a specific assigner
-- Useful for admin views and reporting
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_assigned_by ON task_assignments(user_id, assigned_by);
