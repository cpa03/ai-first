#!/bin/bash

# Cloudflare Build Validation Script
# This script validates environment variables specifically for Cloudflare Workers/Pages builds
# It runs during the build process to provide clear error messages

set -e

# Colors for output (Cloudflare supports basic ANSI colors in build logs)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNS=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "OK")
            echo -e "${GREEN}✓ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠ $message${NC}"
            ((WARNS++))
            ;;
        "ERROR")
            echo -e "${RED}✗ $message${NC}"
            ((ERRORS++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ $message${NC}"
            ;;
    esac
}

# Function to check if environment variable is set
check_required_env() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        print_status "ERROR" "Required environment variable $var_name is not set"
        return 1
    else
        # Mask the value for security (show only first 8 and last 4 chars)
        local masked_value="${var_value:0:8}...${var_value: -4}"
        print_status "OK" "$var_name is configured (value: $masked_value)"
        return 0
    fi
}

# Function to check optional environment variable
check_optional_env() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        print_status "WARN" "Optional environment variable $var_name is not set"
        return 1
    else
        print_status "OK" "$var_name is configured"
        return 0
    fi
}

echo -e "${BLUE}"
echo "============================================"
echo "  Cloudflare Workers Build Validation"
echo "============================================"
echo -e "${NC}"
echo

print_status "INFO" "Starting environment variable validation for Cloudflare Workers build"
echo

# ==========================================
# REQUIRED ENVIRONMENT VARIABLES
# ==========================================

echo -e "${BLUE}Required Variables:${NC}"
echo

# Supabase Configuration
print_status "INFO" "Checking Supabase configuration..."
check_required_env "NEXT_PUBLIC_SUPABASE_URL" || true
check_required_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" || true
check_required_env "SUPABASE_SERVICE_ROLE_KEY" || true

# AI Provider Configuration (at least one required)
print_status "INFO" "Checking AI provider configuration..."
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
    print_status "ERROR" "At least one AI provider (OPENAI_API_KEY or ANTHROPIC_API_KEY) must be configured"
else
    if [ -n "$OPENAI_API_KEY" ]; then
        print_status "OK" "OPENAI_API_KEY is configured"
    fi
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        print_status "OK" "ANTHROPIC_API_KEY is configured"
    fi
fi

# Cost Guardrails
check_required_env "COST_LIMIT_DAILY" || true

# Application Configuration
check_required_env "NEXT_PUBLIC_APP_URL" || true

echo

# ==========================================
# OPTIONAL ENVIRONMENT VARIABLES
# ==========================================

echo -e "${BLUE}Optional Integration Variables:${NC}"
echo

check_optional_env "NOTION_API_KEY" || true
check_optional_env "TRELLO_API_KEY" || true
check_optional_env "GOOGLE_CLIENT_ID" || true
check_optional_env "GITHUB_TOKEN" || true

echo

# ==========================================
# SUMMARY
# ==========================================

echo -e "${BLUE}============================================${NC}"
echo

if [ $ERRORS -eq 0 ]; then
    print_status "OK" "Build validation passed! All required environment variables are configured."
    echo
    print_status "INFO" "Proceeding with build..."
    exit 0
else
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}  BUILD VALIDATION FAILED${NC}"
    echo -e "${RED}============================================${NC}"
    echo
    echo -e "${RED}Found $ERRORS error(s) and $WARNS warning(s)${NC}"
    echo
    echo -e "${YELLOW}To fix this issue:${NC}"
    echo "1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/"
    echo "2. Navigate to: Workers & Pages → ai-first → Settings → Environment Variables"
    echo "3. Add the missing required environment variables (listed above)"
    echo "4. Add them to BOTH Preview and Production environments"
    echo "5. Trigger a new build by pushing a commit or re-running the workflow"
    echo
    echo -e "${BLUE}Required variables documentation:${NC}"
    echo "- config/.env.example - Complete list of environment variables"
    echo "- docs/deploy.md - Deployment setup guide"
    echo
    print_status "ERROR" "Build cannot proceed without required environment variables"
    exit 1
fi
