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
   git clone https://github.com/your-username/ai-first.git
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

```
/README.md                 ← This file
/blueprint.md             ← Project blueprint and architecture
/docs/
  /architecture.md        ← Technical architecture details
  /agent-guidelines.md    ← Agent behavior rules
  /deploy.md             ← Deployment instructions
  /templates/            ← User-downloadable templates
/src/
  /app/                  ← Next.js app (app router)
  /components/           ← React components
  /lib/                  ← Core utilities
    ai.ts               ← AI model abstraction
    db.ts               ← Database utilities
    exports.ts          ← Export connectors
/supabase/
  schema.sql            ← Database schema
  migrations/           ← Database migrations
/ai/
  agent-configs/        ← Agent configuration files
  prompts/             ← AI prompt templates
/.github/workflows/     ← GitHub Actions automation
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

```bash
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

- **Frontend**: Next.js 14+ with App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Vector)
- **AI**: OpenAI/Anthropic APIs via abstraction layer
- **Hosting**: Vercel (free tier)
- **CI/CD**: GitHub Actions with OpenCode CLI agents

### Component Interaction

```
User Input → Clarification Agent → Breakdown Engine → Timeline Generator → Export System
     ↓              ↓                    ↓                    ↓              ↓
   Supabase ← Vector Store ← AI Models ← Task Database ← External APIs
```

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

- Use the [GitHub Issues](https://github.com/your-username/ai-first/issues) page
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
