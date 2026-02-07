# Database Architect Guide

## Overview

This document serves as the comprehensive guide for the IdeaFlow project's database architecture, covering schema design, migrations, type definitions, and best practices for database operations.

## Database Technology Stack

- **Platform**: Supabase (PostgreSQL)
- **ORM/Client**: @supabase/supabase-js
- **Vector Extension**: pgvector (for embeddings)
- **Authentication**: Supabase Auth (built-in)

## Database Schema

### Core Tables

#### 1. Ideas Table

The central entity representing user ideas/concepts.

```sql
CREATE TABLE ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'clarified', 'breakdown', 'completed')),
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

**TypeScript Interface:**

```typescript
interface Idea {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
  deleted_at: string | null;
  created_at: string;
  updated_at?: string;
}
```

#### 2. Deliverables Table

Represents high-level deliverables derived from ideas.

```sql
CREATE TABLE deliverables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    estimate_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    milestone_id UUID REFERENCES milestones(id),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    business_value DECIMAL(5,2) DEFAULT 0 CHECK (business_value >= 0),
    risk_factors TEXT[],
    acceptance_criteria JSONB,
    deliverable_type TEXT DEFAULT 'feature' CHECK (deliverable_type IN ('feature', 'documentation', 'testing', 'deployment', 'research'))
);
```

#### 3. Tasks Table

Individual tasks associated with deliverables.

```sql
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
    milestone_id UUID REFERENCES milestones(id)
);
```

#### 4. Clarification Sessions Table

Stores AI clarification session state for ideas.

```sql
CREATE TABLE clarification_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface:**

```typescript
interface ClarificationSession {
  id: string;
  idea_id: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

#### 5. Clarification Answers Table

Stores user answers to clarification questions.

```sql
CREATE TABLE clarification_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES clarification_sessions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface:**

```typescript
interface ClarificationAnswer {
  id: string;
  session_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
}
```

### Supporting Tables

#### 6. Idea Sessions Table

Tracks the current state of AI processing for ideas.

```sql
CREATE TABLE idea_sessions (
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    state JSONB,
    last_agent TEXT,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (idea_id)
);
```

#### 7. Vectors Table

Stores embeddings for semantic search.

```sql
CREATE TABLE vectors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    vector_data JSONB,
    reference_type TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding vector(1536)
);
```

#### 8. Agent Logs Table

Audit trail of AI agent activities.

```sql
CREATE TABLE agent_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Breakdown Engine Tables

#### 9. Task Dependencies Table

Tracks task dependencies for project management.

```sql
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
```

#### 10. Milestones Table

Project milestones for timeline management.

```sql
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
```

#### 11. Task Assignments Table

Links users to tasks with roles.

```sql
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
```

#### 12. Time Tracking Table

Logs time spent on tasks.

```sql
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
```

#### 13. Task Comments Table

Stores comments on tasks.

```sql
CREATE TABLE task_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 14. Breakdown Sessions Table

Stores AI breakdown session data.

```sql
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
```

#### 15. Timelines Table

Stores project timeline data.

```sql
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
```

#### 16. Risk Assessments Table

Stores risk analysis data.

```sql
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
```

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data.

### Key RLS Patterns

1. **Ownership-based access**: Users can only access ideas they own
2. **Cascading permissions**: Access to deliverables requires access to parent idea
3. **Service role bypass**: Service role can access all data for background processing

### Example RLS Policy

```sql
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (
        (auth.uid() = user_id OR auth.role() = 'service_role') AND
        deleted_at IS NULL
    );
```

## Indexes

### Performance Indexes

| Table        | Index                        | Purpose                        |
| ------------ | ---------------------------- | ------------------------------ |
| ideas        | idx_ideas_user_id            | Fast user idea lookups         |
| ideas        | idx_ideas_status             | Status filtering               |
| ideas        | idx_ideas_user_status        | Combined user + status queries |
| ideas        | idx_ideas_created_at         | Sorting by creation date       |
| ideas        | idx_ideas_deleted_at         | Soft delete filtering          |
| deliverables | idx_deliverables_idea_id     | Deliverable lookups by idea    |
| deliverables | idx_deliverables_priority    | Priority sorting               |
| tasks        | idx_tasks_deliverable_id     | Task lookups by deliverable    |
| tasks        | idx_tasks_status             | Status filtering               |
| vectors      | idx_vectors_embedding_cosine | Vector similarity search       |

### Analytics Indexes

```sql
-- Composite index for user analytics
CREATE INDEX idx_ideas_user_deleted_status ON ideas(user_id, deleted_at, status);

-- Timeline query optimization
CREATE INDEX idx_tasks_start_end_dates ON tasks(start_date, end_date) WHERE deleted_at IS NULL;
```

## Database Service Layer

### DatabaseService Class

Located in `src/lib/db.ts`, provides type-safe database operations:

