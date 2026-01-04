-- Schema extensions for Phase 1: Automatic Breakdown Engine
-- This script extends the existing schema to support task dependencies, timelines, and advanced breakdown features

-- Task Dependencies Table
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    predecessor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    successor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type TEXT DEFAULT 'finish_to_start' 
        CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(predecessor_task_id, successor_task_id)
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'delayed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Assignments Table
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'assignee' CHECK (role IN ('assignee', 'reviewer', 'contributor')),
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(task_id, user_id, role)
);

-- Time Tracking Table
CREATE TABLE IF NOT EXISTS time_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hours_logged DECIMAL(5,2) CHECK (hours_logged > 0),
    date_logged DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Comments Table
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breakdown Sessions Table
CREATE TABLE IF NOT EXISTS breakdown_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    ai_model_version TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    processing_time_ms INTEGER,
    status TEXT DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'decomposing', 'scheduling', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline Data Table
CREATE TABLE IF NOT EXISTS timelines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_weeks INTEGER NOT NULL,
    milestone_data JSONB,
    phase_data JSONB,
    critical_path JSONB,
    resource_allocation JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Assessment Table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    risk_factor TEXT NOT NULL,
    impact_level TEXT CHECK (impact_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    probability_level TEXT CHECK (probability_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    risk_score DECIMAL(3,2),
    mitigation_strategy TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'mitigated', 'accepted', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend existing tasks table with new columns
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(8,2) CHECK (actual_hours >= 0),
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS priority_score DECIMAL(5,2) DEFAULT 0 CHECK (priority_score >= 0),
ADD COLUMN IF NOT EXISTS complexity_score INTEGER DEFAULT 1 CHECK (complexity_score >= 1 AND complexity_score <= 10),
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS custom_fields JSONB,
ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id);

-- Extend existing deliverables table with new columns
ALTER TABLE deliverables 
ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id),
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS business_value DECIMAL(5,2) DEFAULT 0 CHECK (business_value >= 0),
ADD COLUMN IF NOT EXISTS risk_factors TEXT[],
ADD COLUMN IF NOT EXISTS acceptance_criteria JSONB,
ADD COLUMN IF NOT EXISTS deliverable_type TEXT DEFAULT 'feature' CHECK (deliverable_type IN ('feature', 'documentation', 'testing', 'deployment', 'research'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_dependencies_predecessor ON task_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_successor ON task_dependencies(successor_task_id);
CREATE INDEX IF NOT EXISTS idx_milestones_idea_id ON milestones(idea_id);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_id ON time_tracking(task_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_date ON time_tracking(date_logged);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_sessions_idea_id ON breakdown_sessions(idea_id);
CREATE INDEX IF NOT EXISTS idx_timelines_idea_id ON timelines(idea_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_idea_id ON risk_assessments(idea_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_task_id ON risk_assessments(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_end_date ON tasks(end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_milestone_id ON deliverables(milestone_id);

-- Add updated_at trigger for milestones
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_tracking_updated_at BEFORE UPDATE ON time_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breakdown_sessions_updated_at BEFORE UPDATE ON breakdown_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timelines_updated_at BEFORE UPDATE ON timelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for new tables
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakdown_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_dependencies
CREATE POLICY "Users can view task dependencies for their ideas" ON task_dependencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            JOIN deliverables d ON t.deliverable_id = d.id 
            JOIN ideas i ON d.idea_id = i.id 
            WHERE (t.id = predecessor_task_id OR t.id = successor_task_id) 
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create task dependencies for their ideas" ON task_dependencies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t 
            JOIN deliverables d ON t.deliverable_id = d.id 
            JOIN ideas i ON d.idea_id = i.id 
            WHERE (t.id = predecessor_task_id OR t.id = successor_task_id) 
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- RLS Policies for milestones
CREATE POLICY "Users can view milestones for their ideas" ON milestones
    FOR SELECT USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can create milestones for their ideas" ON milestones
    FOR INSERT WITH CHECK (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can update milestones for their ideas" ON milestones
    FOR UPDATE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- RLS Policies for task_assignments
CREATE POLICY "Users can view task assignments for their ideas" ON task_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            JOIN deliverables d ON t.deliverable_id = d.id 
            JOIN ideas i ON d.idea_id = i.id 
            WHERE t.id = task_assignments.task_id 
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- RLS Policies for time_tracking
CREATE POLICY "Users can view their own time tracking" ON time_tracking
    FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can create their own time tracking" ON time_tracking
    FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

-- RLS Policies for task_comments
CREATE POLICY "Users can view comments for their ideas" ON task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            JOIN deliverables d ON t.deliverable_id = d.id 
            JOIN ideas i ON d.idea_id = i.id 
            WHERE t.id = task_comments.task_id 
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create comments for their ideas" ON task_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t 
            JOIN deliverables d ON t.deliverable_id = d.id 
            JOIN ideas i ON d.idea_id = i.id 
            WHERE t.id = task_comments.task_id 
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- RLS Policies for breakdown_sessions
CREATE POLICY "Users can view breakdown sessions for their ideas" ON breakdown_sessions
    FOR SELECT USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can create breakdown sessions for their ideas" ON breakdown_sessions
    FOR INSERT WITH CHECK (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- RLS Policies for timelines
CREATE POLICY "Users can view timelines for their ideas" ON timelines
    FOR SELECT USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can create timelines for their ideas" ON timelines
    FOR INSERT WITH CHECK (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- RLS Policies for risk_assessments
CREATE POLICY "Users can view risk assessments for their ideas" ON risk_assessments
    FOR SELECT USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can create risk assessments for their ideas" ON risk_assessments
    FOR INSERT WITH CHECK (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR 
        auth.role() = 'service_role'
    );