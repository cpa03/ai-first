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
    /InputWithValidation.tsx ← Form input with validation
    /KeyboardShortcutsHelp.tsx ← Keyboard shortcuts help
    /KeyboardShortcutsProvider.tsx ← Keyboard shortcuts context
    /LoadingAnnouncer.tsx   ← Screen reader announcements
    /LoadingSpinner.tsx     ← Spinner component
    /MobileNav.tsx         ← Responsive navigation
    /ProgressStepper.tsx    ← Progress indicator
    /ScrollToTop.tsx        ← Scroll to top button
    /Skeleton.tsx           ← Skeleton loading component
    /StepCelebration.tsx    ← Step completion celebration
    /SuccessCelebration.tsx  ← Success celebration animation
    /TaskManagement.tsx     ← Task management UI
    /ToastContainer.tsx     ← Toast notification container
    /Tooltip.tsx            ← Accessible tooltip component
    /WhyChooseSection.tsx   ← Why choose section
    /UserOnboarding.tsx     ← User onboarding flow
    /ShareButton.tsx        ← Share functionality
    /ReferralLink.tsx       ← Referral link component
    /task-management/       ← Task management components
      /DeliverableCard.tsx    ← Deliverable card with tasks list
      /TaskItem.tsx           ← Individual task item with status toggle
      /TaskManagementHeader.tsx ← Header with progress stats
  /hooks/                  ← React custom hooks
    /useTaskManagement.ts   ← Task management hook
    /useAuthCheck.ts        ← Authentication check hook
    /useBlueprintGeneration.ts ← Blueprint generation hook
    /useClarificationSession.ts ← Clarification session hook
    /useSessionDuration.ts   ← Session duration tracking hook
  /lib/                    ← Core utilities
    /auth.ts              ← Authentication service
    /db.ts                ← Database service
    /api-client.ts        ← API client utilities
    /errors.ts            ← Error handling
    /rate-limit.ts        ← Rate limiting
    /external-rate-limit.ts ← External rate limit service
    /metrics.ts          ← Metrics collection
    /logger.ts           ← Logging utilities
    /config-service.ts    ← Configuration service
    /type-guards.ts      ← Type guard utilities
    /resilience/          ← Resilience framework
      /circuit-breaker.ts    ← Circuit breaker implementation
      /circuit-breaker-manager.ts ← Circuit breaker manager
      /retry-manager.ts      ← Retry logic manager
      /timeout-manager.ts    ← Timeout management
      /resilient-wrapper.ts  ← Resilient operation wrapper
      /manager.ts           ← Resilience manager
      /config.ts            ← Resilience config
      /types.ts             ← Resilience types
  /types/                   ← TypeScript type definitions
    /api.ts               ← API response types
    /database.ts          ← Database types
    /task.ts              ← Task types
    /cloudflare.d.ts      ← Cloudflare types
  /styles/                  ← Global styles
  /templates/               ← Template files
    /blueprint-template.ts ← Blueprint template
  /proxy.ts                 ← Next.js middleware (replacement)
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

- [Blueprint](./docs/blueprint.md) - Complete project architecture
- [Architecture](./docs/architecture.md) - Technical deep-dive
- [API Reference](./docs/api.md) - Complete API documentation with examples
- [Error Codes](./docs/error-codes.md) - Error code reference
- [Health Monitoring](./docs/health-monitoring.md) - Health check guide
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [Agent Guidelines](./docs/agent-guidelines.md) - Agent behavior rules
- [Deployment](./docs/deploy.md) - Production deployment guide
- [Integration Hardening](./docs/integration-hardening.md) - Resilience patterns
- [Templates](./docs/templates/) - User-facing templates
- [Cloudflare Deployment](./docs/cloudflare-deploy.md) - Cloudflare-specific deployment
- [Environment Setup](./docs/environment-setup.md) - Development environment setup
- [FAQ](./docs/faq.md) - Frequently asked questions
- [Security Headers](./docs/security-headers.md) - HTTP security headers
- [Technical Writer Guide](./docs/technical-writer.md) - Documentation standards
- [Task Security](./docs/task-security.md) - Security considerations for tasks
- [Phase 1 Implementation Plan](./docs/phase-1-implementation-plan.md) - Phase 1 detailed plan
- [Integration Engineer](./docs/integration-engineer.md) - Integration patterns guide

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
