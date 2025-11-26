# Workflow Backup Manifest

**Created:** 2025-11-26 18:43:08 UTC
**Reason:** Migration to unified specialists workflow
**Backup files:**

- affiliate-marketing-specialist.yml.backup_20251126_184308
- analytics-specialist.yml.backup_20251126_184308
- backend-specialist.yml.backup_20251126_184308
- content-specialist.yml.backup_20251126_184308
- deploy.yml.backup_20251126_184308
- frontend-specialist.yml.backup_20251126_184308
- repo-maintenance.yml.backup_20251126_184308
- security-specialist.yml.backup_20251126_184308
- seo-specialist.yml.backup_20251126_184308
- testing-specialist.yml.backup_20251126_184308

## Restoration Instructions
To restore any workflow:
1. Copy backup file to .github/workflows/
2. Remove .backup_* suffix
3. Remove [DEPRECATED] prefix
4. Change 'if: false' back to original condition
