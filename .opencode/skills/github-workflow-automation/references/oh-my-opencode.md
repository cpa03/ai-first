# Oh My OpenCode Integration

Multi-agent system for GitHub Actions workflows with OpenCode CLI.

---

## What is Oh My OpenCode?

Oh My OpenCode is a **batteries-included plugin/harness** for OpenCode CLI that transforms it from a standard coding assistant into a powerful AI development team orchestrator.

### Key Capabilities

- **Multi-Agent System** - Run multiple specialized AI agents in parallel
- **Orchestration** - Sisyphus orchestrates tasks across specialized teammates
- **Background Execution** - Parallel agents execute like real dev team
- **LSP & AST Tools** - Surgical refactoring, code diagnostics, AST-based search
- **Productivity Features** - ultrawork, ultrathink, Todo enforcement, Git master
- **Hook System** - 25+ configurable hooks for fine-tuned control
- **Built-in MCPs** - Web search (Exa), official docs (Context7), GitHub code search (Grep.app)
- **JSONC Support** - Comments and trailing commas in configuration

---

## Agent System

### Main Orchestrator
- **Sisyphus** - Main orchestrator (Claude Opus 4.5 High)

### Specialized Teammates
| Agent | Model | Purpose |
|-------|-------|---------|
| Hephaestus | GPT 5.2 Codex Medium | Autonomous deep worker |
| Oracle | GPT 5.2 Medium | Design and debugging |
| Frontend Engineer | Gemini 3 Pro | Frontend development |
| Librarian | Claude Sonnet 4.5 | Official docs & codebase exploration |
| Explore | Claude Haiku 4.5 | Fast codebase exploration via contextual grep |

---

## Quick Start with Oh My OpenCode

### Installation in GitHub Actions

```yaml
jobs:
  opencode:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 120
    env:
      OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    steps:

      # Checkout Repository
      - name: Checkout with Full History
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      # Configure Git
      - name: Configure Git
        run: |
          git config --global user.name "${{ github.actor }}"
          git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"

      # Branch Management
      - name: Setup Agent Branch
        run: |
          git fetch --all
          git checkout agent-workspace || git checkout -b agent-workspace

      # Install OpenCode CLI
      - name: Install OpenCode CLI
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      # Install Oh My OpenCode
      - name: Install Oh My OpenCode
        run: |
          # Install via npm/bun
          bun install -g oh-my-opencode

          # Or clone and setup
          # git clone https://github.com/code-yeongyu/oh-my-opencode ~/oh-my-opencode
          # cd ~/oh-my-opencode
          # bun install

      # Setup Oh My OpenCode Configuration
      - name: Setup Configuration
        run: |
          mkdir -p ~/.config/opencode

          # Create opencode.json with plugin
          cat > ~/.config/opencode/opencode.json <<'EOF'
          {
            "plugins": ["oh-my-opencode"]
          }
          EOF

          # Create oh-my-opencode.json for workflow
          cat > ~/.config/opencode/oh-my-opencode.json <<'EOF'
          {
            // Oh My OpenCode configuration for GitHub Actions
            "agents": {
              "sisyphus": {
                "model": "opencode/kimi-k2.5-free",
                "temperature": 0.7
              },
              "hephaestus": {
                "model": "opencode/kimi-k2.5-free",
                "temperature": 0.5
              },
              "oracle": {
                "model": "opencode/kimi-k2.5-free"
              },
              "librarian": {
                "model": "opencode/kimi-k2.5-free"
              },
              "explore": {
                "model": "opencode/kimi-k2.5-free"
              }
            },
            "background_tasks": {
              "concurrency": {
                "anthropic": 2
              }
            },
            "disabled_hooks": [
              // "comment_checker" - Enable for production
            ],
            "categories": {
              "visual": ["frontend"],
              "business-logic": ["backend", "api"]
            }
          }
          EOF

      # Wait in Queue
      - name: Wait in Queue
        uses: softprops/turnstyle@v2
        with:
          poll-interval-seconds: 30
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Run Oh My OpenCode
      - name: Run Multi-Agent Task
        run: |
          POMPT="$(cat <<'PROMPT'
          ultrawork

          Context: GitHub Actions workflow automation
          Task: [describe your task here]

          Deploy and test changes.
          PROMPT
          )"

          opencode run "$POMPT" --model opencode/kimi-k2.5-free
```

---

## Using ultrawork Mode

The simplest way to enable all Oh My OpenCode features is to use **ultrawork** (or **ulw**) magic word.

### Basic ultrawork

```yaml
- name: Run ultrawork
  run: |
    opencode run "$(cat <<'PROMPT'
    ultrawork

    Build a new feature for X.
    PROMPT
    )" --model opencode/kimi-k2.5-free
```

