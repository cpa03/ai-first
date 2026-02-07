---
name: github-workflow-automation
description: Universal GitHub Actions workflow automation with OpenCode CLI and Oh My OpenCode multi-agent system. Design efficient triggers, optimize resource usage, implement best practices, master OpenCode CLI integration, leverage multi-agent orchestration (Sisyphus + team), understand all GitHub Actions events, build scalable workflows. Use when creating GitHub Actions workflows, integrating OpenCode CLI, leveraging Oh My OpenCode multi-agent system, designing trigger strategies, setting up autonomous agents, troubleshooting workflow performance, or learning GitHub Actions patterns.
---

# GitHub Workflow Automation with OpenCode CLI & Oh My OpenCode

## Quick Start

### OpenCode Basic Workflow

```yaml
name: opencode-basic
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  id-token: write

concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false

jobs:
  opencode:
    if: |
      contains(github.event.comment.body, '/oc') ||
      contains(github.event.comment.body, '/opencode')
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60
    steps:
      - name: Wait in Queue
        uses: softprops/turnstyle@v2
        with:
          poll-interval-seconds: 30
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Install OpenCode CLI
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Configure Git
        run: |
          git config --global user.name "${{ github.actor }}"
          git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"

      - name: Branch Management
        run: |
          git fetch --all
          if git branch -r | grep "origin/agent-workspace"; then
            git checkout agent-workspace
            git pull origin agent-workspace
          else
            git checkout -b agent-workspace
          fi
          git merge origin/main --no-edit || echo "Merge conflict or already up to date"

      - name: Run OpenCode
        run: |
          opencode run "$(cat <<'PROMPT'
            Your task description here
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

### Oh My OpenCode Multi-Agent Workflow

```yaml
name: oh-my-opencode
on:
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  id-token: write

concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false

jobs:
  multi-agent:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 120
    env:
      OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    steps:

      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Configure Git
        run: |
          git config --global user.name "${{ github.actor }}"
          git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"

      - name: Install OpenCode CLI
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Install Oh My OpenCode
        run: |
          bun install -g oh-my-opencode

      - name: Setup Configuration
        run: |
          mkdir -p ~/.config/opencode
          echo '{"plugins":["oh-my-opencode"]}' > ~/.config/opencode/opencode.json

      - name: Wait in Queue
        uses: softprops/turnstyle@v2
        with:
          poll-interval-seconds: 30
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Run Multi-Agent Task
        run: |
          opencode run "$(cat <<'PROMPT'
            ultrawork

            Build new feature for user authentication.
            PROMPT
          )" --model opencode/kimi-k2.5-free
```

See [assets/templates/](assets/templates/) for more templates.

---

## Standard Configuration (MANDATORY)

All workflows MUST follow these rules:

### 1. Runner Specification
**MANDATORY**: `runs-on: ubuntu-24.04-arm`

### 2. OpenCode Model Selection
Use only OpenCode free models. See [references/models.md](references/models.md) for details:
- `opencode/kimi-k2.5-free` - General purpose, fast
- `opencode/glm-4.7-free` - Logic-heavy tasks
- `opencode/minimax-m2.1-free` - Multimodal capabilities

### 3. Branch Strategy
**MANDATORY**: Use `agent-workspace` branch for all automations.

See [references/git-operations.md](references/git-operations.md) for git patterns.

### 4. Concurrency Configuration
**MANDATORY**:
```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false  # Preserve ongoing work
```

### 5. Queue Management
**MANDATORY**: Use `softprops/turnstyle@v2` to prevent race conditions:
```yaml
- name: Wait in Queue
  uses: softprops/turnstyle@v2
  with:
    poll-interval-seconds: 30
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Core Concepts

### Triggers & Events
See [references/triggers-events.md](references/triggers-events.md):
- GitHub Actions events (`push`, `pull_request`, `issue_comment`, etc.)
- Activity types (`created`, `edited`, `opened`, `synchronized`)
- Path filters (`paths`, `paths-ignore`)
- Branch and tag filters

### Efficiency Optimization
See [references/optimization.md](references/optimization.md):
- Selective triggers with `paths` and `paths-ignore`
- Event type specificity (`types:` keyword)
- Conditional expressions (`if:` statements)
- Concurrency control strategies
- Caching dependencies for faster builds
- Parallel job execution

