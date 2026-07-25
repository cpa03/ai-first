#!/bin/bash
# ==============================================================================
# Backup Restoration Test Script for IdeaFlow
# ==============================================================================
# This script tests backup restoration procedures to ensure recoverability.
# Should be run monthly as part of disaster recovery testing.
#
# Usage:
#   ./scripts/backup-restore-test.sh [options]
#
# Options:
#   --backup PATH       Path to backup file (optional, uses latest if not specified)
#   --test-dir DIR      Directory for test restore (default: /tmp/restore-test)
#   --help              Show this help message
# ==============================================================================

set -euo pipefail

# Default configuration
BACKUP_PATH=""
TEST_DIR="/tmp/restore-test"
BACKUP_DIR="./backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

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

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

show_help() {
    head -20 "$0" | tail -15
    exit 0
}

pass_test() {
    local test_name="$1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}  ✓ PASS: ${test_name}${NC}"
}

fail_test() {
    local test_name="$1"
    local reason="$2"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}  ✗ FAIL: ${test_name} - ${reason}${NC}"
}

skip_test() {
    local test_name="$1"
    local reason="$2"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    echo -e "${YELLOW}  ⊘ SKIP: ${test_name} - ${reason}${NC}"
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
        --test-dir)
            TEST_DIR="$2"
            shift 2
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
# Find Backup
# ==============================================================================

if [[ -z "$BACKUP_PATH" ]]; then
    log_info "No backup specified, finding latest..."
    BACKUP_PATH=$(ls -t "$BACKUP_DIR"/ideaflow_backup_*.tar.gz 2>/dev/null | head -1)
    
    if [[ -z "$BACKUP_PATH" ]]; then
        log_error "No backups found in $BACKUP_DIR"
        exit 1
    fi
    
    log_info "Using latest backup: $(basename "$BACKUP_PATH")"
fi

if [[ ! -f "$BACKUP_PATH" ]]; then
    log_error "Backup file not found: $BACKUP_PATH"
    exit 1
fi

# ==============================================================================
# Test 1: Backup File Accessibility
# ==============================================================================

log_test "Test 1: Backup file accessibility"

if [[ -r "$BACKUP_PATH" ]]; then
    pass_test "Backup file is readable"
else
    fail_test "Backup file is readable" "File is not readable"
fi

FILE_SIZE=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || stat -c%s "$BACKUP_PATH" 2>/dev/null || echo "0")
if [[ "$FILE_SIZE" -gt 0 ]]; then
    pass_test "Backup file has content (${FILE_SIZE} bytes)"
else
    fail_test "Backup file has content" "File is empty"
fi

# ==============================================================================
# Test 2: Archive Integrity
# ==============================================================================

log_test "Test 2: Archive integrity"

if [[ "$BACKUP_PATH" == *.tar.gz ]]; then
    if tar -tzf "$BACKUP_PATH" &>/dev/null; then
        pass_test "Archive integrity verified"
        
        # Count files in archive
        FILE_COUNT=$(tar -tzf "$BACKUP_PATH" | wc -l)
        log_info "Archive contains ${FILE_COUNT} files"
    else
        fail_test "Archive integrity" "Archive is corrupted"
    fi
else
    skip_test "Archive integrity" "Not a tar.gz file"
fi

# ==============================================================================
# Test 3: Extraction
# ==============================================================================

log_test "Test 3: Archive extraction"

# Clean up test directory
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

if [[ "$BACKUP_PATH" == *.tar.gz ]]; then
    if tar -xzf "$BACKUP_PATH" -C "$TEST_DIR" 2>/dev/null; then
        pass_test "Archive extraction successful"
        
        # List extracted files
        log_info "Extracted files:"
        ls -la "$TEST_DIR" | head -10
    else
        fail_test "Archive extraction" "Failed to extract archive"
    fi
else
    skip_test "Archive extraction" "Not a tar.gz file"
fi

# ==============================================================================
# Test 4: Data File Validation
# ==============================================================================

log_test "Test 4: Data file validation"

# Check for table export files
TABLES=("ideas" "deliverables" "tasks" "vectors" "clarification_sessions" "clarification_answers" "agent_logs")

