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
