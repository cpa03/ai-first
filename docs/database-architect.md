# Database Architecture Documentation

## Overview

This document provides comprehensive documentation for the IdeaFlow database architecture, built on Supabase (PostgreSQL) with Row Level Security (RLS) policies, comprehensive indexing, and vector similarity search capabilities.

## Database Technology Stack

- **Platform**: Supabase (PostgreSQL)
- **ORM/Client**: @supabase/supabase-js
- **Vector Extension**: pgvector (for embeddings)
- **Authentication**: Supabase Auth (built-in)

## Table of Contents

1. [Database Schema](#database-schema)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Indexes](#indexes)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Triggers](#triggers)
7. [Functions](#functions)
8. [Data Integrity](#data-integrity)
9. [Best Practices](#best-practices)
10. [Common Issues and Solutions](#common-issues-and-solutions)
11. [Migration Guidelines](#migration-guidelines)
12. [Database Service Layer](#database-service-layer)
13. [Database Health Checks](#database-health-checks)

## Database Schema

### Core Tables

```
ideas
├── clarification_sessions
├── clarification_answers
├── deliverables
│   └── tasks
│       ├── task_dependencies
│       ├── task_assignments
│       ├── time_tracking
│       └── task_comments
├── milestones
├── vectors
├── breakdown_sessions
├── timelines
└── risk_assessments

agent_logs (system table)
```

### Schema Dependencies

**Critical Ordering for Schema Creation:**

1. `ideas` (root table)
2. `clarification_sessions` (depends on ideas)
3. `clarification_answers` (depends on clarification_sessions)
4. `milestones` (must be created before deliverables and tasks)
5. `deliverables` (depends on ideas, milestones)
6. `tasks` (depends on deliverables, milestones)
7. `task_dependencies` (depends on tasks)
8. `task_assignments` (depends on tasks)
9. `time_tracking` (depends on tasks)
10. `task_comments` (depends on tasks)
11. `vectors` (depends on ideas)
12. `breakdown_sessions` (depends on ideas)
13. `timelines` (depends on ideas)
14. `risk_assessments` (depends on ideas, tasks)
15. `agent_logs` (independent system table)

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────────────┐
│      ideas      │────▶│  clarification_sessions │
│  (root table)   │     └─────────────────────────┘
└────────┬────────┘                  │
         │                          ▼
         │               ┌─────────────────────────┐
         │               │   clarification_answers │
         │               └─────────────────────────┘
         │
         ├──────────────────────────────────────────┐
         │                                          │
         ▼                                          ▼
┌─────────────────┐                       ┌─────────────────┐
│   milestones    │◀──────────────────────│   deliverables  │
└─────────────────┘                       └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │      tasks      │
                                          └────────┬────────┘
                                                   │
              ┌──────────────┬─────────────────────┼──────────────┐
              │              │                     │              │
              ▼              ▼                     ▼              ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐ ┌─────────────┐
    │task_dependencies│ │task_assign- │ │  time_tracking  │ │task_comments│
    │                 │ │   ments     │ │                 │ │             │
    └─────────────────┘ └─────────────┘ └─────────────────┘ └─────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     vectors     │     │breakdown_sessions│    │    timelines    │
│  (with pgvector)│     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐
│risk_assessments │
└─────────────────┘
```

## Table Definitions

### 1. ideas

**Purpose:** Store user ideas/projects

| Column     | Type        | Constraints                             | Description                                         |
| ---------- | ----------- | --------------------------------------- | --------------------------------------------------- |
| id         | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier                                   |
| user_id    | UUID        | REFERENCES auth.users(id)               | Owner of the idea                                   |
| title      | TEXT        | NOT NULL                                | Idea title                                          |
| raw_text   | TEXT        | NOT NULL                                | Original idea description                           |
| status     | TEXT        | DEFAULT 'draft', CHECK                  | Idea status: draft, clarified, breakdown, completed |
| created_at | TIMESTAMPTZ | DEFAULT NOW()                           | Creation timestamp                                  |
| deleted_at | TIMESTAMPTZ | NULLABLE                                | Soft delete timestamp                               |

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

### 2. clarification_sessions

**Purpose:** Track AI clarification sessions for ideas

| Column     | Type        | Constraints                                      | Description           |
| ---------- | ----------- | ------------------------------------------------ | --------------------- |
| id         | UUID        | PRIMARY KEY                                      | Unique identifier     |
| idea_id    | UUID        | NOT NULL, REFERENCES ideas(id) ON DELETE CASCADE | Associated idea       |
| status     | TEXT        | NOT NULL, DEFAULT 'active', CHECK                | Session status        |
| created_at | TIMESTAMPTZ | DEFAULT NOW()                                    | Creation timestamp    |
| updated_at | TIMESTAMPTZ | DEFAULT NOW()                                    | Last update timestamp |

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

### 3. clarification_answers

**Purpose:** Store user answers to clarification questions

| Column      | Type        | Constraints                                                       | Description           |
| ----------- | ----------- | ----------------------------------------------------------------- | --------------------- |
| id          | UUID        | PRIMARY KEY                                                       | Unique identifier     |
| session_id  | UUID        | NOT NULL, REFERENCES clarification_sessions(id) ON DELETE CASCADE | Associated session    |
| question_id | TEXT        | NOT NULL                                                          | Question identifier   |
| answer      | TEXT        | NOT NULL                                                          | User's answer         |
| created_at  | TIMESTAMPTZ | DEFAULT NOW()                                                     | Creation timestamp    |
| updated_at  | TIMESTAMPTZ | DEFAULT NOW()                                                     | Last update timestamp |

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

### 4. milestones

**Purpose:** Project milestones for timeline tracking

| Column      | Type        | Constraints                            | Description                                    |
| ----------- | ----------- | -------------------------------------- | ---------------------------------------------- |
| id          | UUID        | PRIMARY KEY                            | Unique identifier                              |
| idea_id     | UUID        | REFERENCES ideas(id) ON DELETE CASCADE | Associated idea                                |
| title       | TEXT        | NOT NULL                               | Milestone title                                |
| description | TEXT        | NULLABLE                               | Detailed description                           |
| target_date | DATE        | NULLABLE                               | Target completion date                         |
| status      | TEXT        | DEFAULT 'pending', CHECK               | Status: pending, completed, delayed, cancelled |
| priority    | INTEGER     | DEFAULT 0                              | Priority level                                 |
| created_at  | TIMESTAMPTZ | DEFAULT NOW()                          | Creation timestamp                             |
| updated_at  | TIMESTAMPTZ | DEFAULT NOW()                          | Last update timestamp                          |

### 5. deliverables

**Purpose:** Project deliverables and features

| Column                | Type         | Constraints                                  | Description                                                 |
| --------------------- | ------------ | -------------------------------------------- | ----------------------------------------------------------- |
| id                    | UUID         | PRIMARY KEY                                  | Unique identifier                                           |
| idea_id               | UUID         | REFERENCES ideas(id) ON DELETE CASCADE       | Associated idea                                             |
| title                 | TEXT         | NOT NULL                                     | Deliverable title                                           |
| description           | TEXT         | NULLABLE                                     | Detailed description                                        |
| priority              | INTEGER      | DEFAULT 0                                    | Priority level                                              |
| estimate_hours        | INTEGER      | DEFAULT 0, CHECK >= 0                        | Estimated hours                                             |
| milestone_id          | UUID         | REFERENCES milestones(id) ON DELETE SET NULL | Associated milestone                                        |
| completion_percentage | INTEGER      | DEFAULT 0, CHECK 0-100                       | Completion percentage                                       |
| business_value        | DECIMAL(5,2) | DEFAULT 0, CHECK >= 0                        | Business value score                                        |
| risk_factors          | TEXT[]       | NULLABLE                                     | Array of risk factors                                       |
| acceptance_criteria   | JSONB        | NULLABLE                                     | Acceptance criteria in JSON                                 |
| deliverable_type      | TEXT         | DEFAULT 'feature', CHECK                     | Type: feature, documentation, testing, deployment, research |
| created_at            | TIMESTAMPTZ  | DEFAULT NOW()                                | Creation timestamp                                          |
| deleted_at            | TIMESTAMPTZ  | NULLABLE                                     | Soft delete timestamp                                       |

### 6. tasks

**Purpose:** Individual tasks within deliverables

| Column                | Type         | Constraints                                   | Description                          |
| --------------------- | ------------ | --------------------------------------------- | ------------------------------------ |
| id                    | UUID         | PRIMARY KEY                                   | Unique identifier                    |
| deliverable_id        | UUID         | REFERENCES deliverables(id) ON DELETE CASCADE | Parent deliverable                   |
| title                 | TEXT         | NOT NULL                                      | Task title                           |
| description           | TEXT         | NULLABLE                                      | Detailed description                 |
| assignee              | TEXT         | NULLABLE                                      | Assigned user                        |
| status                | TEXT         | DEFAULT 'todo', CHECK                         | Status: todo, in_progress, completed |
| estimate              | INTEGER      | DEFAULT 0, CHECK >= 0                         | Time estimate                        |
| start_date            | DATE         | NULLABLE                                      | Start date                           |
| end_date              | DATE         | NULLABLE                                      | End date                             |
| actual_hours          | DECIMAL(8,2) | NULLABLE, CHECK >= 0                          | Actual hours spent                   |
| completion_percentage | INTEGER      | DEFAULT 0, CHECK 0-100                        | Completion percentage                |
| priority_score        | DECIMAL(5,2) | DEFAULT 0, CHECK >= 0                         | Priority score                       |
| complexity_score      | INTEGER      | DEFAULT 1, CHECK 1-10                         | Complexity (1-10)                    |
| risk_level            | TEXT         | DEFAULT 'low', CHECK                          | Risk: low, medium, high              |
| tags                  | TEXT[]       | NULLABLE                                      | Array of tags                        |
| custom_fields         | JSONB        | NULLABLE                                      | Custom fields in JSON                |
| milestone_id          | UUID         | REFERENCES milestones(id) ON DELETE SET NULL  | Associated milestone                 |
| created_at            | TIMESTAMPTZ  | DEFAULT NOW()                                 | Creation timestamp                   |
| deleted_at            | TIMESTAMPTZ  | NULLABLE                                      | Soft delete timestamp                |

### 7. task_dependencies

**Purpose:** Define task dependencies (predecessor/successor relationships)

| Column              | Type        | Constraints                              | Description                                                              |
| ------------------- | ----------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| id                  | UUID        | PRIMARY KEY                              | Unique identifier                                                        |
| predecessor_task_id | UUID        | REFERENCES tasks(id) ON DELETE CASCADE   | Predecessor task                                                         |
| successor_task_id   | UUID        | REFERENCES tasks(id) ON DELETE CASCADE   | Successor task                                                           |
| dependency_type     | TEXT        | DEFAULT 'finish_to_start', CHECK         | Type: finish_to_start, start_to_start, finish_to_finish, start_to_finish |
| lag_days            | INTEGER     | DEFAULT 0                                | Lag in days                                                              |
| created_at          | TIMESTAMPTZ | DEFAULT NOW()                            | Creation timestamp                                                       |
| UNIQUE              |             | (predecessor_task_id, successor_task_id) | Prevent duplicate dependencies                                           |

### 8. task_assignments

**Purpose:** Multi-user task assignments with roles

| Column                | Type        | Constraints                                 | Description                           |
| --------------------- | ----------- | ------------------------------------------- | ------------------------------------- |
| id                    | UUID        | PRIMARY KEY                                 | Unique identifier                     |
| task_id               | UUID        | REFERENCES tasks(id) ON DELETE CASCADE      | Associated task                       |
| user_id               | UUID        | REFERENCES auth.users(id) ON DELETE CASCADE | Assigned user                         |
| role                  | TEXT        | DEFAULT 'assignee', CHECK                   | Role: assignee, reviewer, contributor |
| allocation_percentage | INTEGER     | DEFAULT 100, CHECK 1-100                    | Time allocation %                     |
| assigned_at           | TIMESTAMPTZ | DEFAULT NOW()                               | Assignment timestamp                  |
| assigned_by           | UUID        | REFERENCES auth.users(id)                   | Who assigned                          |
| UNIQUE                |             | (task_id, user_id, role)                    | Prevent duplicate assignments         |

### 9. time_tracking

**Purpose:** Time tracking for tasks

| Column       | Type         | Constraints                                 | Description           |
| ------------ | ------------ | ------------------------------------------- | --------------------- |
| id           | UUID         | PRIMARY KEY                                 | Unique identifier     |
| task_id      | UUID         | REFERENCES tasks(id) ON DELETE CASCADE      | Associated task       |
| user_id      | UUID         | REFERENCES auth.users(id) ON DELETE CASCADE | User who logged time  |
| hours_logged | DECIMAL(5,2) | NOT NULL, CHECK > 0                         | Hours logged          |
| date_logged  | DATE         | NOT NULL                                    | Date of work          |
| notes        | TEXT         | NULLABLE                                    | Work notes            |
| created_at   | TIMESTAMPTZ  | DEFAULT NOW()                               | Creation timestamp    |
| updated_at   | TIMESTAMPTZ  | DEFAULT NOW()                               | Last update timestamp |

### 10. task_comments

**Purpose:** Comments on tasks with threading support

| Column            | Type        | Constraints                                 | Description                  |
| ----------------- | ----------- | ------------------------------------------- | ---------------------------- |
| id                | UUID        | PRIMARY KEY                                 | Unique identifier            |
| task_id           | UUID        | REFERENCES tasks(id) ON DELETE CASCADE      | Associated task              |
| user_id           | UUID        | REFERENCES auth.users(id) ON DELETE CASCADE | Comment author               |
| comment           | TEXT        | NOT NULL                                    | Comment content              |
| parent_comment_id | UUID        | REFERENCES task_comments(id)                | Parent comment for threading |
| created_at        | TIMESTAMPTZ | DEFAULT NOW()                               | Creation timestamp           |
| updated_at        | TIMESTAMPTZ | DEFAULT NOW()                               | Last update timestamp        |

### 11. vectors

**Purpose:** Store embedding vectors for semantic search

| Column         | Type         | Constraints                            | Description                |
| -------------- | ------------ | -------------------------------------- | -------------------------- |
| id             | UUID         | PRIMARY KEY                            | Unique identifier          |
| idea_id        | UUID         | REFERENCES ideas(id) ON DELETE CASCADE | Associated idea            |
| vector_data    | JSONB        | NULLABLE                               | Additional vector metadata |
| reference_type | TEXT         | NOT NULL                               | Type of reference          |
| reference_id   | TEXT         | NULLABLE                               | External reference ID      |
| embedding      | vector(1536) | NULLABLE                               | pgvector embedding         |
| created_at     | TIMESTAMPTZ  | DEFAULT NOW()                          | Creation timestamp         |

**Note:** Requires `pgvector` extension.

### 12. breakdown_sessions

**Purpose:** Track AI breakdown sessions

| Column             | Type         | Constraints                            | Description                                                   |
| ------------------ | ------------ | -------------------------------------- | ------------------------------------------------------------- |
| id                 | UUID         | PRIMARY KEY                            | Unique identifier                                             |
| idea_id            | UUID         | REFERENCES ideas(id) ON DELETE CASCADE | Associated idea                                               |
| session_data       | JSONB        | NOT NULL                               | Session data                                                  |
| ai_model_version   | TEXT         | NULLABLE                               | AI model version used                                         |
| confidence_score   | DECIMAL(3,2) | NULLABLE, CHECK 0-1                    | AI confidence score                                           |
| processing_time_ms | INTEGER      | NULLABLE                               | Processing time in ms                                         |
| status             | TEXT         | DEFAULT 'analyzing', CHECK             | Status: analyzing, decomposing, scheduling, completed, failed |
| created_at         | TIMESTAMPTZ  | DEFAULT NOW()                          | Creation timestamp                                            |
| updated_at         | TIMESTAMPTZ  | DEFAULT NOW()                          | Last update timestamp                                         |

### 13. timelines

**Purpose:** Project timeline data

| Column              | Type        | Constraints                            | Description             |
| ------------------- | ----------- | -------------------------------------- | ----------------------- |
| id                  | UUID        | PRIMARY KEY                            | Unique identifier       |
| idea_id             | UUID        | REFERENCES ideas(id) ON DELETE CASCADE | Associated idea         |
| start_date          | DATE        | NOT NULL                               | Project start date      |
| end_date            | DATE        | NOT NULL                               | Project end date        |
| total_weeks         | INTEGER     | NOT NULL                               | Total duration in weeks |
| milestone_data      | JSONB       | NULLABLE                               | Milestone configuration |
| phase_data          | JSONB       | NULLABLE                               | Phase configuration     |
| critical_path       | JSONB       | NULLABLE                               | Critical path data      |
| resource_allocation | JSONB       | NULLABLE                               | Resource allocation     |
| created_at          | TIMESTAMPTZ | DEFAULT NOW()                          | Creation timestamp      |
| updated_at          | TIMESTAMPTZ | DEFAULT NOW()                          | Last update timestamp   |

### 14. risk_assessments

**Purpose:** Risk assessment data for ideas and tasks

| Column              | Type         | Constraints                            | Description                                         |
| ------------------- | ------------ | -------------------------------------- | --------------------------------------------------- |
| id                  | UUID         | PRIMARY KEY                            | Unique identifier                                   |
| idea_id             | UUID         | REFERENCES ideas(id) ON DELETE CASCADE | Associated idea                                     |
| task_id             | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Associated task (optional)                          |
| risk_factor         | TEXT         | NOT NULL                               | Description of risk                                 |
| impact_level        | TEXT         | CHECK                                  | Impact: very_low, low, medium, high, very_high      |
| probability_level   | TEXT         | CHECK                                  | Probability: very_low, low, medium, high, very_high |
| risk_score          | DECIMAL(3,2) | NULLABLE                               | Calculated risk score                               |
| mitigation_strategy | TEXT         | NULLABLE                               | Mitigation plan                                     |
| status              | TEXT         | DEFAULT 'open', CHECK                  | Status: open, mitigated, accepted, closed           |
| created_at          | TIMESTAMPTZ  | DEFAULT NOW()                          | Creation timestamp                                  |
| updated_at          | TIMESTAMPTZ  | DEFAULT NOW()                          | Last update timestamp                               |

### 15. agent_logs

**Purpose:** System logging for AI agent actions

| Column    | Type        | Constraints   | Description       |
| --------- | ----------- | ------------- | ----------------- |
| id        | UUID        | PRIMARY KEY   | Unique identifier |
| agent     | TEXT        | NOT NULL      | Agent name        |
| action    | TEXT        | NOT NULL      | Action performed  |
| payload   | JSONB       | NULLABLE      | Action payload    |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Action timestamp  |

**Security:** Restricted to service_role only (no user access).

### 16. idea_sessions

**Purpose:** Tracks the current state of AI processing for ideas

| Column      | Type        | Constraints                            | Description               |
| ----------- | ----------- | -------------------------------------- | ------------------------- |
| idea_id     | UUID        | REFERENCES ideas(id) ON DELETE CASCADE | Associated idea           |
| state       | JSONB       | NULLABLE                               | Session state             |
| last_agent  | TEXT        | NULLABLE                               | Last agent that processed |
| metadata    | JSONB       | NULLABLE                               | Additional metadata       |
| updated_at  | TIMESTAMPTZ | DEFAULT NOW()                          | Last update timestamp     |
| PRIMARY KEY |             | (idea_id)                              |                           |

## Indexes

### Core Indexes

#### ideas

- `idx_ideas_user_id` - user_id
- `idx_ideas_status` - status
- `idx_ideas_user_status` - (user_id, status)
- `idx_ideas_created_at` - created_at DESC
- `idx_ideas_deleted_at` - deleted_at

#### deliverables

- `idx_deliverables_idea_id` - idea_id
- `idx_deliverables_priority` - priority DESC
- `idx_deliverables_idea_priority` - (idea_id, priority DESC)
- `idx_deliverables_deleted_at` - deleted_at
- `idx_deliverables_milestone_id` - milestone_id

#### tasks

- `idx_tasks_deliverable_id` - deliverable_id
- `idx_tasks_status` - status
- `idx_tasks_deliverable_status` - (deliverable_id, status)
- `idx_tasks_created_at` - created_at ASC
- `idx_tasks_deleted_at` - deleted_at
- `idx_tasks_start_date` - start_date
- `idx_tasks_end_date` - end_date
- `idx_tasks_milestone_id` - milestone_id

### Vector Indexes

- `idx_vectors_idea_id` - idea_id
- `idx_vectors_type` - reference_type
- `idx_vectors_idea_type` - (idea_id, reference_type)
- `idx_vectors_embedding_cosine` - embedding (ivfflat, vector_cosine_ops)
- `idx_vectors_embedding_l2` - embedding (ivfflat, vector_l2_ops)

### Analytics Indexes

- `idx_ideas_user_deleted_status` - (user_id, deleted_at, status)
- `idx_deliverables_idea_deleted` - (idea_id, deleted_at)
- `idx_tasks_deliverable_deleted` - (deliverable_id, deleted_at)
- `idx_tasks_start_end_dates` - (start_date, end_date) WHERE deleted_at IS NULL
- `idx_tasks_status_completion` - (status, completion_percentage) WHERE deleted_at IS NULL
- `idx_clarification_sessions_idea_status` - (idea_id, status)
- `idx_clarification_answers_session` - (session_id)

## Row Level Security (RLS)

### RLS Policies by Table

#### ideas

- **SELECT:** Users can view their own ideas (user_id = auth.uid()) where deleted_at IS NULL
- **INSERT:** Users can create ideas with their user_id
- **UPDATE:** Users can update their own ideas
- **DELETE:** Users can delete their own ideas

#### deliverables

- **SELECT:** Users can view deliverables for their ideas
- **INSERT:** Users can create deliverables for their ideas
- **UPDATE:** Users can update deliverables for their ideas
- **DELETE:** Users can delete deliverables for their ideas

#### tasks

- **SELECT:** Users can view tasks through deliverables -> ideas relationship
- **INSERT:** Users can create tasks through deliverables -> ideas relationship
- **UPDATE:** Users can update tasks through deliverables -> ideas relationship
- **DELETE:** Users can delete tasks through deliverables -> ideas relationship

#### agent_logs

- **ALL:** Restricted to service_role only

### RLS Pattern

All RLS policies follow this pattern:

```sql
CREATE POLICY "policy_name" ON table_name
    FOR operation USING (
        EXISTS (
            SELECT 1 FROM related_table r
            JOIN ideas i ON r.idea_id = i.id
            WHERE r.id = table_name.foreign_key
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );
```

## Triggers

### update_updated_at_column

Automatically updates the `updated_at` timestamp on row updates.

**Applied to:**

- milestones
- task_comments
- time_tracking
- breakdown_sessions
- timelines
- risk_assessments
- clarification_sessions
- clarification_answers

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Functions

### match_vectors

Performs vector similarity search using cosine similarity.

```sql
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
```

**Parameters:**

- `query_embedding`: The vector to search against
- `match_threshold`: Minimum similarity threshold (0-1)
- `match_count`: Maximum number of results
- `idea_id_filter`: Optional filter by idea_id

**Returns:** Matching vectors with similarity scores

## Data Integrity

### CHECK Constraints

#### deliverables

- `completion_percentage >= 0 AND completion_percentage <= 100`
- `business_value >= 0`
- `estimate_hours >= 0`
- `deliverable_type IN ('feature', 'documentation', 'testing', 'deployment', 'research')`

#### tasks

- `completion_percentage >= 0 AND completion_percentage <= 100`
- `priority_score >= 0`
- `complexity_score >= 1 AND complexity_score <= 10`
- `risk_level IN ('low', 'medium', 'high')`
- `estimate >= 0`
- `actual_hours >= 0`

#### task_dependencies

- `dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')`

#### risk_assessments

- `impact_level IN ('very_low', 'low', 'medium', 'high', 'very_high')`
- `probability_level IN ('very_low', 'low', 'medium', 'high', 'very_high')`
- `confidence_score >= 0 AND confidence_score <= 1`

#### task_assignments

- `allocation_percentage > 0 AND allocation_percentage <= 100`

### Foreign Key Constraints

All foreign keys use `ON DELETE CASCADE` except:

- `deliverables.milestone_id`: `ON DELETE SET NULL`
- `tasks.milestone_id`: `ON DELETE SET NULL`

This preserves deliverables/tasks when a milestone is deleted.

## Best Practices

### 1. Soft Deletes

- Use `deleted_at` timestamp for soft deletes
- Always filter with `deleted_at IS NULL` in queries
- Hard delete only when explicitly required

### 2. Query Patterns

```typescript
// Always include user context for RLS
const { data } = await supabase
  .from('ideas')
  .select('*')
  .eq('user_id', userId)
  .is('deleted_at', null);

// Use composite indexes for filtered queries
const { data } = await supabase
  .from('ideas')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'draft')
  .is('deleted_at', null);
```

### 3. Batch Operations

```typescript
// Use bulk inserts for performance
const { data } = await supabase.from('tasks').insert(tasksArray).select();
```

### 4. Transaction Safety

- Use Supabase RPC for complex transactions
- Handle errors appropriately
- Use service_role for admin operations

## Common Issues and Solutions

### Issue 1: Forward Reference Error

**Problem:** Tables reference other tables before they are created.

**Solution:** Ensure correct creation order:

1. Root tables (ideas)
2. Tables with no dependencies (milestones)
3. Tables with single dependencies
4. Tables with multiple dependencies

**Fixed in schema.sql:** Milestones table moved before deliverables and tasks.

### Issue 2: Missing RLS Policies

**Problem:** Users can access data they shouldn't.

**Solution:** Always enable RLS and create policies:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON table_name ...
```

### Issue 3: N+1 Query Problem

**Problem:** Multiple queries for related data.

**Solution:** Use Supabase joins:

```typescript
const { data } = await supabase
  .from('deliverables')
  .select('*, tasks(*)')
  .eq('idea_id', ideaId);
```

### Issue 4: Missing Indexes

**Problem:** Slow queries on large datasets.

**Solution:** Add indexes for frequently queried columns:

```sql
CREATE INDEX idx_table_column ON table_name(column);
CREATE INDEX idx_table_composite ON table_name(col1, col2);
```

### Issue 5: Missing TypeScript Types

**Problem:** `clarification_sessions` and `clarification_answers` tables exist in schema but not in TypeScript types.

**Solution:** Add to `src/types/database.ts`:

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

### Issue 6: Type Mismatches

**Problem:** Database types don't match TypeScript interfaces.

**Solution:** Always regenerate types after schema changes:

```bash
# Generate types from Supabase
supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
```

### Issue 7: RLS Policy Errors

**Problem:** Users can't access their data despite correct RLS policies.

**Solution:** Verify policies check both `auth.uid()` and soft deletes:

```sql
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (
        auth.uid() = user_id AND deleted_at IS NULL
    );
```

## Migration Guidelines

### Creating Migrations

1. **Naming Convention:** `YYYYMMDD_description.sql`
2. **Idempotency:** Use `IF NOT EXISTS` and `IF EXISTS`
3. **Transactions:** Wrap in transactions when possible
4. **Rollback:** Always create down migration

### Migration Template

```sql
-- Up Migration
-- Description: What this migration does

-- Create new table
CREATE TABLE IF NOT EXISTS new_table (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_new_table_column ON new_table(column);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "policy_name" ON new_table
    FOR SELECT USING (auth.uid() = user_id);

-- Down Migration
-- Description: Rollback this migration

-- Drop policies
DROP POLICY IF EXISTS "policy_name" ON new_table;

-- Drop indexes
DROP INDEX IF EXISTS idx_new_table_column;

-- Drop table
DROP TABLE IF EXISTS new_table;
```

### Migration Checklist

- [ ] Test migration in development
- [ ] Test rollback in development
- [ ] Verify RLS policies work correctly
- [ ] Check index performance
- [ ] Update TypeScript types
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Monitor for errors

## Database Service Layer

The `DatabaseService` class in `src/lib/db.ts` provides:

- Type-safe database operations
- Automatic RLS handling
- PII redaction for logging
- Connection pooling
- Error handling

### Usage Example

```typescript
import { dbService } from '@/lib/db';

// Create idea
const idea = await dbService.createIdea({
  user_id: userId,
  title: 'My Idea',
  raw_text: 'Description...',
  status: 'draft',
});

// Get deliverables with tasks
const deliverables = await dbService.getIdeaDeliverablesWithTasks(ideaId);

// Soft delete
await dbService.softDeleteIdea(ideaId);
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

## Performance Optimization

### Query Optimization

1. **Use SELECT only needed columns**
2. **Use pagination for large datasets**
3. **Use composite indexes for multi-column filters**
4. **Avoid SELECT \* in production**

### Vector Search Optimization

1. **Use IVFFlat indexes for large vector tables**
2. **Tune match_threshold for precision/recall balance**
3. **Limit match_count appropriately**
4. **Use idea_id_filter when possible**

### Connection Pooling

Supabase handles connection pooling automatically. For high-traffic applications:

- Monitor connection usage
- Use connection pooling in edge functions
- Implement circuit breakers for resilience

## Security Considerations

1. **Never expose service_role key to client**
2. **Always use RLS policies**
3. **Validate all inputs**
4. **Redact PII in logs**
5. **Use parameterized queries**
6. **Enable audit logging for sensitive operations**

## Monitoring

### Key Metrics

- Query latency
- Index usage
- RLS policy performance
- Connection pool utilization
- Error rates

### Recommended Monitoring

- Poll `/api/health/detailed` every 30s
- Alert on status = 'unhealthy'
- Track circuit breaker open events
- Monitor retry success rates

## Conclusion

This database architecture provides:

- ✅ Strong data integrity with constraints
- ✅ Security with RLS policies
- ✅ Performance with strategic indexing
- ✅ Flexibility with JSONB fields
- ✅ AI capabilities with vector search
- ✅ Audit trail with agent_logs
- ✅ Soft delete pattern for data recovery

For questions or issues, refer to the troubleshooting guide or contact the database architect team.
