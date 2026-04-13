#!/bin/bash

# Environment Setup Validation Script
# This script validates that all required environment variables are set
# and includes security validations for sensitive configuration values
#
# Usage:
#   ./scripts/validate-env.sh           # Full validation (for local dev)
#   ./scripts/validate-env.sh --ci      # CI mode (strict, exit on error)
#   ./scripts/validate-env.sh --quick   # Quick mode (only required vars)

set -e

# Parse arguments
CI_MODE=false
QUICK_MODE=false

for arg in "$@"; do
    case $arg in
        --ci)
            CI_MODE=true
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Security validation settings
MIN_ADMIN_KEY_LENGTH=32
PLACEHOLDER_PATTERNS="your-|placeholder|example|test|demo|changeme|secret123|admin123|default"

# Track security warnings separately
security_warnings=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    if [ "$CI_MODE" = true ]; then
        case $status in
            "OK") echo "[OK] $message" ;;
            "WARN") echo "[WARN] $message" ;;
            "ERROR") echo "[ERROR] $message" ;;
            "INFO") echo "[INFO] $message" ;;
        esac
        return
    fi
    
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
        "SECURITY")
            echo -e "${RED}🔒 $message${NC}"
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

# Function to properly load .env file with correct variable parsing
load_env_file() {
    local env_file="$1"
    if [[ -f "$env_file" ]]; then
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Skip comments and empty lines
            [[ $line =~ ^[[:space:]]*# ]] && continue
            [[ -z "${line// }" ]] && continue
            
            # Parse KEY=VALUE format - allow spaces around =
            if [[ $line =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)[[:space:]]*$ ]]; then
                local key="${BASH_REMATCH[1]}"
                local value="${BASH_REMATCH[2]}"
                
                # Remove surrounding quotes (single and double)
                # Use substring removal - works correctly in bash
                if [[ "$value" == \"*\" ]]; then
                    value="${value:1:-1}"
                fi
                if [[ "$value" == \'*\' ]]; then
                    value="${value:1:-1}"
                fi
                
                export "$key"="$value"
            fi
        done < "$env_file"
    fi
}

# Function to check for placeholder values in sensitive variables
check_placeholder_value() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        return 0
    fi
    
    local lower_value=$(echo "$var_value" | tr '[:upper:]' '[:lower:]')
    
    for pattern in $(echo $PLACEHOLDER_PATTERNS | tr '|' ' '); do
        if [[ "$lower_value" == *"$pattern"* ]]; then
            print_status "SECURITY" "$var_name appears to contain a placeholder value: '...${pattern}...'"
            ((security_warnings++)) || true
            return 1
        fi
    done
    
    return 0
}

# Function to validate ADMIN_API_KEY complexity
validate_admin_key_security() {
    local key="${ADMIN_API_KEY}"
    
    if [ -z "$key" ]; then
        print_status "WARN" "ADMIN_API_KEY is not set (optional but recommended)"
        return 2
    fi
    
    local key_length=${#key}
    local has_upper=$(echo "$key" | grep -c '[A-Z]' || :)
    local has_lower=$(echo "$key" | grep -c '[a-z]' || :)
    local has_number=$(echo "$key" | grep -c '[0-9]' || :)
    local has_special=$(echo "$key" | grep -c '[^A-Za-z0-9]' || :)
    
    if [ "$key_length" -lt "$MIN_ADMIN_KEY_LENGTH" ]; then
        print_status "SECURITY" "ADMIN_API_KEY is too short ($key_length chars, minimum $MIN_ADMIN_KEY_LENGTH)"
        ((security_warnings++)) || true
        return 1
    fi
    
    if [ "$has_upper" -eq 0 ] || [ "$has_lower" -eq 0 ]; then
        print_status "SECURITY" "ADMIN_API_KEY should contain both uppercase and lowercase letters"
        ((security_warnings++)) || true
        return 1
    fi
    
    if [ "$has_number" -eq 0 ]; then
        print_status "SECURITY" "ADMIN_API_KEY should contain at least one number"
        ((security_warnings++)) || true
        return 1
    fi
    
    if [ "$has_special" -eq 0 ]; then
        print_status "SECURITY" "ADMIN_API_KEY should contain at least one special character"
        ((security_warnings++)) || true
        return 1
    fi
    
    print_status "OK" "ADMIN_API_KEY meets security requirements ($key_length chars, mixed case, numbers, special)"
    return 0
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

# Function to validate logging configuration
validate_logging_config() {
    local has_warnings=false
    
    # Check STRUCTURED_LOGGING
    if [ -n "$STRUCTURED_LOGGING" ]; then
        if [[ "$STRUCTURED_LOGGING" == "true" ]]; then
            print_status "OK" "STRUCTURED_LOGGING is enabled (JSON output for log aggregation)"
        elif [[ "$STRUCTURED_LOGGING" == "false" ]]; then
            print_status "INFO" "STRUCTURED_LOGGING is disabled (using human-readable format)"
        else
            print_status "WARN" "STRUCTURED_LOGGING should be 'true' or 'false', got: $STRUCTURED_LOGGING"
            has_warnings=true
        fi
    fi
    
    # Check ENABLE_DEBUG_LOGS (security concern in production)
    if [ -n "$ENABLE_DEBUG_LOGS" ]; then
        if [[ "$ENABLE_DEBUG_LOGS" == "true" ]]; then
            print_status "SECURITY" "ENABLE_DEBUG_LOGS is TRUE - debug logs visible in production!"
            print_status "WARN" "Disable ENABLE_DEBUG_LOGS after troubleshooting is complete"
            ((security_warnings++)) || true
        fi
    fi
    
    # Check SUPPRESS_BUILD_LOGS
    if [ -n "$SUPPRESS_BUILD_LOGS" ]; then
        if [[ "$SUPPRESS_BUILD_LOGS" == "true" ]]; then
            print_status "OK" "SUPPRESS_BUILD_LOGS is enabled (cleaner build output)"
        fi
    fi
    
    if [ "$has_warnings" = true ]; then
        return 1
    fi
    return 0
}
# Function to validate Node.js version meets engine requirements
validate_node_version() {
    # Get Node.js version from package.json engines field
    local required_version="20.0.0"
    
    # Get current Node.js version (remove 'v' prefix if present)
    local current_version=$(node --version 2>/dev/null | sed 's/^v//')
    
    if [ -z "$current_version" ]; then
        print_status "ERROR" "Node.js is not installed or not found in PATH"
        return 1
    fi
    
    # Compare versions using sort -V (version sorting)
    if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" ]; then
        print_status "ERROR" "Node.js version $current_version is too old. Required: >=$required_version"
        return 1
    else
        print_status "OK" "Node.js version $current_version meets requirement (>= $required_version)"
        return 0
    fi
}


# Main validation function
main() {
    if [ "$CI_MODE" = true ]; then
        echo "Environment Configuration Validation (CI Mode)"
        echo "================================================"
    elif [ "$QUICK_MODE" = true ]; then
        echo "Environment Configuration Validation (Quick Mode)"
        echo "=================================================="
    else
        echo -e "${BLUE}🔍 Environment Configuration Validation${NC}"
        echo -e "${BLUE}============================================${NC}"
    fi
    echo
    
    # Load environment from .env.local if it exists
    if [ -f ".env.local" ]; then
        print_status "INFO" "Loading environment from .env.local"
        load_env_file ".env.local"
    else
        if [ "$CI_MODE" = true ]; then
            print_status "WARN" ".env.local not found (CI may use secrets)"
        else
            # Auto-create .env.local from .env.example for better DX
            if [ -f "config/.env.example" ]; then
                print_status "INFO" ".env.local not found, creating from template..."
                cp config/.env.example .env.local
                print_status "INFO" "Created .env.local from config/.env.example"
                print_status "INFO" "Please edit .env.local with your actual values"
                # Load the newly created file
                load_env_file ".env.local"
            else
                print_status "WARN" ".env.local file not found"
                print_status "INFO" "Create .env.local from config/.env.example"
            fi
        fi
    fi
    
    echo
    if [ "$CI_MODE" = true ]; then
        echo "Checking Required Variables:"
    else
        echo -e "${BLUE}Checking Required Variables:${NC}"
    fi
    echo
    
    # Initialize error count
    errors=0
    
    # Check required variables
    check_env_var "NEXT_PUBLIC_SUPABASE_URL" "true" || ((errors++))
    check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "true" || ((errors++))
    check_env_var "SUPABASE_SERVICE_ROLE_KEY" "true" || ((errors++))
    check_env_var "COST_LIMIT_DAILY" "true" || ((errors++))
    check_env_var "NEXT_PUBLIC_APP_URL" "true" || ((errors++))
    
    # Skip detailed validation in quick mode
    if [ "$QUICK_MODE" = true ]; then
        echo
        if [ $errors -eq 0 ]; then
            print_status "OK" "Required environment variables are set"
            exit 0
        else
            print_status "ERROR" "Found $errors configuration error(s)"
            exit 1
        fi
    fi
    
    echo
    if [ "$CI_MODE" = true ]; then
        echo "Validating Configurations:"
    else
        echo -e "${BLUE}Validating Configurations:${NC}"
    fi
    echo
    
    # Validate Supabase
    validate_supabase || ((errors++))
    
    # Validate AI providers
    validate_ai_providers || ((errors++))
    
    # Validate cost limit
    validate_cost_limit || ((errors++))
    
    # Validate logging configuration
    validate_logging_config
    
    # Validate Node.js version
    validate_node_version || ((errors++))
    
    # Skip optional integrations in CI mode
    if [ "$CI_MODE" = true ]; then
        echo
        echo "================================================"
        if [ $errors -eq 0 ]; then
            print_status "OK" "CI environment configuration is valid"
            exit 0
        else
            print_status "ERROR" "Found $errors configuration error(s)"
            exit 1
        fi
    fi
    
    echo
    echo -e "${BLUE}Security Validations:${NC}"
    echo
    
    # Security validations for sensitive environment variables
    check_placeholder_value "SUPABASE_SERVICE_ROLE_KEY" || true
    check_placeholder_value "OPENAI_API_KEY" || true
    check_placeholder_value "ANTHROPIC_API_KEY" || true
    check_placeholder_value "ADMIN_API_KEY" || true
    
    validate_admin_key_security || true
    
    echo
    echo -e "${BLUE}Optional Integrations:${NC}"
    echo
    
    # Check optional variables
    check_env_var "OPENAI_API_KEY" "false" || true
    check_env_var "ANTHROPIC_API_KEY" "false" || true
    check_env_var "NOTION_API_KEY" "false" || true
    check_env_var "TRELLO_API_KEY" "false" || true
    check_env_var "GOOGLE_CLIENT_ID" "false" || true
    check_env_var "GITHUB_TOKEN" "false" || true
    
    echo
    echo -e "${BLUE}============================================${NC}"
    
    # Summary
    if [ $errors -eq 0 ] && [ $security_warnings -eq 0 ]; then
        print_status "OK" "Environment configuration is valid! 🎉"
        echo
        print_status "INFO" "You can now start the application with: npm run dev"
        exit 0
    elif [ $errors -eq 0 ] && [ $security_warnings -gt 0 ]; then
        print_status "WARN" "Environment configuration is valid but has $security_warnings security warning(s)"
        echo
        print_status "INFO" "Review security warnings above before deploying to production"
        print_status "INFO" "Generate a secure ADMIN_API_KEY: openssl rand -base64 32"
        exit 0
    else
        print_status "ERROR" "Found $errors configuration error(s) that must be fixed"
        echo
        print_status "INFO" "Please review the setup guide at docs/environment-setup.md"
        exit 1
    fi
}

# Run main function
main "$@"