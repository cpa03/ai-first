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

-- Additional RLS policies for other tables
CREATE POLICY "Users can view their own idea sessions" ON idea_sessions
    FOR SELECT USING (EXISTS (SELECT 1 FROM ideas WHERE ideas.id = idea_sessions.idea_id AND ideas.user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their own idea sessions" ON idea_sessions
    FOR ALL USING (EXISTS (SELECT 1 FROM ideas WHERE ideas.id = idea_sessions.idea_id AND ideas.user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can view their own deliverables" ON deliverables
    FOR SELECT USING (EXISTS (SELECT 1 FROM ideas WHERE ideas.id = deliverables.idea_id AND ideas.user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their own deliverables" ON deliverables
    FOR ALL USING (EXISTS (SELECT 1 FROM ideas WHERE ideas.id = deliverables.idea_id AND ideas.user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (EXISTS (SELECT 1 FROM deliverables WHERE deliverables.id = tasks.deliverable_id AND EXISTS (SELECT 1 FROM ideas WHERE ideas.id = deliverables.idea_id AND ideas.user_id = auth.uid())) OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their own tasks" ON tasks
    FOR ALL USING (EXISTS (SELECT 1 FROM deliverables WHERE deliverables.id = tasks.deliverable_id AND EXISTS (SELECT 1 FROM ideas WHERE ideas.id = deliverables.idea_id AND ideas.user_id = auth.uid())) OR auth.role() = 'service_role');

CREATE POLICY "Users can view their own vectors" ON vectors
    FOR SELECT USING (EXISTS (SELECT 1 FROM ideas WHERE ideas.id = vectors.idea_id AND ideas.user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their own vectors" ON vectors
    FOR ALL USING (EXISTS (SELECT 1 FROM ideas WHERE ideas.id = vectors.idea_id AND ideas.user_id = auth.uid()) OR auth.role() = 'service_role');

-- Agent logs are only accessible by service role
CREATE POLICY "Only service role can access agent logs" ON agent_logs
    FOR ALL USING (auth.role() = 'service_role');