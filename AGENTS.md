# AI Agents Configuration

This repository uses a sophisticated multi-agent system powered by OpenCode CLI with OhMyOpenCode and Superpowers frameworks.

## Agent Architecture

### Primary Agent: CMZ (Cognitive Meta-Z)

**CMZ** is the main orchestrating agent with three core capabilities:

1. **Self-Heal**: Automatically detect and recover from errors
2. **Self-Learn**: Continuously learn from interactions and outcomes
3. **Self-Evolve**: Automatically improve capabilities over time

**Configuration**: `.opencode/agents/CMZ.json`

### Specialized Agents (via OhMyOpenCode)

| Agent              | Model                      | Purpose                                    |
| ------------------ | -------------------------- | ------------------------------------------ |
| **Sisyphus**       | opencode/kimi-k2.5-free    | Main orchestrator, relentless execution    |
| **Hephaestus**     | opencode/glm-4.7-free      | Autonomous deep worker, goal-oriented      |
| **Oracle**         | opencode/kimi-k2.5-free    | Architecture, debugging, complex reasoning |
| **Librarian**      | opencode/glm-4.7-free      | Documentation, codebase exploration        |
| **Explore**        | opencode/glm-4.7-free      | Fast codebase search                       |
| **Frontend UI/UX** | opencode/glm-4.7-free      | Frontend development                       |
| **Minimax Agent**  | opencode/minimax-m2.1-free | Balanced performance tasks                 |

## Model Configuration

All agents use free-tier OpenCode models:

- **opencode/kimi-k2.5-free**: High reasoning capability (Sisyphus, Oracle, CMZ)
- **opencode/glm-4.7-free**: Fast, efficient (Hephaestus, Librarian, Explore)
- **opencode/minimax-m2.1-free**: Balanced performance (quick tasks)

## Task Delegation Rules

CMZ automatically delegates based on task type:

- **Visual Engineering** → Frontend UI/UX Agent
- **Complex Logic/Architecture** → Oracle/Sisyphus
- **Quick Tasks** → Minimax Agent
- **Git Operations** → Git Master skill
- **Debugging** → Systematic Debugging skill
- **Documentation** → Librarian

## Skills Library

33 specialized skills available in `.opencode/skills/`:

### Process Skills

- `superpowers-brainstorming` - Design refinement
- `superpowers-writing-plans` - Implementation planning
- `superpowers-executing-plans` - Plan execution
- `superpowers-tdd` - Test-driven development
- `systematic-debugging` - Root cause analysis

### Development Skills

- `superpowers-subagent-dev` - Subagent-driven development
- `superpowers-git-worktrees` - Parallel development
- `superpowers-verification` - Completion verification
- `superpowers-finishing-branch` - Merge/PR workflow

### Domain Skills

- `git-master` - Git operations
- `planning` - Task planning
- `skill-creator` - Create new skills
- `github-workflow-automation` - CI/CD workflows
- `codepro-backend-standards` - Backend standards

## Usage

### Quick Start

Use the magic keyword for full automation:

```
ultrawork [your task]
```

Or shorthand:

```
ulw [your task]
```

### Manual Delegation

To delegate a specific task:

1. Specify the category or skill
2. CMZ will route to the appropriate agent
3. Monitor progress in real-time

### GitHub Actions Integration

The `iterate.yml` workflow runs continuously with 8 phases:

1. **BugLover** - Find and fix bugs
2. **Pallete** - UX improvements
3. **Flexy** - Modularity improvements
4. **TestGuard** - Test optimization
5. **StorX** - Feature consolidation
6. **CodeKeep** - Code quality review
7. **BroCula** - Browser console fixes
8. **Git Management** - PR and merge

## Configuration Files

| File                            | Purpose                      |
| ------------------------------- | ---------------------------- |
| `opencode.json`                 | OpenCode CLI configuration   |
| `.opencode/oh-my-opencode.json` | Agent orchestration settings |
| `.opencode/agents/CMZ.json`     | CMZ agent configuration      |
| `.opencode/skills/*/SKILL.md`   | Skill documentation          |

## Best Practices

1. **Use ultrawork/ulw** for automatic orchestration
2. **Let CMZ delegate** - Don't manually specify agents
3. **Trust the process** - Skills enforce best practices automatically
4. **Review PRs** - Always check agent-generated changes
5. **Monitor workflows** - Watch GitHub Actions for issues

## Frameworks Integrated

- **OhMyOpenCode**: Agent orchestration and parallel execution
- **Superpowers**: TDD, systematic debugging, planning
- **OpenCode CLI**: Core CLI with LSP, MCP, and skills support
- **UltraRAG**: Context retrieval and knowledge management

## Support

For issues or questions:

- Check skill documentation: `.opencode/skills/[skill-name]/SKILL.md`
- Review agent configuration: `.opencode/agents/CMZ.json`
- Consult OpenCode docs: https://opencode.ai/docs
