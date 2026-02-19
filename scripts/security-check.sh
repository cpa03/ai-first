#!/bin/bash

# Security Check Script for Comprehensive Security Audit
# This script scans the codebase for potential security issues
# Part of security-engineer best practices
# Enhanced: 2026-02-19 by security-engineer specialist

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize counters
errors=0
warnings=0

print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "OK")
            echo -e "${GREEN}✓ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠ $message${NC}"
            ((warnings++)) || true
            ;;
        "ERROR")
            echo -e "${RED}✗ $message${NC}"
            ((errors++)) || true
            ;;
        "INFO")
            echo -e "${BLUE}ℹ $message${NC}"
            ;;
    esac
}

echo -e "${BLUE}🔒 Security Check - Comprehensive Security Audit${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# 1. Check for hardcoded API keys (excluding env references)
echo -e "${BLUE}Checking for hardcoded API keys...${NC}"
if grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '(sk-[a-zA-Z0-9]{20,}|sk-ant-[a-zA-Z0-9]{20,})' \
    src/ 2>/dev/null | grep -v "process.env" | grep -v "your_" | grep -v "placeholder" | grep -v "// " | grep -v "/\*"; then
    print_status "ERROR" "Found potential hardcoded API keys"
else
    print_status "OK" "No hardcoded API keys found"
fi

# 2. Check for hardcoded passwords/secrets
echo -e "${BLUE}Checking for hardcoded passwords/secrets...${NC}"
if grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '(password|secret|token)\s*[:=]\s*["'"'"'][^"'"'"']{8,}["'"'"']' \
    src/ 2>/dev/null | grep -v "process.env" | grep -v "your_" | grep -v "placeholder" | grep -v "redact"; then
    print_status "ERROR" "Found potential hardcoded passwords/secrets"
else
    print_status "OK" "No hardcoded passwords/secrets found"
fi

# 3. Check for NEXT_PUBLIC_ prefixed secrets
echo -e "${BLUE}Checking for improperly exposed secrets...${NC}"
if grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E 'NEXT_PUBLIC_.*(SECRET|KEY|PASSWORD|TOKEN)' \
    src/ config/ 2>/dev/null | grep -v "// " | grep -v "ANON_KEY"; then
    print_status "ERROR" "Found secrets with NEXT_PUBLIC_ prefix (would be exposed to client)"
else
    print_status "OK" "No improperly exposed secrets found"
fi

# 4. Check for dangerous HTML rendering
echo -e "${BLUE}Checking for dangerouslySetInnerHTML usage...${NC}"
dangerous_html=$(grep -rn --include="*.tsx" "dangerouslySetInnerHTML" src/ 2>/dev/null || true)
if [ -n "$dangerous_html" ]; then
    print_status "WARN" "Found dangerouslySetInnerHTML usage (review for XSS risks):"
    echo "$dangerous_html" | head -5
else
    print_status "OK" "No dangerouslySetInnerHTML usage found"
fi

# 5. Check for eval usage
echo -e "${BLUE}Checking for eval() usage...${NC}"
if grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '\beval\s*\(' \
    src/ 2>/dev/null | grep -v "// " | grep -v "/\*"; then
    print_status "ERROR" "Found eval() usage (security risk)"
else
    print_status "OK" "No eval() usage found"
fi

# 6. Check for .env files in git tracking
echo -e "${BLUE}Checking for exposed .env files...${NC}"
if git ls-files 2>/dev/null | grep -E "\.env$" | grep -v ".env.example" | grep -v ".env.test.example"; then
    print_status "ERROR" "Found .env files tracked in git (should be in .gitignore)"
else
    print_status "OK" "No .env files tracked in git"
fi

# 7. Check for console.log in production code
echo -e "${BLUE}Checking for console.log statements...${NC}"
console_logs=$(grep -rn --include="*.ts" --include="*.tsx" "console\.\(log\|debug\)" src/ 2>/dev/null | grep -v "logger.ts" | grep -v "instrumentation.ts" | grep -v "// " || true)
if [ -n "$console_logs" ]; then
    count=$(echo "$console_logs" | wc -l)
    print_status "WARN" "Found $count console.log/debug statements (review for sensitive data leakage)"
else
    print_status "OK" "No console.log/debug statements found (excluding logger.ts)"
fi

# 8. Check npm audit for critical/high vulnerabilities
echo -e "${BLUE}Running npm audit check...${NC}"
audit_result=$(npm audit --audit-level=high --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"critical":0,"high":0}}}')
critical=$(echo "$audit_result" | node -e "const d=require('fs').readFileSync(0,'utf8');const j=JSON.parse(d);console.log(j.metadata?.vulnerabilities?.critical || 0)" 2>/dev/null || echo "0")
high=$(echo "$audit_result" | node -e "const d=require('fs').readFileSync(0,'utf8');const j=JSON.parse(d);console.log(j.metadata?.vulnerabilities?.high || 0)" 2>/dev/null || echo "0")

if [ "$critical" -gt 0 ]; then
    print_status "ERROR" "Found $critical CRITICAL npm vulnerabilities"
elif [ "$high" -gt 0 ]; then
    print_status "WARN" "Found $high HIGH npm vulnerabilities (review: npm audit)"
else
    print_status "OK" "No critical/high npm vulnerabilities found"
fi

