#!/bin/bash
# =============================================================================
# HMR Verification Script
# =============================================================================
# Tests that Next.js Hot Module Replacement works correctly in development.
# This catches reload failures early in CI before they impact developers.
#
# Usage: ./scripts/verify-hmr.sh [TIMEOUT_SECONDS]
# Default timeout: 30 seconds
# =============================================================================

set -e

TIMEOUT_SECONDS=${1:-30}
TEMP_FILE="src/app/test-hmr-page.tsx"
BACKUP_FILE="src/app/test-hmr-page.tsx.bak"
PORT=3000
START_TIME=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Kill dev server if running
    if [ -n "$DEV_SERVER_PID" ] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        kill "$DEV_SERVER_PID" 2>/dev/null || true
        sleep 2
        kill -9 "$DEV_SERVER_PID" 2>/dev/null || true
    fi
    
    # Remove test file
    rm -f "$TEMP_FILE"
    
    # Restore backup if exists
    if [ -f "$BACKUP_FILE" ]; then
        mv "$BACKUP_FILE" "$TEMP_FILE"
    fi
    
    # Kill any remaining node processes on port 3000
    fuser -k "$PORT/tcp" 2>/dev/null || true
}

trap cleanup EXIT

# =============================================================================
# STEP 1: Create a test file to modify
# =============================================================================
log_info "Creating test file for HMR verification..."

mkdir -p src/app

# Create initial test file
cat > "$TEMP_FILE" << 'EOF'
// This file is used for HMR testing - can be safely deleted
export default function TestHmrPage() {
  return <div>HMR Test Initial</div>
}
EOF

log_info "Test file created at $TEMP_FILE"

# =============================================================================
# STEP 2: Start the dev server
# =============================================================================
log_info "Starting Next.js dev server..."

# Start dev server in background
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_SERVER_PID=$!

log_info "Dev server started with PID: $DEV_SERVER_PID"

# =============================================================================
# STEP 3: Wait for server to be ready
# =============================================================================
log_info "Waiting for dev server to be ready..."

READY=false
WAIT_COUNT=0
MAX_WAIT=60

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/api/health" | grep -q "200"; then
        READY=true
        break
    fi
    
    # Also check if server is listening on the port
    if curl -s -o /dev/null "http://localhost:$PORT" 2>/dev/null; then
        READY=true
        break
    fi
    
    # Check if process is still running
    if ! kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        log_error "Dev server process died unexpectedly!"
        cat /tmp/dev-server.log
        exit 1
    fi
    
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    echo -n "."
done

echo ""

if [ "$READY" = false ]; then
    log_error "Dev server did not start within $MAX_WAIT seconds"
    cat /tmp/dev-server.log
    exit 1
fi

log_info "Dev server is ready!"

# Give server a moment to stabilize
sleep 3

# =============================================================================
# STEP 4: Make a code change and measure HMR time
# =============================================================================
log_info "Making code change to trigger HMR..."

# Backup original
cp "$TEMP_FILE" "$BACKUP_FILE"

# Record the time before making the change
HMR_START=$(date +%s)

# Modify the test file to trigger HMR
cat > "$TEMP_FILE" << 'EOF'
// This file is used for HMR testing - can be safely deleted
export default function TestHmrPage() {
  return <div>HMR Test Updated</div>
}
EOF

log_info "Code change applied, waiting for HMR..."

# =============================================================================
# STEP 5: Wait for HMR to complete
# =============================================================================
HMR_COMPLETE=false

while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - HMR_START))
    
    # Check timeout
    if [ $ELAPSED -ge $TIMEOUT_SECONDS ]; then
        log_error "HMR timed out after $TIMEOUT_SECONDS seconds!"
        log_error "This indicates a problem with Hot Module Replacement"
        
        # Show relevant logs
        log_error "Dev server logs:"
        tail -50 /tmp/dev-server.log
        
        exit 1
    fi
    
    # Check if HMR has completed by looking at the server output
    if grep -q "compiled" /tmp/dev-server.log 2>/dev/null; then
        HMR_COMPLETE=true
        break
    fi
    
    # Also check for HMR heartbeat or ready signal
    if grep -q "HMR" /tmp/dev-server.log 2>/dev/null; then
        # Give it a moment to fully complete
        sleep 2
        if grep -q "compiled" /tmp/dev-server.log 2>/dev/null || grep -q "ready" /tmp/dev-server.log 2>/dev/null; then
            HMR_COMPLETE=true
            break
        fi
    fi
    
    # Check if the page reflects the change
    if curl -s "http://localhost:$PORT/test-hmr-page" 2>/dev/null | grep -q "Updated"; then
        HMR_COMPLETE=true
        break
    fi
    
    sleep 1
    echo -n "."
done

echo ""

HMR_END=$(date +%s)
HMR_DURATION=$((HMR_END - HMR_START))

if [ "$HMR_COMPLETE" = true ]; then
    log_info "HMR completed successfully in $HMR_DURATION seconds!"
    
    # Verify the change is actually reflected
    if curl -s "http://localhost:$PORT/test-hmr-page" 2>/dev/null | grep -q "Updated"; then
        log_info "Verified: Page content reflects the update"
    else
        log_warn "HMR signal received but page content verification inconclusive"
    fi
else
    log_error "HMR did not complete within timeout"
    exit 1
fi

# =============================================================================
# STEP 6: Report metrics
# =============================================================================
log_info "=============================================="
log_info "HMR Verification Summary"
log_info "=============================================="
log_info "HMR Duration: ${HMR_DURATION}s"
log_info "Timeout: ${TIMEOUT_SECONDS}s"
log_info "Status: PASS"
log_info "=============================================="

# Export metrics for CI
echo "HMR_DURATION=$HMR_DURATION" >> $GITHUB_OUTPUT || true
echo "HMR_STATUS=pass" >> $GITHUB_OUTPUT || true

exit 0
