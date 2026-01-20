-- Down Migration: Remove Clarification Tables and Performance Indexes
-- Reverses 20260120_add_clarification_tables_and_indexes.sql

-- =====================================================
-- PHASE 1: Drop Triggers
-- =====================================================

DROP TRIGGER IF EXISTS update_clarification_sessions_updated_at
    ON clarification_sessions;

DROP TRIGGER IF EXISTS update_clarification_answers_updated_at
    ON clarification_answers;

-- =====================================================
-- PHASE 2: Drop RLS Policies
-- =====================================================

-- Drop clarification_sessions policies
DROP POLICY IF EXISTS "Users can view clarification sessions for their ideas"
    ON clarification_sessions;

DROP POLICY IF EXISTS "Users can create clarification sessions for their ideas"
    ON clarification_sessions;

DROP POLICY IF EXISTS "Users can update their clarification sessions"
    ON clarification_sessions;

-- Drop clarification_answers policies
DROP POLICY IF EXISTS "Users can view clarification answers for their sessions"
    ON clarification_answers;

DROP POLICY IF EXISTS "Users can create clarification answers for their sessions"
    ON clarification_answers;

DROP POLICY IF EXISTS "Users can update their clarification answers"
    ON clarification_answers;

-- =====================================================
-- PHASE 3: Disable RLS
-- =====================================================

ALTER TABLE clarification_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_answers DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 4: Drop Indexes for Clarification Tables
-- =====================================================

DROP INDEX IF EXISTS idx_clarification_sessions_idea_status;
DROP INDEX IF EXISTS idx_clarification_answers_session;

-- =====================================================
-- PHASE 5: Drop Clarification Tables
-- =====================================================

DROP TABLE IF EXISTS clarification_answers CASCADE;
DROP TABLE IF EXISTS clarification_sessions CASCADE;

-- =====================================================
-- PHASE 6: Drop Performance Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_ideas_user_deleted_status;
DROP INDEX IF EXISTS idx_deliverables_idea_deleted;
DROP INDEX IF EXISTS idx_tasks_deliverable_deleted;
DROP INDEX IF EXISTS idx_tasks_start_end_dates;
DROP INDEX IF EXISTS idx_tasks_status_completion;