```typescript
export class DatabaseService {
  // Ideas CRUD
  async createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea>;
  async getIdea(id: string): Promise<Idea | null>;
  async getUserIdeas(userId: string): Promise<Idea[]>;
  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea>;
  async softDeleteIdea(id: string): Promise<void>;

  // Deliverables
  async createDeliverable(
    deliverable: Omit<Deliverable, 'id' | 'created_at'>
  ): Promise<Deliverable>;
  async getIdeaDeliverables(ideaId: string): Promise<Deliverable[]>;

  // Tasks
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task>;
  async getDeliverableTasks(deliverableId: string): Promise<Task[]>;

  // Vector operations
  async storeEmbedding(
    ideaId: string,
    referenceType: string,
    embedding: number[]
  ): Promise<Vector>;
  async searchSimilarVectors(
    ideaId: string,
    queryEmbedding: number[],
    limit?: number
  ): Promise<Vector[]>;

  // Clarification
  async createClarificationSession(ideaId: string): Promise<any>;
  async saveAnswers(
    sessionId: string,
    answers: Record<string, string>
  ): Promise<any>;
}
```

### Client Initialization

```typescript
// Browser client (respects RLS)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Admin client (bypasses RLS for server operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

## Migrations

### Migration Files

Located in `/supabase/migrations/`:

| Migration                                         | Description                  |
| ------------------------------------------------- | ---------------------------- |
| 001_breakdown_engine_extensions.sql               | Adds breakdown engine tables |
| 002_data_integrity_constraints.sql                | Adds CHECK constraints       |
| 002_schema_optimization.sql                       | Performance optimizations    |
| 003_vectors_pgvector_support.sql                  | Vector extension setup       |
| 20260113_add_missing_tables_and_columns.sql       | Missing tables and columns   |
| 20260120_add_clarification_tables_and_indexes.sql | Clarification tables         |

### Migration Best Practices

1. **Always include down migrations** for rollback capability
2. **Use IF EXISTS/IF NOT EXISTS** to make migrations idempotent
3. **Document purpose and safety** in migration headers
4. **Test migrations** on a copy of production data

### Example Migration Structure

```sql
-- Migration: Description
-- Purpose: What this migration does
-- Safe: Whether it's non-destructive
-- Reversible: Whether down migration exists

-- Create table
CREATE TABLE IF NOT EXISTS new_table (...);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "policy_name" ON new_table ...;
```

## Common Issues & Fixes

### Issue 1: Missing TypeScript Types

**Problem**: `clarification_sessions` and `clarification_answers` tables exist in schema but not in TypeScript types.

**Solution**: Add to `src/types/database.ts`:

```typescript
clarification_sessions: {
  Row: { id: string; idea_id: string; status: 'active' | 'completed' | 'cancelled'; created_at: string; updated_at: string; };
  Insert: { ... };
  Update: { ... };
};
clarification_answers: {
  Row: { id: string; session_id: string; question_id: string; answer: string; created_at: string; updated_at: string; };
  Insert: { ... };
  Update: { ... };
};
```

### Issue 2: Type Mismatches

**Problem**: Database types don't match TypeScript interfaces.

**Solution**: Always regenerate types after schema changes:

```bash
# Generate types from Supabase
supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
```

### Issue 3: RLS Policy Errors

**Problem**: Users can't access their data despite correct RLS policies.

**Solution**: Verify policies check both `auth.uid()` and soft deletes:

```sql
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (
        auth.uid() = user_id AND deleted_at IS NULL
    );
```

## Database Health Checks

### Automated Health Check

```typescript
async healthCheck(): Promise<{ status: string; timestamp: string }> {
  try {
    const { error } = await this.client.from('ideas').select('id').limit(1);
    if (error) throw error;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch {
    return { status: 'unhealthy', timestamp: new Date().toISOString() };
  }
}
```

### Manual Verification Commands

```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes WHERE schemaname = 'public' ORDER BY idx_scan DESC;

-- Check slow queries
SELECT query, calls, mean_time, total_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

## Best Practices

### 1. Soft Deletes

Always use soft deletes (`deleted_at` timestamp) instead of hard deletes to maintain data integrity and audit trails.

### 2. JSONB for Flexibility

Use JSONB columns for metadata and custom fields to allow schema evolution without migrations.

### 3. Index Strategy

- Index all foreign keys
- Index frequently queried columns
- Use partial indexes for soft-deleted data filtering
- Consider composite indexes for common query patterns

### 4. Type Safety

- Always update TypeScript types when modifying schema
- Use strict typing for all database operations
- Validate data before insertion

### 5. Security

- Enable RLS on all tables
- Use service role only for background operations
- Never expose service role key to client
- Redact PII before logging

## Environment Variables

```bash
# Required for database connection
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Troubleshooting

### Connection Issues

1. Verify environment variables are set
2. Check Supabase project status
3. Verify network connectivity
4. Check IP allowlist settings

### Performance Issues

1. Analyze query execution plans
2. Check for missing indexes
3. Monitor connection pool usage
4. Review slow query logs

### Migration Failures

1. Check migration order dependencies
2. Verify no conflicting objects exist
3. Test on staging first
4. Use transactions where possible

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgvector Extension](https://github.com/pgvector/pgvector)
- [Architecture Document](./architecture.md)
