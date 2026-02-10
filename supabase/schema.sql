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
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'clarified', 'breakdown', 'completed')),
    deleted_at TIMESTAMP WITH TIME ZONE
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

-- Clarification sessions table
CREATE TABLE clarification_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clarification answers table
CREATE TABLE clarification_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES clarification_sessions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones Table (must be created before deliverables and tasks)
CREATE TABLE milestones (
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

-- Deliverables table
CREATE TABLE deliverables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    estimate_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    business_value DECIMAL(5,2) DEFAULT 0 CHECK (business_value >= 0),
    risk_factors TEXT[],
    acceptance_criteria JSONB,
    deliverable_type TEXT DEFAULT 'feature' CHECK (deliverable_type IN ('feature', 'documentation', 'testing', 'deployment', 'research'))
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    start_date DATE,
    end_date DATE,
    actual_hours DECIMAL(8,2) CHECK (actual_hours >= 0),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    priority_score DECIMAL(5,2) DEFAULT 0 CHECK (priority_score >= 0),
    complexity_score INTEGER DEFAULT 1 CHECK (complexity_score >= 1 AND complexity_score <= 10),
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    tags TEXT[],
    custom_fields JSONB,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL
);

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Vectors table (for embedding vectors/references)
CREATE TABLE vectors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    vector_data JSONB,
    reference_type TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding vector(1536)
);

-- Agent logs table
CREATE TABLE agent_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Dependencies Table
CREATE TABLE task_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    predecessor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    successor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type TEXT DEFAULT 'finish_to_start'
        CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(predecessor_task_id, successor_task_id)
);

