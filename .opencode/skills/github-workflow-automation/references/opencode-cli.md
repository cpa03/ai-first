# OpenCode CLI Integration

This reference covers OpenCode CLI integration with GitHub Actions for workflow automation.

---

## Installation in GitHub Actions

### Basic Installation
```yaml
name: opencode-example

jobs:
  opencode:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install OpenCode CLI
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH
```

### With Error Handling
```yaml
- name: Install OpenCode CLI
  run: |
    if ! command -v opencode &> /dev/null; then
      curl -fsSL https://opencode.ai/install | bash
      echo "$HOME/.opencode/bin" >> $GITHUB_PATH
    fi
    opencode --version
```

### Installation with Specific Version
```yaml
- name: Install OpenCode CLI
  run: |
    curl -fsSL https://opencode.ai/install | bash -s -- --version latest
    echo "$HOME/.opencode/bin" >> $GITHUB_PATH
```

---

## GitHub App Setup

### Automatic Setup (Recommended)
Run locally in your repository:

```bash
cd /path/to/your/repo
opencode github install
```

This interactive setup will:
1. Guide you through installing the OpenCode GitHub app
2. Help you select an AI provider and model
3. Generate `.github/workflows/opencode.yml`
4. Configure API keys as secrets

### Manual GitHub App Setup

#### 1. Install GitHub App
1. Visit: https://github.com/apps/opencode-agent
2. Install for your repositories or organization

#### 2. Create Workflow File
Create `.github/workflows/opencode.yml`:

```yaml
name: opencode

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

jobs:
  opencode:
    if: |
      contains(github.event.comment.body, '/oc') ||
      contains(github.event.comment.body, '/opencode')
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: Run OpenCode
        uses: anomalyco/opencode/github@latest
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          model: opencode/kimi-k2.5-free
```

#### 3. Configure Secrets
Add required secrets to GitHub repository settings:
- Go to Settings > Secrets and Variables > Actions
- Add secrets for your AI provider

---

## Triggering OpenCode

### Comment-Based Triggers
In GitHub issues or PR comments:

```markdown
/opencode explain this issue
/oc fix this bug
/opencode please add error handling
/opencode refactor this function
```

### Workflow-Based Triggers
Trigger OpenCode from other workflows:

```yaml
jobs:
  analyze:
    needs: test
    if: needs.test.result == 'success'
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Install OpenCode
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH
      - name: Run Analysis
        run: |
          opencode run "Analyze code quality and suggest improvements" \
            --model opencode/kimi-k2.5-free
```

### Scheduled Triggers
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  nightyly-analysis:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Install OpenCode
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH
      - name: Run Nightly Analysis
        run: |
          opencode run "Perform code quality analysis and create issues" \
            --model opencode/kimi-k2.5-free
```

---

## OpenCode Command Patterns

### Basic Command
```yaml
- name: Run OpenCode
  run: |
    opencode run "Your prompt here"
```

### With Model Selection
```yaml
- name: Run Opencode
  run: |
    opencode run "Your prompt here" \
      --model opencode/kimi-k2.5-free
```

### Heredoc Prompt Format
```yaml
- name: Complex Task
  run: |
    opencode run "$(cat <<'PROMPT'
      You are an expert software engineer.

      Task: Review the following code and suggest improvements:
      - Check for security vulnerabilities
      - Look for performance bottlenecks
      - Suggest code structure improvements

      Files to review: src/**/*.ts
    PROMPT
    )" \
      --model opencode/kimi-k2.5-free \
      --share false
```

### Multi-Phase Agent
```yaml
- name: Multi-Phase Agent
  run: |
    opencode run "$(cat <<'PROMPT'
      You are an autonomous software engineering agent.

      Execute in phases:
      PHASE 1: Analyze codebase for bugs
      PHASE 2: Fix identified bugs
      PHASE 3: Run tests
      PHASE 4: Create PR with changes

      Start from PHASE 1.
    PROMPT
    )" \
      --model opencode/kimi-k2.5-free \
      --share false
