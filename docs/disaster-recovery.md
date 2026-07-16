# Disaster Recovery Plan for IdeaFlow

## Overview

This document outlines the disaster recovery procedures for IdeaFlow, including backup strategies, recovery procedures, and emergency protocols.

**Last Updated**: 2026-07-16  
**Version**: 2.0.0  
**Owner**: DevOps Team

## Recovery Objectives

| Metric                             | Target   | Description                  |
| ---------------------------------- | -------- | ---------------------------- |
| **RTO** (Recovery Time Objective)  | 4 hours  | Maximum acceptable downtime  |
| **RPO** (Recovery Point Objective) | 24 hours | Maximum acceptable data loss |

## Backup Strategy

### 1. Automated Backup System (Primary)

**Implementation**: GitHub Actions workflow (`.github/workflows/backup.yml`)

#### Daily Backups

- **Schedule**: Daily at 02:00 UTC via GitHub Actions cron
- **Retention**: 30 days (configurable)
- **Storage**: GitHub Actions artifacts
- **Verification**: Automated integrity checks after each backup
- **Monitoring**: Automated status reporting

#### Backup Process

1. **Database Export**: Exports critical tables via Supabase REST API
   - ideas, deliverables, tasks, vectors
   - clarification_sessions, clarification_answers
   - agent_logs
2. **Schema Export**: Database schema via Supabase CLI (when available)
3. **Compression**: Creates compressed archive (`.tar.gz`)
4. **Metadata**: Generates backup metadata with timestamps
5. **Retention**: Automatically cleans up backups older than retention period

#### Backup Files Structure

```
backups/
├── ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz          # Compressed archive
├── ideaflow_backup_YYYYMMDD_HHMMSS_metadata.json   # Backup metadata
├── ideaflow_backup_YYYYMMDD_HHMMSS_ideas.json      # Ideas table export
├── ideaflow_backup_YYYYMMDD_HHMMSS_deliverables.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_tasks.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_vectors.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_clarification_sessions.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_clarification_answers.json
└── ideaflow_backup_YYYYMMDD_HHMMSS_agent_logs.json
```

### 2. Manual Backups

#### When to Run Manual Backups

- Before major deployments
- Before schema migrations
- Upon developer request
- Before critical changes

#### Manual Backup Commands

```bash
# Full backup with verification
./scripts/backup.sh --verify

# Backup with custom retention
./scripts/backup.sh --retention 60

# Backup to specific directory
./scripts/backup.sh --output-dir /path/to/backups

# Backup with verification and custom retention
./scripts/backup.sh --verify --retention 90 --output-dir /secure/backups
```

### 3. Backup Verification

#### Automated Verification

- **Post-backup**: Every backup is automatically verified
- **Integrity checks**: Archive integrity, file size, metadata validation
- **Test restore**: Optional test restore to verify data integrity

#### Manual Verification

```bash
# Verify backup integrity
./scripts/backup-verify.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz

# Verify with test restore
./scripts/backup-verify.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz --test-restore
```

### 4. Application State Backups

#### Configuration Files

- Environment variables (excluding secrets)
- Database schema
- Application configuration

#### User Data

- Ideas and deliverables
- Task data
- Clarification sessions

### 5. Code Repository

#### Git Backups

- All code is version controlled
- Multiple remote copies (GitHub)
- Branch protection rules enabled

## Backup Monitoring

### Monitoring Script

```bash
# Check backup status
./scripts/backup-monitor.sh --check

# Generate backup report
./scripts/backup-monitor.sh --report

# Check for issues and send alerts
./scripts/backup-monitor.sh --alert
```

### Monitoring Checklist

- [ ] Daily backup completion
- [ ] Backup integrity verification
- [ ] Backup size monitoring
- [ ] Retention policy enforcement
- [ ] Alert for failures

### Alert Conditions

| Condition             | Severity | Action                       |
| --------------------- | -------- | ---------------------------- |
| No backups found      | CRITICAL | Immediate investigation      |
| Backup > 48 hours old | WARNING  | Check backup workflow        |
| Backup corrupted      | CRITICAL | Restore from previous backup |
| Backup size anomaly   | WARNING  | Investigate data changes     |

## Recovery Procedures

### Scenario 1: Database Corruption

**Symptoms**:

- Data inconsistency errors
- Missing records
- Application errors

**Recovery Steps**:

