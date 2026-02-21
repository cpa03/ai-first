-- Migration: Add updated_at Column and Trigger to tasks Table
-- Purpose: Add automatic timestamp tracking for task modifications
-- Date: 2026-02-21
-- Issue: #1189, #1172 (consolidated database architecture improvements)
-- Safety: Non-destructive, adds new column with default and trigger
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The tasks table currently only has a created_at column but no updated_at
-- column. For consistency with all other tables in the schema (ideas,
-- deliverables, milestones, task_comments, time_tracking, breakdown_sessions,
-- timelines, risk_assessments, clarification_sessions, clarification_answers,
-- task_dependencies, idea_sessions, task_assignments), this migration adds
-- an updated_at column with automatic trigger-based updates.
--
-- This ensures:
-- 1. Consistent audit trail across all tables
-- 2. Ability to track when tasks are modified
-- 3. Data synchronization and debugging capabilities
-- 4. Proper tracking of task status changes, assignment changes, etc.

-- ============================================================================
-- Add updated_at column to tasks
-- ============================================================================

-- Add the updated_at column with default value
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at match created_at initially
-- This ensures consistency for existing data
UPDATE tasks
SET updated_at = created_at
WHERE updated_at IS NULL;

-- ============================================================================
-- Add index for updated_at column
-- ============================================================================

-- Create index for efficient queries by update time
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at
ON tasks(updated_at DESC);

-- ============================================================================
-- Add trigger for automatic updated_at updates
-- ============================================================================

-- Create trigger to automatically update updated_at on row modification
-- Uses the existing update_updated_at_column() function defined in schema.sql
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes made:
-- 1. Added updated_at column to tasks table
-- 2. Populated existing rows with updated_at = created_at
-- 3. Created index for efficient queries by update time
-- 4. Created trigger for automatic updates
--
-- This ensures consistency with all other tables in the database schema
-- and provides proper audit trail for task modifications.
