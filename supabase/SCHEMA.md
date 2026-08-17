# Database Schema Documentation

## Overview

This document describes the complete database schema for the ai-first application. The schema supports idea management, task breakdown, clarification workflows, and risk assessment.

## Tables

### Core Tables

#### `ideas`

The central table storing user ideas and their metadata.

| Column      | Type      | Description                                   |
| ----------- | --------- | --------------------------------------------- |
| id          | UUID      | Primary key                                   |
| user_id     | UUID      | Foreign key to auth.users                     |
| title       | TEXT      | Idea title                                    |
| description | TEXT      | Idea description                              |
| status      | TEXT      | Status (draft, processing, completed, failed) |
| created_at  | TIMESTAMP | Creation timestamp                            |
| updated_at  | TIMESTAMP | Last update timestamp                         |
| deleted_at  | TIMESTAMP | Soft delete timestamp                         |

**Indexes:**

- `idx_ideas_user_id` - User lookup
- `idx_ideas_status` - Status filtering
- `idx_ideas_created_at` - Chronological ordering
- `idx_ideas_user_status` - Composite user+status
- `idx_ideas_updated_at` - Recent updates
- `idx_ideas_user_deleted_created` - Paginated user queries (partial)

#### `tasks`

Individual tasks derived from idea breakdown.

| Column                | Type      | Description                                    |
| --------------------- | --------- | ---------------------------------------------- |
| id                    | UUID      | Primary key                                    |
| deliverable_id        | UUID      | Foreign key to deliverables                    |
| title                 | TEXT      | Task title                                     |
| description           | TEXT      | Task description                               |
| status                | TEXT      | Status (pending, in_progress, completed, etc.) |
| priority              | INTEGER   | Priority level (0-10)                          |
| complexity_score      | INTEGER   | AI-assigned complexity (1-10)                  |
| risk_level            | TEXT      | Risk level (low, medium, high)                 |
| tags                  | TEXT[]    | Categorization tags                            |
| custom_fields         | JSONB     | Extensible metadata                            |
| start_date            | TIMESTAMP | Scheduled start                                |
| end_date              | TIMESTAMP | Scheduled end                                  |
| actual_hours          | NUMERIC   | Time spent                                     |
| completion_percentage | INTEGER   | Progress (0-100)                               |
| milestone_id          | UUID      | Foreign key to milestones                      |
| created_at            | TIMESTAMP | Creation timestamp                             |
| updated_at            | TIMESTAMP | Last update timestamp                          |
| deleted_at            | TIMESTAMP | Soft delete timestamp                          |

**Indexes:**

- `idx_tasks_deliverable_id` - Deliverable lookup
- `idx_tasks_status` - Status filtering
- `idx_tasks_created_at` - Chronological ordering
- `idx_tasks_updated_at` - Recent updates
- `idx_tasks_deliverable_status` - Composite lookup

#### `deliverables`

High-level deliverables grouping related tasks.

| Column                | Type      | Description                                  |
| --------------------- | --------- | -------------------------------------------- |
| id                    | UUID      | Primary key                                  |
| idea_id               | UUID      | Foreign key to ideas                         |
| title                 | TEXT      | Deliverable title                            |
| description           | TEXT      | Deliverable description                      |
| priority              | INTEGER   | Priority level                               |
| milestone_id          | UUID      | Foreign key to milestones                    |
| completion_percentage | INTEGER   | Progress (0-100)                             |
| business_value        | NUMERIC   | Business value score                         |
| risk_factors          | TEXT[]    | Identified risks                             |
| acceptance_criteria   | JSONB     | Completion criteria                          |
| deliverable_type      | TEXT      | Type (feature, documentation, testing, etc.) |
| created_at            | TIMESTAMP | Creation timestamp                           |
| updated_at            | TIMESTAMP | Last update timestamp                        |
| deleted_at            | TIMESTAMP | Soft delete timestamp                        |

**Indexes:**

- `idx_deliverables_idea_id` - Idea lookup
- `idx_deliverables_priority` - Priority sorting
- `idx_deliverables_idea_deleted_priority` - Paginated idea queries (partial)
- `idx_deliverables_idea_milestone_priority` - Milestone filtering (partial)

#### `vectors`

Vector embeddings for semantic search.

| Column         | Type      | Description          |
| -------------- | --------- | -------------------- |
| id             | UUID      | Primary key          |
| idea_id        | UUID      | Foreign key to ideas |
| content        | TEXT      | Original content     |
| embedding      | VECTOR    | pgvector embedding   |
| reference_type | TEXT      | Reference type       |
| reference_id   | UUID      | Reference ID         |
| created_at     | TIMESTAMP | Creation timestamp   |

**Indexes:**

