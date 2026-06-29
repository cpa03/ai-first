#!/bin/bash
# ==============================================================================
# Automated Database Backup Script for IdeaFlow
# ==============================================================================
# This script creates automated backups of the Supabase database.
# Run via GitHub Actions cron or manually for disaster recovery.
#
# Usage:
#   ./scripts/backup.sh [options]
#
# Options:
#   --output-dir DIR    Directory to store backups (default: ./backups)
#   --retention DAYS    Number of days to keep backups (default: 30)
#   --verify            Run verification after backup
#   --help              Show this help message
# ==============================================================================

set -euo pipefail

# Default configuration
OUTPUT_DIR="./backups"
RETENTION_DAYS=30
VERIFY=false
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="ideaflow_backup_${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==============================================================================
# Helper Functions
# ==============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    head -20 "$0" | tail -15
    exit 0
}

# ==============================================================================
# Parse Arguments
# ==============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        --verify)
            VERIFY=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ==============================================================================
# Validation
# ==============================================================================

# Check required environment variables
if [[ -z "${SUPABASE_URL:-}" ]]; then
    log_error "SUPABASE_URL environment variable is not set"
    exit 1
fi

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
    log_error "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# ==============================================================================
# Database Backup
# ==============================================================================

log_info "Starting database backup: ${BACKUP_NAME}"

# Create backup metadata
cat > "${OUTPUT_DIR}/${BACKUP_NAME}_metadata.json" << EOF
{
    "backup_name": "${BACKUP_NAME}",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "supabase_url": "${SUPABASE_URL}",
    "retention_days": ${RETENTION_DAYS},
    "backup_type": "database",
    "version": "1.0.0"
}
EOF

# Export database schema using Supabase Management API
# Note: This requires the Supabase CLI or direct API access
if command -v supabase &> /dev/null; then
    log_info "Using Supabase CLI for backup"
    supabase db dump --db-url "${SUPABASE_URL}" > "${OUTPUT_DIR}/${BACKUP_NAME}_schema.sql" 2>&1 || {
        log_warn "Supabase CLI dump failed, using API fallback"
    }
fi

# API-based backup using Supabase REST API
# This exports data from critical tables
log_info "Exporting data from critical tables..."

# List of critical tables to backup
TABLES=("ideas" "deliverables" "tasks" "vectors" "clarification_sessions" "clarification_answers" "agent_logs")

for table in "${TABLES[@]}"; do
    log_info "Exporting table: ${table}"
    curl -s \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        "${SUPABASE_URL}/rest/v1/${table}?select=*" \
        > "${OUTPUT_DIR}/${BACKUP_NAME}_${table}.json" 2>/dev/null || {
            log_warn "Failed to export table: ${table}"
        }
done

# Create compressed archive
log_info "Creating compressed archive..."
tar -czf "${OUTPUT_DIR}/${BACKUP_NAME}.tar.gz" \
    -C "$OUTPUT_DIR" \
    $(ls "${OUTPUT_DIR}/${BACKUP_NAME}"* 2>/dev/null | xargs -n1 basename) 2>/dev/null || {
    log_warn "Failed to create archive"
}

# Calculate backup size
BACKUP_SIZE=$(du -sh "${OUTPUT_DIR}/${BACKUP_NAME}.tar.gz" 2>/dev/null | cut -f1 || echo "unknown")
log_info "Backup completed: ${BACKUP_NAME} (${BACKUP_SIZE})"

# ==============================================================================
# Retention Cleanup
# ==============================================================================

log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

find "$OUTPUT_DIR" -name "ideaflow_backup_*" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

REMAINING=$(find "$OUTPUT_DIR" -name "ideaflow_backup_*" -type f | wc -l)
log_info "Remaining backups: ${REMAINING}"

# ==============================================================================
# Verification (Optional)
# ==============================================================================

if [[ "$VERIFY" == "true" ]]; then
    log_info "Running backup verification..."
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [[ -x "${SCRIPT_DIR}/backup-verify.sh" ]]; then
        "${SCRIPT_DIR}/backup-verify.sh" --backup "${OUTPUT_DIR}/${BACKUP_NAME}"
    else
        log_warn "Verification script not found or not executable"
    fi
fi

# ==============================================================================
# Summary
# ==============================================================================

log_info "=========================================="
log_info "Backup Summary"
log_info "=========================================="
log_info "Backup Name: ${BACKUP_NAME}"
log_info "Location: ${OUTPUT_DIR}"
log_info "Size: ${BACKUP_SIZE}"
log_info "Retention: ${RETENTION_DAYS} days"
log_info "=========================================="

echo "${OUTPUT_DIR}/${BACKUP_NAME}.tar.gz"
