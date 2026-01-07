#!/bin/bash

# Cloudflare Environment Variables Setup Script
# This script helps configure Cloudflare Workers environment variables
# This script should be run locally and provides instructions for Cloudflare dashboard setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo
}

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
        "STEP")
            echo -e "${CYAN}▶ $message${NC}"
            ;;
    esac
}

print_header "Cloudflare Environment Variables Setup"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_status "INFO" "Wrangler CLI not detected. Installing..."
    npm install -g wrangler
    print_status "OK" "Wrangler CLI installed"
fi

# Authenticate with Cloudflare
echo
print_status "STEP" "Step 1: Authenticate with Cloudflare"
print_status "INFO" "If not already authenticated, wrangler will open a browser for authentication"
if ! wrangler whoami &> /dev/null; then
    print_status "INFO" "Please authenticate with Cloudflare..."
    wrangler login
    print_status "OK" "Authenticated successfully"
else
    print_status "OK" "Already authenticated with Cloudflare"
    wrangler whoami
fi

# Load environment from .env.local if exists
ENV_FILE=""
if [ -f ".env.local" ]; then
    ENV_FILE=".env.local"
    print_status "OK" "Found .env.local file"
elif [ -f "config/.env.example" ]; then
    print_status "WARN" "No .env.local found, using config/.env.example as template"
    print_status "INFO" "Please create .env.local from config/.env.example with your actual values"
    ENV_FILE="config/.env.example"
else
    print_status "ERROR" "No environment configuration file found"
    exit 1
fi

echo
print_status "STEP" "Step 2: Collect Environment Variables"
echo

# Function to get variable value from env file
get_env_value() {
    local var_name=$1
    local value=$(grep "^${var_name}=" "$ENV_FILE" | cut -d '=' -f2-)
    echo "$value"
}

# Required environment variables
declare -a REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "COST_LIMIT_DAILY"
    "NEXT_PUBLIC_APP_URL"
)

# Optional environment variables (at least one required)
declare -a AI_VARS=(
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
)

print_status "INFO" "Checking required variables..."
echo

missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -z "$value" ] || [[ "$value" == "your_"* ]] || [[ "$value" == "https://your-"* ]]; then
        print_status "ERROR" "$var is not configured in $ENV_FILE"
        ((missing_vars++))
    else
        # Show only first few characters for security
        masked_value="${value:0:8}..."
        print_status "OK" "$var: $masked_value"
    fi
done

echo
print_status "INFO" "Checking AI provider variables (at least one required)..."
echo

ai_configured=false
for var in "${AI_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -n "$value" ] && [[ "$value" != "your_"* ]]; then
        masked_value="${value:0:12}..."
        print_status "OK" "$var: $masked_value"
        ai_configured=true
    fi
done

if [ "$ai_configured" = false ]; then
    print_status "ERROR" "No AI provider (OPENAI_API_KEY or ANTHROPIC_API_KEY) is configured"
    ((missing_vars++))
fi

if [ $missing_vars -gt 0 ]; then
    echo
    print_status "ERROR" "Found $missing_vars missing or incomplete variable(s)"
    print_status "INFO" "Please configure all required variables in $ENV_FILE"
    echo
    print_status "INFO" "Refer to config/.env.example for the required format"
    exit 1
fi

echo
print_status "STEP" "Step 3: Configure Cloudflare Environment Variables"
echo
print_status "INFO" "Choose environment to configure:"
echo
echo "  1) Production"
echo "  2) Preview"
echo "  3) Both"
echo
read -p "Enter choice (1-3): " env_choice

case $env_choice in
    1)
        ENVIRONMENTS="production"
        ;;
    2)
        ENVIRONMENTS="preview"
        ;;
    3)
        ENVIRONMENTS="production preview"
        ;;
    *)
        print_status "ERROR" "Invalid choice"
        exit 1
        ;;
esac

echo
print_status "INFO" "Configuring environment variables for: $ENVIRONMENTS"
echo

# Function to set secret in Cloudflare
set_cloudflare_secret() {
    local var_name=$1
    local var_value=$2
    local environments=$3
    
    for env in $environments; do
        print_status "INFO" "Setting $var_name in $env..."
        if echo "$var_value" | wrangler secret put "$var_name" --env "$env"; then
            print_status "OK" "$var_name set in $env"
        else
            print_status "ERROR" "Failed to set $var_name in $env"
            return 1
        fi
    done
    return 0
}

# Configure each required variable
for var in "${REQUIRED_VARS[@]}"; do
    value=$(get_env_value "$var")
    if ! set_cloudflare_secret "$var" "$value" "$ENVIRONMENTS"; then
        print_status "ERROR" "Failed to configure $var"
        exit 1
    fi
done

# Configure AI provider variables
for var in "${AI_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -n "$value" ] && [[ "$value" != "your_"* ]]; then
        if ! set_cloudflare_secret "$var" "$value" "$ENVIRONMENTS"; then
            print_status "ERROR" "Failed to configure $var"
            exit 1
        fi
    fi
done

# Configure optional variables
echo
print_status "INFO" "Checking optional variables..."
echo

OPTIONAL_VARS=(
    "NOTION_API_KEY"
    "NOTION_CLIENT_ID"
    "NOTION_CLIENT_SECRET"
    "NOTION_REDIRECT_URI"
    "NOTION_PARENT_PAGE_ID"
    "TRELLO_API_KEY"
    "TRELLO_TOKEN"
    "TRELLO_REDIRECT_URI"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "GOOGLE_REDIRECT_URI"
    "GOOGLE_REFRESH_TOKEN"
    "GITHUB_TOKEN"
    "GITHUB_CLIENT_ID"
    "GITHUB_CLIENT_SECRET"
    "GITHUB_REDIRECT_URI"
)

configured_optional=0
for var in "${OPTIONAL_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -n "$value" ] && [[ "$value" != "" ]]; then
        if set_cloudflare_secret "$var" "$value" "$ENVIRONMENTS"; then
            ((configured_optional++))
        fi
    fi
done

if [ $configured_optional -gt 0 ]; then
    print_status "OK" "Configured $configured_optional optional variables"
fi

echo
print_header "Setup Complete!"
echo
print_status "OK" "All required environment variables configured in Cloudflare"
echo
print_status "INFO" "Next steps:"
echo "  1. Trigger a new deployment (push to branch or create PR)"
echo "  2. Monitor the Cloudflare Workers Build in GitHub Actions"
echo "  3. Verify the build passes and deployment succeeds"
echo
print_status "INFO" "To verify configuration:"
echo "  wrangler secret list"
echo
print_status "INFO" "For manual configuration via Cloudflare Dashboard:"
echo "  1. Visit: https://dash.cloudflare.com/"
echo "  2. Navigate to: Workers & Pages → ideaflow → Settings → Environment Variables"
echo "  3. Verify all variables are set for both Production and Preview"
echo
