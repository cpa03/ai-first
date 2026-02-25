# AI Agent Engineer Documentation

## Overview

This document serves as the long-term memory for the AI Agent Engineer specialist. It captures domain knowledge, patterns, and lessons learned from implementing agent systems.

## Domain: AI Agent Engineering

### Responsibilities

- Implementing agent configurations (CMZ.json, oh-my-opencode.json)
- Creating and modifying agent skills
- Enhancing agent orchestration patterns
- Implementing self-\* capabilities (self-heal, self-learn, self-evolve)
- Working with OpenCode CLI, OhMyOpenCode, and Superpowers frameworks

### Current Architecture

The agent system consists of:

1. **Clarifier Agent** (`src/lib/agents/clarifier.ts`)
   - Asks targeted questions to refine raw ideas
   - Manages clarification sessions
   - Generates refined ideas based on user responses

2. **Breakdown Engine** (`src/lib/agents/breakdown-engine.ts`)
   - Analyzes refined ideas
   - Decomposes into tasks and deliverables
   - Generates timelines and dependency graphs

### Event-Driven Architecture

As of 2026-02-24, the system implements an event-driven architecture:

- **Event Bus**: Central pub/sub mechanism for agent communication
- **Event Types**: Typed events for different agent actions
- **Audit Trail**: Full event history for observability

See: [Event System Implementation](./events.md)

## Patterns & Conventions

### Agent Implementation Pattern

```typescript
class Agent {
  async initialize(): Promise<void> {
    // Load config and initialize dependencies
  }

  async execute(input: Input): Promise<Output> {
    // Emit start event
    // Process
    // Emit completion event
    // Return output
  }
}
```

### Event Emission Pattern

```typescript
import { eventBus } from './event-bus';

await eventBus.emit({
  type: 'AgentStarted',
  payload: { agentId: 'clarifier', input: {...} },
  timestamp: new Date(),
  source: 'clarifier',
});
```

## Known Issues & Solutions

### Issue: Tight Coupling Between Agents

**Solution**: Implemented event-driven architecture with typed events and centralized event bus.

### Issue: No Audit Trail

**Solution**: Event bus logs all events with timestamps for full observability.

## References

- [Agent Configuration](./agent-config.md)
- [Skills Library](../.opencode/skills/)
- [CMZ Agent Configuration](../.opencode/agents/CMZ.json)

## Lessons Learned

### Issue Resolution Process (2026-02-25)

When handling ai-agent-engineer labeled issues:

1. **Check existing PRs**: Use `gh pr list --label "ai-agent-engineer" --state all`
2. **Check existing issues**: Use `gh issue list --label "ai-agent-engineer" --state all`
3. **Explore codebase**: Use glob/grep to find relevant implementations
4. **Verify implementation**: Check if acceptance criteria are already met
5. **If complete**: Add comment with implementation summary and close issue
6. **If incomplete**: Create branch and implement

### Key Pattern: Event-Driven Architecture

The event-driven architecture was implemented to solve tight coupling. Key files:

- `src/lib/agents/events/types.ts` - Event type definitions
- `src/lib/agents/events/event-bus.ts` - Pub/sub implementation
- `src/lib/agents/events/handlers.ts` - Side effect handlers
- `src/lib/agents/events/index.ts` - Public exports
- `docs/events.md` - Full documentation

All agents should emit typed events for:

- Start of operation
- Progress/completion of subtasks
- Completion of operation
- Errors

#JY|This enables loose coupling and easy extensibility.

## CI Workflow Jobs

The iterate.yml workflow (`.github/workflows/iterate.yml`) runs 6 agent jobs:

| Job Name          | Agent             | Purpose                        |
| ----------------- | ----------------- | ------------------------------ |
| architect         | RepoKeeper        | Strategy & Triage              |
| bugfix            | RepoKeeper        | Bug fixing                     |
| palette           | RepoKeeper        | UX improvements                |
| flexy             | RepoKeeper        | Modularity improvements        |
| brocula           | RepoKeeper        | Browser console fixes          |
| ai-agent-engineer | ai-agent-engineer | Agent system maintenance (NEW) |

The ai-agent-engineer job specifically focuses on:

- Agent configuration improvements (CMZ.json, oh-my-opencode.json)
- Skill maintenance and creation
- Workflow CI enhancements
- Self-\* capability implementations

## CI Workflow Jobs

The iterate.yml workflow (`.github/workflows/iterate.yml`) runs 5 agent jobs:

| Job Name  | Agent      | Purpose                 |
| --------- | ---------- | ----------------------- |
| architect | RepoKeeper | Strategy & Triage       |
| bugfix    | RepoKeeper | Bug fixing              |
| palette   | RepoKeeper | UX improvements         |
| flexy     | RepoKeeper | Modularity improvements |
| brocula   | RepoKeeper | Browser console fixes   |

**Note**: The ai-agent-engineer job is not yet implemented in the CI workflow.
The ai-agent-engineer agent can be triggered manually or via separate workflows
for agent system maintenance, configuration improvements, and skill maintenance.

Runs on schedule every 4 hours and on main branch changes.
