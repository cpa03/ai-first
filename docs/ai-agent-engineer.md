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

### Documentation Verification (2026-02-26)

When maintaining agent documentation:

1. **Verify against actual code**: Always cross-reference documentation claims with actual implementation
2. **Check iterate.yml job count**: Use grep to find job definitions and verify accuracy
3. **Proactive scanning**: When no issues exist, scan for documentation inconsistencies
4. **Small fixes**: Documentation fixes are valid ai-agent-engineer domain improvements

Example verification command:

```bash
grep -E "^\s{2}[a-z]+:" .github/workflows/iterate.yml | wc -l
```

### Skills Count Verification (2026-02-26)

When documenting skill counts:

1. **Count actual skills**: Use glob to find all SKILL.md files
2. **Check CMZ.json**: The `total_available` field should match actual count
3. **Cross-reference**: Verify AGENTS.md matches CMZ.json

Example verification command:

```bash
ls .opencode/skills/*/SKILL.md | wc -l
```

Note: CMZ.json shows 33 skills, ensure AGENTS.md reflects this.

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

The iterate.yml workflow (`.github/workflows/iterate.yml`) runs 5 agent jobs:

| Job Name  | Agent      | Purpose                 |
| --------- | ---------- | ----------------------- |
| architect | RepoKeeper | Strategy & Triage       |
| bugfix    | RepoKeeper | Bug fixing              |
| palette   | RepoKeeper | UX improvements         |
| flexy     | RepoKeeper | Modularity improvements |
| brocula   | RepoKeeper | Browser console fixes   |

The ai-agent-engineer job (planned for iterate.yml) will focus on:

- Agent configuration improvements (CMZ.json, oh-my-opencode.json)
- Skill maintenance and creation
- Workflow CI enhancements
- Self-\* capability implementations

### GitHub App Token Limitations (2026-02-25)

When pushing workflow file changes, the GitHub App token may fail with:
`refusing to allow a GitHub App to create or update workflow .github/workflows/xxx without workflows permission`

**Workarounds:**

1. Use a GitHub PAT with `workflows` permission instead of GitHub App token
2. Create PR with non-workflow changes first, then add workflow via follow-up
3. Use GitHub API with proper token to upload workflow files
4. Have maintainer with proper permissions merge workflow changes

**Prevention:**

- Document workflow changes in PR comments for manual addition
- Split changes into docs-only + workflow when token is limited

## Proactive Scanning (2026-02-26)

When no ai-agent-engineer labeled issues exist:

1. **Verify existing docs**: Check if domain documentation is accurate
2. **Cross-reference**: Compare AGENTS.md vs iterate.yml for consistency
3. **Check actual files**: Always verify against actual code/config
4. **Small fixes count**: Documentation fixes are valid domain improvements

Lesson learned: docs/ai-agent-engineer.md already had correct iterate.yml info (5 jobs), but AGENTS.md incorrectly listed only 4 jobs (missing Brocula). Always verify against actual implementation.

### Documentation Cross-Check (2026-02-27)

PM|Fixed AGENTS.md to include all 5 iterate.yml jobs:

JX|- architect (Strategy & Triage)
#QP|- bugfix (Bug fixing)
#YQ|- Palette (UX improvements)
#NQ|- Flexy (Modularity improvements)
#HB|- Brocula (Browser console fixes) - **was missing**

YX|This was discovered during proactive scanning - docs/ai-agent-engineer.md had correct info, but AGENTS.md was outdated.

#TB|This was discovered during proactive scanning - docs/ai-agent-engineer.md had correct info, but AGENTS.md was outdated.

#RH|### Missing Skill Discovery (2026-02-27)

#QT|During proactive scan of agent configurations:

#QT|1. **Issue Found**: CMZ.json and oh-my-opencode.json referenced a non-existent skill `frontend-ui-ux`
#YQ|2. **Impact**: Agent configs had broken skill reference
#JM|3. **Fix Applied**: Created `.opencode/skills/frontend-ui-ux/SKILL.md`
#NH|4. **Verification**: Skills count increased from 33 to 34

#YH|Key verification command:

#QW|```bash
#YQ|ls .opencode/skills/*/SKILL.md | wc -l
#MM|```

#QZ|Always verify referenced skills exist in `.opencode/skills/` directory.