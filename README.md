# IdeaFlow — Turn Ideas into Actionable Plans

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/cpa03/ai-first/workflows/CI/badge.svg)](https://github.com/cpa03/ai-first/actions)
[![Deployed to Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com/)

**IdeaFlow** — turn raw ideas into production-ready plans (blueprint, roadmap, prioritized tasks, templates) — serverless web app + AI agents that fully manage repository automation.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Supabase account (free tier)
- GitHub account (for repository automation)

### Local Development Setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/cpa03/ai-first.git
   cd ai-first
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp config/.env.example .env.local
   # Edit .env.local with your Supabase and AI provider credentials
   ```

3. **Validate environment setup**

   ```bash
   npm run env:check
   ```

4. **Initialize Supabase database**

   ```bash
   # Apply schema from supabase/schema.sql
   npm run db:migrate
   ```

5. **Run the development server**

   ```bash
   npm run dev:check
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

   **Check health status**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 📁 Project Structure

```text
/README.md                    ← This file
/docs/blueprint.md            ← Project blueprint and architecture
/docs/                        ← Documentation
  /architecture.md           ← Technical architecture details
  /agent-guidelines.md       ← Agent behavior rules
  /api.md                   ← Complete API reference
  /error-codes.md           ← Error code reference
  /health-monitoring.md      ← Health monitoring guide
  /deploy.md                ← Deployment instructions
  /troubleshooting.md       ← Troubleshooting guide
  /integration-hardening.md  ← Resilience patterns
  /templates/               ← User-downloadable templates
  /security/                ← Security audit reports
  /adr/                     ← Architecture decision records
  /user-stories/            ← User story specifications
/src/
  /app/                    ← Next.js app (app router)
    /clarify/              ← Clarification flow pages
    /results/              ← Results display pages
    /dashboard/            ← Dashboard and analytics pages
    /login/                ← Login page
    /signup/               ← Signup page
    /auth/callback/        ← OAuth callback handler
    /api/                  ← API routes
      /health/             ← Health check endpoints
        /detailed/        ← Detailed health check
        /database/        ← Database health check
        /live/            ← Liveness probe
        /ready/           ← Readiness probe
        /integrations/    ← External integrations health
      /clarify/            ← Clarification API
        /start/           ← Start clarification session
        /answer/          ← Submit clarification answer
        /complete/        ← Complete clarification
      /breakdown/          ← Breakdown API
      /ideas/              ← Ideas CRUD API
        /[id]/tasks/      ← Tasks for idea
        /[id]/session/    ← Session management
        /[id]/route.ts    ← Single idea CRUD
      /deliverables/       ← Deliverables API
        /[id]/tasks/      ← Tasks for deliverable
      /tasks/              ← Tasks API
        /[id]/           ← Single task
        /[id]/status/     ← Task status update
      /metrics/            ← Metrics API
      /admin/              ← Admin endpoints
        /rate-limit/      ← Rate limit management
      /csp-report/         ← CSP violation reports
    /robots.ts          ← Robots.txt
    /sitemap.ts         ← Sitemap
  /components/             ← React components
    /Alert.tsx             ← Alert component
    /AutoSaveIndicator.tsx  ← Auto-save status indicator
    /BlueprintDisplay.tsx   ← Blueprint display UI
    /Button.tsx            ← Reusable button component
    /ClarificationFlow.tsx  ← Clarification workflow UI
    /CopyButton.tsx         ← Copy to clipboard button
    /EmailButton.tsx         ← Email send-to-self button
    /ErrorBoundary.tsx      ← Error boundary component
    /FeatureGrid.tsx        ← Feature showcase grid
    /GlobalErrorHandler.tsx  ← Global error handling
    /IdeaInput.tsx          ← Idea input component
    /IdeaReadyIndicator.tsx ← Idea ready status indicator
    /InputWithValidation.tsx ← Form input with validation
    /KeyboardShortcutsHelp.tsx ← Keyboard shortcuts help
    /KeyboardShortcutsProvider.tsx ← Keyboard shortcuts context
    /LayoutErrorFallback.tsx ← Layout error fallback UI
    /LoadingAnnouncer.tsx   ← Screen reader announcements
    /LoadingSpinner.tsx     ← Spinner component
    /MobileNav.tsx         ← Responsive navigation
    /NotificationPreferences.tsx ← Notification preferences settings
    /NotificationPrompt.tsx ← Notification permission prompt
    /ProgressStepper.tsx    ← Progress indicator
    /ReferralLink.tsx       ← Referral link component
    /ScrollToTop.tsx        ← Scroll to top button
    /SessionTracker.tsx     ← Session tracking component
    /ShareButton.tsx        ← Share functionality
    /Skeleton.tsx           ← Skeleton loading component
    /StatusAnnouncer.tsx    ← Status announcements for a11y
    /StepCelebration.tsx    ← Step completion celebration
    /SuccessCelebration.tsx  ← Success celebration animation
    /TaskManagement.tsx     ← Task management UI
    /ToastContainer.tsx     ← Toast notification container
    /Tooltip.tsx            ← Accessible tooltip component
    /UserOnboarding.tsx     ← User onboarding flow
    /WhyChooseSection.tsx   ← Why choose section
    /task-management/       ← Task management components
      /DeliverableCard.tsx    ← Deliverable card with tasks list
      /TaskItem.tsx           ← Individual task item with status toggle
      /TaskManagementHeader.tsx ← Header with progress stats
  /hooks/                  ← React custom hooks
    /useAuthCheck.ts        ← Authentication check hook
    /useBlueprintGeneration.ts ← Blueprint generation hook
    /useClarificationSession.ts ← Clarification session hook
    /useNotificationPermission.ts ← Notification permission hook
    /usePrefersReducedMotion.ts ← Reduced motion preference hook
    /useSessionDuration.ts   ← Session duration tracking hook
    /useTaskManagement.ts   ← Task management hook
  /lib/                    ← Core utilities
    /ab-test.ts           ← A/B testing utilities
    /ai.ts                ← AI provider abstraction
    /analytics.ts         ← Analytics tracking
    /api-client.ts        ← API client utilities
    /auth.ts              ← Authentication service
    /cache.ts             ← Caching utilities
    /cloudflare.ts        ← Cloudflare integration
    /config-service.ts    ← Configuration service
    /embedding-service.ts ← Embedding service
    /errors.ts            ← Error handling
    /external-rate-limit.ts ← External rate limit service
    /logger.ts           ← Logging utilities
    /metrics.ts          ← Metrics collection
    /pii-redaction.ts    ← PII redaction utilities
    /prompt-service.ts   ← AI prompt service
    /rate-limit.ts       ← Rate limiting
    /resource-cleanup.ts ← Resource cleanup utilities
    /service-worker.ts   ← Service worker utilities
    /session-analytics.ts ← Session analytics
    /similarity-service.ts ← Similarity matching service
    /type-guards.ts      ← Type guard utilities
    /utils.ts            ← General utilities
    /validation.ts       ← Input validation utilities
    /agents/             ← AI agent implementations
      /breakdown-engine/  ← Breakdown engine agent
      /clarifier-engine/  ← Clarifier engine agent
      /events/           ← Event handling agents
    /api-handler/        ← API handler utilities
      /wrapper.ts        ← API request wrapper
      /response.ts       ← Response formatting
    /config/             ← Configuration modules (40+ files)
      /constants.ts      ← Centralized constants
      /environment.ts    ← Environment configuration
      /database-tables.ts ← Database table names
      /theme.ts          ← Theme configuration
    /db/                  ← Database service module
      /service.ts        ← Database service
      /client.ts         ← Database client
      /ideas.ts          ← Ideas repository
      /tasks.ts          ← Tasks repository
      /deliverables.ts   ← Deliverables repository
      /clarification.ts  ← Clarification repository
      /vectors.ts        ← Vector store repository
    /export-connectors/  ← Export integrations
      /notion-exporter.ts ← Notion export
      /trello-exporter.ts ← Trello export
      /github-projects-exporter.ts ← GitHub Projects export
    /prompts/            ← AI prompt templates
      /breakdown/        ← Breakdown prompts
      /clarifier/        ← Clarifier prompts
    /resilience/          ← Resilience framework
      /circuit-breaker.ts    ← Circuit breaker implementation
      /circuit-breaker-manager.ts ← Circuit breaker manager
      /retry-manager.ts      ← Retry logic manager
      /timeout-manager.ts    ← Timeout management
      /resilient-wrapper.ts  ← Resilient operation wrapper
      /manager.ts           ← Resilience manager
      /config.ts            ← Resilience config
      /types.ts             ← Resilience types
    /security/           ← Security utilities
      /crypto.ts         ← Cryptographic functions
      /csrf.ts           ← CSRF protection
      /request-signer.ts ← Request signing
      /suspicious-patterns.ts ← Threat detection
  /types/                   ← TypeScript type definitions
    /api.ts               ← API response types
    /database.ts          ← Database types
    /task.ts              ← Task types
    /cloudflare.d.ts      ← Cloudflare types
  /styles/                  ← Global styles
  /templates/               ← Template files
    /blueprint-template.ts ← Blueprint template
  /instrumentation.ts      ← Next.js instrumentation
  /instrumentation.node.ts  ← Node-specific instrumentation
/supabase/
  schema.sql                 ← Database schema
/ai/
  /agent-configs/           ← Agent configuration files
    clarifier.yml           ← Clarifier agent config
    breakdown-engine.yml     ← Breakdown engine config
/config/
  /.env.example             ← Environment variable template
  /.env.test.example       ← Test environment template
  /agent-policy.md          ← Agent behavior rules
/scripts/
  /validate-env.sh          ← Environment validation script
  /security-check.sh        ← Security validation script
  /check-circular-deps.js   ← Circular dependency checker
  /scan-console.js          ← Console log scanner
  /lighthouse-audit.js      ← Lighthouse performance audit
  /validate-user-stories.js  ← User story validator
  /docs-link-validator.js   ← Documentation link checker
  /setup.js                 ← Project setup script
  /config.js                ← Configuration loader
/tests/                     ← Test files
  /api/                    ← API tests
  /utils/                   ← Test utilities
  /fixtures/                ← Test data and mocks
/.github/workflows/          ← GitHub Actions automation
/.husky/                     ← Git hooks
```

## 🤖 How the Agent System Works

IdeaFlow uses specialized AI agents that automate repository management:

1. **Clarification Agent** - Asks targeted questions to refine raw ideas
2. **Breakdown Agent** - Decomposes ideas into deliverables and tasks
3. **Timeline Agent** - Generates realistic project timelines
4. **Export Agent** - Creates downloadable plans and integrates with external tools

Agents operate through GitHub Actions, creating branches, making commits, and opening PRs for human review.

## 🛠️ Development Guidelines

### Coding Conventions

- **TypeScript** (strict mode) for all code
- **ESLint + Prettier** with shared configuration
- **Tailwind CSS** for styling
- **Jest + React Testing Library** for testing

### Agent Contribution Rules

- All agent work must go through feature branches + PRs
- Commits must include `AGENT=<agent-name>` in the message
- Never push directly to `main`
- Follow the machine-readable PR template
- Run tests and linting before merging

### Testing & Deployment

````bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build:check

# Check environment configuration
npm run env:check

# Deploy to Vercel
vercel --prod
```

## 🏗️ Architecture Summary

### Tech Stack

- **Frontend**: Next.js 16+ with App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Vector)
- **AI**: OpenAI/Anthropic APIs via abstraction layer
- **Hosting**: Vercel (free tier)
- **CI/CD**: GitHub Actions with OpenCode CLI agents

### Phase 0 Current Capabilities

- ✅ Repository structure and agent workflows
- ✅ Basic Next.js scaffold
- ✅ Supabase database schema
- ✅ GitHub Actions automation skeleton
- 🚧 Clarification Agent (in progress)
- 🚧 Blueprint export functionality (in progress)

## 🤝 Contributing & Issues

### How to Contribute

1. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines
2. Look for issues labeled `good first issue` or `help wanted`
3. Create a feature branch from `main`
4. Follow the coding conventions and testing requirements
5. Submit a PR with the machine-readable template

### Reporting Bugs or Requesting Features

- Use the [GitHub Issues](https://github.com/cpa03/ai-first/issues) page
- Provide clear reproduction steps for bugs
- Include detailed requirements for feature requests
- Tag relevant team members if needed

### Agent Workflow

All automated work follows this pattern:

1. Agent receives task via GitHub Actions
2. Creates feature branch `agent/<agent>-YYYYMMDD-HHMM`
3. Implements changes with proper commit messages
4. Opens PR with machine-readable metadata
5. CI runs tests and checks
6. Human reviews and merges (or requests changes)

## 📚 Documentation

> **Complete documentation index**: [docs/README.md](./docs/README.md) — 80+ documents organized by category

### Quick Links

- [Blueprint](./docs/blueprint.md) - Complete project architecture
- [Architecture](./docs/architecture.md) - Technical deep-dive
- [API Reference](./docs/api.md) - Complete API documentation with examples
- [Database Schema](./docs/database-schema.md) - Database schema with ERD
- [Environment Setup](./docs/environment-setup.md) - Development environment setup
- [Deployment](./docs/deploy.md) - Production deployment guide
- [FAQ](./docs/faq.md) - Frequently asked questions

### Specialist Guides

- [Backend Engineer](./docs/backend-engineer.md) | [Frontend Engineer](./docs/frontend-engineer.md) | [Database Architect](./docs/database-architect.md)
- [DevOps Engineer](./docs/devops-engineer.md) | [Security Engineer](./docs/security-engineer.md) | [API Specialist](./docs/api-specialist.md)
- [Quality Assurance](./docs/quality-assurance.md) | [Performance Engineer](./docs/performance-engineer.md)

### Architecture Decision Records

- [ADR Index](./docs/adr/) - All 15 architecture decisions (ADR-000 through ADR-014)

### User Stories & Templates

- [User Stories](./docs/user-stories/) - Authentication, ideas, breakdown, export, growth
- [Templates](./docs/templates/) - Blueprint, roadmap, tasks, user story templates

## 🗺️ Roadmap

### Phase 0 (Current) - Foundation

- [x] Repository structure and automation
- [x] Basic frontend scaffold
- [x] Database schema
- [ ] Clarification Agent MVP
- [ ] Blueprint export functionality

### Phase 1 - MVP

- [ ] Automatic breakdown engine
- [ ] Timeline generator
- [ ] Task management UI
- [ ] Vector store integration

### Phase 2 - Integrations

- [ ] Notion/Trello exports
- [ ] Advanced agent orchestration
- [ ] Progress analytics

### Phase 3 - Scale

- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] Paid plans and billing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ by the IdeaFlow team**
````
