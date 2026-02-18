-- Down Migration: Remove updated_at Column and Trigger from task_dependencies Table
-- Purpose: Rollback the updated_at column addition
-- Date: 2026-02-18
-- Issue: #1172 (consolidated), #839 (original)
-- Safety: Safe rollback, drops column and related objects
-- Author: database-architect specialist

-- ============================================================================
-- Remove trigger
-- ============================================================================

DROP TRIGGER IF EXISTS update_task_dependencies_updated_at ON task_dependencies;

-- ============================================================================
-- Remove index
-- ============================================================================

DROP INDEX IF EXISTS idx_task_dependencies_updated_at;

-- ============================================================================
-- Remove column
-- ============================================================================

ALTER TABLE task_dependencies DROP COLUMN IF EXISTS updated_at;

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes reverted:
-- 1. Dropped update_task_dependencies_updated_at trigger
-- 2. Dropped idx_task_dependencies_updated_at index
-- 3. Dropped updated_at column
--
-- The table returns to its original state with only created_at timestamp.
