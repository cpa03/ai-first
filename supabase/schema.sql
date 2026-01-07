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

-- Enable Row Level Security (RLS)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

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