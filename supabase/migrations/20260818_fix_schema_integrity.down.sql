-- Migration: Revert Fix Schema Integrity Issues
-- Description: Remove RLS DELETE policies and updated_at triggers added in forward migration
-- Date: 2026-08-18
-- Related Issues: #779 (Database Schema Integrity)

-- ============================================================================
-- PART 1: Remove RLS DELETE Policies
-- ============================================================================

-- Clarification Sessions: Remove DELETE and UPDATE policies
DROP POLICY IF EXISTS "Users can delete clarification sessions for their ideas" ON clarification_sessions;
DROP POLICY IF EXISTS "Users can update clarification sessions for their ideas" ON clarification_sessions;

-- Clarification Answers: Remove DELETE and UPDATE policies
DROP POLICY IF EXISTS "Users can delete clarification answers for their sessions" ON clarification_answers;
DROP POLICY IF EXISTS "Users can update clarification answers for their sessions" ON clarification_answers;

-- ============================================================================
-- PART 2: Remove updated_at Triggers
-- ============================================================================

-- Remove triggers added in forward migration
DROP TRIGGER IF EXISTS update_deliverables_updated_at ON deliverables;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
DROP TRIGGER IF EXISTS update_idea_sessions_updated_at ON idea_sessions;
DROP TRIGGER IF EXISTS update_task_dependencies_updated_at ON task_dependencies;

-- Note: We do NOT drop the update_updated_at_column function as it may be used by other triggers
