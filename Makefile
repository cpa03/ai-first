# IdeaFlow Makefile
# Standardized commands for development, CI/CD, and DevOps
#
# Usage:
#   make <target>
#   make help          # Show all available targets
#
# Categories:
#   - setup     : Environment setup and dependencies
#   - dev       : Development commands
#   - quality   : Code quality (lint, type-check, test)
#   - build     : Build commands
#   - devops    : DevOps and deployment commands
#   - security  : Security checks
#   - clean     : Cleanup commands

.PHONY: help setup install dev dev-check quality lint type-check test test-ci test-all build build-check devops env-check security security-check audit clean clean-all clean-cache deploy deploy-cloudflare

# Default target
.DEFAULT_GOAL := help

# =============================================================================
# HELP
# =============================================================================

help: ## Show this help message
	@echo "IdeaFlow Makefile - Available Commands"
	@echo "======================================"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; section=""} \
		/^##/ { section=substr($$0, 3); printf "\n[%s]\n", section } \
		/^[a-zA-Z0-9_-]+:.*##/ { printf "  %-20s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  make install          # Install dependencies"
	@echo "  make quality          # Run lint, type-check, and test"
	@echo "  make build            # Build for production"
	@echo "  make devops           # Run all DevOps checks"

# =============================================================================
# SETUP
# =============================================================================

## Setup
install: ## Install dependencies with npm ci
	@echo "📦 Installing dependencies..."
	npm ci

setup: install env-check ## Full setup: install deps and validate environment
	@echo "✅ Setup complete!"

# =============================================================================
# DEVELOPMENT
# =============================================================================

## Development
dev: ## Start development server
	@echo "🚀 Starting development server..."
	npm run dev

dev-check: ## Start dev server with environment validation
	@echo "🚀 Starting development server with validation..."
	npm run dev:check

# =============================================================================
# QUALITY
# =============================================================================

## Quality
lint: ## Run ESLint (errors only, max-warnings=0)
	@echo "🔍 Running ESLint..."
	npm run lint

type-check: ## Run TypeScript type checking
	@echo "🔍 Running TypeScript type check..."
	npm run type-check

test: ## Run tests in watch mode
	@echo "🧪 Running tests..."
	npm run test

test-ci: ## Run tests in CI mode (no watch)
	@echo "🧪 Running tests (CI mode)..."
	npm run test:ci

test-all: ## Run all test suites (unit, integration, e2e)
	@echo "🧪 Running all test suites..."
	npm run test:all

test-coverage: ## Run tests with coverage report
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage

quality: lint type-check test-ci ## Run all quality checks (lint, type-check, test)
	@echo "✅ All quality checks passed!"

# =============================================================================
# BUILD
# =============================================================================

## Build
build: ## Build for production
	@echo "🏗️ Building for production..."
	npm run build

build-check: ## Build with environment validation
	@echo "🏗️ Building with validation..."
	npm run build:check

build-cloudflare: ## Build for Cloudflare deployment
	@echo "🏗️ Building for Cloudflare..."
	npm run build:cloudflare

# =============================================================================
# DEVOPS
# =============================================================================

## DevOps
env-check: ## Validate environment configuration
	@echo "🔍 Validating environment..."
	@if [ -f scripts/validate-env.sh ]; then \
		bash scripts/validate-env.sh --quick; \
	else \
		echo "⚠️ scripts/validate-env.sh not found"; \
	fi

scan-console: ## Scan for console errors/warnings
	@echo "🔍 Scanning for console issues..."
	npm run scan:console

lighthouse: ## Run Lighthouse audit
	@echo "🔍 Running Lighthouse audit..."
	npm run audit:lighthouse

broc: build scan-console lighthouse ## Run BroCula workflow (build + console scan + lighthouse)
	@echo "✅ BroCula workflow complete!"

devops: quality security env-check ## Run all DevOps checks (quality + security + env)
	@echo "✅ All DevOps checks passed!"

# =============================================================================
# SECURITY
# =============================================================================

## Security
security-check: ## Run security checks for hardcoded secrets
	@echo "🔒 Running security check..."
	@if [ -f scripts/security-check.sh ]; then \
		bash scripts/security-check.sh; \
	else \
		echo "⚠️ scripts/security-check.sh not found"; \
	fi

audit: ## Run npm audit for vulnerabilities
	@echo "🔒 Running npm audit..."
	npm run audit:ci

audit-fix: ## Fix npm audit vulnerabilities
	@echo "🔒 Fixing npm vulnerabilities..."
	npm run audit:fix

security: security-check audit ## Run all security checks
	@echo "✅ Security checks complete!"

# =============================================================================
# CLEANUP
# =============================================================================

## Cleanup
clean-cache: ## Clear build caches
	@echo "🧹 Clearing caches..."
	rm -rf .next/cache .swc .eslintcache

clean-deps: ## Remove node_modules
	@echo "🧹 Removing node_modules..."
	rm -rf node_modules

clean-build: ## Remove build outputs
	@echo "🧹 Removing build outputs..."
	rm -rf .next out dist .open-next .wrangler coverage

clean: clean-cache clean-build ## Clean caches and build outputs
	@echo "✅ Cleaned caches and build outputs!"

clean-all: clean clean-deps ## Clean everything (including dependencies)
	@echo "✅ Fully cleaned!"

# =============================================================================
# DEPLOYMENT
# =============================================================================

## Deployment
preview-cloudflare: ## Preview Cloudflare deployment locally
	@echo "🚀 Previewing Cloudflare deployment..."
	npm run preview:cloudflare

deploy-cloudflare: ## Deploy to Cloudflare production
	@echo "🚀 Deploying to Cloudflare..."
	npm run deploy:cloudflare

deploy-cloudflare-staging: ## Deploy to Cloudflare staging
	@echo "🚀 Deploying to Cloudflare staging..."
	npm run deploy:cloudflare:staging

# =============================================================================
# DATABASE
# =============================================================================

## Database
db-migrate: ## Run database migrations
	@echo "🗄️ Running database migrations..."
	npm run db:migrate

db-reset: ## Reset database (DESTRUCTIVE)
	@echo "⚠️ Resetting database (DESTRUCTIVE)..."
	npm run db:reset

# =============================================================================
# UTILITIES
# =============================================================================

## Utilities
analyze: ## Analyze bundle size
	@echo "📊 Analyzing bundle size..."
	npm run analyze

format: ## Format code with Prettier
	@echo "✨ Formatting code..."
	npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

format-check: ## Check code formatting
	@echo "✨ Checking code format..."
	npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"

outdated: ## Check for outdated dependencies
	@echo "📦 Checking for outdated packages..."
	npm outdated
