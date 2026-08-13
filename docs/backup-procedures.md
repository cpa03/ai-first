# Backup Procedures

## Overview

This document describes the backup procedures for the AI-First application, implemented as part of Issue #756 (Missing automated backup and disaster recovery procedures).

## Backup Strategy

### Backup Types

| Type          | Frequency | Retention | Description                                    |
| ------------- | --------- | --------- | ---------------------------------------------- |
| Database      | Daily     | 30 days   | Full database dump via Supabase CLI or pg_dump |
| Configuration | Daily     | 30 days   | Application configuration files                |
| Documentation | Daily     | 30 days   | Documentation and guides                       |
| Code          | On push   | N/A       | Git repository (hosted on GitHub)              |

### Backup Location

Backups are stored in `/tmp/backups` by default, configurable via `BACKUP_DIR` environment variable.

## Automated Backups

### GitHub Actions Workflow

Automated backups run daily at 2 AM UTC via the `backup.yml` workflow.

**Trigger:** Scheduled cron job or manual dispatch

**Steps:**

1. Checkout repository
2. Install dependencies
3. Run backup script
4. Upload artifacts
5. Cleanup old backups

### Manual Backup

To run a backup manually:

```bash
# Run full backup
./scripts/backup.sh

# Verify backup
./scripts/backup-verify.sh
```

### Environment Variables

| Variable                | Default        | Description                      |
| ----------------------- | -------------- | -------------------------------- |
| `BACKUP_DIR`            | `/tmp/backups` | Directory to store backups       |
| `BACKUP_RETENTION_DAYS` | `30`           | Number of days to retain backups |
| `DATABASE_URL`          | -              | PostgreSQL connection string     |
| `SUPABASE_DB_URL`       | -              | Supabase database URL            |

## Backup Files

### Database Backup

- **File:** `ai-first_YYYYMMDD_HHMMSS_database.sql.gz`
- **Format:** Compressed SQL dump
- **Contents:** Full database schema and data

### Configuration Backup

- **File:** `ai-first_YYYYMMDD_HHMMSS_config.tar.gz`
- **Format:** Compressed tar archive
- **Contents:** Configuration files, workflows, scripts

### Documentation Backup

- **File:** `ai-first_YYYYMMDD_HHMMSS_docs.tar.gz`
- **Format:** Compressed tar archive
- **Contents:** Documentation directory

### Manifest

- **File:** `ai-first_YYYYMMDD_HHMMSS_manifest.json`
- **Format:** JSON
- **Contents:** Backup metadata and file list

## Verification

Backups are automatically verified after creation:

1. **File existence** - All expected files exist
2. **File size** - No empty files
3. **GZIP integrity** - Compressed files are not corrupted
4. **JSON validity** - Manifest is valid JSON
5. **Manifest completeness** - Required fields present

## Retention Management

Backups older than `BACKUP_RETENTION_DAYS` (default: 30 days) are automatically deleted.

## Restoration

### Automated Restoration

Use the restoration script for easy backup restoration:

```bash
# Restore all tables from backup
./scripts/backup-restore.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz

# Restore specific tables
./scripts/backup-restore.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz --tables ideas,tasks

# Dry run (see what would be restored)
./scripts/backup-restore.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz --dry-run

# Restore to specific directory
./scripts/backup-restore.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz --target-dir /tmp/restore
```

### Manual Database Restoration

```bash
# Decompress backup
gunzip ai-first_YYYYMMDD_HHMMSS_database.sql.gz

# Restore to PostgreSQL
psql $DATABASE_URL < ai-first_YYYYMMDD_HHMMSS_database.sql

# Or using Supabase CLI
supabase db push --file ai-first_YYYYMMDD_HHMMSS_database.sql
```

### Configuration Restoration

```bash
# Extract configuration
tar -xzf ai-first_YYYYMMDD_HHMMSS_config.tar.gz

# Copy files back
cp ai-first_YYYYMMDD_HHMMSS_config/* .
```

### Documentation Restoration

```bash
# Extract documentation
tar -xzf ai-first_YYYYMMDD_HHMMSS_docs.tar.gz

# Copy docs back
cp -r ai-first_YYYYMMDD_HHMMSS_docs/docs/* docs/
```

## Monitoring

### Backup Success/Failure

Monitor backup status via:

- GitHub Actions workflow status
- Backup manifest files
- Backup verification script output

### Backup Size Tracking

Check backup sizes:

```bash
ls -lh /tmp/backups/ai-first_*
```

## Cross-Region Backup Replication

For disaster recovery, backups can be replicated to external storage:

### AWS S3 Replication

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Upload backup to S3
aws s3 cp ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz s3://your-backup-bucket/backups/

# Enable versioning for backup retention
aws s3api put-bucket-versioning --bucket your-backup-bucket --versioning-configuration Status=Enabled
```

### Google Cloud Storage Replication

```bash
# Install gsutil
pip install gsutil

# Copy backup to GCS
gsutil cp ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz gs://your-backup-bucket/backups/
```

### Automated Cross-Region Replication

Add to your GitHub Actions workflow:

```yaml
- name: Replicate to external storage
  if: success()
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: |
    # Find latest backup
    LATEST_BACKUP=$(ls -t ./backups/ideaflow_backup_*.tar.gz | head -1)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
      # Upload to S3
      aws s3 cp "$LATEST_BACKUP" s3://your-backup-bucket/backups/
      echo "Backup replicated to S3: $LATEST_BACKUP"
    fi
```

## Best Practices

1. **Regular Verification** - Run `backup-verify.sh` after each backup
2. **Test Restoration** - Periodically test restoration procedures
3. **Monitor Disk Space** - Ensure sufficient storage for backups
4. **Secure Backups** - Protect backup files with appropriate permissions
5. **Document Changes** - Update this document when procedures change
6. **Cross-Region Replication** - Replicate backups to external storage for disaster recovery
7. **Encryption** - Encrypt backups at rest and in transit

## Troubleshooting

### Backup Fails

1. Check environment variables are set
2. Verify database connectivity
3. Check disk space in backup directory
4. Review backup script output for errors

### Restoration Fails

1. Verify backup file integrity
2. Check database permissions
3. Ensure target database exists
4. Review restoration script output

## Related Documentation

- [Disaster Recovery Plan](disaster-recovery.md)
- [Security Procedures](security/SECURITY_VALIDATION.md)
- [Deployment Guide](deploy.md)

## Maintenance

This document should be reviewed and updated:

- After any changes to backup procedures
- When adding new backup types
- When modifying retention policies
- During disaster recovery drills
