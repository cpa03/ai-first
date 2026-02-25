-- Down Migration: Remove updated_at Trigger from idea_sessions Table
-- Purpose: Rollback the automatic timestamp trigger for idea_sessions
-- Date: 2026-02-19
-- Issue: #1172
-- Safety: Safe rollback, removes trigger only
-- Author: database-architect specialist

-- ============================================================================
-- Remove trigger
-- ============================================================================

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_idea_sessions_updated_at ON idea_sessions;

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes made:
-- 1. Removed update_idea_sessions_updated_at trigger from idea_sessions table
--
-- This reverts the schema to its previous state.
