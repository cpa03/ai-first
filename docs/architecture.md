# Architecture

## Project Structure

The project follows a Next.js 14+ app router structure with Supabase integration and AI abstraction layer.

```
src/
├── app/                 # Next.js app router pages
│   ├── clarify/         # Clarification flow pages
│   ├── results/         # Results display pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions
└── styles/              # Global styles
supabase/
├── schema.sql           # Database schema
├── migrations/          # Database migration files
└── seeds/               # Seed data
ai/
├── agent-configs/       # Agent configuration files
└── prompts/             # AI prompt templates
docs/                    # Documentation
config/                  # Configuration files
tests/                   # Test files
```

## Database Schema

- users (via Supabase Auth)
- ideas (id, user_id, title, raw_text, created_at, status)
- idea_sessions (idea_id, state, last_agent, metadata JSON)
- deliverables (idea_id, title, description, priority, estimate_hours)
- tasks (deliverable_id, title, description, assignee, status, estimate)
- vectors (embedding vectors/references)
- agent_logs (agent, action, payload, timestamp)

## AI Abstraction Layer

- Abstract model calls from OpenAI/Anthropic
- Implement context windowing strategy
- Add cost guardrails and rate limiting
- Support programmatic integrations

## Export Connectors

- Placeholder for Notion/Trello integrations
- Define JSON schema for programmatic integrations
