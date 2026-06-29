#!/bin/bash
# ==============================================================================
# Backup Verification Script for IdeaFlow
# ==============================================================================
# This script verifies the integrity and restorability of database backups.
#
# Usage:
#   ./scripts/backup-verify.sh --backup BACKUP_PATH
#
# Options:
#   --backup PATH       Path to backup file (required)
#   --test-restore      Perform a test restore to verify data integrity
#   --help              Show this help message
# ==============================================================================

set -euo pipefail

# Default configuration
BACKUP_PATH=""
TEST_RESTORE=false

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
        --backup)
            BACKUP_PATH="$2"
            shift 2
            ;;
        --test-restore)
            TEST_RESTORE=true
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

if [[ -z "$BACKUP_PATH" ]]; then
    log_error "Backup path is required. Use --backup PATH"
    exit 1
fi

if [[ ! -f "$BACKUP_PATH" ]]; then
    log_error "Backup file not found: ${BACKUP_PATH}"
    exit 1
fi

# ==============================================================================
# Verification Steps
# ==============================================================================

log_info "Starting backup verification: ${BACKUP_PATH}"
VERIFICATION_PASSED=true

# Step 1: Check file exists and is readable
log_info "Step 1: Checking file accessibility..."
if [[ -r "$BACKUP_PATH" ]]; then
    log_info "✓ File is readable"
else
    log_error "✗ File is not readable"
    VERIFICATION_PASSED=false
fi

# Step 2: Check file size
log_info "Step 2: Checking file size..."
FILE_SIZE=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || stat -c%s "$BACKUP_PATH" 2>/dev/null || echo "0")
if [[ "$FILE_SIZE" -gt 0 ]]; then
    log_info "✓ File size: ${FILE_SIZE} bytes"
else
    log_error "✗ File is empty"
    VERIFICATION_PASSED=false
fi

# Step 3: Check file integrity (if compressed)
log_info "Step 3: Checking file integrity..."
if [[ "$BACKUP_PATH" == *.tar.gz ]]; then
    if tar -tzf "$BACKUP_PATH" &>/dev/null; then
        log_info "✓ Archive integrity verified"
        
        # List contents
        log_info "Archive contents:"
        tar -tzf "$BACKUP_PATH" | head -20
    else
        log_error "✗ Archive is corrupted"
        VERIFICATION_PASSED=false
    fi
elif [[ "$BACKUP_PATH" == *.sql ]]; then
    # Check SQL file has content
    if [[ -s "$BACKUP_PATH" ]]; then
        log_info "✓ SQL file has content"
    else
        log_error "✗ SQL file is empty"
        VERIFICATION_PASSED=false
    fi
elif [[ "$BACKUP_PATH" == *.json ]]; then
    # Validate JSON
    if python3 -m json.tool "$BACKUP_PATH" &>/dev/null; then
        log_info "✓ JSON file is valid"
    else
        log_error "✗ JSON file is invalid"
        VERIFICATION_PASSED=false
    fi
fi

# Step 4: Check metadata (if exists)
log_info "Step 4: Checking metadata..."
METADATA_FILE="${BACKUP_PATH%.*}_metadata.json"
if [[ -f "$METADATA_FILE" ]]; then
    if python3 -m json.tool "$METADATA_FILE" &>/dev/null; then
        log_info "✓ Metadata is valid JSON"
        
        # Extract key info
        BACKUP_NAME=$(python3 -c "import json; print(json.load(open('$METADATA_FILE')).get('backup_name', 'unknown'))" 2>/dev/null || echo "unknown")
        BACKUP_DATE=$(python3 -c "import json; print(json.load(open('$METADATA_FILE')).get('timestamp', 'unknown'))" 2>/dev/null || echo "unknown")
        log_info "  Backup name: ${BACKUP_NAME}"
        log_info "  Backup date: ${BACKUP_DATE}"
    else
        log_warn "⚠ Metadata file is invalid JSON"
    fi
else
    log_warn "⚠ No metadata file found"
fi

# Step 5: Test restore (optional)
if [[ "$TEST_RESTORE" == "true" ]]; then
    log_info "Step 5: Testing restore..."
    
    # Create temporary directory for test restore
    TEMP_DIR=$(mktemp -d)
    
    if [[ "$BACKUP_PATH" == *.tar.gz ]]; then
        # Extract to temp directory
        if tar -xzf "$BACKUP_PATH" -C "$TEMP_DIR" 2>/dev/null; then
            log_info "✓ Extracted successfully to ${TEMP_DIR}"
            
            # Check extracted files
            EXTRACTED_FILES=$(find "$TEMP_DIR" -type f | wc -l)
            log_info "  Extracted files: ${EXTRACTED_FILES}"
            
            # Verify table exports
            for file in "$TEMP_DIR"/*.json; do
                if [[ -f "$file" ]]; then
                    if python3 -m json.tool "$file" &>/dev/null; then
                        log_info "  ✓ $(basename "$file") is valid JSON"
                    else
                        log_warn "  ⚠ $(basename "$file") is invalid JSON"
                    fi
                fi
            done
        else
            log_error "✗ Failed to extract archive"
            VERIFICATION_PASSED=false
        fi
    fi
    
    # Cleanup
    rm -rf "$TEMP_DIR"
fi

# ==============================================================================
# Summary
# ==============================================================================

log_info "=========================================="
log_info "Verification Summary"
log_info "=========================================="

if [[ "$VERIFICATION_PASSED" == "true" ]]; then
    log_info "✓ Backup verification PASSED"
    log_info "=========================================="
    exit 0
else
    log_error "✗ Backup verification FAILED"
    log_info "=========================================="
    exit 1
fi