```

---

## Available Options

### Model Selection
```bash
--model opencode/kimi-k2.5-free      # General purpose, fast
--model opencode/glm-4.7-free         # Logic-heavy, Chinese optimized
--model opencode/minimax-m2.1-free     # Multimodal
```

### Share Settings
```bash
--share true      # Share execution (enabled by default)
--share false     # Private execution
```

### Output Control
```bash
--output json     # JSON formatted output
--output text     # Plain text output (default)
--quiet           # Suppress progress indicators
```

### Context Control
```bash
--cwd /path/to/project   # Set working directory
```

---

## Using @anomalyco/opencode/github Action

### Basic Usage
```yaml
- name: Run OpenCode with Action
  uses: anomalyco/opencode/github@latest
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  with:
    model: opencode/kimi-k2.5-free
    prompt: "Review this PR for security issues"
```

### With Context
```yaml
- name: Code Review
  uses: anomalyco/opencode/github@latest
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  with:
    model: opencode/kimi-k2.5-free
    context: 'pr'
    prompt: "Review this PR and suggest improvements"
```

---

## Common Workflow Patterns

### Issue Resolution
```yaml
- name: Resolve Issue
  run: |
    opencode run "$(cat <<'PROMPT'
      Resolve this GitHub issue:
      ${{ github.event.issue.body }}

      Steps:
      1. Understand the issue
      2. Branch: agent-workspace
      3. Implement fix
      4. Test
      5. Create PR
    PROMPT
    )" \
      --model opencode/kimi-k2.5-free
```

### Code Review
```yaml
- name: Code Review
  run: |
    opencode run "$(cat <<'PROMPT'
      Review the pull request changes:
      - Check for bugs
      - Verify coding standards
      - Check for security vulnerabilities
      - Suggest improvements

      PR context: ${{ github.event.pull_request.html_url }}
    PROMPT
    )" \
      --model opencode/kimi-k2.5-free
```

### Documentation Generation
```yaml
- name: Generate Documentation
  run: |
    opencode run "$(cat <<'PROMPT'
      Generate API documentation for the codebase:
      - Analyze src/**/*.{ts,js}
      - Create docs/api.md with:
        * Function signatures
        * Parameters
        * Return types
        * Examples
    PROMPT
    )" \
      --model opencode/kimi-k2.5-free
```

---

## Integration with Git Operations

### OpenCode + Git Branch Management
```yaml
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

- name: Run OpenCode with Git Operations
  run: |
    opencode run "$(cat <<'PROMPT'
      Work on agent-workspace branch.
      Make changes, commit, and push.
      Then create PR to main.
    PROMPT
    )" \
      --model opencode/kimi-k2.5-free
```

---

## Error Handling & Debugging

### Retry on Failure
```yaml
- name: Run OpenCode with Retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 30
    max_attempts: 3
    command: opencode run "Your prompt" --model opencode/kimi-k2.5-free
```

### Verbose Output
```yaml
- name: Run OpenCode (Debug)
  run: |
    opencode run "Your prompt" \
      --model opencode/kimi-k2.5-free \
      --debug
```

### Error Capture
```yaml
- name: Run OpenCode
  id: opencode
  continue-on-error: true
  run: |
    opencode run "Your prompt" --model opencode/kimi-k2.5-free 2>&1 | tee opencode.log

- name: Check Results
  if: steps.opencode.outcome == 'failure'
  run: |
    cat opencode.log
    echo "OpenCode failed, see logs above"
```

---

## Best Practices

1. **Always use free models** for Actions automation
   - `opencode/kimi-k2.5-free` for general tasks
   - `opencode/glm-4.7-free` for logic tasks
   - `opencode/minimax-m2.1-free` for multimodal

2. **Use `--share false`** for sensitive operations

3. **Set timeouts** to prevent runaway execution:
   ```yaml
   timeout-minutes: 60
   ```

4. **Use proper Git configuration** for OpenCode operations:
   ```yaml
   git config --global user.name "${{ github.actor }}"
   git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"
   ```

5. **Handle errors gracefully** with `continue-on-error` and retry logic

6. **Enable debug output** when troubleshooting:
   ```yaml
   opencode run "..." --debug
   ```

7. **Use Heredoc** for complex prompts to avoid escaping issues

---

## Reference

- [OpenCode CLI Official Documentation](https://opencode.ai/docs)
- [OpenCode GitHub App](https://github.com/apps/opencode-agent)
- [OpenCode CLI GitHub Repository](https://github.com/opencode-ai/opencode)