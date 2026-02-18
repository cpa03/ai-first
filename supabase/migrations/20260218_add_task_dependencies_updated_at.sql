-- Migration: Add updated_at Column and Trigger to task_dependencies Table
-- Purpose: Add automatic timestamp tracking for task_dependencies modifications
-- Date: 2026-02-18
-- Issue: #1172 (consolidated), #839 (original)
-- Safety: Non-destructive, adds new column with default and trigger
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The task_dependencies table currently only has a created_at column.
-- For consistency with other tables and proper audit trail, this migration
-- adds an updated_at column with automatic trigger-based updates.
--
-- This aligns with the pattern used across all other tables in the schema:
-- ideas, deliverables, tasks, milestones, task_comments, time_tracking,
-- breakdown_sessions, timelines, risk_assessments, clarification_sessions,
-- and clarification_answers all have updated_at columns with triggers.

-- ============================================================================
-- Add updated_at column to task_dependencies
-- ============================================================================

-- Add the updated_at column with default value matching created_at initially
ALTER TABLE task_dependencies
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at match created_at
-- This ensures consistency for existing data
UPDATE task_dependencies
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Add NOT NULL constraint after populating existing rows
ALTER TABLE task_dependencies
ALTER COLUMN updated_at SET NOT NULL;

-- ============================================================================
-- Add index for updated_at column
-- ============================================================================

-- Create index for efficient queries by update time
CREATE INDEX IF NOT EXISTS idx_task_dependencies_updated_at
ON task_dependencies(updated_at DESC);

-- ============================================================================
-- Add trigger for automatic updated_at updates
-- ============================================================================

-- Create trigger to automatically update updated_at on row modification
-- Uses the existing update_updated_at_column() function defined in schema.sql
CREATE TRIGGER update_task_dependencies_updated_at
BEFORE UPDATE ON task_dependencies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes made:
-- 1. Added updated_at column to task_dependencies table
-- 2. Populated existing rows with updated_at = created_at
-- 3. Added NOT NULL constraint
-- 4. Created index for efficient queries
-- 5. Created trigger for automatic updates
--
-- This ensures consistency with all other tables in the database schema.