-- Task Assignments Table
CREATE TABLE task_assignments (
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
CREATE TABLE time_tracking (
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
CREATE TABLE task_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Breakdown Sessions Table
CREATE TABLE breakdown_sessions (
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
CREATE TABLE timelines (
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
CREATE TABLE risk_assessments (
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

-- Enable Row Level Security (RLS)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Add CHECK constraints for data validation
ALTER TABLE deliverables ADD CONSTRAINT check_estimate_hours_positive
    CHECK (estimate_hours >= 0);

ALTER TABLE tasks ADD CONSTRAINT check_estimate_positive
    CHECK (estimate >= 0);

-- Create policies for RLS
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (
        (auth.uid() = user_id OR auth.role() = 'service_role') AND
        deleted_at IS NULL
    );

CREATE POLICY "Users can create their own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can delete their own ideas" ON ideas
    FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Idea sessions policies
CREATE POLICY "Users can view their own idea sessions" ON idea_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_sessions.idea_id AND user_id = auth.uid() AND deleted_at IS NULL)
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
        EXISTS (SELECT 1 FROM ideas WHERE id = deliverables.idea_id AND user_id = auth.uid() AND deleted_at IS NULL)
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
            WHERE d.id = tasks.deliverable_id AND i.user_id = auth.uid() AND i.deleted_at IS NULL AND d.deleted_at IS NULL
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

CREATE POLICY "Service role can update vectors" ON vectors
    FOR UPDATE USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

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

-- Clarification sessions policies
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

-- Clarification answers policies
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

-- Enable Row Level Security for new tables
ALTER TABLE clarification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_answers ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Users can delete milestones for their ideas" ON milestones
    FOR DELETE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

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

CREATE POLICY "Users can create task assignments for their ideas" ON task_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update task assignments for their ideas" ON task_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete task assignments for their ideas" ON task_assignments
    FOR DELETE USING (
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

CREATE POLICY "Users can update their own time tracking" ON time_tracking
    FOR UPDATE USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can delete their own time tracking" ON time_tracking
    FOR DELETE USING (user_id = auth.uid() OR auth.role() = 'service_role');

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

CREATE POLICY "Users can update comments for their ideas" ON task_comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_comments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete comments for their ideas" ON task_comments
    FOR DELETE USING (
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

CREATE POLICY "Users can update breakdown sessions for their ideas" ON breakdown_sessions
    FOR UPDATE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can delete breakdown sessions for their ideas" ON breakdown_sessions
    FOR DELETE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- RLS Policies for timelines
CREATE POLICY "Users can view timelines for their ideas" ON timelines
    FOR SELECT USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can create timelines for their ideas" ON timelines
    FOR INSERT WITH CHECK (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can update timelines for their ideas" ON timelines
    FOR UPDATE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can delete timelines for their ideas" ON timelines
    FOR DELETE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

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

CREATE POLICY "Users can update risk assessments for their ideas" ON risk_assessments
    FOR UPDATE USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete risk assessments for their ideas" ON risk_assessments
    FOR DELETE USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR
        auth.role() = 'service_role'
    );


-- Performance indexes for frequently queried columns
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_user_status ON ideas(user_id, status);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_ideas_deleted_at ON ideas(deleted_at);

CREATE INDEX idx_deliverables_idea_id ON deliverables(idea_id);
CREATE INDEX idx_deliverables_priority ON deliverables(priority DESC);
CREATE INDEX idx_deliverables_idea_priority ON deliverables(idea_id, priority DESC);
CREATE INDEX idx_deliverables_deleted_at ON deliverables(deleted_at);
CREATE INDEX idx_deliverables_milestone_id ON deliverables(milestone_id);

CREATE INDEX idx_tasks_deliverable_id ON tasks(deliverable_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deliverable_status ON tasks(deliverable_id, status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at ASC);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
CREATE INDEX idx_tasks_start_date ON tasks(start_date);
CREATE INDEX idx_tasks_end_date ON tasks(end_date);
CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);

CREATE INDEX idx_vectors_idea_id ON vectors(idea_id);
CREATE INDEX idx_vectors_type ON vectors(reference_type);
CREATE INDEX idx_vectors_idea_type ON vectors(idea_id, reference_type);
CREATE INDEX idx_vectors_embedding_cosine ON vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_vectors_embedding_l2 ON vectors USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp DESC);
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent);
CREATE INDEX idx_agent_logs_agent_timestamp ON agent_logs(agent, timestamp DESC);

CREATE INDEX idx_idea_sessions_last_agent ON idea_sessions(last_agent);
CREATE INDEX idx_idea_sessions_updated_at ON idea_sessions(updated_at);

CREATE INDEX idx_task_dependencies_predecessor ON task_dependencies(predecessor_task_id);
CREATE INDEX idx_task_dependencies_successor ON task_dependencies(successor_task_id);
CREATE INDEX idx_task_dependencies_both ON task_dependencies(predecessor_task_id, successor_task_id);

CREATE INDEX idx_milestones_idea_id ON milestones(idea_id);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);

CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);

CREATE INDEX idx_time_tracking_task_id ON time_tracking(task_id);
CREATE INDEX idx_time_tracking_date ON time_tracking(date_logged);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_deleted_at ON task_comments(deleted_at);

CREATE INDEX idx_breakdown_sessions_idea_id ON breakdown_sessions(idea_id);

CREATE INDEX idx_timelines_idea_id ON timelines(idea_id);

CREATE INDEX idx_risk_assessments_idea_id ON risk_assessments(idea_id);
CREATE INDEX idx_risk_assessments_task_id ON risk_assessments(task_id);

-- ============================================================================
-- Performance Indexes for Analytics
-- ============================================================================

-- Composite index for analytics: user_id + deleted_at + status
CREATE INDEX idx_ideas_user_deleted_status ON ideas(user_id, deleted_at, status);

-- Composite index for deliverables analytics: idea_id + deleted_at
CREATE INDEX idx_deliverables_idea_deleted ON deliverables(idea_id, deleted_at);

-- Composite index for tasks analytics: deliverable_id + deleted_at
CREATE INDEX idx_tasks_deliverable_deleted ON tasks(deliverable_id, deleted_at);

-- Index for tasks start_date + end_date combined queries
CREATE INDEX idx_tasks_start_end_dates ON tasks(start_date, end_date) WHERE deleted_at IS NULL;

-- Index for tasks status + completion_percentage
CREATE INDEX idx_tasks_status_completion ON tasks(status, completion_percentage) WHERE deleted_at IS NULL;

-- Index for clarification_sessions: idea_id + status
CREATE INDEX idx_clarification_sessions_idea_status ON clarification_sessions(idea_id, status);

-- Index for clarification_answers: session_id
CREATE INDEX idx_clarification_answers_session ON clarification_answers(session_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables with updated_at column
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

-- Apply updated_at trigger to clarification_sessions
CREATE TRIGGER update_clarification_sessions_updated_at BEFORE UPDATE ON clarification_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to clarification_answers
CREATE TRIGGER update_clarification_answers_updated_at BEFORE UPDATE ON clarification_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for deliverables table (missing in original schema)
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Vector Similarity Search Function
-- ============================================================================

-- Create a function to find similar vectors using cosine similarity
CREATE OR REPLACE FUNCTION match_vectors(
  query_embedding vector,
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10,
  idea_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  idea_id uuid,
  reference_type text,
  reference_id text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.idea_id,
    v.reference_type,
    v.reference_id,
    1 - (v.embedding <=> query_embedding) as similarity
  FROM vectors v
  WHERE
    v.embedding IS NOT NULL AND
    (idea_id_filter IS NULL OR v.idea_id = idea_id_filter) AND
    1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION match_vectors TO authenticated;
GRANT EXECUTE ON FUNCTION match_vectors TO service_role;
