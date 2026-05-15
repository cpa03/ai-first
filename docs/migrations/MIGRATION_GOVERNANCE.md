# Database Migration Governance

## Overview

This document outlines the governance practices for database migrations in the ai-first project.

## Current State

As of May 2026, the project has **60 migration files** in `supabase/migrations/`.

### Migration Files Breakdown

| Pattern              | Count    | Example                                       |
| -------------------- | -------- | --------------------------------------------- |
| Sequential (`001_*`) | 5 files  | `001_breakdown_engine_extensions.sql`         |
| Dated (`202601*`)    | 6 files  | `20260113_add_missing_tables_and_columns.sql` |
| Dated (`202602*`)    | 49 files | `20260218_add_missing_rls_policies.sql`       |

### Key Observations

1. **Two naming conventions used**: The migrations use both sequential numbering (`001_`) and date-based naming (`YYYYMMDD_`). The date-based format is preferred.

2. **Migration pairs**: Each migration typically has a corresponding `*.down.sql` rollback file.

3. **Common themes**:
   - Extensions setup (pgvector, etc.)
   - Schema additions (tables, columns)
   - RLS policies
   - Indexes

## Naming Conventions

### Required Format

All new migrations MUST use the date-based format:

```
YYYYMMDD_<description>.sql
YYYYMMDD_<description>.down.sql
```

Examples:

- `20260515_add_user_preferences_table.sql`
- `20260515_add_user_preferences_table.down.sql`

### Description Guidelines

- Use lowercase with underscores
- Keep under 50 characters
- Describe the change, not the reason
- Examples: `add_user_preferences_table`, `fix_rls_policy_bug`, `add_email_index`

## Migration Best Practices

### When to Create a New Migration

- ✅ Adding a new table
- ✅ Adding/modifying columns
- ✅ Adding indexes (for performance)
- ✅ Adding RLS policies
- ✅ Adding constraints

### When NOT to Create a New Migration

- ❌ Refactoring existing code (schema stays the same)
- ❌ Adding comments/documentation only
- ❌ Bulk data migrations (consider separate script)

### Batch vs. Incremental Migrations

**Incremental migrations** (preferred): Small, focused changes that are easy to review and rollback.

**Batch migrations**: Multiple related changes in one file. Use when:

- Changes are tightly coupled
- Changes must be applied together for consistency

## Consolidation Strategy

To reduce migration count (target: 30% reduction):

1. **Audit**: Identify migrations that can be squashed
2. **Snapshot**: Create consolidated snapshots at major version milestones
3. **Preserve**: Keep essential rollback migrations

### Consolidation Criteria

A migration can be consolidated if:

- It has been in production for > 3 months
- No issues have been reported
- It doesn't need independent rollback capability

### When NOT to Consolidate

- Migrations < 3 months old
- Migrations that fixed critical bugs
- Migrations affecting high-risk tables (users, payments)

## CI/CD Considerations

### Migration Testing

All migrations should be tested in the following environments:

1. Local development (fresh database)
2. Staging environment
3. Production (with rollback plan ready)

### CI Pipeline

The CI pipeline should:

1. Validate migration syntax
2. Run migrations on test database
3. Verify schema integrity after migration

### Performance

Long migration chains can slow down CI. Target:

- New environments: < 30 seconds
- Migration application: < 5 minutes

## Rollback Procedures

### Before Applying Migrations

1. Ensure you have the rollback migration ready
2. Backup the database (for production)
3. Test rollback on staging first

### Rollback Commands

```bash
# Apply migrations
npx supabase migration up

# Revert last migration
npx supabase migration down
```

## References

- [Supabase Migrations Docs](https://supabase.com/docs/guides/migrations)
- Previous ADR: See `docs/adr/` for migration-related decisions
