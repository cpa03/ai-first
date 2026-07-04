# Database Migrations

This document catalogs the current database migrations and establishes naming conventions for future migrations.

## Current Migration Count

- **Total migrations**: 18 (9 up + 9 down rollback scripts)
- **Unique up migrations**: 9
- **Consolidation Status**: Completed (62 → 9 up migrations, 85% reduction)

### Migration Notes

- Legacy migrations (001-003) are retained for foundational schema support
- Migrations 004 and 005 have been removed (superseded by `20260226_consolidate_risk_assessments_migrations.sql`)
- Consolidation migrations (20260222, 20260223, 20260226) supersede individual migrations
- Old migrations marked as "superseded" in comments have been removed

## Migration Catalog

### Legacy Numbered Migrations (001-003)

| File                                          | Description                                                                          | Date       |
| --------------------------------------------- | ------------------------------------------------------------------------------------ | ---------- |
| `001_breakdown_engine_extensions.sql`         | Core schema extensions for task dependencies, milestones, task assignments           | Pre-2025   |
| `002_schema_optimization_and_constraints.sql` | Consolidated: Performance indexes, soft-delete mechanism, data integrity constraints | 2025-01-07 |
| `003_vectors_pgvector_support.sql`            | Vector store support with pgvector extension                                         | 2025-01-07 |

### Dated Migrations (20260113 - 20260226)

#### January 2026

| File                                                | Description                           |
| --------------------------------------------------- | ------------------------------------- |
| `20260113_add_missing_tables_and_columns.sql`       | Missing tables and columns            |
| `20260120_add_clarification_tables_and_indexes.sql` | Clarification flow tables and indexes |

#### February 2026

| File                                                   | Description                             |
| ------------------------------------------------------ | --------------------------------------- |
| `20260218_add_missing_rls_policies.sql`                | Row Level Security policies             |
| `20260222_consolidate_performance_indexes.sql`         | Consolidated performance indexes        |
| `20260223_consolidate_migrations.sql`                  | Consolidated index-only migrations      |
| `20260226_consolidate_risk_assessments_migrations.sql` | Consolidated risk assessment migrations |

## Removed Migrations

The following migrations have been removed as part of consolidation:

| Original File                                   | Reason                       | Replacement                                            |
| ----------------------------------------------- | ---------------------------- | ------------------------------------------------------ |
| `002_data_integrity_constraints.sql`            | Merged into consolidated 002 | `002_schema_optimization_and_constraints.sql`          |
| `002b_schema_optimization.sql`                  | Merged into consolidated 002 | `002_schema_optimization_and_constraints.sql`          |
| `004_risk_assessments_not_null_constraints.sql` | Superseded                   | `20260226_consolidate_risk_assessments_migrations.sql` |
| `005_risk_assessments_constraints_fix.sql`      | Superseded                   | `20260226_consolidate_risk_assessments_migrations.sql` |

## Migration Naming Conventions

### Current Convention (Dated)

```
YYYYMMDD_description.sql
```

Examples:

- `20260119_add_date_integrity_constraints.sql`
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
