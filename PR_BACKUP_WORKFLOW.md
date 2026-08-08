# Fix: Add Automated Backup Workflow

## Issue

Closes #756

## Problem

The backup scripts exist (`scripts/backup.sh`, `scripts/backup-verify.sh`, `scripts/backup-monitor.sh`) but there's no GitHub Actions workflow to run them automatically on a schedule.

## Solution

This PR adds a GitHub Actions workflow (`.github/workflows/backup.yml`) that automates:

1. **Daily Database Backups** - Runs at 02:00 UTC
2. **Weekly Backup Verification** - Runs on Sundays at 03:00 UTC
3. **Backup Monitoring** - Checks health and generates reports

## Workflow Structure

```yaml
jobs:
  backup:        # Daily database backup
  verify:        # Weekly backup verification
  monitor:       # Backup health checks
```

## Required Secrets

Add these secrets to your repository settings:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## Manual Workflow Creation

Due to GitHub App permission restrictions, the workflow file needs to be created manually:

1. Copy the workflow content from `backup.yml` (provided below)
2. Create `.github/workflows/backup.yml` in your repository
3. Commit and push to main

## Workflow Content

```yaml
name: Automated Backup

on:
  schedule:
    - cron: "0 2 * * *"      # Daily at 02:00 UTC
    - cron: "0 3 * * 0"      # Weekly on Sunday at 03:00 UTC
  workflow_dispatch:
    inputs:
      backup_type:
        description: "Backup type (full/verify)"
        required: false
        default: "full"
        type: choice
        options:
          - full
          - verify

permissions:
  contents: write
  actions: read

env:
  BACKUP_RETENTION_DAYS: 30

jobs:
  backup:
    name: "Database Backup"
    runs-on: ubuntu-latest
    if: >-
      github.event_name == 'schedule' && github.event.schedule == '0 2 * * *' ||
      github.event_name == 'workflow_dispatch' && github.event.inputs.backup_type == 'full'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Make backup scripts executable
        run: chmod +x scripts/backup*.sh

      - name: Run database backup
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          echo "Starting automated database backup..."
          ./scripts/backup.sh --output-dir ./backups --retention ${{ env.BACKUP_RETENTION_DAYS }} --verify

      - name: Upload backup artifact
        uses: actions/upload-artifact@v4
        with:
          name: backup-${{ github.run_id }}
          path: backups/
          retention-days: 7
          if-no-files-found: warn

      - name: Backup summary
        if: always()
        run: |
          echo "## Backup Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- **Trigger**: ${{ github.event_name }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Run ID**: ${{ github.run_id }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Timestamp**: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $GITHUB_STEP_SUMMARY
          echo "- **Retention**: ${{ env.BACKUP_RETENTION_DAYS }} days" >> $GITHUB_STEP_SUMMARY

  verify:
    name: "Backup Verification"
    runs-on: ubuntu-latest
    if: >-
      github.event_name == 'schedule' && github.event.schedule == '0 3 * * 0' ||
      github.event_name == 'workflow_dispatch' && github.event.inputs.backup_type == 'verify'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Make backup scripts executable
        run: chmod +x scripts/backup*.sh

      - name: Download latest backup
        uses: actions/download-artifact@v4
        with:
          name: backup-*
          path: backups/
        continue-on-error: true

      - name: Run backup verification
        run: |
          echo "Starting backup verification..."
          
          LATEST_BACKUP=$(find ./backups -name "ideaflow_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
          
          if [[ -z "$LATEST_BACKUP" ]]; then
            echo "No backup found to verify"
            echo "### Verification Result" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "No backup found to verify" >> $GITHUB_STEP_SUMMARY
            exit 0
          fi
          
          echo "Verifying backup: $LATEST_BACKUP"
          ./scripts/backup-verify.sh --backup "$LATEST_BACKUP" --test-restore

      - name: Verification summary
        if: always()
        run: |
          echo "## Verification Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- **Trigger**: ${{ github.event_name }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Run ID**: ${{ github.run_id }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Timestamp**: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $GITHUB_STEP_SUMMARY

  monitor:
    name: "Backup Health Check"
    runs-on: ubuntu-latest
    needs: [backup]
    if: success() || failure()
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Make backup scripts executable
        run: chmod +x scripts/backup*.sh

      - name: Check backup health
        run: |
          echo "Running backup health check..."
          ./scripts/backup-monitor.sh --check

      - name: Generate backup report
        run: |
          ./scripts/backup-monitor.sh --report

      - name: Upload report artifact
        uses: actions/upload-artifact@v4
        with:
          name: backup-report-${{ github.run_id }}
          path: reports/
          retention-days: 30
          if-no-files-found: warn

      - name: Alert on failure
        if: failure()
        run: |
          echo "## Backup Alert" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "The backup workflow encountered issues." >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### Recommended Actions" >> $GITHUB_STEP_SUMMARY
          echo "1. Check the backup logs for errors" >> $GITHUB_STEP_SUMMARY
          echo "2. Verify Supabase credentials are valid" >> $GITHUB_STEP_SUMMARY
          echo "3. Manual backup: \`npm run backup\`" >> $GITHUB_STEP_SUMMARY
```

## Testing

After creating the workflow:

1. Go to Actions → Automated Backup
2. Click "Run workflow"
3. Select "full" for backup type
4. Verify the backup completes successfully

## Related Documentation

- [Disaster Recovery Plan](docs/disaster-recovery.md)
- [Backup Scripts](scripts/backup.sh)
