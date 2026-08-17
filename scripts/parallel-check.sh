#!/bin/bash
# parallel-check.sh - Run lint, type-check, and tests in parallel for faster CI feedback
#
# Usage:
#   ./scripts/parallel-check.sh              # Run all checks in parallel
#   ./scripts/parallel-check.sh --shard      # Run tests with sharding (2 shards)
#   ./scripts/parallel-check.sh --suites     # Run all test suites in parallel
#
# This script runs lint, type-check, and test suites concurrently.
# Total time = max(lint, type-check, test suites) instead of sum.
#
# Expected improvement:
#   Sequential: ~42s (13s lint + 4s type-check + 25s tests)
#   Parallel:   ~25s (longest single task)
#
# With --suites flag:
#   Sequential: ~15+ minutes (5min comprehensive + 5min integration + 5min e2e)
#   Parallel:   ~5-8 minutes (longest single suite)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Track results
LINT_RESULT=0
TYPECHECK_RESULT=0
TEST_RESULT=0
START_TIME=$(date +%s)

# Parse arguments
USE_SHARD=false
USE_SUITES=false
for arg in "$@"; do
    case $arg in
        --shard)
            USE_SHARD=true
            ;;
        --suites)
            USE_SUITES=true
            ;;
    esac
done

log() {
    echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +%H:%M:%S)] ✅ $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +%H:%M:%S)] ❌ $1${NC}"
}

log_info() {
    echo -e "${YELLOW}[$(date +%H:%M:%S)] ℹ️  $1${NC}"
}

# Run lint in background
run_lint() {
    log "Starting lint check..."
    if npm run lint 2>&1; then
        log_success "Lint passed"
        return 0
    else
        log_error "Lint failed"
        return 1
    fi
}

# Run type-check in background
run_typecheck() {
    log "Starting type-check..."
    if npm run type-check 2>&1; then
        log_success "Type-check passed"
        return 0
    else
        log_error "Type-check failed"
        return 1
    fi
}

# Run tests in background
run_tests() {
    log "Starting test suite..."
    if [[ "$USE_SHARD" == "true" ]]; then
        # Run tests with sharding for even more parallelism
        SHARD_COUNT=2
        log_info "Using $SHARD_COUNT shards for test parallelism"
        
        # Run shards in parallel
        PIDS=()
        for i in $(seq 1 $SHARD_COUNT); do
            npx jest --shard=$i/$SHARD_COUNT --coverage --ci --watchAll=false --passWithNoTests --forceExit 2>&1 &
            PIDS+=($!)
        done
        
        # Wait for all shards
        TEST_RESULT=0
        for pid in "${PIDS[@]}"; do
            if ! wait $pid; then
                TEST_RESULT=1
            fi
        done
        
        if [[ $TEST_RESULT -eq 0 ]]; then
            log_success "Tests passed (sharded)"
        else
            log_error "Tests failed (sharded)"
        fi
        return $TEST_RESULT
    else
        if npm run test:ci 2>&1; then
            log_success "Tests passed"
            return 0
        else
            log_error "Tests failed"
            return 1
        fi
    fi
}

# Run all test suites in parallel
run_test_suites() {
    log "Starting all test suites in parallel..."
    
    SUITES=("test:comprehensive" "test:integration" "test:e2e" "test:a11y")
    PIDS=()
    RESULTS=()
    
    # Start all suites in parallel
    for suite in "${SUITES[@]}"; do
        log_info "Starting $suite..."
        npm run "$suite" 2>&1 &
        PIDS+=($!)
        RESULTS+=($!)
    done
    
    # Wait for all suites to complete
    SUITE_RESULT=0
    for i in "${!PIDS[@]}"; do
        if ! wait "${PIDS[$i]}"; then
            log_error "Suite ${SUITES[$i]} failed"
            SUITE_RESULT=1
        else
            log_success "Suite ${SUITES[$i]} passed"
        fi
    done
    
    if [[ $SUITE_RESULT -eq 0 ]]; then
        log_success "All test suites passed"
    else
        log_error "One or more test suites failed"
    fi
    return $SUITE_RESULT
}

# Main execution
log "=========================================="
log "Parallel Quality Checks - Issue #1935"
log "=========================================="
log ""

if [[ "$USE_SUITES" == "true" ]]; then
    # Run all test suites in parallel
    run_test_suites
    SUITES_EXIT=$?
    
    # Calculate total time
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    # Summary
    log ""
    log "=========================================="
    log "RESULTS SUMMARY (Total: ${DURATION}s)"
    log "=========================================="
    
    if [[ $SUITES_EXIT -eq 0 ]]; then
        log_success "All test suites passed! ✨"
        exit 0
    else
        log_error "One or more test suites failed"
        exit 1
    fi
else
    # Run all checks in parallel (original behavior)
    run_lint &
    PID_LINT=$!

    run_typecheck &
    PID_TYPECHECK=$!

    run_tests &
    PID_TEST=$!

    # Wait for all to complete
    log "Waiting for all checks to complete..."
    wait $PID_LINT
    LINT_EXIT=$?

    wait $PID_TYPECHECK
    TYPECHECK_EXIT=$?

    wait $PID_TEST
    TEST_EXIT=$?

# Calculate total time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Summary
log ""
log "=========================================="
log "RESULTS SUMMARY (Total: ${DURATION}s)"
log "=========================================="

OVERALL_PASS=true

if [[ $LINT_EXIT -eq 0 ]]; then
    log_success "Lint: PASSED"
else
    log_error "Lint: FAILED"
    OVERALL_PASS=false
fi

if [[ $TYPECHECK_EXIT -eq 0 ]]; then
    log_success "Type-check: PASSED"
else
    log_error "Type-check: FAILED"
    OVERALL_PASS=false
fi

if [[ $TEST_EXIT -eq 0 ]]; then
    log_success "Tests: PASSED"
else
    log_error "Tests: FAILED"
    OVERALL_PASS=false
fi

log ""

if [[ "$OVERALL_PASS" == "true" ]]; then
    log_success "All checks passed! ✨"
    exit 0
else
    log_error "One or more checks failed"
    exit 1
fi
fi
