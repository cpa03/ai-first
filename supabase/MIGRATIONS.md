# Database Migrations

This document catalogs the current database migrations and establishes naming conventions for future migrations.

## Current Migration Count

- **Total migrations**: 62 (31 up + 31 down rollback scripts)
- **Unique up migrations**: 31

## Migration Catalog

### Legacy Numbered Migrations (001-005)

| File                                            | Description                                                                | Date       |
| ----------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| `001_breakdown_engine_extensions.sql`           | Core schema extensions for task dependencies, milestones, task assignments | Pre-2025   |
| `002_schema_optimization.sql`                   | Database schema optimization - indexes for performance                     | 2025-01-07 |
| `002_data_integrity_constraints.sql`            | Data integrity constraints                                                 | -          |
| `003_vectors_pgvector_support.sql`              | Vector store support with pgvector extension                               | -          |
| `004_risk_assessments_not_null_constraints.sql` | Risk assessments NOT NULL constraints                                      | -          |
| `005_risk_assessments_constraints_fix.sql`      | Risk assessments constraints fix                                           | -          |

### Dated Migrations (20260113 - 20260222)

#### January 2026

| File                                                | Description                           |
| --------------------------------------------------- | ------------------------------------- |
| `20260113_add_missing_tables_and_columns.sql`       | Missing tables and columns            |
| `20260120_add_clarification_tables_and_indexes.sql` | Clarification flow tables and indexes |

#### February 2026 - Early (20260218)

| File                                            | Description                    |
| ----------------------------------------------- | ------------------------------ |
| `20260218_add_missing_rls_policies.sql`         | Row Level Security policies    |
| `20260218_add_task_comments_soft_delete.sql`    | Task comments with soft delete |
| `20260218_add_ideas_updated_at.sql`             | Ideas updated_at timestamp     |
| `20260218_add_task_dependencies_updated_at.sql` | Task dependencies updated_at   |
| `20260218_vector_index_maintenance.sql`         | Vector index maintenance       |

#### February 2026 - Mid (20260219-20260220)

| File                                                | Description                  |
| --------------------------------------------------- | ---------------------------- |
| `20260219_add_date_integrity_constraints.sql`       | Date integrity constraints   |
| `20260219_add_task_assignments_updated_at.sql`      | Task assignments updated_at  |
| `20260219_add_idea_sessions_updated_at_trigger.sql` | Idea sessions update trigger |
| `20260220_fix_risk_score_data_type.sql`             | Risk score data type fix     |
| `20260220_add_task_assignments_indexes.sql`         | Task assignments indexes     |
| `20260220_add_agent_logs_action_index.sql`          | Agent logs action index      |

#### February 2026 - Late (20260221-20260222)

| File                                                     | Description                           |
| -------------------------------------------------------- | ------------------------------------- |
| `20260221_add_clarification_question_index.sql`          | Clarification question index          |
| `20260221_add_risk_assessments_risk_score_index.sql`     | Risk assessments risk score index     |
| `20260221_add_tasks_updated_at.sql`                      | Tasks updated_at timestamp            |
| `20260221_add_time_tracking_task_user_index.sql`         | Time tracking task-user index         |
| `20260221_add_missing_fk_indexes.sql`                    | Missing foreign key indexes           |
| `20260222_add_ideas_pagination_composite_index.sql`      | Ideas pagination composite index      |
| `20260222_add_deliverables_composite_priority_index.sql` | Deliverables priority composite index |
| `20260222_consolidate_performance_indexes.sql`           | Consolidated performance indexes      |
| `20260222_add_agent_logs_agent_action_index.sql`         | Agent logs agent-action index         |
| `20260222_add_time_tracking_user_date_index.sql`         | Time tracking user-date index         |
| `20260222_add_risk_assessments_status_score_index.sql`   | Risk assessments status-score index   |
| `20260222_add_idea_sessions_agent_updated_index.sql`     | Idea sessions agent-updated index     |

## Migration Naming Conventions

### Current Convention (Dated)

```
YYYYMMDD_description.sql
```

Examples:

- `20260219_add_date_integrity_constraints.sql`
- `20260222_consolidate_performance_indexes.sql`

### Down Migrations

Append `.down.sql` to the original migration name:

- `20260219_add_date_integrity_constraints.down.sql`

### Recommended Conventions

1. **Use descriptive names**: `add_ideas_title_index` not `add_index1`
2. **Use action prefixes**: `add_`, `create_`, `alter_`, `drop_`, `fix_`, `update_`
3. **Include object name**: `add_tasks_status_index` not just `add_index`
4. **Use lowercase with underscores**: `add_user_preferences_table`

## Migration Categories

Migrations can be categorized by type:

1. **Schema Changes**: CREATE TABLE, ALTER TABLE, DROP TABLE
2. **Indexes**: CREATE INDEX, DROP INDEX
3. **Constraints**: ADD CONSTRAINT, ALTER CONSTRAINT
4. **Data**: INSERT, UPDATE, DELETE (use sparingly)
5. **Extensions**: CREATE EXTENSION
6. **Security**: RLS policies, row security

## Best Practices

1. **Always include down migrations**: Every up migration should have a corresponding down migration
2. **Use IF EXISTS / IF NOT EXISTS**: Prevent errors on re-runs
3. **Keep migrations small**: One logical change per migration
4. **Add comments**: Document the purpose of each migration
5. **Test in staging first**: Always test migrations against staging data
6. **Backup before running**: Especially for destructive operations
7. **Monitor after deployment**: Watch for errors in production logs

## Future Consolidation Opportunities

Based on the current migration count (62 files), potential consolidation opportunities include:

1. **Batch similar indexes**: Multiple small index creations can be combined
2. **Consolidate daily migrations**: Migrations from the same day can be merged
3. **Squash old migrations**: Pre-consolidate historical migrations into baseline snapshots

> **Note**: Consolidation should be done carefully with full testing and backup.

## Running Migrations

```bash
# Apply all pending migrations
npm run db:migrate

# Reset database (dangerous - destroys all data)
npm run db:reset
```

## Related Documentation

- [Database Schema](./schema.sql)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/migrations)
