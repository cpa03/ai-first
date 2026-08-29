#!/bin/bash

# BugFixer Workflow Script
# Continuous bug detection and fixing agent
# Treats build/lint warnings as fatal failures

set -e

echo "🔧 BugFixer Agent - Starting Workflow"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Track overall status
OVERALL_STATUS=0
FIXES_NEEDED=()

# Step 1: Environment Check
echo ""
echo "Step 1: Environment Check"
echo "-------------------------"

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Check if main exists
if ! git show-ref --verify --quiet refs/heads/main; then
    echo -e "${RED}Error: main branch not found${NC}"
    exit 1
fi

# Step 2: Sync with main
echo ""
echo "Step 2: Syncing with main"
echo "-------------------------"

# Fetch latest changes
print_info "Fetching latest changes..."
git fetch origin

# Check if we're on main
if [ "$CURRENT_BRANCH" = "main" ]; then
    print_info "On main branch, pulling latest..."
    git pull origin main
else
    print_warning "Not on main branch. Switching to main..."
    git checkout main
    git pull origin main
fi

# Step 3: Create fix branch
echo ""
echo "Step 3: Creating fix branch"
echo "---------------------------"

BRANCH_NAME="bugfix/$(date +%Y%m%d-%H%M%S)"
print_info "Creating branch: $BRANCH_NAME"
git checkout -b $BRANCH_NAME

# Step 4: Run diagnostics
echo ""
echo "Step 4: Running diagnostics"
echo "---------------------------"

# 4.1 Lint check (warnings = failures)
echo ""
echo "4.1 Running ESLint (warnings as errors)..."
if npm run lint -- --max-warnings=0; then
    print_status 0 "Linting passed (no warnings)"
else
    print_status 1 "Linting failed (warnings or errors found)"
    FIXES_NEEDED+=("lint")
    OVERALL_STATUS=1
fi

# 4.2 Type check
echo ""
echo "4.2 Running TypeScript Type Check..."
if npm run type-check; then
    print_status 0 "Type check passed"
else
    print_status 1 "Type check failed"
    FIXES_NEEDED+=("type-check")
    OVERALL_STATUS=1
fi

# 4.3 Test check
echo ""
echo "4.3 Running Tests..."
if npm run test:ci; then
    print_status 0 "Tests passed"
else
    print_status 1 "Tests failed"
    FIXES_NEEDED+=("tests")
    OVERALL_STATUS=1
fi

# 4.4 Build check
echo ""
echo "4.4 Running Build..."
if npm run build; then
    print_status 0 "Build passed"
else
    print_status 1 "Build failed"
    FIXES_NEEDED+=("build")
    OVERALL_STATUS=1
fi

# Step 5: Analyze results
echo ""
echo "Step 5: Analysis"
echo "----------------"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! No bugs detected.${NC}"
    
    # Switch back to main
    git checkout main
    git branch -d $BRANCH_NAME
    
    echo ""
    echo "Workflow completed successfully."
    exit 0
else
    echo -e "${RED}❌ Issues detected in: ${FIXES_NEEDED[*]}${NC}"
    echo ""
    echo "Please fix the following issues:"
    for fix in "${FIXES_NEEDED[@]}"; do
        echo "  - $fix"
    done
    echo ""
    echo "After fixing, run:"
    echo "  npm run lint -- --max-warnings=0"
    echo "  npm run type-check"
    echo "  npm run test:ci"
    echo "  npm run build"
    echo ""
    echo "Then commit and create PR:"
    echo "  git add ."
    echo "  git commit -m 'fix: resolve [issue description]'"
    echo "  git push origin $BRANCH_NAME"
    echo "  gh pr create --title 'fix: [Brief description]' --body '...'"
    
    exit 1
fi