- `idx_vectors_idea_id` - Idea lookup
- `idx_vectors_reference_type` - Reference type filtering

#### `agent_logs`

Logs of AI agent interactions.

| Column    | Type      | Description          |
| --------- | --------- | -------------------- |
| id        | UUID      | Primary key          |
| idea_id   | UUID      | Foreign key to ideas |
| agent     | TEXT      | Agent identifier     |
| action    | TEXT      | Action performed     |
| details   | JSONB     | Action details       |
| timestamp | TIMESTAMP | Event timestamp      |

**Indexes:**

- `idx_agent_logs_agent` - Agent lookup
- `idx_agent_logs_timestamp` - Chronological ordering
- `idx_agent_logs_agent_timestamp` - Composite agent+time
- `idx_agent_logs_action` - Action filtering
- `idx_agent_logs_action_timestamp` - Action+time composite
- `idx_agent_logs_agent_action_timestamp` - Full composite

### Breakdown Engine Tables

#### `task_dependencies`

Dependencies between tasks.

| Column              | Type      | Description                                  |
| ------------------- | --------- | -------------------------------------------- |
| id                  | UUID      | Primary key                                  |
| predecessor_task_id | UUID      | Foreign key to tasks                         |
| successor_task_id   | UUID      | Foreign key to tasks                         |
| dependency_type     | TEXT      | Type (finish_to_start, start_to_start, etc.) |
| lag_days            | INTEGER   | Delay in days                                |
| created_at          | TIMESTAMP | Creation timestamp                           |

**Constraints:**

- UNIQUE(predecessor_task_id, successor_task_id)

**Indexes:**

- `idx_task_dependencies_both` - Composite dependency lookup
- `idx_task_dependencies_updated_at` - Recent updates

#### `milestones`

Project milestones for tracking progress.

| Column      | Type      | Description                                     |
| ----------- | --------- | ----------------------------------------------- |
| id          | UUID      | Primary key                                     |
| idea_id     | UUID      | Foreign key to ideas                            |
| title       | TEXT      | Milestone title                                 |
| description | TEXT      | Milestone description                           |
| target_date | DATE      | Target completion date                          |
| priority    | INTEGER   | Priority level                                  |
| status      | TEXT      | Status (pending, completed, delayed, cancelled) |
| created_at  | TIMESTAMP | Creation timestamp                              |
| updated_at  | TIMESTAMP | Last update timestamp                           |

#### `task_assignments`

User assignments to tasks.

| Column                | Type      | Description                            |
| --------------------- | --------- | -------------------------------------- |
| id                    | UUID      | Primary key                            |
| task_id               | UUID      | Foreign key to tasks                   |
| user_id               | UUID      | Foreign key to auth.users              |
| role                  | TEXT      | Role (assignee, reviewer, contributor) |
| allocation_percentage | INTEGER   | Time allocation (1-100)                |
| assigned_at           | TIMESTAMP | Assignment timestamp                   |
| assigned_by           | UUID      | Foreign key to auth.users              |

**Constraints:**

- UNIQUE(task_id, user_id, role)

**Indexes:**

- `idx_task_assignments_updated_at` - Recent updates
- `idx_task_assignments_assigned_by` - Assigner lookup
- `idx_task_assignments_user_assigned_by` - User+assigner composite

#### `time_tracking`

Time logging against tasks.

| Column       | Type      | Description               |
| ------------ | --------- | ------------------------- |
| id           | UUID      | Primary key               |
| task_id      | UUID      | Foreign key to tasks      |
| user_id      | UUID      | Foreign key to auth.users |
| hours_logged | NUMERIC   | Hours spent               |
| date_logged  | DATE      | Date of work              |
| notes        | TEXT      | Work notes                |
| created_at   | TIMESTAMP | Creation timestamp        |
| updated_at   | TIMESTAMP | Last update timestamp     |

**Indexes:**

- `idx_time_tracking_task_user` - Task+user composite
- `idx_time_tracking_user_date` - User+date composite

#### `task_comments`

Comments on tasks.

| Column            | Type      | Description               |
| ----------------- | --------- | ------------------------- |
| id                | UUID      | Primary key               |
| task_id           | UUID      | Foreign key to tasks      |
| user_id           | UUID      | Foreign key to auth.users |
| comment           | TEXT      | Comment content           |
| parent_comment_id | UUID      | For threaded comments     |
| created_at        | TIMESTAMP | Creation timestamp        |
| updated_at        | TIMESTAMP | Last update timestamp     |
| deleted_at        | TIMESTAMP | Soft delete timestamp     |

**Indexes:**

- `idx_task_comments_deleted_at` - Soft delete filtering (partial)
- `idx_task_comments_user_id` - User lookup
- `idx_task_comments_task_user` - Task+user composite

