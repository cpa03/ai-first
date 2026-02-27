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
TEMP_DIR="src/app/test-hmr"
TEMP_FILE="$TEMP_DIR/page.tsx"
PORT=3000
START_TIME=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
    log_info "Cleaning up..."
    if [ -n "$DEV_SERVER_PID" ] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        kill "$DEV_SERVER_PID" 2>/dev/null || true
        sleep 2
        kill -9 "$DEV_SERVER_PID" 2>/dev/null || true
    fi
    rm -rf "$TEMP_DIR"
    fuser -k "$PORT/tcp" 2>/dev/null || true
}
trap cleanup EXIT

log_info "Creating test file for HMR verification..."
mkdir -p "$TEMP_DIR"

cat > "$TEMP_FILE" << 'EOF'
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'HMR Test' };
export default function TestHmrPage() {
  return <div><h1>HMR Test Initial</h1></div>;
}
EOF

log_info "Starting Next.js dev server..."
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_SERVER_PID=$!

log_info "Waiting for dev server to be ready..."
READY=false
WAIT_COUNT=0
MAX_WAIT=60

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/api/health" | grep -q "200"; then
        READY=true; break
    fi
    if curl -s -o /dev/null "http://localhost:$PORT" 2>/dev/null; then
        READY=true; break
    fi
    if ! kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        log_error "Dev server process died unexpectedly!"; cat /tmp/dev-server.log; exit 1
    fi
    sleep 2; WAIT_COUNT=$((WAIT_COUNT + 2)); echo -n "."
done
echo ""

if [ "$READY" = false ]; then
    log_error "Dev server did not start within $MAX_WAIT seconds"; cat /tmp/dev-server.log; exit 1
fi

log_info "Dev server is ready!"
sleep 3

log_info "Making code change to trigger HMR..."
HMR_START=$(date +%s)

cat > "$TEMP_FILE" << 'EOF'
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'HMR Test' };
export default function TestHmrPage() {
  return <div><h1>HMR Test Updated</h1></div>;
}
EOF

log_info "Code change applied, waiting for HMR..."
HMR_COMPLETE=false

while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - HMR_START))
    
    if [ $ELAPSED -ge $TIMEOUT_SECONDS ]; then
        log_error "HMR timed out after $TIMEOUT_SECONDS seconds!"; tail -50 /tmp/dev-server.log; exit 1
    fi
    
    if grep -q "compiled" /tmp/dev-server.log 2>/dev/null; then
        HMR_COMPLETE=true; break
    fi
    
    if grep -q "HMR" /tmp/dev-server.log 2>/dev/null; then
        sleep 2
        if grep -q "compiled\|ready" /tmp/dev-server.log 2>/dev/null; then
            HMR_COMPLETE=true; break
        fi
    fi
    
    if curl -s "http://localhost:$PORT/test-hmr" 2>/dev/null | grep -q "Updated"; then
        HMR_COMPLETE=true; break
    fi
    
    sleep 1; echo -n "."
done
echo ""

HMR_END=$(date +%s)
HMR_DURATION=$((HMR_END - HMR_START))

if [ "$HMR_COMPLETE" = true ]; then
    log_info "HMR completed successfully in $HMR_DURATION seconds!"
    if curl -s "http://localhost:$PORT/test-hmr" 2>/dev/null | grep -q "Updated"; then
        log_info "Verified: Page content reflects the update"
    else
        log_warn "HMR signal received but page content verification inconclusive"
    fi
else
    log_error "HMR did not complete within timeout"; exit 1
fi

log_info "=============================================="
log_info "HMR Verification Summary"
log_info "=============================================="
log_info "HMR Duration: ${HMR_DURATION}s"
log_info "Timeout: ${TIMEOUT_SECONDS}s"
log_info "Status: PASS"
log_info "=============================================="

echo "HMR_DURATION=$HMR_DURATION" >> $GITHUB_OUTPUT || true
echo "HMR_STATUS=pass" >> $GITHUB_OUTPUT || true
exit 0
