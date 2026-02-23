# Agent Architecture Details

Deep dive into the IdeaFlow multi-agent system internals, model selection strategies, and advanced patterns.

## Table of Contents

1. [System Overview](#system-overview)
2. [Model Selection Strategy](#model-selection-strategy)
3. [Agent Communication Patterns](#agent-communication-patterns)
4. [Skill Integration](#skill-integration)
5. [MCP Server Configuration](#mcp-server-configuration)
6. [Hooks System](#hooks-system)
7. [Performance Optimization](#performance-optimization)

## System Overview

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                           │
│                   (Next.js App Router)                       │
├─────────────────────────────────────────────────────────────┤
│                     CMZ Orchestrator                         │
│         (Self-Heal, Self-Learn, Self-Evolve)                │
├───────────────────────┬─────────────────────────────────────┤
│   OhMyOpenCode        │         Superpowers                  │
│   (Agent Dispatch)    │    (TDD, Debugging, Planning)       │
├───────────────────────┴─────────────────────────────────────┤
│                     Skills Layer                             │
│              (32+ Specialized Skills)                        │
├─────────────────────────────────────────────────────────────┤
│                   MCP Server Layer                           │
│      (Playwright, WebSearch, Context7, GitHub)              │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Hierarchy

| Level | File                            | Scope                  |
| ----- | ------------------------------- | ---------------------- |
| 1     | `opencode.json`                 | Base CLI configuration |
| 2     | `.opencode/oh-my-opencode.json` | Agent definitions      |
| 3     | `.opencode/agents/CMZ.json`     | CMZ-specific overrides |
| 4     | `.opencode/skills/*/SKILL.md`   | Skill-specific rules   |

## Model Selection Strategy

### Available Models

| Model             | Provider | Strengths                    | Cost Tier |
| ----------------- | -------- | ---------------------------- | --------- |
| kimi-k2.5-free    | OpenCode | Deep reasoning, architecture | Free      |
| glm-4.7-free      | OpenCode | Fast, efficient, frontend    | Free      |
| minimax-m2.1-free | OpenCode | Balanced, quick tasks        | Free      |

### Task-to-Model Mapping

```typescript
// Decision tree for model selection
function selectModel(task: Task): Model {
  if (task.requiresDeepReasoning) {
    return 'kimi-k2.5-free'; // Architecture, debugging
  }
  if (task.isFrontendWork) {
    return 'glm-4.7-free'; // UI/UX components
  }
  if (task.isQuickFix) {
    return 'minimax-m2.1-free'; // Simple changes
  }
  return 'glm-4.7-free'; // Default: fast and capable
}
```

### Category Definitions

| Category             | Model             | When to Use                                      |
| -------------------- | ----------------- | ------------------------------------------------ |
| `ultrabrain`         | kimi-k2.5-free    | Complex logic, architecture decisions, debugging |
| `visual-engineering` | glm-4.7-free      | UI components, styling, frontend features        |
| `quick`              | minimax-m2.1-free | Documentation, simple fixes, formatting          |
| `deep`               | kimi-k2.5-free    | Thorough analysis, comprehensive refactoring     |
| `artistry`           | glm-4.7-free      | Creative solutions, non-standard approaches      |
| `writing`            | glm-4.7-free      | Documentation, comments, explanations            |

## Agent Communication Patterns

### Background Task Pattern

```
Main Agent                Background Agent
    │                           │
    │─── Launch (async) ────────▶
    │                           │
    │   Continue work           │ Process task
    │                           │
    │◀── Notification ──────────│ Complete
    │                           │
    │─── Fetch results ─────────▶
    │                           │
    │◀── Return results ────────│
```

### Blocking Consultation Pattern

```
Main Agent                Oracle/Specialist
    │                           │
    │─── Request (blocking) ────▶
    │                           │
    │   Wait for response       │ Process
    │                           │
    │◀── Return result ─────────│
    │                           │
    │   Continue with result    │
```

### Parallel Agent Dispatch

```typescript
// Fire multiple background agents in parallel
const results = await Promise.all([
  task({ subagent_type: 'explore', run_in_background: true, prompt: '...' }),
  task({ subagent_type: 'librarian', run_in_background: true, prompt: '...' }),
  task({ subagent_type: 'explore', run_in_background: true, prompt: '...' }),
]);

// Collect results as they complete
for (const result of results) {
  const output = await background_output({ task_id: result.task_id });
  // Process output
}
```

## Skill Integration

### Skill Loading Order

1. **Metadata Phase**: All skill names and descriptions loaded
2. **Trigger Phase**: Matching skills identified
3. **Body Phase**: SKILL.md content loaded
4. **Reference Phase**: Additional files loaded as needed

### Skill Categories

| Category      | Skills                                                                   | Purpose                |
| ------------- | ------------------------------------------------------------------------ | ---------------------- |
| Process       | brainstorming, writing-plans, executing-plans, tdd, systematic-debugging | Development workflow   |
| Development   | subagent-dev, git-worktrees, verification, finishing-branch              | Implementation support |
| Collaboration | requesting-review, receiving-review, parallel-agents                     | Team coordination      |
| Domain        | git-master, planning, skill-creator, skill-builder                       | Specialized knowledge  |
| Context       | memory-systems, engineering-memory                                       | State management       |
| GitHub        | issue-triage, pr-triage, git-commit-message                              | Repository automation  |
| Backend       | codepro-backend, claude-codepro-backend                                  | Backend standards      |
| Debugging     | claude-code-debugging, debugging-strategies                              | Problem solving        |
| Testing       | proffesor-testing-qe                                                     | Quality assurance      |

### Creating Integrated Skills

```markdown
## Integration with Other Skills

This skill works well with:

- **systematic-debugging**: For root cause analysis
- **superpowers-tdd**: For test-first development
- **git-master**: For commit and branch management

Cross-reference in SKILL.md:

> See [systematic-debugging](../systematic-debugging/SKILL.md) for debugging methodology.
```

## MCP Server Configuration

### Available MCP Servers

| Server     | Purpose               | Configuration                  |
| ---------- | --------------------- | ------------------------------ |
| Playwright | Browser automation    | `mcp.playwright.enabled: true` |
| WebSearch  | Web search via Exa    | `mcp.websearch.enabled: true`  |
| Context7   | Context retrieval     | `mcp.context7.enabled: true`   |
| GitHub     | Repository operations | `mcp.github.enabled: true`     |

### MCP Integration Pattern

```typescript
// Use MCP through skill_mcp tool
skill_mcp({
  mcp_name: 'playwright',
  tool_name: 'browser_navigate',
  arguments: { url: 'https://example.com' },
});
```

## Hooks System

### Available Hooks

| Hook                 | When Fired            | Use Case              |
| -------------------- | --------------------- | --------------------- |
| `pre_tool_use`       | Before tool execution | Validation, logging   |
| `post_tool_use`      | After tool execution  | Cleanup, notification |
| `user_prompt_submit` | User sends message    | Preprocessing         |
| `stop`               | Session ends          | Cleanup, summary      |
| `pre_model_use`      | Before model call     | Context preparation   |
| `post_model_use`     | After model response  | Response processing   |

### Hook Configuration

```json
{
  "hooks": {
    "enabled": [
      "pre_tool_use",
      "post_tool_use",
      "user_prompt_submit",
      "stop",
      "pre_model_use",
      "post_model_use"
    ],
    "disabled": ["anthropic-context-window-limit-recovery"]
  }
}
```

## Performance Optimization

### Context Window Management

1. **Progressive Disclosure**: Load content in stages
2. **Reference Splitting**: Keep SKILL.md under 500 lines
3. **Background Tasks**: Offload exploration to background agents
4. **Caching**: Enable skill caching

### Parallel Execution Settings

```json
{
  "performance": {
    "cache_enabled": true,
    "parallel_agents": true,
    "background_tasks": true,
    "lsp_integration": true
  }
}
```

### Efficient Agent Dispatch

```typescript
// Good: Parallel background tasks
const [codebase, docs] = await Promise.all([
  task({ subagent_type: 'explore', run_in_background: true, prompt: '...' }),
  task({ subagent_type: 'librarian', run_in_background: true, prompt: '...' }),
]);

// Bad: Sequential blocking calls
const codebase = await task({
  subagent_type: 'explore',
  run_in_background: false,
});
const docs = await task({
  subagent_type: 'librarian',
  run_in_background: false,
});
```

### Memory Management

- Use `session_search` instead of reading full sessions
- Limit context with `limit` parameters
- Clear completed background tasks
- Use `grep` before reading large files

## Troubleshooting

### Common Issues

| Issue             | Cause           | Solution                  |
| ----------------- | --------------- | ------------------------- |
| Agent timeout     | Complex task    | Use background tasks      |
| Context overflow  | Large files     | Use references, grep      |
| Model mismatch    | Wrong category  | Check oh-my-opencode.json |
| Skill not loading | Bad frontmatter | Validate YAML syntax      |

### Debug Mode

```bash
# Check agent configuration
cat .opencode/oh-my-opencode.json | jq '.agents'

# Verify skill structure
cat .opencode/skills/skill-name/SKILL.md | head -10

# Test agent dispatch
opencode --agent sisyphus "test message"
```
