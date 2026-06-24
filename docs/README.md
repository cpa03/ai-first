# Documentation Index

Complete index of all IdeaFlow documentation.

## 🚀 Quick Reference

### Common Commands

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start development server                     |
| `npm run dev:check`    | Start dev server with environment validation |
| `npm run build`        | Build for production                         |
| `npm run lint`         | Run ESLint with 0 warnings allowed           |
| `npm run lint:fix`     | Run ESLint with auto-fix                     |
| `npm run type-check`   | Run TypeScript type checking                 |
| `npm test`             | Run all tests                                |
| `npm run test:watch`   | Run tests in watch mode                      |
| `npm run test:changed` | Run only tests for changed files             |
| `npm run check`        | Run lint + type-check + tests                |
| `npm run env:check`    | Validate environment variables               |
| `npm run db:migrate`   | Run database migrations                      |

### Quick Start for New Developers

1. **Setup Environment**: See [Environment Setup](./environment-setup.md)
2. **Run Development Server**: `npm run dev:check`
3. **Check Health**: `curl http://localhost:3000/api/health`
4. **Run All Checks**: `npm run check`

### Architecture at a Glance

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | Next.js 16+ (App Router)         |
| Backend  | Supabase (PostgreSQL + Auth)     |
| AI       | OpenAI/Anthropic via abstraction |
| Hosting  | Vercel / Cloudflare              |
| CI/CD    | GitHub Actions                   |

---

## Core Documentation

- [Architecture](./architecture.md) - Technical architecture and system design
- [Blueprint](./blueprint.md) - Complete project blueprint and specifications
- [API Reference](./api.md) - Complete API documentation with examples
- [Agent Guidelines](./agent-guidelines.md) - AI agent behavior rules and guidelines
- [Database Schema](./database-schema.md) - Database schema documentation with ERD diagram

## Development Guides

- [Error Codes](./error-codes.md) - Complete error code reference
- [Health Monitoring](./health-monitoring.md) - Health check and monitoring guide
- [Deployment](./deploy.md) - Production deployment instructions
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [Integration Hardening](./integration-hardening.md) - Resilience patterns and best practices
- [Environment Setup](./environment-setup.md) - Development environment setup
- [FAQ](./faq.md) - Frequently asked questions
- [Database Migrations](./database-migrations.md) - Database migration guide and conventions
- [Events System](./events.md) - Event-driven architecture documentation
- [CI Parallel Tests](./ci-parallel-tests-implementation.md) - Parallel test execution in CI
- [Skipped Tests](./skipped-tests.md) - Documentation for skipped tests
- [Workflow Fix](./workflow-fix.md) - Workflow troubleshooting and fixes

## Specialist Guides

### Engineering

- [Backend Engineer](./backend-engineer.md) - Backend development guide
- [Frontend Engineer](./frontend-engineer.md) - Frontend development guide
- [Database Architect](./database-architect.md) - Database design and optimization
- [DevOps Engineer](./devops-engineer.md) - DevOps and infrastructure
- [DX Engineer](./dx-engineer.md) - Developer experience and tooling
- [Integration Engineer](./integration-engineer.md) - Integration patterns
- [API Specialist](./api-specialist.md) - API design and implementation
- [AI Agent Engineer](./ai-agent-engineer.md) - AI agent engineering and configuration
- [Platform Engineer](./platform-engineer.md) - Platform architecture and infrastructure

### Quality & Security

- [Security Engineer](./security-engineer.md) - Security best practices
- [Security Assessment](./security-assessment.md) - Security audit guidelines
- [Security Headers](./security-headers.md) - HTTP security headers reference
- [Security Sentinel](./security/sentinel.md) - Security vulnerability log and lessons learned
- [Security Validation](./SECURITY_VALIDATION.md) - Credential exposure prevention and validation
- [Quality Assurance](./quality-assurance.md) - Testing and quality standards
- [Performance Engineer](./performance-engineer.md) - Performance optimization
- [Performance Optimization](./performance-optimization.md) - Detailed optimization guide
- [Reliability Engineer](./reliability-engineer.md) - System reliability patterns
- [Memory Management](./memory-management.md) - Memory leak prevention and bounded cache configurations

### Design & UX

- [UI/UX Engineer](./ui-ux-engineer.md) - User interface guidelines
- [Technical Writer](./technical-writer.md) - Documentation standards

## Project Management

- [Roadmap](./roadmap.md) - Project roadmap and milestones
- [MVP Feature Status](./mvp-feature-status.md) - Current MVP progress dashboard
- [Launch Readiness Checklist](./launch-readiness-checklist.md) - MVP launch go/no-go criteria
- [Phase 1 Implementation Plan](./phase-1-implementation-plan.md) - Phase 1 detailed plan
- [Breakdown Engine Architecture](./breakdown-engine-architecture.md) - Breakdown system design
- [User Story Engineer](./user-story-engineer.md) - User story writing best practices
- [User Personas](./user-stories/personas.md) - Primary user personas for writing user stories
- [Product Architect](./Product-Architect.md) - Product architecture and design decisions
- [Growth & Innovation Strategist](./Growth-Innovation-Strategist.md) - Growth strategy and innovation
- [Research & Development](./RnD.md) - R&D documentation and experiments

