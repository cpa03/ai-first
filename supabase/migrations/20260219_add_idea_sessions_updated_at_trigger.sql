-- Migration: Add updated_at Trigger to idea_sessions Table
-- Purpose: Add automatic timestamp tracking for idea_sessions modifications
-- Date: 2026-02-19
-- Issue: #1172 (consolidated database architecture issues)
-- Safety: Non-destructive, only adds trigger
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The idea_sessions table has an updated_at column with an index, but it is
-- missing the automatic trigger that updates this column on row modification.
--
-- This is inconsistent with all other tables that have updated_at columns:
-- ideas, deliverables, tasks, milestones, task_dependencies, task_comments,
-- time_tracking, breakdown_sessions, timelines, risk_assessments,
-- clarification_sessions, and clarification_answers.
--
-- This migration adds the missing trigger to ensure consistency.

-- ============================================================================
-- Add trigger for automatic updated_at updates
-- ============================================================================

-- Create trigger to automatically update updated_at on row modification
-- Uses the existing update_updated_at_column() function defined in schema.sql
CREATE TRIGGER update_idea_sessions_updated_at
BEFORE UPDATE ON idea_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes made:
-- 1. Added update_idea_sessions_updated_at trigger to idea_sessions table
--
-- This ensures consistency with all other tables in the database schema
-- that have updated_at columns with automatic triggers.