#### `breakdown_sessions`

AI breakdown analysis sessions.

| Column             | Type      | Description           |
| ------------------ | --------- | --------------------- |
| id                 | UUID      | Primary key           |
| idea_id            | UUID      | Foreign key to ideas  |
| session_data       | JSONB     | Breakdown results     |
| status             | TEXT      | Session status        |
| confidence_score   | NUMERIC   | AI confidence         |
| ai_model_version   | TEXT      | Model used            |
| processing_time_ms | INTEGER   | Processing duration   |
| created_at         | TIMESTAMP | Creation timestamp    |
| updated_at         | TIMESTAMP | Last update timestamp |

#### `timelines`

Project timeline data.

| Column              | Type      | Description            |
| ------------------- | --------- | ---------------------- |
| id                  | UUID      | Primary key            |
| idea_id             | UUID      | Foreign key to ideas   |
| start_date          | TIMESTAMP | Project start          |
| end_date            | TIMESTAMP | Project end            |
| total_weeks         | INTEGER   | Duration in weeks      |
| phase_data          | JSONB     | Phase breakdown        |
| milestone_data      | JSONB     | Milestone schedule     |
| resource_allocation | JSONB     | Resource planning      |
| critical_path       | JSONB     | Critical path analysis |
| created_at          | TIMESTAMP | Creation timestamp     |
| updated_at          | TIMESTAMP | Last update timestamp  |

### Clarification Tables

#### `clarification_sessions`

User clarification interview sessions.

| Column           | Type      | Description           |
| ---------------- | --------- | --------------------- |
| id               | UUID      | Primary key           |
| idea_id          | UUID      | Foreign key to ideas  |
| status           | TEXT      | Session status        |
| questions_asked  | INTEGER   | Count of questions    |
| answers_provided | INTEGER   | Count of answers      |
| created_at       | TIMESTAMP | Creation timestamp    |
| updated_at       | TIMESTAMP | Last update timestamp |

#### `clarification_answers`

User answers to clarification questions.

| Column      | Type      | Description             |
| ----------- | --------- | ----------------------- |
| id          | UUID      | Primary key             |
| session_id  | UUID      | Foreign key to sessions |
| question_id | TEXT      | Question identifier     |
| answer      | TEXT      | User's answer           |
| created_at  | TIMESTAMP | Creation timestamp      |

**Indexes:**

- `idx_clarification_answers_question_id` - Question lookup
- `idx_clarification_answers_session_question` - Session+question composite

### Risk Assessment Tables

#### `risk_assessments`

Risk analysis for ideas.

| Column     | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | UUID      | Primary key           |
| idea_id    | UUID      | Foreign key to ideas  |
| risk_type  | TEXT      | Type of risk          |
| risk_score | NUMERIC   | Risk score            |
| mitigation | TEXT      | Mitigation strategy   |
| status     | TEXT      | Assessment status     |
| created_at | TIMESTAMP | Creation timestamp    |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**

- `idx_risk_assessments_risk_score` - Score filtering (partial)
- `idx_risk_assessments_idea_risk_score` - Idea+score composite (partial)
- `idx_risk_assessments_status_risk_score` - Status+score composite

## Migration History

### Consolidated Migrations

1. **001_breakdown_engine_extensions.sql** - Core breakdown engine tables
2. **002_schema_optimization_and_constraints.sql** - Indexes, soft-delete, constraints
3. **003_vectors_pgvector_support.sql** - Vector embeddings support
4. **20260113_add_missing_tables_and_columns.sql** - Schema synchronization
5. **20260120_add_clarification_tables_and_indexes.sql** - Clarification workflow
6. **20260218_add_missing_rls_policies.sql** - Row-level security
7. **20260222_consolidate_performance_indexes.sql** - Performance indexes
8. **20260223_consolidate_migrations.sql** - Additional indexes
9. **20260226_consolidate_risk_assessments_migrations.sql** - Risk assessments

## Best Practices

### Migration Guidelines

1. **Use IF NOT EXISTS** - All CREATE statements should be idempotent
2. **Use IF EXISTS** - All DROP statements should be idempotent
3. **Add comments** - Document the purpose of each migration
4. **Include rollback** - Provide .down.sql files for reversibility
5. **Test locally** - Verify migrations work before committing

### Index Guidelines

1. **Index foreign keys** - All FK columns should have indexes
2. **Composite indexes** - For common query patterns
3. **Partial indexes** - For filtered queries (e.g., soft-delete)
4. **Cover indexes** - For frequently accessed columns

### Soft Delete Guidelines

1. **Use deleted_at** - NULL means active, non-NULL means deleted
2. **Partial indexes** - Only index non-deleted records
3. **Cascade carefully** - Consider impact on related data