1. **Identify the issue**

   ```bash
   # Check database health
   curl https://your-project.supabase.co/rest/v1/ideas?select=count

   # Review application logs
   # Check for error patterns
   ```

2. **Restore from backup**

   ```bash
   # List available backups
   ls -la backups/ideaflow_backup_*.tar.gz

   # Restore specific tables
   # Extract backup
   tar -xzf backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp/restore

   # Use Supabase dashboard to import data
   # Or use Supabase CLI for restoration
   ```

3. **Verify restoration**
   ```bash
   # Check data integrity
   # Run application tests
   npm test
   ```

### Scenario 2: Complete Data Loss

**Symptoms**:

- All data missing
- Database unreachable
- Service completely down

**Recovery Steps**:

1. **Assess the situation**
   - Check Supabase status page
   - Verify network connectivity
   - Check environment variables

2. **Restore from latest backup**

   ```bash
   # Find latest backup
   LATEST=$(ls -t backups/ideaflow_backup_*.tar.gz | head -1)

   # Restore
   ./scripts/backup-verify.sh --backup "$LATEST" --test-restore
   ```

3. **Reconfigure application**
   - Verify environment variables
   - Test database connection
   - Run health checks

4. **Verify recovery**
   ```bash
   # Run full test suite
   npm run check

   # Verify API endpoints
   curl https://your-app.vercel.app/api/health
   ```

### Scenario 3: Service Outage

**Symptoms**:

- Application unreachable
- API returning errors
- Timeout errors

**Recovery Steps**:

1. **Check service status**
   - Supabase status: https://status.supabase.com
   - Vercel status: https://www.vercel-status.com
   - GitHub status: https://www.githubstatus.com

2. **Failover procedures**
   - If Supabase is down, check for cached data
   - If Vercel is down, check for alternative deployment
   - If GitHub is down, use local backups

3. **Communication**
   - Notify stakeholders
   - Update status page
   - Document incident

## Emergency Contacts

| Role           | Contact | Responsibility        |
| -------------- | ------- | --------------------- |
| Database Admin | @cpa03  | Database recovery     |
| DevOps Lead    | @cpa03  | Infrastructure issues |
| Security Lead  | @cpa03  | Security incidents    |

## Incident Response

### 1. Detection

- Automated monitoring alerts
- User reports
- Internal discovery

### 2. Assessment

- Impact evaluation
- Root cause analysis
- Recovery priority

### 3. Recovery

- Execute appropriate recovery procedure
- Verify system stability
- Document actions taken

### 4. Post-Incident

- Conduct post-mortem
- Update procedures
- Implement preventive measures

## Testing Recovery Procedures

### Monthly Drills

- Test backup restoration
- Verify recovery procedures
- Update documentation

### Quarterly Reviews

- Review backup retention
- Update contact information
- Assess RTO/RPO targets

## Compliance

### Data Protection

- Regular backup verification
- Encrypted backup storage
- Access control for backup data

### Audit Trail

- Log all backup operations
- Track restoration attempts
- Document recovery procedures

## Appendices

### Environment Variables Required

```bash
# Required for backup operations
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
BACKUP_RETENTION_DAYS=30
BACKUP_OUTPUT_DIR=./backups
```

### Backup File Structure

```
backups/
├── ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz
├── ideaflow_backup_YYYYMMDD_HHMMSS_metadata.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_ideas.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_deliverables.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_tasks.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_vectors.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_clarification_sessions.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_clarification_answers.json
└── ideaflow_backup_YYYYMMDD_HHMMSS_agent_logs.json
```

### Recovery Time Estimates

| Scenario            | Estimated Time | Priority |
| ------------------- | -------------- | -------- |
| Database corruption | 1-2 hours      | HIGH     |
| Complete data loss  | 2-4 hours      | CRITICAL |
| Service outage      | 1-4 hours      | HIGH     |
| Configuration loss  | 30 minutes     | MEDIUM   |

### Backup Schedule

| Backup Type    | Frequency       | Retention | Storage          |
| -------------- | --------------- | --------- | ---------------- |
| Automated      | Daily 02:00 UTC | 30 days   | GitHub Artifacts |
| Manual         | As needed       | 90 days   | Local + External |
| Pre-deployment | Before deploys  | 7 days    | Local            |

---

**Last Updated**: 2026-07-16  
**Version**: 2.0.0  
**Owner**: DevOps Team

## Backup Procedures

### Running Manual Backup

