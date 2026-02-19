-- Migration: Add updated_at Column and Trigger to task_assignments Table
-- Purpose: Add automatic timestamp tracking for task_assignments modifications
-- Date: 2026-02-19
-- Issue: #1172 (consolidated database architecture improvements)
-- Safety: Non-destructive, adds new column with default and trigger
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The task_assignments table currently only has an assigned_at column but no
-- updated_at column. For consistency with all other tables in the schema
-- (ideas, deliverables, tasks, milestones, task_comments, time_tracking,
-- breakdown_sessions, timelines, risk_assessments, clarification_sessions,
-- clarification_answers, task_dependencies, idea_sessions), this migration
-- adds an updated_at column with automatic trigger-based updates.
--
-- This ensures:
-- 1. Consistent audit trail across all tables
-- 2. Ability to track when assignments are modified
-- 3. Data synchronization and debugging capabilities

-- ============================================================================
-- Add updated_at column to task_assignments
-- ============================================================================

-- Add the updated_at column with default value matching assigned_at initially
ALTER TABLE task_assignments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at match assigned_at
-- This ensures consistency for existing data
UPDATE task_assignments
SET updated_at = assigned_at
WHERE updated_at IS NULL;

-- Add NOT NULL constraint after populating existing rows
ALTER TABLE task_assignments
ALTER COLUMN updated_at SET NOT NULL;

-- ============================================================================
-- Add index for updated_at column
-- ============================================================================

-- Create index for efficient queries by update time
CREATE INDEX IF NOT EXISTS idx_task_assignments_updated_at
ON task_assignments(updated_at DESC);

-- ============================================================================
-- Add trigger for automatic updated_at updates
-- ============================================================================

-- Create trigger to automatically update updated_at on row modification
-- Uses the existing update_updated_at_column() function defined in schema.sql
CREATE TRIGGER update_task_assignments_updated_at
BEFORE UPDATE ON task_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes made:
-- 1. Added updated_at column to task_assignments table
-- 2. Populated existing rows with updated_at = assigned_at
-- 3. Added NOT NULL constraint
-- 4. Created index for efficient queries
-- 5. Created trigger for automatic updates
--
-- This ensures consistency with all other tables in the database schema
-- and provides proper audit trail for assignment modifications.
