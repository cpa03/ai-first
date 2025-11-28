-- Supabase schema for IdeaFlow

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (via Supabase Auth)
-- Note: Supabase Auth automatically creates the auth.users table
-- We just need to create a view or related tables if needed

-- Ideas table
CREATE TABLE ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' -- active, archived, completed
);

-- Idea sessions table
CREATE TABLE idea_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    state JSONB, -- Stores the current state of the clarification session
    last_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliverables table
CREATE TABLE deliverables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0, -- 0 is lowest, higher is more important
    estimate_hours NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT, -- Could be a user ID or agent name
    status TEXT DEFAULT 'todo', -- todo, in_progress, done, blocked
    estimate_hours NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent logs table
CREATE TABLE agent_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_name TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own ideas" ON ideas FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Users can insert their own ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Users can update their own ideas" ON ideas FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Users can delete their own ideas" ON ideas FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX ideas_user_id_idx ON ideas(user_id);
CREATE INDEX ideas_created_at_idx ON ideas(created_at);
CREATE INDEX idea_sessions_idea_id_idx ON idea_sessions(idea_id);
CREATE INDEX deliverables_idea_id_idx ON deliverables(idea_id);
CREATE INDEX tasks_deliverable_id_idx ON tasks(deliverable_id);
CREATE INDEX agent_logs_agent_name_idx ON agent_logs(agent_name);
CREATE INDEX agent_logs_created_at_idx ON agent_logs(created_at);