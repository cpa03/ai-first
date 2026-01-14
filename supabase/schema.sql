-- Supabase schema for IdeaFlow project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (using Supabase Auth)
-- Note: Supabase Auth provides the users table automatically

-- Ideas table
CREATE TABLE ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'clarified', 'breakdown', 'completed'))
);

-- Idea sessions table
CREATE TABLE idea_sessions (
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    state JSONB,
    last_agent TEXT,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (idea_id)
);

-- Deliverables table
CREATE TABLE deliverables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    estimate_hours INTEGER DEFAULT 0,
    milestone_id UUID,
    completion_percentage INTEGER DEFAULT 0,
    business_value NUMERIC(10, 2) DEFAULT 0,
    risk_factors TEXT[],
    acceptance_criteria JSONB,
    deliverable_type TEXT DEFAULT 'feature'
      CHECK (deliverable_type IN ('feature', 'documentation', 'testing', 'deployment', 'research')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    estimate INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    actual_hours NUMERIC(10, 2),
    completion_percentage INTEGER DEFAULT 0,
    priority_score INTEGER DEFAULT 0,
    complexity_score INTEGER DEFAULT 0,
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    tags TEXT[],
    custom_fields JSONB,
    milestone_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vectors table (for embedding vectors/references)
CREATE TABLE vectors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    vector_data JSONB,
    reference_type TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent logs table
CREATE TABLE agent_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
CREATE TABLE milestones (
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
CREATE TABLE breakdown_sessions (
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
CREATE TABLE timelines (
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
CREATE TABLE task_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    predecessor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    successor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type TEXT NOT NULL
      CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (predecessor_task_id, successor_task_id)
);

-- Task assignments table
CREATE TABLE task_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'assignee'
      CHECK (role IN ('assignee', 'reviewer', 'contributor')),
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by TEXT,
    UNIQUE (task_id, user_id, role)
);

-- Time tracking table
CREATE TABLE time_tracking (
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
CREATE TABLE task_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk assessments table
CREATE TABLE risk_assessments (
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

-- Enable Row Level Security (RLS)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakdown_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can create their own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can delete their own ideas" ON ideas
    FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Idea sessions policies
CREATE POLICY "Users can view their own idea sessions" ON idea_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own idea sessions" ON idea_sessions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own idea sessions" ON idea_sessions
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own idea sessions" ON idea_sessions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_sessions.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- Deliverables policies
CREATE POLICY "Users can view their own deliverables" ON deliverables
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = deliverables.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own deliverables" ON deliverables
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = deliverables.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own deliverables" ON deliverables
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = deliverables.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own deliverables" ON deliverables
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = deliverables.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deliverables d
            JOIN ideas i ON d.idea_id = i.id
            WHERE d.id = tasks.deliverable_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own tasks" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deliverables d
            JOIN ideas i ON d.idea_id = i.id
            WHERE d.id = tasks.deliverable_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM deliverables d
            JOIN ideas i ON d.idea_id = i.id
            WHERE d.id = tasks.deliverable_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM deliverables d
            JOIN ideas i ON d.idea_id = i.id
            WHERE d.id = tasks.deliverable_id AND i.user_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );

-- Vectors policies
CREATE POLICY "Users can view their own vectors" ON vectors
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = vectors.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create their own vectors" ON vectors
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = vectors.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own vectors" ON vectors
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = vectors.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own vectors" ON vectors
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = vectors.idea_id AND user_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- Agent logs policies (restricted to service role only for security)
CREATE POLICY "Only service role can view agent logs" ON agent_logs
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can create agent logs" ON agent_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update agent logs" ON agent_logs
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can delete agent logs" ON agent_logs
    FOR DELETE USING (auth.role() = 'service_role');

-- Foreign key constraints
ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_milestone
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_milestone
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

-- Performance indexes for frequently queried columns
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_user_status ON ideas(user_id, status);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);

CREATE INDEX idx_deliverables_idea_id ON deliverables(idea_id);
CREATE INDEX idx_deliverables_priority ON deliverables(priority DESC);
CREATE INDEX idx_deliverables_idea_priority ON deliverables(idea_id, priority DESC);

CREATE INDEX idx_tasks_deliverable_id ON tasks(deliverable_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deliverable_status ON tasks(deliverable_id, status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at ASC);

CREATE INDEX idx_vectors_idea_id ON vectors(idea_id);
CREATE INDEX idx_vectors_type ON vectors(reference_type);
CREATE INDEX idx_vectors_idea_type ON vectors(idea_id, reference_type);

CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp DESC);
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent);
CREATE INDEX idx_agent_logs_agent_timestamp ON agent_logs(agent, timestamp DESC);

-- Milestone indexes
CREATE INDEX idx_milestones_idea_id ON milestones(idea_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);
CREATE INDEX idx_milestones_idea_status ON milestones(idea_id, status);

-- Breakdown sessions indexes
CREATE INDEX idx_breakdown_sessions_idea_id ON breakdown_sessions(idea_id);
CREATE INDEX idx_breakdown_sessions_status ON breakdown_sessions(status);
CREATE INDEX idx_breakdown_sessions_idea_status ON breakdown_sessions(idea_id, status);

-- Timeline indexes
CREATE INDEX idx_timelines_idea_id ON timelines(idea_id);
CREATE INDEX idx_timelines_dates ON timelines(start_date, end_date);

-- Task dependencies indexes
CREATE INDEX idx_task_dependencies_predecessor ON task_dependencies(predecessor_task_id);
CREATE INDEX idx_task_dependencies_successor ON task_dependencies(successor_task_id);

-- Task assignments indexes
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX idx_task_assignments_task_user ON task_assignments(task_id, user_id);

-- Time tracking indexes
CREATE INDEX idx_time_tracking_task_id ON time_tracking(task_id);
CREATE INDEX idx_time_tracking_user_id ON time_tracking(user_id);
CREATE INDEX idx_time_tracking_date_logged ON time_tracking(date_logged DESC);
CREATE INDEX idx_time_tracking_task_date ON time_tracking(task_id, date_logged DESC);

-- Task comments indexes
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_parent_id ON task_comments(parent_comment_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at DESC);

-- Risk assessments indexes
CREATE INDEX idx_risk_assessments_idea_id ON risk_assessments(idea_id);
CREATE INDEX idx_risk_assessments_task_id ON risk_assessments(task_id);
CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX idx_risk_assessments_idea_task ON risk_assessments(idea_id, task_id);

-- RLS policies for new tables

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