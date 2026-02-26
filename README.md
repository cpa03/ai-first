# IdeaFlow — Turn Ideas into Actionable Plans

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/cpa03/ai-first/workflows/CI/badge.svg)](https://github.com/cpa03/ai-first/actions)
[![Deployed to Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com/)

**IdeaFlow** — turn raw ideas into production-ready plans (blueprint, roadmap, prioritized tasks, templates) — serverless web app + AI agents that fully manage repository automation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
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

#SB|## 📁 Project Structure
#QH|
#PH|``text
#PX|/README.md                    ← This file
#QH|/blueprint.md                  ← Project blueprint and architecture
#VY|/docs/                        ← Documentation
#NR|  /architecture.md           ← Technical architecture details
#HS|  /agent-guidelines.md       ← Agent behavior rules
#RY|  /api.md                   ← Complete API reference
#RP|  /error-codes.md           ← Error code reference
#BW|  /health-monitoring.md      ← Health monitoring guide
#TH|  /deploy.md                ← Deployment instructions
#HT|  /troubleshooting.md       ← Troubleshooting guide
#HS|  /integration-hardening.md  ← Resilience patterns
#HH|  /templates/               ← User-downloadable templates
#HH|  /security/                ← Security audit reports
#HH|  /adr/                     ← Architecture decision records
#HH|  /user-stories/            ← User story specifications
#BY|  /src/
#PJ|  /app/                    ← Next.js app (app router)
#XY|    /clarify/              ← Clarification flow pages
#NY|    /results/              ← Results display pages
#PK|    /dashboard/            ← Dashboard and analytics pages
#VB|    /login/                ← Login page
#VB|    /signup/               ← Signup page
#VB|    /auth/callback/        ← OAuth callback handler
#PB|    /api/                  ← API routes
#SN|      /health/             ← Health check endpoints
#XK|        /detailed/        ← Detailed health check
#XK|        /database/        ← Database health check
#XK|        /live/            ← Liveness probe
#XK|        /ready/           ← Readiness probe
#XK|        /integrations/    ← External integrations health
#ZP|      /clarify/            ← Clarification API
#ZP|        /start/           ← Start clarification session
#ZP|        /answer/          ← Submit clarification answer
#ZP|        /complete/        ← Complete clarification
#ZP|      /breakdown/          ← Breakdown API
#PW|      /ideas/              ← Ideas CRUD API
#PW|        /[id]/tasks/      ← Tasks for idea
#PW|        /[id]/session/    ← Session management
#PW|        /[id]/route.ts    ← Single idea CRUD
#KK|      /deliverables/       ← Deliverables API
#KK|        /[id]/tasks/      ← Tasks for deliverable
#KP|      /tasks/              ← Tasks API
#KP|        /[id]/           ← Single task
#KP|        /[id]/status/     ← Task status update
#HR|      /metrics/            ← Metrics API
#RT|      /admin/              ← Admin endpoints
#RT|        /rate-limit/      ← Rate limit management
#RT|      /csp-report/         ← CSP violation reports
#RT|      /robots.ts          ← Robots.txt
#RT|      /sitemap.ts         ← Sitemap
#XM|  /components/             ← React components
#PR|    /Alert.tsx             ← Alert component
#RT|    /AutoSaveIndicator.tsx  ← Auto-save status indicator
#SJ|    /BlueprintDisplay.tsx   ← Blueprint display UI
#VH|    /Button.tsx            ← Reusable button component
#ZH|    /ClarificationFlow.tsx  ← Clarification workflow UI
    /CopyButton.tsx         ← Copy to clipboard button
    /EmailButton.tsx         ← Email send-to-self button
#JS|    /ErrorBoundary.tsx      ← Error boundary component
#QM|    /FeatureGrid.tsx        ← Feature showcase grid
#HB|    /GlobalErrorHandler.tsx  ← Global error handling
#YK|    /IdeaInput.tsx          ← Idea input component
#BX|    /InputWithValidation.tsx ← Form input with validation
#YQ|    /KeyboardShortcutsHelp.tsx ← Keyboard shortcuts help
#SK|    /KeyboardShortcutsProvider.tsx ← Keyboard shortcuts context
#RN|    /LoadingAnnouncer.tsx   ← Screen reader announcements
#TQ|    /LoadingOverlay.tsx     ← Loading overlay component
#MQ|    /LoadingSpinner.tsx     ← Spinner component
#TB|    /MobileNav.tsx         ← Responsive navigation
#WX|    /ProgressStepper.tsx    ← Progress indicator
#QS|    /ScrollToTop.tsx        ← Scroll to top button
#XK|    /Skeleton.tsx           ← Skeleton loading component
#QZ|    /StepCelebration.tsx    ← Step completion celebration
#TT|    /SuccessCelebration.tsx  ← Success celebration animation
#RR|    /TaskManagement.tsx     ← Task management UI
#PS|    /ToastContainer.tsx     ← Toast notification container
#BR|    /Tooltip.tsx            ← Accessible tooltip component
#YQ|    /WhyChooseSection.tsx   ← Why choose section
#JW|    /UserOnboarding.tsx     ← User onboarding flow
#JW|    /ShareButton.tsx        ← Share functionality
#JW|    /ReferralLink.tsx       ← Referral link component
#PR|    /task-management/       ← Task management components
#KK|      /DeliverableCard.tsx    ← Deliverable card with tasks list
#KK|      /TaskItem.tsx           ← Individual task item with status toggle
#KK|      /TaskManagementHeader.tsx ← Header with progress stats
#HX|  /hooks/                  ← React custom hooks
#QY|    /useTaskManagement.ts   ← Task management hook
#QY|    /useAuthCheck.ts        ← Authentication check hook
#QY|    /useBlueprintGeneration.ts ← Blueprint generation hook
#QY|    /useClarificationSession.ts ← Clarification session hook
#PM|  /lib/                    ← Core utilities
#BM|    /auth.ts              ← Authentication service
#HN|    /db.ts                ← Database service
#BK|    /api-client.ts        ← API client utilities
#KB|    /api-handler.ts       ← API request handler
#ZT|    /errors.ts            ← Error handling
#PM|    /rate-limit.ts        ← Rate limiting
#PM|    /external-rate-limit.ts ← External rate limit service
#PM|    /use-cache.ts         ← Caching utilities
#PM|    /metrics.ts          ← Metrics collection
#PM|    /logger.ts           ← Logging utilities
#PM|    /config-service.ts    ← Configuration service
#PM|    /type-guards.ts      ← Type guard utilities
#PM|    /resilience/          ← Resilience framework
#SR|      /circuit-breaker.ts    ← Circuit breaker implementation
#BJ|      /circuit-breaker-manager.ts ← Circuit breaker manager
#PK|      /retry-manager.ts      ← Retry logic manager
#MK|      /timeout-manager.ts    ← Timeout management
#WX|      /resilient-wrapper.ts  ← Resilient operation wrapper
#WX|      /manager.ts           ← Resilience manager
#WX|      /config.ts            ← Resilience config
#WX|      /types.ts             ← Resilience types
#RT|  /types/                   ← TypeScript type definitions
#RT|    /api.ts               ← API response types
#RT|    /database.ts          ← Database types
#RT|    /task.ts              ← Task types
#RT|    /cloudflare.d.ts      ← Cloudflare types
#QJ|  /styles/                  ← Global styles
#RS|  /templates/               ← Template files
#BQ|    /blueprint-template.ts ← Blueprint template
#JP|  /middleware.ts            ← Next.js middleware (legacy)
#JP|  /instrumentation.ts      ← Next.js instrumentation
#JP|  /instrumentation.node.ts  ← Node-specific instrumentation
#MJ|/supabase/
#RX|  schema.sql                 ← Database schema
#MJ|/ai/
#JR|  /agent-configs/           ← Agent configuration files
#MZ|    clarifier.yml           ← Clarifier agent config
#QJ|    breakdown-engine.yml     ← Breakdown engine config
#WZ|/config/
#TK|  /.env.example             ← Environment variable template
#TK|  /.env.test.example       ← Test environment template
#TK|  /agent-policy.md          ← Agent behavior rules
#QH|/scripts/
#ZP|  /validate-env.sh          ← Environment validation script
#ZP|  /setup-cloudflare-env.sh ← Cloudflare environment setup
#ZP|  /security-check.sh        ← Security validation script
#ZP|  /check-circular-deps.js   ← Circular dependency checker
#ZP|  /scan-console.js          ← Console log scanner
#ZP|  /lighthouse-audit.js      ← Lighthouse performance audit
#ZP|  /validate-ci-config.js    ← CI configuration validator
#ZP|  /validate-user-stories.js  ← User story validator
#ZP|  /docs-link-validator.js   ← Documentation link checker
#ZP|  /setup.js                 ← Project setup script
#ZP|  /config.js                ← Configuration loader
#ZP|  /generate-pwa-icons.js    ← PWA icon generator
#XT|/tests/                     ← Test files
#WZ|  /api/                    ← API tests
#QB|  /utils/                   ← Test utilities
#RM|  /fixtures/                ← Test data and mocks
#PJ|/.github/workflows/          ← GitHub Actions automation
#KM|/.husky/                     ← Git hooks
#KM|`text
#HM|

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
```bash

## 🏗️ Architecture Summary

### Tech Stack

- **Frontend**: Next.js 16+ with App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Vector)
- **AI**: OpenAI/Anthropic APIs via abstraction layer
- **Hosting**: Vercel (free tier)
- **CI/CD**: GitHub Actions with OpenCode CLI agents

### Component Interaction

```text

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

- [Blueprint](./blueprint.md) - Complete project architecture
- [Architecture](./docs/architecture.md) - Technical deep-dive
- [API Reference](./docs/api.md) - Complete API documentation with examples
- [Error Codes](./docs/error-codes.md) - Error code reference
- [Health Monitoring](./docs/health-monitoring.md) - Health check guide
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [Agent Guidelines](./docs/agent-guidelines.md) - Agent behavior rules
- [Deployment](./docs/deploy.md) - Production deployment guide
- [Integration Hardening](./docs/integration-hardening.md) - Resilience patterns
- [Templates](./docs/templates/) - User-facing templates

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
