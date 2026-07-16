#!/bin/bash
# ==============================================================================
# Backup Monitoring Script for IdeaFlow
# ==============================================================================
# This script monitors backup operations and provides status reporting.
# Can be used in CI/CD pipelines or scheduled monitoring.
#
# Usage:
#   ./scripts/backup-monitor.sh [options]
#
# Options:
#   --check              Check backup status
#   --report             Generate backup report
#   --alert              Send alerts for failures
#   --help               Show this help message
# ==============================================================================

set -euo pipefail

# Default configuration
CHECK_STATUS=false
GENERATE_REPORT=false
SEND_ALERTS=false
BACKUP_DIR="./backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
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
        --check)
            CHECK_STATUS=true
            shift
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --alert)
            SEND_ALERTS=true
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

# Default to check if no option specified
if [[ "$CHECK_STATUS" == "false" && "$GENERATE_REPORT" == "false" && "$SEND_ALERTS" == "false" ]]; then
    CHECK_STATUS=true
fi

# ==============================================================================
# Backup Status Check
# ==============================================================================

check_backup_status() {
    log_info "Checking backup status..."
    
    # Check if backup directory exists
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        return 1
    fi
    
    # Count backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f | wc -l)
    log_info "Found $BACKUP_COUNT backups"
    
    if [[ "$BACKUP_COUNT" -eq 0 ]]; then
        log_warn "No backups found"
        return 1
    fi
    
    # Find latest backup
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
        log_info "Latest backup: $(basename "$LATEST_BACKUP")"
        
        # Check backup age
        BACKUP_TIME=$(stat -c %Y "$LATEST_BACKUP" 2>/dev/null || stat -f %m "$LATEST_BACKUP" 2>/dev/null)
        CURRENT_TIME=$(date +%s)
        AGE_HOURS=$(( (CURRENT_TIME - BACKUP_TIME) / 3600 ))
        
        log_info "Backup age: ${AGE_HOURS} hours"
        
        # Check if backup is too old (> 48 hours)
        if [[ "$AGE_HOURS" -gt 48 ]]; then
            log_warn "Latest backup is older than 48 hours"
            return 1
        fi
        
        # Check backup size
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
        log_info "Backup size: $BACKUP_SIZE"
        
        # Verify backup integrity
        log_info "Verifying backup integrity..."
        if tar -tzf "$LATEST_BACKUP" &>/dev/null; then
            log_info "✓ Backup integrity verified"
        else
            log_error "✗ Backup is corrupted"
            return 1
        fi
        
        # Check metadata
        METADATA_FILE="${LATEST_BACKUP%.*}_metadata.json"
        if [[ -f "$METADATA_FILE" ]]; then
            log_info "✓ Metadata file exists"
            if python3 -m json.tool "$METADATA_FILE" &>/dev/null; then
                log_info "✓ Metadata is valid JSON"
            else
                log_warn "⚠ Metadata is invalid JSON"
            fi
        else
            log_warn "⚠ No metadata file found"
        fi
        
        return 0
    else
        log_error "Could not find latest backup"
        return 1
    fi
}

# ==============================================================================
# Generate Backup Report
# ==============================================================================

generate_report() {
    log_info "Generating backup report..."
    
    # Create report directory
    mkdir -p "./reports"
    
    REPORT_FILE="./reports/backup-report-$(date +%Y%m%d).md"
    
    cat > "$REPORT_FILE" << EOF
# Backup Report - $(date '+%Y-%m-%d %H:%M:%S UTC')

## Summary

- **Total Backups**: $(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f | wc -l)
- **Backup Directory**: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "N/A")
- **Latest Backup**: $(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- | xargs basename 2>/dev/null || echo "N/A")

## Recent Backups

| Backup Name | Date | Size |
|-------------|------|------|
EOF
    
    # Add recent backups to report
    find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -10 | while read -r line; do
        FILE=$(echo "$line" | cut -d' ' -f2-)
        DATE=$(stat -c %y "$FILE" 2>/dev/null | cut -d'.' -f1 || stat -f %Sm "$FILE" 2>/dev/null | cut -d'.' -f1)
        SIZE=$(du -h "$FILE" | cut -f1)
        NAME=$(basename "$FILE")
        echo "| $NAME | $DATE | $SIZE |" >> "$REPORT_FILE"
    done
    
    cat >> "$REPORT_FILE" << EOF

## Backup Health

- **Oldest Backup**: $(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | head -1 | cut -d' ' -f2- | xargs basename 2>/dev/null || echo "N/A")
- **Newest Backup**: $(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- | xargs basename 2>/dev/null || echo "N/A")

## Recommendations

1. Ensure backups are running daily
2. Verify backup integrity regularly
3. Test restoration procedures monthly
4. Monitor backup storage usage

---

*Generated by backup-monitor.sh*
EOF
    
    log_info "Report generated: $REPORT_FILE"
}

# ==============================================================================
# Send Alerts
# ==============================================================================

send_alerts() {
    log_info "Checking for backup issues..."
    
    ALERTS=()
    
    # Check if backup directory exists
    if [[ ! -d "$BACKUP_DIR" ]]; then
        ALERTS+=("CRITICAL: Backup directory not found")
    fi
    
    # Check backup count
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f 2>/dev/null | wc -l)
    if [[ "$BACKUP_COUNT" -eq 0 ]]; then
        ALERTS+=("CRITICAL: No backups found")
    fi
    
    # Check latest backup age
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "ideaflow_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
        BACKUP_TIME=$(stat -c %Y "$LATEST_BACKUP" 2>/dev/null || stat -f %m "$LATEST_BACKUP" 2>/dev/null)
        CURRENT_TIME=$(date +%s)
        AGE_HOURS=$(( (CURRENT_TIME - BACKUP_TIME) / 3600 ))
        
        if [[ "$AGE_HOURS" -gt 48 ]]; then
            ALERTS+=("WARNING: Latest backup is ${AGE_HOURS} hours old")
        fi
        
        # Check backup integrity
        if ! tar -tzf "$LATEST_BACKUP" &>/dev/null; then
            ALERTS+=("CRITICAL: Latest backup is corrupted")
        fi
    fi
    
    # Send alerts if any issues found
    if [[ ${#ALERTS[@]} -gt 0 ]]; then
        log_warn "Found ${#ALERTS[@]} issues:"
        for alert in "${ALERTS[@]}"; do
            log_warn "  - $alert"
        done
        
        # Here you would integrate with your alerting system
        # Examples:
        # - Slack webhook
        # - Email notification
        # - PagerDuty
        # - GitHub Issues
        
        return 1
    else
        log_info "No backup issues found"
        return 0
    fi
}

# ==============================================================================
# Main Execution
# ==============================================================================

log_info "Backup Monitor starting..."
log_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S UTC')"

# Run checks
if [[ "$CHECK_STATUS" == "true" ]]; then
    check_backup_status
fi

# Generate report
if [[ "$GENERATE_REPORT" == "true" ]]; then
    generate_report
fi

# Send alerts
if [[ "$SEND_ALERTS" == "true" ]]; then
    send_alerts
fi

log_info "Backup monitor completed"
