-- Migration: Add Clarification Tables and Performance Indexes
-- Purpose: Add missing clarification_sessions/answers tables and optimize analytics queries
-- Safe: Non-destructive, adds new tables and indexes only
-- Reversible: Down migration drops tables and indexes

-- =====================================================
-- PHASE 1: Add Missing Tables
-- =====================================================

-- Clarification Sessions table
CREATE TABLE IF NOT EXISTS clarification_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clarification Answers table
CREATE TABLE IF NOT EXISTS clarification_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES clarification_sessions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PHASE 2: Add Indexes for Analytics Query Performance
-- =====================================================

-- Composite index for analytics: user_id + deleted_at + status
-- Optimizes getUserIdeas queries with status filtering
CREATE INDEX IF NOT EXISTS idx_ideas_user_deleted_status
    ON ideas(user_id, deleted_at, status);

-- Composite index for deliverables analytics: idea_id + deleted_at
-- Optimizes batch queries on deliverables for specific ideas
CREATE INDEX IF NOT EXISTS idx_deliverables_idea_deleted
    ON deliverables(idea_id, deleted_at);

-- Composite index for tasks analytics: deliverable_id + deleted_at
-- Optimizes batch queries on tasks for specific deliverables
CREATE INDEX IF NOT EXISTS idx_tasks_deliverable_deleted
    ON tasks(deliverable_id, deleted_at);

-- Index for tasks start_date + end_date combined queries
-- Optimizes timeline-based queries
CREATE INDEX IF NOT EXISTS idx_tasks_start_end_dates
    ON tasks(start_date, end_date) WHERE deleted_at IS NULL;

-- Index for tasks status + completion_percentage
-- Optimizes progress tracking queries
CREATE INDEX IF NOT EXISTS idx_tasks_status_completion
    ON tasks(status, completion_percentage) WHERE deleted_at IS NULL;

-- =====================================================
-- PHASE 3: Enable Row Level Security
-- =====================================================

ALTER TABLE clarification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clarification_sessions
CREATE POLICY "Users can view clarification sessions for their ideas" ON clarification_sessions
    FOR SELECT USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid() AND deleted_at IS NULL)
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create clarification sessions for their ideas" ON clarification_sessions
    FOR INSERT WITH CHECK (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their clarification sessions" ON clarification_sessions
    FOR UPDATE USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- RLS Policies for clarification_answers
CREATE POLICY "Users can view clarification answers for their sessions" ON clarification_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clarification_sessions cs
            JOIN ideas i ON cs.idea_id = i.id
            WHERE cs.id = clarification_answers.session_id
            AND i.user_id = auth.uid()
            AND i.deleted_at IS NULL
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create clarification answers for their sessions" ON clarification_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clarification_sessions cs
            JOIN ideas i ON cs.idea_id = i.id
            WHERE cs.id = clarification_answers.session_id
            AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their clarification answers" ON clarification_answers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clarification_sessions cs
            JOIN ideas i ON cs.idea_id = i.id
            WHERE cs.id = clarification_answers.session_id
            AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

-- =====================================================
-- PHASE 4: Add Triggers
-- =====================================================

-- Trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to clarification_sessions
CREATE TRIGGER update_clarification_sessions_updated_at
    BEFORE UPDATE ON clarification_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to clarification_answers
CREATE TRIGGER update_clarification_answers_updated_at
    BEFORE UPDATE ON clarification_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 5: Add Indexes for Clarification Tables
-- =====================================================

-- Index for clarification_sessions: idea_id + status
CREATE INDEX IF NOT EXISTS idx_clarification_sessions_idea_status
    ON clarification_sessions(idea_id, status);

-- Index for clarification_answers: session_id
CREATE INDEX IF NOT EXISTS idx_clarification_answers_session
    ON clarification_answers(session_id);
