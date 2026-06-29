#!/bin/bash

# Bug Scanner Script
# This script runs comprehensive checks to catch bugs before they enter the codebase

set -e

echo "🔍 Starting Bug Scanner..."
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        return 1
    fi
}

# Track overall status
OVERALL_STATUS=0

# 1. Run Linting
echo ""
echo "1. Running ESLint..."
if npm run lint; then
    print_status 0 "Linting passed"
else
    print_status 1 "Linting failed"
    OVERALL_STATUS=1
fi

# 2. Run Type Check
echo ""
echo "2. Running TypeScript Type Check..."
if npm run type-check; then
    print_status 0 "Type check passed"
else
    print_status 1 "Type check failed"
    OVERALL_STATUS=1
fi

# 3. Run Tests
echo ""
echo "3. Running Tests..."
if npm run test:ci; then
    print_status 0 "Tests passed"
else
    print_status 1 "Tests failed"
    OVERALL_STATUS=1
fi

# 4. Run Security Scan
echo ""
echo "4. Running Security Scan..."
if npm run security:check; then
    print_status 0 "Security scan passed"
else
    print_status 1 "Security scan failed"
    OVERALL_STATUS=1
fi

# 5. Run Circular Dependency Check
echo ""
echo "5. Running Circular Dependency Check..."
if npm run check:circular; then
    print_status 0 "Circular dependency check passed"
else
    print_status 1 "Circular dependency check failed"
    OVERALL_STATUS=1
fi

# 6. Run Build
echo ""
echo "6. Running Build..."
if npm run build; then
    print_status 0 "Build passed"
else
    print_status 1 "Build failed"
    OVERALL_STATUS=1
fi

# Summary
echo ""
echo "=========================="
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! No bugs detected.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
