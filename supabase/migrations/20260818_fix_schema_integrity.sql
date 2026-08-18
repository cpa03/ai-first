-- Migration: Fix Schema Integrity Issues
-- Description: Add missing RLS DELETE policies and updated_at triggers
-- Date: 2026-08-18
-- Related Issues: #779 (Database Schema Integrity)
-- Safety: All statements use IF NOT EXISTS / IF EXISTS for idempotency
-- Status: Fixes remaining gaps from schema consolidation

-- ============================================================================
-- PART 1: Add Missing RLS DELETE Policies
-- ============================================================================

-- Clarification Sessions: DELETE policy
-- Users can delete clarification sessions for their ideas
DROP POLICY IF EXISTS "Users can delete clarification sessions for their ideas" ON clarification_sessions;
CREATE POLICY "Users can delete clarification sessions for their ideas" ON clarification_sessions
    FOR DELETE USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid() AND deleted_at IS NULL)
        OR auth.role() = 'service_role'
    );

-- Clarification Sessions: UPDATE policy
-- Users can update clarification sessions for their ideas
DROP POLICY IF EXISTS "Users can update clarification sessions for their ideas" ON clarification_sessions;
CREATE POLICY "Users can update clarification sessions for their ideas" ON clarification_sessions
    FOR UPDATE USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid() AND deleted_at IS NULL)
        OR auth.role() = 'service_role'
    );

-- Clarification Answers: DELETE policy
-- Users can delete clarification answers for their sessions
DROP POLICY IF EXISTS "Users can delete clarification answers for their sessions" ON clarification_answers;
CREATE POLICY "Users can delete clarification answers for their sessions" ON clarification_answers
    FOR DELETE USING (
        session_id IN (
            SELECT cs.id FROM clarification_sessions cs
            JOIN ideas i ON cs.idea_id = i.id
            WHERE i.user_id = auth.uid() AND i.deleted_at IS NULL
        )
        OR auth.role() = 'service_role'
    );

-- Clarification Answers: UPDATE policy
-- Users can update clarification answers for their sessions
DROP POLICY IF EXISTS "Users can update clarification answers for their sessions" ON clarification_answers;
CREATE POLICY "Users can update clarification answers for their sessions" ON clarification_answers
    FOR UPDATE USING (
        session_id IN (
            SELECT cs.id FROM clarification_sessions cs
            JOIN ideas i ON cs.idea_id = i.id
            WHERE i.user_id = auth.uid() AND i.deleted_at IS NULL
        )
        OR auth.role() = 'service_role'
    );

-- ============================================================================
-- PART 2: Add Missing updated_at Triggers
-- ============================================================================

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Deliverables table: Add updated_at trigger
DROP TRIGGER IF EXISTS update_deliverables_updated_at ON deliverables;
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tasks table: Add updated_at trigger
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ideas table: Add updated_at trigger
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Idea Sessions table: Add updated_at trigger
DROP TRIGGER IF EXISTS update_idea_sessions_updated_at ON idea_sessions;
CREATE TRIGGER update_idea_sessions_updated_at BEFORE UPDATE ON idea_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Task Dependencies table: Add updated_at trigger
DROP TRIGGER IF EXISTS update_task_dependencies_updated_at ON task_dependencies;
CREATE TRIGGER update_task_dependencies_updated_at BEFORE UPDATE ON task_dependencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 3: Add Missing NOT NULL Constraints (where safe)
-- ============================================================================

-- Note: NOT NULL constraints on existing columns with data require careful handling.
-- We only add constraints where the column already has a DEFAULT and is non-nullable in practice.

-- deliverables.updated_at - already NOT NULL in base schema, no change needed
-- tasks.start_date/end_date - already DATE type per migration 001, no change needed

-- ============================================================================
-- PART 4: Verification Queries (for documentation)
-- ============================================================================

-- These queries can be used to verify the migration was applied correctly:
--
-- 1. Check RLS policies exist for clarification tables:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('clarification_sessions', 'clarification_answers')
-- ORDER BY tablename, cmd;
--
-- 2. Check updated_at triggers exist:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE 'update_%_updated_at'
-- ORDER BY event_object_table;
--
-- 3. Verify all tables have RLS enabled:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
