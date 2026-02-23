---
name: ai-agent-engineer
description: Specialist skill for AI agent engineering in the IdeaFlow codebase. Use when (1) improving agent configurations (CMZ.json, oh-my-opencode.json), (2) creating or modifying agent skills, (3) enhancing agent orchestration patterns, (4) implementing self-* capabilities (self-heal, self-learn, self-evolve), (5) working with OpenCode CLI, OhMyOpenCode, or Superpowers frameworks, or (6) labeled issues with 'ai-agent-engineer'. Provides domain-specific knowledge for multi-agent systems, delegation patterns, and agent best practices.
license: MIT
---

# AI Agent Engineer

Expert guidance for engineering and improving AI agents in the IdeaFlow multi-agent system.

## Domain Scope

This skill covers the ai-agent-engineer domain within IdeaFlow:

| Area                | Files                                                        | Purpose                                 |
| ------------------- | ------------------------------------------------------------ | --------------------------------------- |
| Agent Configuration | `.opencode/agents/CMZ.json`, `.opencode/oh-my-opencode.json` | Agent definitions, models, capabilities |
| Skills Library      | `.opencode/skills/*/SKILL.md`                                | 32+ specialized skills                  |
| Agent Guidelines    | `docs/agent-guidelines.md`                                   | 10 core principles, workflows           |
| System Integration  | `opencode.json`, `AGENTS.md`                                 | CLI config, documentation               |

## Agent Architecture

### Primary Orchestrator: CMZ

CMZ (Cognitive Meta-Z) is the main orchestrating agent with three core capabilities:

1. **Self-Heal**: Detect errors, diagnose root cause, implement recovery
2. **Self-Learn**: Integrate feedback, analyze outcomes, build knowledge
3. **Self-Evolve**: Expand capabilities, optimize performance, meta-improve

### Specialized Agents (OhMyOpenCode)

| Agent      | Model          | Purpose                                 |
| ---------- | -------------- | --------------------------------------- |
| Sisyphus   | kimi-k2.5-free | Main orchestrator, relentless execution |
| Hephaestus | glm-4.7-free   | Autonomous deep worker                  |
| Oracle     | kimi-k2.5-free | Architecture, debugging, reasoning      |
| Librarian  | glm-4.7-free   | Documentation, exploration              |
| Explore    | glm-4.7-free   | Fast codebase search                    |

### Categories

| Category           | Model             | Use Case                    |
| ------------------ | ----------------- | --------------------------- |
| visual-engineering | glm-4.7-free      | UI/Frontend work            |
| ultrabrain         | kimi-k2.5-free    | Complex logic, architecture |
| quick              | minimax-m2.1-free | Fast, simple tasks          |
| deep               | kimi-k2.5-free    | Thorough analysis           |

## Delegation Patterns

### When to Delegate

```
Task Type              → Delegate To
─────────────────────────────────────
Codebase exploration   → explore (background)
Documentation lookup   → librarian (background)
Complex reasoning      → oracle (blocking)
UI/Frontend work       → visual-engineering category
Quick fixes            → quick category
```

### Delegation Commands

```bash
# Background exploration (parallel)
task(subagent_type="explore", run_in_background=true, prompt="...")

# Blocking consultation
task(subagent_type="oracle", run_in_background=false, prompt="...")

# Category delegation
task(category="visual-engineering", load_skills=["frontend-ui-ux"])
```

## Configuration Management

### Key Files

| File                            | Purpose                                  |
| ------------------------------- | ---------------------------------------- |
| `opencode.json`                 | CLI config, model selection, MCP servers |
| `.opencode/oh-my-opencode.json` | Agent definitions, categories, hooks     |
| `.opencode/agents/CMZ.json`     | CMZ-specific configuration               |

### Adding a New Agent

1. Define in `.opencode/oh-my-opencode.json`:

```json
"agents": {
  "new_agent": {
    "model": "opencode/model-name",
    "category": "category-name"
  }
}
```

2. Add to CMZ.json if orchestrator integration needed

### Adding a New Skill

1. Create directory: `.opencode/skills/skill-name/`
2. Create `SKILL.md` with frontmatter (name, description)
3. Add references in `references/` if needed
4. Follow skill-creator guidelines for structure

## Self-\* Capabilities

### Self-Heal Implementation

```
Error → Detect → Diagnose → Recover → Learn
```

1. **Detect**: Monitor for exceptions, failed tests, CI failures
2. **Diagnose**: Use systematic-debugging skill, analyze stack traces
3. **Recover**: Implement fix, verify with tests
4. **Learn**: Document in memory, prevent recurrence

### Self-Learn Implementation

```
Feedback → Analyze → Extract → Apply
```

1. **Collect**: User feedback, test outcomes, performance metrics
2. **Analyze**: Identify patterns, successful approaches
3. **Extract**: Generalize into reusable patterns
4. **Apply**: Update skills, configs, documentation

### Self-Evolve Implementation

```
Evaluate → Identify → Implement → Verify
```

1. **Evaluate**: Current capabilities vs requirements
2. **Identify**: Gaps, optimization opportunities
3. **Implement**: New skills, improved delegation
4. **Verify**: Tests pass, metrics improve

## Agent Improvement Workflow

### RESEARCH → PLAN → IMPLEMENT → VERIFY → SELF-REVIEW → DELIVER

1. **RESEARCH**: Explore codebase, gather context
2. **PLAN**: Create detailed work breakdown
3. **IMPLEMENT**: Make atomic changes
4. **VERIFY**: Run tests, lint, type-check
5. **SELF-REVIEW**: Check against requirements
6. **DELIVER**: Create PR with proper labeling

### Verification Checklist

- [ ] All tests pass (`npm test`)
- [ ] Lint passes with zero warnings (`npm run lint`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated if needed
- [ ] PR has `ai-agent-engineer` label

## Common Tasks

### Improve Agent Configuration

1. Read current config from `.opencode/oh-my-opencode.json`
2. Identify improvement (model change, capability addition)
3. Make atomic change
4. Verify with `opencode` CLI if possible
5. Document change in commit message

### Create New Skill

1. Use `skill-creator` skill for guidance
2. Run `init_skill.py` from skill-creator
3. Write SKILL.md with clear frontmatter
4. Add references for detailed content
5. Validate and test

### Fix Agent Issue

1. Reproduce issue
2. Use `systematic-debugging` skill
3. Implement minimal fix
4. Add regression test
5. Verify fix

## Reference Files

For detailed patterns and examples, see:

- **[Agent Architecture Details](references/agent-architecture.md)**: Deep dive into agent system internals, model selection, and advanced patterns

## Anti-Patterns

| Anti-Pattern         | Why Bad         | Instead                |
| -------------------- | --------------- | ---------------------- |
| Direct main commits  | Bypasses review | Use feature branches   |
| Skipping tests       | Regressions     | Always run tests       |
| Large atomic changes | Hard to review  | Small, focused changes |
| Ignoring CI failures | Ships bugs      | Fix all failures       |
| Undocumented changes | Knowledge loss  | Update documentation   |