### ultrawork automatically:
- Enables multi-agent orchestration
- Fires background agents (Explore, Librarian) in parallel
- Delegates specialized tasks (Oracle, Frontend Engineer, etc.)
- Enforces TODO completion
- Uses Git Master for atomic commits
- Continues until task is 100% complete

---

## Using ultrathink Mode

For deep exploration without full execution:

```yaml
- name: Run ultrathink
  run: |
    opencode run "$(cat <<'PROMPT'
    ultrathink

    Analyze how the authentication system works in this codebase.
    Provide detailed explanation of:
    1. Flow diagram
    2. Key components
    3. Security measures
    4. Potential improvements

    Do not execute any changes.
    PROMPT
    )" --model opencode/kimi-k2.5-free
```

### ultrathink automatically:
- Explores codebase thoroughly
- Gathers extensive context via background agents
- Synthesizes comprehensive analysis
- Does NOT execute code changes

---

## Configuration Options

### Project-Level Configuration

Create `.opencode/oh-my-opencode.json` in your repository:

```jsonc
{
  // Project-specific Oh My OpenCode configuration

  // Override agent models for this project
  "agents": {
    "sisyphus": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.7
    },
    "explore": {
      "model": "opencode/kimi-k2.5-free",
      "temperature": 0.3  // Lower temperature for exploration
    }
  },

  // Background task concurrency
  "background_tasks": {
    "concurrency": {
      "anthropic": 3,
      "openai": 2
    }
  },

  // Disable specific hooks
  "disabled_hooks": [
    "comment_checker"  // Allow AI comments during development
  ],

  // Domain task delegation
  "categories": {
    "visual": ["frontend", "ui", "ux"],
    "business-logic": ["backend", "api", "services"],
    "infrastructure": ["docker", "k8s", "cicd"]
  }
}
```

### User-Level Configuration

Create `~/.config/opencode/oh-my-opencode.json`:

```jsonc
{
  // Global Oh My OpenCode settings

  // Default agent configurations
  "agents": {
    "sisyphus": {
      "model": "opencode/kimi-k2.5-free"
    }
  },

  // Global hooks settings
  "hooks": {
    "comment_checker": {
      "enabled": true
    }
  }
}
```

---

## Agent Delegation Patterns

### Pattern 1: Feature Development

```yaml
- name: Build New Feature
  run: |
    opencode run "$(cat <<'PROMPT'
    ultrawork

    Task: Build user authentication feature
    Requirements:
    - Frontend UI (React components)
    - Backend API (authentication endpoints)
    - Database schema (users table)
    - Tests (unit and integration)

    Deploy and test.
    PROMPT
    )" --model opencode/kimi-k2.5-free
```

**Execution Flow:**
1. Sisyphus receives task and triggers ultrawork mode
2. Background agents fire in parallel:
   - **Explore** maps codebase structure
   - **Librarian** searches auth best practices
3. Sisyphus synthesizes findings
4. Tasks delegated:
   - Frontend to **Frontend Engineer** (Gemini)
   - Backend to **Hephaestus** (GPT)
   - Tests to **Oracle** (GPT)
5. **Git Master** creates atomic commits
6. **Todo Continuation Enforcer** ensures completion

### Pattern 2: Bug Fixing

```yaml
- name: Fix Bug
  run: |
    opencode run "$(cat <<'PROMPT'
    ultrawork

    Bug Report: ${PR_BODY}

    Task: Fix the reported bug
    Steps:
    1. Reproduce the bug
    2. Identify root cause (use Oracle for debugging)
    3. Implement fix
    4. Add tests
    5. Verify fix

    Deploy and test.
    PROMPT
    )" --model opencode/kimi-k2.5-free
```

### Pattern 3: Codebase Analysis

```yaml
- name: Analyze Codebase
  run: |
    opencode run "$(cat <<'PROMPT'
    ultrathink

    Provide comprehensive analysis of this codebase:
    1. Architecture overview
    2. Key components and their responsibilities
    3. Data flow
    4. Security measures
    5. Performance bottlenecks
    6. Recommendations for improvement

    Focus on ${FILE_PATTERN}
    PROMPT
    )" --model opencode/kimi-k2.5-free
    env:
      FILE_PATTERN: "src/**/*.ts"
```

---

## Built-in Skills

### Git Master

Automatic atomic commits during execution.

```yaml
# Git Master is automatically when ultrawork is enabled
# No additional configuration needed

# Manually enable:
opencode run "$(cat <<'PROMPT'
ultrawork
Use git-master skill for all commits.
Task: ...
PROMPT
)" --model opencode/kimi-k2.5-free
```

### Custom Hooks

Configure hooks in `oh-my-opencode.json`:

