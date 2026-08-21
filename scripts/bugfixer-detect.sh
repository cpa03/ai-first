#!/bin/bash

# BugFixer Automated Detection Script
# This script runs all bug detection checks and generates a report

set -e

echo "🔍 BugFixer Automated Detection Script"
echo "======================================"
echo "Started at: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -e "${YELLOW}Running: ${check_name}${NC}"
    
    if eval "$check_command"; then
        echo -e "${GREEN}✓ ${check_name} passed${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗ ${check_name} failed${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    echo ""
}

# 1. Lint Check
run_check "ESLint (0 warnings/errors)" "npm run lint"

# 2. TypeScript Type Check
run_check "TypeScript Type Check" "npm run type-check"

# 3. Test Suite
run_check "Test Suite" "npm run test:ci"

# 4. Build Check
run_check "Production Build" "npm run build"

# 5. Security Scan
run_check "Security Vulnerability Scan" "npm run security:check"

# 6. Circular Dependency Check
run_check "Circular Dependency Check" "npm run check:circular"

# 7. Bug Scan
run_check "Comprehensive Bug Scan" "npm run bug:scan"

# Summary
echo "======================================"
echo "BugFixer Detection Summary"
echo "======================================"
echo "Date: $(date)"
echo "Total Checks: ${TOTAL_CHECKS}"
echo -e "${GREEN}Passed: ${PASSED_CHECKS}${NC}"
echo -e "${RED}Failed: ${FAILED_CHECKS}${NC}"
echo ""

if [ ${FAILED_CHECKS} -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Repository is bug-free.${NC}"
    exit 0
else
    echo -e "${RED}❌ ${FAILED_CHECKS} check(s) failed. Please fix the issues.${NC}"
    exit 1
fi