```bash
# Full backup with verification
./scripts/backup.sh --verify

# Backup with custom retention
./scripts/backup.sh --retention 60

# Backup to specific directory
./scripts/backup.sh --output-dir /path/to/backups
```

### Verifying Backups

```bash
# Verify backup integrity
./scripts/backup-verify.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz

# Verify with test restore
./scripts/backup-verify.sh --backup ./backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz --test-restore
```

## Recovery Procedures

### Scenario 1: Database Corruption

**Symptoms**:

- Data inconsistency errors
- Missing records
- Application errors

**Recovery Steps**:

1. **Identify the issue**

   ```bash
   # Check database health
   curl https://your-project.supabase.co/rest/v1/ideas?select=count

   # Review application logs
   # Check for error patterns
   ```

2. **Restore from backup**

   ```bash
   # List available backups
   ls -la backups/ideaflow_backup_*.tar.gz

   # Restore specific tables
   # Extract backup
   tar -xzf backups/ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp/restore

   # Use Supabase dashboard to import data
   # Or use Supabase CLI for restoration
   ```

3. **Verify restoration**
   ```bash
   # Check data integrity
   # Run application tests
   npm test
   ```

### Scenario 2: Complete Data Loss

**Symptoms**:

- All data missing
- Database unreachable
- Service completely down

**Recovery Steps**:

1. **Assess the situation**
   - Check Supabase status page
   - Verify network connectivity
   - Check environment variables

2. **Restore from latest backup**

   ```bash
   # Find latest backup
   LATEST=$(ls -t backups/ideaflow_backup_*.tar.gz | head -1)

   # Restore
   ./scripts/backup-verify.sh --backup "$LATEST" --test-restore
   ```

3. **Reconfigure application**
   - Verify environment variables
   - Test database connection
   - Run health checks

4. **Verify recovery**
   ```bash
   # Run full test suite
   npm run check

   # Verify API endpoints
   curl https://your-app.vercel.app/api/health
   ```

### Scenario 3: Service Outage

**Symptoms**:

- Application unreachable
- API returning errors
- Timeout errors

**Recovery Steps**:

1. **Check service status**
   - Supabase status: https://status.supabase.com
   - Vercel status: https://www.vercel-status.com
   - GitHub status: https://www.githubstatus.com

2. **Failover procedures**
   - If Supabase is down, check for cached data
   - If Vercel is down, check for alternative deployment
   - If GitHub is down, use local backups

3. **Communication**
   - Notify stakeholders
   - Update status page
   - Document incident

## Emergency Contacts

| Role           | Contact | Responsibility        |
| -------------- | ------- | --------------------- |
| Database Admin | @cpa03  | Database recovery     |
| DevOps Lead    | @cpa03  | Infrastructure issues |
| Security Lead  | @cpa03  | Security incidents    |

## Incident Response

### 1. Detection

- Automated monitoring alerts
- User reports
- Internal discovery

### 2. Assessment

- Impact evaluation
- Root cause analysis
- Recovery priority

### 3. Recovery

- Execute appropriate recovery procedure
- Verify system stability
- Document actions taken

### 4. Post-Incident

- Conduct post-mortem
- Update procedures
- Implement preventive measures

## Testing Recovery Procedures

### Monthly Drills

- Test backup restoration
- Verify recovery procedures
- Update documentation

### Quarterly Reviews

- Review backup retention
- Update contact information
- Assess RTO/RPO targets

## Compliance

### Data Protection

- Regular backup verification
- Encrypted backup storage
- Access control for backup data

### Audit Trail

- Log all backup operations
- Track restoration attempts
- Document recovery procedures

## Appendices

### Backup File Structure

```
backups/
├── ideaflow_backup_YYYYMMDD_HHMMSS.tar.gz
├── ideaflow_backup_YYYYMMDD_HHMMSS_metadata.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_ideas.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_deliverables.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_tasks.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_vectors.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_clarification_sessions.json
├── ideaflow_backup_YYYYMMDD_HHMMSS_clarification_answers.json
└── ideaflow_backup_YYYYMMDD_HHMMSS_agent_logs.json
```

### Environment Variables Required

```bash
# Required for backup operations
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
BACKUP_RETENTION_DAYS=30
BACKUP_OUTPUT_DIR=./backups
```

---

**Last Updated**: 2026-06-29
**Version**: 1.0.0
**Owner**: DevOps Team