### OpenCode CLI Integration
See [references/opencode-cli.md](references/opencode-cli.md):
- Installation in GitHub Actions
- GitHub App setup (`opencode github install`)
- Trigger patterns (`/oc`, `/opencode`)
- Command syntax and options
- Available action: `anomalyco/opencode/github@latest`

### Oh My OpenCode (Multi-Agent System)
See [references/oh-my-opencode.md](references/oh-my-opencode.md):
- **Ultra-powerful multi-agent orchestration** for GitHub Actions
- **Sisyphus** (orchestrator) + specialized teammates (Hephaestus, Oracle, Frontend Engineer, Librarian, Explore)
- **ultrawork** (magic word) - Enables all features automatically with parallel agents
- **ultrathink** mode - Deep exploration without execution
- **LSP & AST tools** - Surgical refactoring, code diagnostics, AST-based search
- **Built-in MCPs** - Web search (Exa), official docs (Context7), GitHub code search
- **Productivity features** - Git Master (atomic commits), Todo enforcement, Ralph Loop
- **JSONC configuration** - Comments and trailing commas in config files
- **Hook system** - 25+ configurable hooks for fine-tuned control

---

## Workflow Design Patterns

### Basic Flows
See [references/patterns/basic.md](references/patterns/basic.md):
- Basic CI workflow (build, test, lint)
- Comment-triggered automation
- Branch protection integration
- Simple PR review automation

### Advanced Flows
See [references/patterns/advanced.md](references/patterns/advanced.md):
- Multi-job workflows with dependencies
- Matrix builds for multiple versions
- Conditional deployments
- Scheduled automation (cron)
- Reusable workflows via `workflow_call`

### Autonomous Agents
See [references/patterns/autonomous-agents.md](references/patterns/autonomous-agents.md):
- Multi-phase agent loops
- State machine for PR/Issue handling
- Git automation patterns
- Long-running autonomous processes
- Multi-agent orchestration with Oh My OpenCode
- See [assets/examples/iterate.yml](assets/examples/iterate.yml) for complex reference

### Multi-Agent Flows (Oh My OpenCode)
See [references/oh-my-opencode.md](references/oh-my-opencode.md):
- Parallel agent execution (Explore + Librarian)
- Feature development with specialization
- Bug fixing with Oracle delegation
- Codebase analysis with ultrathink
- Ralph Loop iterative development

---

## Infrastructure Patterns

### Git Operations
See [references/git-operations.md](references/git-operations.md):
- Branch management (agent-workspace strategy)
- Fetch/checkout/merge patterns
- Conflict resolution strategies
- Git config for automation
- `fetch-depth: 0` for full history

### Secrets Management
See [references/git-operations.md](references/secrets.md):
- GITHUB_TOKEN passing pattern
- Custom secrets configuration
- Environment variable setup
- Security best practices
- API key management

### Wait & Monitor Patterns
See [references/wait-monitor.md](references/wait-monitor.md):
- Turnstyle queue usage
- `continue-on-error` patterns
- Timeout configuration (60 minutes)
- CI checks monitoring
- Fail-safe mechanisms

---

## Best Practices

See [references/best-practices.md](references/best-practices.md):
- Workflow security
- Dependency caching strategies
- Concurrency and parallelism
- Timeouts and resource limits
- Notification patterns (Slack, Discord, email)
- Error handling and rollback
- Workflow maintainability

- **Oh My OpenCode Best Practices**:
  - Use `ultrawork` for complex multi-agent tasks
  - Use `ultrathink` for deep exploration without execution
  - Configure project-specific settings in `.opencode/oh-my-opencode.json`
  - Combine with queue management for parallel workflows

---

## Troubleshooting

See [references/troubleshooting.md](references/troubleshooting.md):
- Common workflow failures
- Debugging with `act` or `nektos/act`
- Log analysis strategies
- Performance bottlenecks identification
- OpenCode CLI errors in Actions
- Oh My OpenCode plugin issues
- Concurrency issues

---

## Scripts

Helper scripts for workflow automation:
- `scripts/setup_opencode.sh` - Generate OpenCode installation step
- `scripts/generate_workflow.py` - Create workflow from template
- `scripts/validate_workflow.py` - Validate YAML and triggers
- `scripts/optimize_workflow.py` - Suggest workflow optimizations

---

## References & Learning

For comprehensive documentation on:
- GitHub Actions official features
- OpenCode CLI specific commands
- Oh My OpenCode multi-agent system
- Workflow optimization techniques
- Security and permissions

See [references/](references/) directory for detailed guides.