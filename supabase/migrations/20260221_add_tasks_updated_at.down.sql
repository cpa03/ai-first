-- Down Migration: Remove updated_at Column and Trigger from tasks Table
-- Purpose: Rollback migration 20260221_add_tasks_updated_at.sql
-- Date: 2026-02-21
-- Issue: #1189, #1172 (consolidated database architecture improvements)
-- Safety: Destructive - removes column and data, but column was just added
-- Author: database-architect specialist

-- ============================================================================
-- Remove trigger for automatic updated_at updates
-- ============================================================================

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- ============================================================================
-- Remove index for updated_at column
-- ============================================================================

-- Drop the index
DROP INDEX IF EXISTS idx_tasks_updated_at;

-- ============================================================================
-- Remove updated_at column from tasks
-- ============================================================================

-- Drop the column (this will also remove any data in the column)
ALTER TABLE tasks DROP COLUMN IF EXISTS updated_at;

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes made:
-- 1. Removed update_tasks_updated_at trigger from tasks table
-- 2. Removed idx_tasks_updated_at index
-- 3. Removed updated_at column from tasks table
--
-- This reverts the database to the state before the migration was applied.