```jsonc
{
  "hooks": {
    "pre_tool_use": {
      "enabled": true,
      "config": {
        "require_review": 500  // Require review after 500 tool uses
      }
    },
    "post_tool_use": {
      "enabled": true,
      "config": {
        "log_changes": true
      }
    }
  }
}
```

---

## Productivity Features

### Ralph Loop

Iterative development pattern with Oh My OpenCode:

```yaml
- name: Ralph Loop Iteration
  run: |
    opencode run "$(cat <<'PROMPT'
    ultrawork

    Task: Implement feature incrementally

    Ralph Loop:
    1. Research and plan (ultrathink)
    2. Implement minimal viable version
    3. Test and validate
    4. Refine based on feedback
    5. Repeat until满意

    Commit each iteration with detailed messages.
    PROMPT
    )" --model opencode/kimi-k2.5-free
```

---

## Best Practices for GitHub Actions

### 1. Always Use ultrawork for Complex Tasks

```yaml
# Good
opencode run "$(cat <<'PROMPT'
ultrawork
Task: Complex feature
PROMPT
)"

# Avoid manual orchestration
opencode run "Explore the codebase" && \
opencode run "Read docs" && \
opencode run "Implement"
```

### 2. Use ultrathink for Analysis

```yaml
# Good for exploration
opencode run "$(cat <<'PROMPT'
ultrathink
Analyze the payment flow
PROMPT
)"

# Not for implementation
opencode run "$(cat <<'PROMPT'
ultrathink
Build payment flow  # Wrong - ultrathink is read-only
PROMPT
)"
```

### 3. Configure Project-Specific Settings

```yaml
# Create .opencode/oh-my-opencode.json
- name: Setup Project Config
  run: |
    mkdir -p .opencode
    cat > .opencode/oh-my-opencode.json <<'EOF'
    {
      "agents": {
        "sisyphus": {
          "model": "opencode/kimi-k2.5-free"
        }
      },
      "categories": {
        "frontend": ["ui", "components"],
        "backend": ["api", "services"]
      }
    }
    EOF
```

### 4. Combine with Queue Management

```yaml
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

    Task: Your task here
    PROMPT
    )" --model opencode/kimi-k2.5-free
```

---

## Advanced Patterns

### Multi-Phase Workflow with ultrawork

```yaml
# See assets/templates/oh-my-opencode-full.yml for complete example
# Phases:
# 1. ultrathink - Plan and analyze
# 2. ultrawork - Implement with multi-agent
# 3. ultrathink - Review and document
```

### Parallel Feature Development

```yaml
# Using ultrawork, agents work in parallel
- name: Parallel Development
  run: |
    opencode run "$(cat <<'PROMPT'
    ultrawork

    Task: Develop multiple features in parallel
    Features:
    - Feature A (Frontend)
    - Feature B (Backend API)
    - Feature C (Database)

    All agents should work on their assigned features simultaneously.
    PROMPT
    )" --model opencode/kimi-k2.5-free
```

---

## Troubleshooting

### Issue: Plugin Not Loaded

**Cause:** `oh-my-opencode` not in plugins array

**Solution:**
```yaml
- name: Configure OpenCode
  run: |
    cat > ~/.config/opencode/opencode.json <<'EOF'
    {
      "plugins": ["oh-my-opencode"]
    }
    EOF
```

### Issue: Agents Not Firing

**Cause:** ultrawork not triggered

**Solution:**
```yaml
# Include "ultrawork" or "ulw" magic word
opencode run "$(cat <<'PROMPT'
ultrawork  # ← This magic word enables all features
Task: ...
PROMPT
)"
```

### Issue: Configuration Not Applied

**Cause:** Configuration file in wrong location

**Solution:**
```yaml
# Use ~/.config/opencode/oh-my-opencode.json
# OR .opencode/oh-my-opencode.json (project-level)
```

---

## Summary

Oh My OpenCode provides:
- **Multi-agent orchestration** - Parallel execution like real dev team
- **Productivity features** - ultrawork, ultrathink, Git Master
- **Configurable agents** - Custom models and behavior per agent
- **Hook system** - Fine-grained control over workflow
- **Built-in tools** - MCPs, LSP, AST operations
- **JSONC configuration** - Easy configuration with comments

Use `ultrawork` for full automation and multi-agent parallelism. Use `ultrathink` for deep exploration without changes.

---

## Resources

- [Official Repo](https://github.com/code-yeongyu/oh-my-opencode)
- [Installation Guide](https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/refs/heads/master/docs/guide/installation.md)
- [Agent Documentation](https://github.com/code-yeongyu/oh-my-opencode/blob/master/AGENTS.md)
- [Sisyphus Prompts](https://github.com/code-yeongyu/oh-my-opencode/blob/master/sisyphus-prompt.md)