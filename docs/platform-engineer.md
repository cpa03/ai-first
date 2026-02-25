# Platform Engineer Guide

## Overview

This guide provides comprehensive information for Platform Engineers working on the IdeaFlow project. It covers the platform infrastructure, OpenCode agent configuration, GitHub Actions workflows, development tooling, and best practices for maintaining and improving the development platform.

## Table of Contents

- [Architecture](#architecture)
- [OpenCode Configuration](#opencode-configuration)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Development Infrastructure](#development-infrastructure)
- [Platform Improvements](#platform-improvements)
- [Troubleshooting](#troubleshooting)
- [Checklists](#checklists)

---

## Architecture

### Platform Components

```
.
├── .opencode/                    # OpenCode agent configuration
│   ├── agents/                   # Agent definitions
│   │   └── CMZ.json             # Main CMZ orchestrator config
│   ├── skills/                   # Skill definitions (35+ skills)
│   ├── oh-my-opencode.json      # OhMyOpenCode integration config
│   └── package.json             # OpenCode dependencies
├── .github/workflows/            # CI/CD workflows
│   ├── iterate.yml              # Main iteration workflow (8 phases)
│   ├── issue-solver.yml         # Issue resolution workflow
│   ├── on-pull.yml              # PR automation workflow
│   ├── parallel.yml             # Parallel task execution
│   └── specialists-unified.yml  # Specialist agent unified workflow
├── scripts/                     # Automation scripts
│   ├── validate-env.sh         # Environment validation
│   ├── security-check.sh       # Security scanning
│   └── setup-cloudflare-env.sh # Cloudflare setup
└── config/                      # Configuration templates
    └── .env.example             # Environment template
```

### Key Platform Systems

| System                  | Purpose                        | Technology                     |
| ----------------------- | ------------------------------ | ------------------------------ |
| **Agent Orchestration** | Multi-agent task execution     | OhMyOpenCode + CMZ             |
| **CI/CD**               | Automated workflows            | GitHub Actions                 |
| **Skill System**        | Specialized agent capabilities | 35+ skills across 8 categories |
| **MCP Integration**     | External tool integration      | Exa, Context7, GitHub MCPs     |
| **LSP**                 | Code intelligence              | TypeScript LSP                 |

---

## OpenCode Configuration

### CMZ Agent (Main Orchestrator)

The CMZ (Cognitive Meta-Z) agent is the main orchestrator with three core capabilities:

1. **Self-Heal**: Automatic error detection and recovery
2. **Self-Learn**: Continuous learning from interactions
3. **Self-Evolve**: Automatic capability expansion

**Configuration**: `.opencode/agents/CMZ.json`

```json
{
  "agents": {
    "sisyphus": {
      "model": "opencode/kimi-k2.5-free",
      "capabilities": ["orchestration", "task_management", "background_tasks"],
      "triggers": ["ultrawork", "ulw"]
    },
    "hephaestus": {
      "model": "opencode/glm-4.7-free",
      "capabilities": ["deep_exploration", "autonomous_execution"]
    },
    "oracle": {
      "model": "opencode/kimi-k2.5-free",
      "capabilities": ["architecture", "debugging", "reasoning"]
    }
  }
}
```

### Agent Categories

| Category               | Model             | Use Case                   |
| ---------------------- | ----------------- | -------------------------- |
| **visual-engineering** | glm-4.7-free      | Frontend/UI work           |
| **ultrabrain**         | kimi-k2.5-free    | Complex logic/architecture |
| **deep**               | kimi-k2.5-free    | Deep analysis              |
| **artistry**           | glm-4.7-free      | Non-conventional problems  |
| **quick**              | minimax-m2.1-free | Quick tasks                |
| **writing**            | glm-4.7-free      | Documentation              |

### Skill System

The platform includes 35+ specialized skills organized by category:

**Process Skills:**

- `superpowers-brainstorming` - Design refinement
- `superpowers-writing-plans` - Implementation planning
- `superpowers-executing-plans` - Plan execution
- `superpowers-tdd` - Test-driven development
- `systematic-debugging` - Root cause analysis

**Development Skills:**

- `superpowers-subagent-dev` - Subagent-driven development
- `superpowers-git-worktrees` - Parallel development
- `superpowers-verification` - Completion verification
- `superpowers-finishing-branch` - Merge/PR workflow
- `superpowers-parallel-agents` - Parallel agent dispatch

**Domain Skills:**

- `git-master` - Git operations
- `skill-creator` - Create new skills
- `skill-builder` - Build skills with templates
- `codepro-backend-standards` - Backend standards
- `claude-codepro-backend` - Enterprise backend development

---

## GitHub Actions Workflows

### Main Workflow: iterate.yml

The `iterate.yml` workflow runs with 8 phases:

| Phase | Agent          | Purpose                 |
| ----- | -------------- | ----------------------- |
| 1     | Architect      | Strategy & triage       |
| 2     | BugFixer       | Bug fixes               |
| 3     | Palette        | UX improvements         |
| 4     | Flexy          | Modularity improvements |
| 5     | TestGuard      | Test optimization       |
| 6     | StorX          | Feature consolidation   |
| 7     | BroCula        | Browser console fixes   |
| 8     | Git Management | PR and merge            |

### Workflow Pattern

All platform workflows follow this pattern:

```yaml
jobs:
  job-name:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Cache
        uses: actions/cache@v5
        with:
          path: |
            ~/.opencode
            ~/.npm
          key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1

      - name: Configure Git
        run: |
          git config --global user.name "${{ github.actor }}"
          git config --global user.email "..."

      - name: Install Dependencies
        run: npm ci

      - name: Install OpenCode CLI
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Execute Task
        run: opencode run /ulw-loop "task description" ...
```

### Workflow Best Practices

1. **Always use `continue-on-error: true`** for agent steps to allow retry logic
2. **Implement retry logic** with 2-3 attempts before failure
3. **Use caching** for OpenCode and npm dependencies
4. **Set appropriate timeouts** (20 minutes for agent tasks)
5. **Use concurrency groups** to prevent parallel runs

---

## Development Infrastructure

### Environment Validation

The platform includes comprehensive environment validation:

```bash
# Full validation
npm run env:check

# Quick check (required vars only)
npm run env:check -- --quick

# CI mode (strict, exits on error)
npm run env:check -- --ci
```

### Security Scanning

```bash
# Security checks
npm run security:check
```

### Build and Test Commands

| Command              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start development server                   |
| `npm run build`      | Production build                           |
| `npm run lint`       | ESLint with 0 warnings                     |
| `npm run type-check` | TypeScript validation                      |
| `npm run test:ci`    | CI test execution                          |
| `npm run check`      | Full validation (lint + type-check + test) |

---

## Platform Improvements

### Common Platform Improvements

1. **Add New Skills**: Create skills in `.opencode/skills/` following the skill template
2. **Optimize Workflows**: Reduce redundancy in GitHub Actions
3. **Improve Caching**: Optimize cache keys and restore patterns
4. **Add Agent Capabilities**: Extend CMZ or create new agents
5. **Enhance MCP Integration**: Add new MCP servers

### Adding a New Skill

1. Create `.opencode/skills/<skill-name>/SKILL.md`
2. Add skill definition with YAML frontmatter:
   ```yaml
   name: <skill-name>
   description: <description>
   triggers: [<trigger phrases>]
   ```
3. Register in `CMZ.json` if needed

### Improving Workflows

1. Identify repeated patterns in `.github/workflows/`
2. Extract to reusable workflows where possible
3. Optimize cache strategies
4. Add proper error handling and retry logic

---

## Troubleshooting

### Common Platform Issues

| Issue                  | Solution                                  |
| ---------------------- | ----------------------------------------- |
| **OpenCode not found** | Ensure `~/.opencode/bin` is in PATH       |
| **Cache miss**         | Check cache key matches expected pattern  |
| **Workflow timeout**   | Increase timeout-minutes or optimize task |
| **Agent failures**     | Check retry logic and error logs          |
| **Permission errors**  | Verify GITHUB_TOKEN has required scopes   |

### Debugging Agent Issues

1. Check workflow logs for error messages
2. Verify OpenCode CLI version: `opencode --version`
3. Test locally with same command
4. Check skill definitions are valid YAML
5. Verify agent model availability

---

## Checklists

### Platform Engineer Checklist

- [ ] Monitor workflow success rates
- [ ] Keep OpenCode and dependencies updated
- [ ] Review and merge platform-related PRs
- [ ] Optimize CI/CD execution time
- [ ] Maintain platform documentation
- [ ] Add new skills as needed
- [ ] Ensure zero warnings in builds
- [ ] Verify all tests pass before merging

### Before Creating PR

- [ ] Run `npm run check` successfully
- [ ] Verify no new warnings introduced
- [ ] Test changes locally if applicable
- [ ] Update relevant documentation
- [ ] Use proper commit messages
- [ ] Link to issue if applicable
- [ ] Add appropriate labels

### Platform Health Metrics

| Metric                | Target | Measurement               |
| --------------------- | ------ | ------------------------- |
| Workflow Success Rate | > 95%  | GitHub Actions metrics    |
| Build Time            | < 120s | CI execution time         |
| OpenCode CLI Version  | Latest | `opencode --version`      |
| Skill Coverage        | 100%   | All needed skills exist   |
| Documentation Updated | 100%   | docs/platform-engineer.md |

---

## Related Documentation

- [DX Engineer](./dx-engineer.md) - Developer experience guidelines
- [DevOps Engineer](./devops-engineer.md) - Deployment and infrastructure
- [Architecture](./architecture.md) - System architecture
- [Agent Guidelines](./agent-guidelines.md) - Agent behavior rules
- [OhMyOpenCode Docs](https://github.com/code-yeongyu/oh-my-opencode) - Framework reference
