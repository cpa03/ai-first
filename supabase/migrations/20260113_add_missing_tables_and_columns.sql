-- Migration: Schema Synchronization - Add Missing Tables and Columns
-- Purpose: Align database schema with TypeScript types in src/types/database.ts
-- Safe: Non-destructive, adds new columns and tables only
-- Reversible: Down migration drops new columns and tables

-- =====================================================
-- PHASE 1: Add Missing Columns to Existing Tables
-- =====================================================

-- Add missing columns to deliverables table
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS milestone_id UUID;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS business_value NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS risk_factors TEXT[];
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS acceptance_criteria JSONB;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS deliverable_type TEXT
  CHECK (deliverable_type IN ('feature', 'documentation', 'testing', 'deployment', 'research'));

-- Add foreign key for milestone_id in deliverables (will be added after milestones table is created)
-- ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_milestone
--   FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

-- Add missing columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(10, 2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS complexity_score INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS risk_level TEXT
  CHECK (risk_level IN ('low', 'medium', 'high'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id UUID;

-- Add foreign key for milestone_id in tasks (will be added after milestones table is created)
-- ALTER TABLE tasks ADD CONSTRAINT fk_tasks_milestone
--   FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

-- =====================================================
-- PHASE 2: Create Missing Tables
-- =====================================================

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending'
      CHECK (status IN ('pending', 'completed', 'delayed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breakdown sessions table
CREATE TABLE IF NOT EXISTS breakdown_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    status TEXT DEFAULT 'analyzing'
      CHECK (status IN ('analyzing', 'decomposing', 'scheduling', 'completed', 'failed')),
    confidence_score NUMERIC(5, 2),
    ai_model_version TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timelines table
CREATE TABLE IF NOT EXISTS timelines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_weeks INTEGER NOT NULL,
    phase_data JSONB,
    milestone_data JSONB,
    resource_allocation JSONB,
    critical_path JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    predecessor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    successor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type TEXT NOT NULL
      CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate dependencies between same tasks
    UNIQUE (predecessor_task_id, successor_task_id)
);

-- Task assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'assignee'
      CHECK (role IN ('assignee', 'reviewer', 'contributor')),
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by TEXT,

    -- Prevent duplicate assignments for same task/user/role
    UNIQUE (task_id, user_id, role)
);

-- Time tracking table
CREATE TABLE IF NOT EXISTS time_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    date_logged TIMESTAMP WITH TIME ZONE NOT NULL,
    hours_logged NUMERIC(10, 2) NOT NULL CHECK (hours_logged > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    risk_factor TEXT NOT NULL,
    probability_level TEXT NOT NULL
      CHECK (probability_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    impact_level TEXT NOT NULL
      CHECK (impact_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    risk_score NUMERIC(5, 2),
    mitigation_strategy TEXT,
    status TEXT DEFAULT 'open'
      CHECK (status IN ('open', 'mitigated', 'accepted', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PHASE 3: Add Foreign Keys (Now that all tables exist)
-- =====================================================

-- Add milestone foreign key to deliverables
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS fk_deliverables_milestone;
ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_milestone
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

-- Add milestone foreign key to tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_tasks_milestone;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_milestone
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

-- =====================================================
-- PHASE 4: Add Performance Indexes
-- =====================================================

-- Milestone indexes
CREATE INDEX IF NOT EXISTS idx_milestones_idea_id ON milestones(idea_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_milestones_idea_status ON milestones(idea_id, status);

-- Breakdown sessions indexes
CREATE INDEX IF NOT EXISTS idx_breakdown_sessions_idea_id ON breakdown_sessions(idea_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_sessions_status ON breakdown_sessions(status);
CREATE INDEX IF NOT EXISTS idx_breakdown_sessions_idea_status ON breakdown_sessions(idea_id, status);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_timelines_idea_id ON timelines(idea_id);
CREATE INDEX IF NOT EXISTS idx_timelines_dates ON timelines(start_date, end_date);

-- Task dependencies indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_predecessor ON task_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_successor ON task_dependencies(successor_task_id);

-- Task assignments indexes
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_user ON task_assignments(task_id, user_id);

-- Time tracking indexes
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_id ON time_tracking(task_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id ON time_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_date_logged ON time_tracking(date_logged DESC);
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_date ON time_tracking(task_id, date_logged DESC);

-- Task comments indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_parent_id ON task_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

-- Risk assessments indexes
CREATE INDEX IF NOT EXISTS idx_risk_assessments_idea_id ON risk_assessments(idea_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_task_id ON risk_assessments(task_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_idea_task ON risk_assessments(idea_id, task_id);

-- =====================================================
-- PHASE 5: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakdown_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Milestone policies
CREATE POLICY "Users can view their own milestones" ON milestones
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = milestones.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own milestones" ON milestones
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = milestones.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own milestones" ON milestones
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = milestones.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own milestones" ON milestones
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = milestones.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- Breakdown sessions policies
CREATE POLICY "Users can view their own breakdown sessions" ON breakdown_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = breakdown_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own breakdown sessions" ON breakdown_sessions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = breakdown_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own breakdown sessions" ON breakdown_sessions
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = breakdown_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- Timeline policies
CREATE POLICY "Users can view their own timelines" ON timelines
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = timelines.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own timelines" ON timelines
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = timelines.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own timelines" ON timelines
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = timelines.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- Task dependencies policies
CREATE POLICY "Users can view task dependencies for their tasks" ON task_dependencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE (t.id = task_dependencies.predecessor_task_id OR t.id = task_dependencies.successor_task_id)
            AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create task dependencies for their tasks" ON task_dependencies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE (t.id = task_dependencies.predecessor_task_id OR t.id = task_dependencies.successor_task_id)
            AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete task dependencies for their tasks" ON task_dependencies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE (t.id = task_dependencies.predecessor_task_id OR t.id = task_dependencies.successor_task_id)
            AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

-- Task assignments policies
CREATE POLICY "Users can view task assignments for their tasks" ON task_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id AND i.user_id = auth.uid()
        )
        OR task_assignments.user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create task assignments for their tasks" ON task_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update task assignments for their tasks" ON task_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id AND i.user_id = auth.uid()
        )
        OR task_assignments.user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete task assignments for their tasks" ON task_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id AND i.user_id = auth.uid()
        )
        OR task_assignments.user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- Time tracking policies
CREATE POLICY "Users can view their own time tracking" ON time_tracking
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = time_tracking.task_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own time tracking" ON time_tracking
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own time tracking" ON time_tracking
    FOR UPDATE USING (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own time tracking" ON time_tracking
    FOR DELETE USING (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- Task comments policies
CREATE POLICY "Users can view comments for their tasks" ON task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_comments.task_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create comments for their tasks" ON task_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_comments.task_id AND i.user_id = auth.uid()
        )
        AND user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own comments" ON task_comments
    FOR UPDATE USING (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own comments" ON task_comments
    FOR DELETE USING (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- Risk assessments policies
CREATE POLICY "Users can view risk assessments for their ideas/tasks" ON risk_assessments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = risk_assessments.idea_id AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = risk_assessments.task_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create risk assessments for their ideas/tasks" ON risk_assessments
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = risk_assessments.idea_id AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = risk_assessments.task_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update risk assessments for their ideas/tasks" ON risk_assessments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = risk_assessments.idea_id AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = risk_assessments.task_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete risk assessments for their ideas/tasks" ON risk_assessments
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = risk_assessments.idea_id AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = risk_assessments.task_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );
