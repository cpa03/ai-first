# Database Migration Governance

## Overview

This document establishes conventions and guidelines for managing Supabase database migrations to prevent accumulation of small, fragmented migrations.

## Current State

### Migration Statistics

- **Total Migration Files**: 60
- **Date Range**: 2026-01-13 to 2026-02-22
- **Average**: ~2 migrations per day during active development

### Migration Categories

| Category         | Count | Examples                                            |
| ---------------- | ----- | --------------------------------------------------- |
| Index additions  | ~25   | `20260221_add_clarification_question_index.sql`     |
| RLS policies     | ~6    | `20260218_add_missing_rls_policies.sql`             |
| Constraints      | ~8    | `20260219_add_date_integrity_constraints.sql`       |
| Table operations | ~10   | `20260120_add_clarification_tables_and_indexes.sql` |
| Triggers         | ~4    | `20260219_add_idea_sessions_updated_at_trigger.sql` |
| Data fixes       | ~3    | `20260220_fix_risk_score_data_type.sql`             |

### Issues Identified

1. **Fragmentation**: Many small migrations for similar operations (e.g., 8+ index additions over 5 days)
2. **Naming inconsistency**: Mixed formats (`20260218_` vs `004_` vs `001_`)
3. **No batch consolidation**: Each index created as separate migration
4. **Testing gap**: No automated migration testing in CI

## Governance Guidelines

### 1. Migration Naming Convention

```
Format: YYYYMMDD_description_operation_type.sql
```

| Element     | Format                | Example                                   |
| ----------- | --------------------- | ----------------------------------------- |
| Date        | YYYYMMDD              | 20260219                                  |
| Description | lowercase_underscores | add_user_indexes                          |
| Operation   | operation_type        | create_index, alter_table, add_constraint |

**Examples**:

- ✅ `20260225_add_user_email_index.sql`
- ✅ `20260225_consolidate_user_permissions.sql`
- ❌ `2026-02-25-user-index.sql` (wrong format)
- ❌ `indexes.sql` (too vague)

### 2. Batch Consolidation Rule

**When to consolidate**: Multiple operations on the same table within 7 days should be merged.

**Consolidation template**:

```sql
-- Migration: YYYYMMDD_consolidate_tablename_changes.sql
-- Description: Combined migration for [table] changes from YYYYMMDD-YYYYMMDD
-- Tables affected: [table_name]

-- [Operation 1]
CREATE INDEX IF NOT EXISTS idx_table_column1 ON table(column1);

-- [Operation 2]
ALTER TABLE table ADD CONSTRAINT constraint_name...

-- [Operation 3]
-- ... more operations
```

### 3. Migration Size Guidelines

| Type           | Max operations per migration |
| -------------- | ---------------------------- |
| Index creation | 5 indexes                    |
| RLS policy     | 3 policies                   |
| Column alter   | 3 columns                    |
| Constraint     | 2 constraints                |
| Mixed          | 5 operations total           |

### 4. Required Metadata

Each migration must include:

```sql
-- Migration: YYYYMMDD_description.sql
-- Description: [clear explanation of what this does]
-- Tables affected: [list]
-- Rollback: [how to undo]
-- Related issue: [optional]
```

### 5. CI Integration

Add to CI pipeline:

```yaml
migration-check:
  runs-on: ubuntu-latest
  steps:
    - name: Validate migration naming
      run: |
        # Check format: YYYYMMDD_description.sql
        find supabase/migrations -name "*.sql" | while read f; do
          if ! basename "$f" | grep -qE '^[0-9]{8}_[a-z0-9_]+\.sql$'; then
            echo "Invalid naming: $f"
            exit 1
          fi
        done

    - name: Check migration size
      run: |
        # Warn if > 5 statements per migration
        find supabase/migrations -name "*.sql" ! -name "*.down.sql" \
          -exec wc -l {} \; | awk '$1 > 100 {print $2}'
```

### 6. Review Checklist

Before merging a migration PR:

- [ ] Follows naming convention
- [ ] Includes metadata header
- [ ] Within size guidelines
- [ ] No duplicate operations (check recent migrations)
- [ ] Tested on local database
- [ ] Down migration provided

## Consolidation Plan (Future)

To reduce the current 60 migrations:

1. **Phase 1** (Completed): Document current state
2. **Phase 2** (TBD): Identify safe consolidation candidates
   - Index additions from same date
   - Related RLS policies
3. **Phase 3**: Implement governance to prevent future accumulation

### Safe Consolidation Candidates

The following can be safely merged (same table, same date, related operations):

- `20260221_add_clarification_question_index.sql` + related FK indexes
- `20260218_add_missing_rls_policies.sql` (already consolidated)

### Risky Consolidations (Do Not Merge)

- Migration files with data migrations
- Schema changes that depend on order
- Extensions that must load in sequence

## Related Issues

- #1816: Consolidate Database Migrations - 60+ Migration Files

## References

- [Supabase Migrations](https://supabase.com/docs/guides/migrations)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/best-practices.html)
