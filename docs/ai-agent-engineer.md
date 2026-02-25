# AI Agent Engineer - Long-term Memory

This document serves as the long-term memory for the AI Agent Engineer specialist role.

## Overview

The AI Agent Engineer is responsible for:

- Improving agent configurations (CMZ.json, oh-my-opencode.json)
- Creating/modifying agent skills
- Enhancing agent orchestration patterns
- Implementing self-\* capabilities (self-heal, self-learn, self-evolve)
- Working with OpenCode CLI, OhMyOpenCode, or Superpowers frameworks

## Issue #1743 - Event-Driven Architecture

**Status**: In Progress (Phase 1 Complete)

### Issue Description

The current agent system (Clarifier, Breakdown Engine) uses direct method calls and callbacks. As the system grows, this creates:

- Tight coupling between agents
- Difficult orchestration of complex workflows
- Limited extensibility for new agents
- No audit trail of agent events

### Implementation Phases

#### Phase 1 (PR #1774 - COMPLETE)

- Created event types in `src/lib/events/types.ts`
- Created EventBus class in `src/lib/events/event-bus.ts`
- Integrated EventBus into ClarifierAgent
- **Verification**: Type check passes, lint passes, 1327 tests pass

#### Phase 2 (Future)

- Add event emission to BreakdownEngine
- Add event handlers for side effects

#### Phase 3 (Future)

- Event logging for audit trail
- Documentation for event types

### Key Files Modified/Created

| File                          | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `src/lib/events/types.ts`     | TypeScript interfaces for all event types  |
| `src/lib/events/event-bus.ts` | EventBus singleton with subscribe/emit     |
| `src/lib/events/index.ts`     | Module exports                             |
| `src/lib/agents/clarifier.ts` | Added event emission (backward compatible) |

### Event Types Defined

- `idea.created`
- `clarification.started`
- `clarification.answer-submitted`
- `clarification.completed`
- `breakdown.started`
- `breakdown.completed`
- `deliverable.created`
- `task.generated`
- `export.requested`

## Guidelines Applied

1. **Small, Atomic Diffs**: Each PR implements a minimal, safe change
2. **Backward Compatibility**: Existing functionality preserved
3. **Type Safety**: Full TypeScript support
4. **Test Coverage**: All existing tests pass

## Best Practices

- Never refactor unrelated modules
- Never introduce unnecessary abstraction
- Always verify with tests before committing
- Link PRs to issues
- Use conventional commit messages with `AGENT=<agent-name>`

## Notes

- Pre-existing test failures in `ClarificationFlow.test.tsx` (2 tests) are unrelated to agent engineering changes
- Build requires environment variables (.env.local) not present in CI
