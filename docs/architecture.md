# Architecture

## Overview

IdeaFlow is a serverless web application that turns raw ideas into actionable plans using AI agents. The system consists of a Next.js frontend, Supabase backend, and automated AI agents that manage repository workflows.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Vector)
- **AI**: OpenAI/Anthropic APIs via abstraction layer
- **Hosting**: Vercel (free tier)
- **CI/CD**: GitHub Actions with OpenCode CLI agents
- **Vector/Embedding store**: Supabase Vector (pgvector)

## Component Interaction

```
User Input → Clarification Agent → Breakdown Engine → Timeline Generator → Export System
     ↓              ↓                    ↓                    ↓              ↓
  Supabase ← Vector Store ← AI Models ← Task Database ← External APIs
```

## Data Flow

1. User submits raw idea through the web interface
2. Clarification Agent engages with user to refine the idea
3. Breakdown Engine decomposes idea into deliverables and tasks
4. Timeline Generator creates realistic project timeline
5. Export System creates downloadable plans and integrates with external tools
6. Progress Tracker monitors task completion and updates dashboard

## Database Schema

The database schema includes:

- `ideas` - stores raw user ideas
- `idea_sessions` - tracks clarification session state
- `deliverables` - broken-down project deliverables
- `tasks` - individual tasks with estimates and status
- `agent_logs` - logs all agent actions for audit trail

## Security & Privacy

- Supabase Auth handles user authentication
- RLS (Row Level Security) enforces data access controls
- PII is redacted before logging
- API keys are stored as GitHub secrets
- All sensitive operations require human approval

## Agent System

The agent system consists of several specialized agents:

- **Clarification Agent**: Asks targeted questions to refine raw ideas
- **Breakdown Agent**: Decomposes ideas into deliverables and tasks
- **Timeline Agent**: Generates realistic project timelines
- **Export Agent**: Creates downloadable plans and integrates with external tools
