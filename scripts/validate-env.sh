#!/bin/bash

# Environment Setup Validation Script
# This script validates that all required environment variables are set

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
            ;;
        "ERROR")
            echo -e "${RED}✗ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ $message${NC}"
            ;;
    esac
}

# Function to check if environment variable is set and not empty
check_env_var() {
    local var_name=$1
    local required=${2:-true}
    
    if [ -z "${!var_name}" ]; then
        if [ "$required" = "true" ]; then
            print_status "ERROR" "$var_name is required but not set"
            return 1
        else
            print_status "WARN" "$var_name is not set (optional)"
            return 2
        fi
    else
        print_status "OK" "$var_name is set"
        return 0
    fi
}

# Function to validate Supabase connection
validate_supabase() {
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        return 1
    fi
    
    # Basic URL format validation
    if [[ $NEXT_PUBLIC_SUPABASE_URL =~ ^https://.*\.supabase\.co$ ]] || [[ $NEXT_PUBLIC_SUPABASE_URL =~ ^http://localhost:.*$ ]]; then
        print_status "OK" "Supabase URL format is valid"
        return 0
    else
        print_status "ERROR" "Supabase URL format is invalid"
        return 1
    fi
}

# Function to validate AI provider setup
validate_ai_providers() {
    local has_openai=${OPENAI_API_KEY:+true}
    local has_anthropic=${ANTHROPIC_API_KEY:+true}
    
    if [ "$has_openai" = true ]; then
        if [[ $OPENAI_API_KEY =~ ^sk-.* ]]; then
            print_status "OK" "OpenAI API key format is valid"
        else
            print_status "WARN" "OpenAI API key format may be invalid"
        fi
    fi
    
    if [ "$has_anthropic" = true ]; then
        if [[ $ANTHROPIC_API_KEY =~ ^sk-ant-.* ]]; then
            print_status "OK" "Anthropic API key format is valid"
        else
            print_status "WARN" "Anthropic API key format may be invalid"
        fi
    fi
    
    if [ "$has_openai" = true ] || [ "$has_anthropic" = true ]; then
        return 0
    else
        print_status "ERROR" "At least one AI provider (OpenAI or Anthropic) must be configured"
        return 1
    fi
}

# Function to validate cost limit
validate_cost_limit() {
    if [ -z "$COST_LIMIT_DAILY" ]; then
        return 1
    fi
    
    # Check if it's a valid number
    if [[ $COST_LIMIT_DAILY =~ ^[0-9]*\.?[0-9]+$ ]]; then
        print_status "OK" "Cost limit is set to \$$COST_LIMIT_DAILY per day"
        return 0
    else
        print_status "ERROR" "Cost limit must be a valid number"
        return 1
    fi
}

# Main validation function
main() {
    echo -e "${BLUE}🔍 Environment Configuration Validation${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo

    # Check if running in CI environment - be more lenient
    if [ "$CI" = "true" ] || [ "$CF_PAGES" = "1" ] || [ "$CLOUDFLARE_PAGES" = "1" ]; then
        print_status "INFO" "Running in CI/Cloudflare environment - using lenient validation"
        CI_MODE=true
    else
        CI_MODE=false
    fi

    # Load environment from .env.local if it exists
    if [ -f ".env.local" ]; then
        print_status "INFO" "Loading environment from .env.local"
        export $(grep -v '^#' .env.local | xargs)
    else
        print_status "WARN" ".env.local file not found"
        print_status "INFO" "Create .env.local from config/.env.example"
    fi

    echo
    echo -e "${BLUE}Checking Required Variables:${NC}"
    echo

    # Initialize error count
    errors=0

    # Check required variables - in CI mode, only warn
    if [ "$CI_MODE" = "true" ]; then
        check_env_var "NEXT_PUBLIC_SUPABASE_URL" "false" || ((errors++))
        check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "false" || ((errors++))
        check_env_var "SUPABASE_SERVICE_ROLE_KEY" "false" || ((errors++))
        check_env_var "COST_LIMIT_DAILY" "false" || ((errors++))
        check_env_var "NEXT_PUBLIC_APP_URL" "false" || ((errors++))
    else
        check_env_var "NEXT_PUBLIC_SUPABASE_URL" "true" || ((errors++))
        check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "true" || ((errors++))
        check_env_var "SUPABASE_SERVICE_ROLE_KEY" "true" || ((errors++))
        check_env_var "COST_LIMIT_DAILY" "true" || ((errors++))
        check_env_var "NEXT_PUBLIC_APP_URL" "true" || ((errors++))
    fi

    echo
    echo -e "${BLUE}Validating Configurations:${NC}"
    echo

    # Validate Supabase - skip in CI mode if not configured
    if [ "$CI_MODE" = "true" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_status "WARN" "Skipping Supabase validation in CI mode"
    else
        validate_supabase || ((errors++))
    fi

    # Validate AI providers - skip in CI mode if not configured
    if [ "$CI_MODE" = "true" ] && [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
        print_status "WARN" "Skipping AI provider validation in CI mode"
    else
        validate_ai_providers || ((errors++))
    fi

    # Validate cost limit - skip in CI mode if not configured
    if [ "$CI_MODE" = "true" ] && [ -z "$COST_LIMIT_DAILY" ]; then
        print_status "WARN" "Skipping cost limit validation in CI mode"
    else
        validate_cost_limit || ((errors++))
    fi

    echo
    echo -e "${BLUE}Optional Integrations:${NC}"
    echo

    # Check optional variables
    check_env_var "OPENAI_API_KEY" "false"
    check_env_var "ANTHROPIC_API_KEY" "false"
    check_env_var "NOTION_API_KEY" "false"
    check_env_var "TRELLO_API_KEY" "false"
    check_env_var "GOOGLE_CLIENT_ID" "false"
    check_env_var "GITHUB_TOKEN" "false"

    echo
    echo -e "${BLUE}============================================${NC}"

    # Summary
    if [ $errors -eq 0 ]; then
        print_status "OK" "Environment configuration is valid! 🎉"
        echo
        if [ "$CI_MODE" = "false" ]; then
            print_status "INFO" "You can now start the application with: npm run dev"
        fi
        exit 0
    else
        if [ "$CI_MODE" = "true" ]; then
            print_status "WARN" "Found $errors configuration warning(s) in CI mode - continuing anyway"
            print_status "INFO" "Note: Some features may not work without proper environment configuration"
            exit 0
        else
            print_status "ERROR" "Found $errors configuration error(s) that must be fixed"
            echo
            print_status "INFO" "Please review the setup guide at docs/environment-setup.md"
            exit 1
        fi
    fi
}

# Run main function
main "$@"