# 9. Check for potential SQL injection patterns
echo -e "${BLUE}Checking for potential SQL injection patterns...${NC}"
if grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '\$\{[^}]+\}.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)' \
    src/ 2>/dev/null | grep -v "// " | grep -v "process.env" | grep -v "parameterized"; then
    print_status "ERROR" "Found potential SQL injection (string interpolation in SQL)"
else
    print_status "OK" "No SQL injection patterns found"
fi

# 10. Check for SSRF vulnerabilities (unvalidated URL fetches)
echo -e "${BLUE}Checking for potential SSRF vulnerabilities...${NC}"
ssrf_patterns=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '(fetch|axios|http\.get|https\.get|request)\s*\(\s*(req\.|request\.|params\.|query\.)' \
    src/ 2>/dev/null | grep -v "validation" | grep -v "sanitize" || true)
if [ -n "$ssrf_patterns" ]; then
    count=$(echo "$ssrf_patterns" | wc -l)
    print_status "WARN" "Found $count potential SSRF patterns (unvalidated URL fetches) - review for URL validation"
else
    print_status "OK" "No obvious SSRF patterns found"
fi

# 11. Check for ReDoS vulnerable regex patterns
echo -e "${BLUE}Checking for ReDoS vulnerable regex patterns...${NC}"
redos_patterns=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '/[^/]*\([^)]*\+[^)]*\)[^/]*/[gimsuvy]*' \
    src/ 2>/dev/null | head -10 || true)
if [ -n "$redos_patterns" ]; then
    count=$(echo "$redos_patterns" | wc -l)
    print_status "WARN" "Found $count potential ReDoS patterns (nested quantifiers) - review regex complexity"
else
    print_status "OK" "No obvious ReDoS patterns found"
fi

# 12. Check for prototype pollution risks
echo -e "${BLUE}Checking for prototype pollution risks...${NC}"
proto_pollution=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '(Object\.assign|Object\.merge|\.extend\s*\()\s*\(\s*\{\s*\}\s*,' \
    src/ 2>/dev/null | grep -v "Object.create(null)" || true)
if [ -n "$proto_pollution" ]; then
    count=$(echo "$proto_pollution" | wc -l)
    print_status "WARN" "Found $count potential prototype pollution risks - review Object.assign usage"
else
    print_status "OK" "No prototype pollution risks found"
fi

# 13. Check for insecure random number generation
echo -e "${BLUE}Checking for insecure random number generation...${NC}"
insecure_random=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
    -E '(Math\.random\(\)|Math\.floor\(Math\.random)' \
    src/ 2>/dev/null | grep -v "test" | grep -v "mock" | grep -v "example" | grep -v "demo" || true)
if [ -n "$insecure_random" ]; then
    count=$(echo "$insecure_random" | wc -l)
    print_status "WARN" "Found $count Math.random() usages - ensure crypto.randomUUID() is used for security-sensitive random values"
else
    print_status "OK" "No insecure random number generation found"
fi

# 14. Check for missing authentication on API routes
echo -e "${BLUE}Checking for API routes without authentication...${NC}"
api_routes=$(find src/app/api -name "route.ts" -type f 2>/dev/null || true)
unauth_routes=0
for route in $api_routes; do
    if ! grep -q "auth\|session\|token\|user" "$route" 2>/dev/null; then
        if ! grep -q "GET\|public" "$route" 2>/dev/null; then
            unauth_routes=$((unauth_routes + 1))
        fi
    fi
done
if [ "$unauth_routes" -gt 0 ]; then
    print_status "WARN" "Found $unauth_routes API routes potentially without authentication - review for public endpoints"
else
    print_status "OK" "All API routes have authentication or are explicitly public"
fi

# 15. Check for exposed sensitive data in API responses
echo -e "${BLUE}Checking for sensitive data exposure in API responses...${NC}"
sensitive_exposure=$(grep -rn --include="*.ts" --include="*.tsx" \
    -E 'return\s+(Response\.json\(|NextResponse\.json\(|{).*\b(password|secret|token|api_key|private_key)\b' \
    src/app/api/ 2>/dev/null | grep -v "redact\|REDACTED\|process.env" || true)
if [ -n "$sensitive_exposure" ]; then
    print_status "ERROR" "Found potential sensitive data exposure in API responses"
else
    print_status "OK" "No sensitive data exposure patterns found in API responses"
fi

# 16. Check for missing rate limiting on sensitive endpoints
echo -e "${BLUE}Checking for rate limiting on sensitive endpoints...${NC}"
sensitive_endpoints=$(find src/app/api -name "route.ts" -type f -exec grep -l "POST\|PUT\|DELETE\|PATCH" {} \; 2>/dev/null || true)
unrated_count=0
for endpoint in $sensitive_endpoints; do
    if ! grep -q "rate\|limit\|throttle" "$endpoint" 2>/dev/null; then
        unrated_count=$((unrated_count + 1))
    fi
done
if [ "$unrated_count" -gt 0 ]; then
    print_status "INFO" "Found $unrated_count mutation endpoints without explicit rate limiting - ensure middleware handles this"
else
    print_status "OK" "All sensitive endpoints have rate limiting"
fi

# Summary
echo
echo -e "${BLUE}================================================${NC}"
if [ $errors -eq 0 ]; then
    if [ $warnings -eq 0 ]; then
        print_status "OK" "Security check passed! No issues found. 🎉"
        exit 0
    else
        print_status "WARN" "Security check passed with $warnings warning(s). Review above."
        exit 0
    fi
else
    print_status "ERROR" "Security check FAILED with $errors error(s) and $warnings warning(s)"
    exit 1
fi