## Operations

- [Cloudflare Deployment](./cloudflare-deploy.md) - Cloudflare-specific deployment
- [Code Reviewer](./code-reviewer.md) - Code review guidelines

## Task Management

- [Task Guide](./task.md) - Task creation and management
- [Task Security](./task-security.md) - Security considerations for tasks
- [Bug Guide](./bug.md) - Bug reporting guidelines
- [Feature Guide](./feature.md) - Feature request guidelines

## Maintenance

- [Branch Cleanup Registry](./BRANCH_CLEANUP.md) - Branch cleanup history and recommendations
- [Repository Health Report](./repository-health-report.md) - Repository health check results

## Project Meta

- [Changelog](../CHANGELOG.md) - Project changelog and version history

## Architecture Decision Records

- [ADR Index](./adr/README.md) - Complete ADR listing and guidelines
- [ADR-000: Template](./adr/ADR-000-template.md) - ADR template for new decisions
- [ADR-001: AI Abstraction Layer](./adr/ADR-001-ai-abstraction-layer.md) - AI provider abstraction strategy
- [ADR-002: Supabase Database & Auth](./adr/ADR-002-supabase-database-auth.md) - Database and auth provider choice
- [ADR-003: Next.js App Router](./adr/ADR-003-nextjs-app-router.md) - Next.js routing strategy
- [ADR-004: Rate Limiting](./adr/ADR-004-rate-limiting.md) - Rate limiting implementation
- [ADR-005: Circuit Breaker](./adr/ADR-005-circuit-breaker.md) - Circuit breaker pattern
- [ADR-006: Standardized Errors](./adr/ADR-006-standardized-errors.md) - Error handling standards
- [ADR-007: TypeScript Strict Mode](./adr/ADR-007-typescript-strict-mode.md) - TypeScript configuration
- [ADR-008: Tailwind CSS](./adr/ADR-008-tailwind-css.md) - Styling approach
- [ADR-009: Vercel Hosting](./adr/ADR-009-vercel-hosting.md) - Hosting platform choice
- [ADR-010: GitHub Actions CI/CD](./adr/ADR-010-github-actions-ci-cd.md) - CI/CD pipeline
- [ADR-011: Supabase Database Services](./adr/ADR-011-supabase-database-services.md) - Database service patterns
- [ADR-012: REST API Design Patterns](./adr/ADR-012-rest-api-design-patterns.md) - API design standards
- [ADR-013: Resilience Patterns](./adr/ADR-013-resilience-patterns.md) - Resilience and retry patterns
- [ADR-014: Supabase Auth](./adr/ADR-014-supabase-auth.md) - Authentication implementation

## Templates

- [Templates Index](./templates/README.md) - Complete templates listing and usage guide
- [Blueprint Template](./templates/blueprint_template.md) - Blueprint document template
- [Roadmap Template](./templates/roadmap_template.md) - Roadmap document template
- [Tasks Template](./templates/tasks_template.md) - Tasks document template
- [User Story Template](./templates/user-story_template.md) - User story template
- [Specialist User Story Template](./templates/specialist-user-story_template.md) - Specialist user story template

## User Stories

- [User Stories Index](./user-stories/README.md) - Complete user stories dashboard and progress tracker

### Authentication

- [US-AUTH-001: Signup](./user-stories/authentication/us-auth-001-signup.md) - User signup flow
- [US-AUTH-002: Login](./user-stories/authentication/us-auth-002-login.md) - User login flow
- [US-AUTH-003: Password Reset](./user-stories/authentication/us-auth-003-password-reset.md) - Password reset flow

### Idea Management

- [US-IDEA-001: Submission](./user-stories/idea-management/us-idea-001-submission.md) - Idea submission flow
- [US-IDEA-002: Dashboard](./user-stories/idea-management/us-idea-002-dashboard.md) - Dashboard management

### Breakdown

- [US-BREAKDOWN-001: Engine](./user-stories/breakdown/us-breakdown-001-engine.md) - Breakdown engine flow

### Export

- [US-EXPORT-001: Markdown](./user-stories/export/us-export-001-markdown.md) - Markdown export flow

### Growth

- [US-GROWTH-001: Share](./user-stories/growth/us-growth-001-share.md) - Sharing functionality
- [US-GROWTH-002: Referral](./user-stories/growth/us-growth-002-referral.md) - Referral system

### Personas

- [User Personas](./user-stories/personas.md) - Primary user personas

## Implementation Plans

- [Flexy Modularity Plan](./plans/flexy-modularity-plan.md) - Modular architecture plan
- [Decompose Database Service](./plans/2026-05-12-decompose-database-service.md) - Database service decomposition

## Security Reports

- [Security Audit P0](./security/SECURITY_AUDIT_P0_1135.md) - Priority-0 security audit
- [Security Verification #1135](./security/SECURITY_VERIFICATION_1135.md) - Supabase service role key exposure verification
- [Security Sentinel](./security/sentinel.md) - Security vulnerability log

---

_This index is maintained by RepoKeeper to ensure documentation discoverability._