for table in "${TABLES[@]}"; do
    TABLE_FILE=$(find "$TEST_DIR" -name "*_${table}.json" -type f 2>/dev/null | head -1)
    
    if [[ -n "$TABLE_FILE" ]]; then
        # Validate JSON
        if python3 -m json.tool "$TABLE_FILE" &>/dev/null; then
            # Count records
            RECORD_COUNT=$(python3 -c "import json; print(len(json.load(open('$TABLE_FILE'))))" 2>/dev/null || echo "0")
            pass_test "Table ${table} exported (${RECORD_COUNT} records)"
        else
            fail_test "Table ${table} JSON validation" "Invalid JSON"
        fi
    else
        skip_test "Table ${table}" "No export file found"
    fi
done

# ==============================================================================
# Test 5: Metadata Validation
# ==============================================================================

log_test "Test 5: Metadata validation"

METADATA_FILE=$(find "$TEST_DIR" -name "*_metadata.json" -type f 2>/dev/null | head -1)

if [[ -n "$METADATA_FILE" ]]; then
    if python3 -m json.tool "$METADATA_FILE" &>/dev/null; then
        pass_test "Metadata is valid JSON"
        
        # Extract key metadata
        BACKUP_NAME=$(python3 -c "import json; print(json.load(open('$METADATA_FILE')).get('backup_name', 'unknown'))" 2>/dev/null || echo "unknown")
        BACKUP_DATE=$(python3 -c "import json; print(json.load(open('$METADATA_FILE')).get('timestamp', 'unknown'))" 2>/dev/null || echo "unknown")
        
        log_info "  Backup name: ${BACKUP_NAME}"
        log_info "  Backup date: ${BACKUP_DATE}"
    else
        fail_test "Metadata validation" "Invalid JSON"
    fi
else
    skip_test "Metadata validation" "No metadata file found"
fi

# ==============================================================================
# Test 6: Schema Validation (if present)
# ==============================================================================

log_test "Test 6: Schema validation"

SCHEMA_FILE=$(find "$TEST_DIR" -name "*_schema.sql" -type f 2>/dev/null | head -1)

if [[ -n "$SCHEMA_FILE" ]]; then
    if [[ -s "$SCHEMA_FILE" ]]; then
        pass_test "Schema file has content"
        
        # Count SQL statements
        SQL_COUNT=$(grep -c ";" "$SCHEMA_FILE" || echo "0")
        log_info "  Schema contains ${SQL_COUNT} SQL statements"
    else
        fail_test "Schema validation" "Schema file is empty"
    fi
else
    skip_test "Schema validation" "No schema file found"
fi

# ==============================================================================
# Test 7: Data Integrity Check
# ==============================================================================

log_test "Test 7: Data integrity check"

# Check if any table has data
HAS_DATA=false

for table in "${TABLES[@]}"; do
    TABLE_FILE=$(find "$TEST_DIR" -name "*_${table}.json" -type f 2>/dev/null | head -1)
    
    if [[ -n "$TABLE_FILE" ]]; then
        RECORD_COUNT=$(python3 -c "import json; print(len(json.load(open('$TABLE_FILE'))))" 2>/dev/null || echo "0")
        if [[ "$RECORD_COUNT" -gt 0 ]]; then
            HAS_DATA=true
            break
        fi
    fi
done

if [[ "$HAS_DATA" == "true" ]]; then
    pass_test "Backup contains data"
else
    fail_test "Data integrity" "No tables with data found"
fi

# ==============================================================================
# Cleanup
# ==============================================================================

log_info "Cleaning up test directory..."
rm -rf "$TEST_DIR"

# ==============================================================================
# Summary
# ==============================================================================

echo ""
echo "=========================================="
echo "Restoration Test Summary"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo -e "Tests Skipped: ${YELLOW}${TESTS_SKIPPED}${NC}"
echo "=========================================="

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}All tests passed! Backup is recoverable.${NC}"
    exit 0
else
    echo -e "${RED}${TESTS_FAILED} test(s) failed. Backup may not be recoverable.${NC}"
    exit 1
fi
