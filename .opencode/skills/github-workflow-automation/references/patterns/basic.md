# Basic Workflow Patterns

Simple, common patterns for GitHub Actions workflows with OpenCode CLI.

---

## 1. Comment-Triggered OpenCode

Trigger OpenCode via `/oc` or `/opencode` comments.

```yaml
name: opencode-basic
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

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
          opencode run "Process the request from comment" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 2. Basic CI Workflow

Standard build, test, and lint workflow.

```yaml
name: ci
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Cache Node Modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      - name: Install Dependencies
        run: npm ci
      - name: Lint
        run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Cache Node Modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      - name: Install Dependencies
        run: npm ci
      - name: Test
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Cache Node Modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      - name: Install Dependencies
        run: npm ci
      - name: Build
        run: npm run build
```

---

## 3. Auto-Deploy to Production

Deploy on push to main after successful build.

```yaml
name: deploy-production
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-24.04-arm
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Cache Node Modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      - name: Install Dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy
        run: |
          # Your deployment command here
          echo "Deploying to production"
```

---

## 4. Schedule Nightly Analysis

Run OpenCode analysis daily.

```yaml
name: nightly-analysis
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  analyze:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
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

      - name: Nightly Code Analysis
        run: |
          opencode run "$(cat <<'PROMPT'
            Perform nightly code analysis:

            1. Scan codebase for bugs and errors
            2. Check for security vulnerabilities
            3. Identify performance bottlenecks
            4. Check for code debt and technical issues
            5. Create GitHub issues for each finding

            Focus on high-impact issues only.
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 5. Issue Comment Handler

Handle comment-based triggers on issues.

```yaml
name: issue-handler
on:
  issue_comment:
    types: [created]

permissions:
  contents: write
  issues: write

jobs:
  handle-comment:
    if: |
      contains(github.event.comment.body, '/fix') ||
      contains(github.event.comment.body, '/explain')
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
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

      - name: Process Issue
        run: |
          opencode run "$(cat <<'PROMPT'
            Issue URL: ${{ github.event.issue.html_url }}
            Issue Title: ${{ github.event.issue.title }}
            Issue Body: ${{ github.event.issue.body }}
            Comment: ${{ github.event.comment.body }}

            Task: Process the issue based on the comment command.

            Comment contains /fix: Implement fix and create PR
            Comment contains /explain: Explain the issue in detail
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 6. Branch-Based Trigger

Only run workflow for specific branches.

```yaml
name: branch-specific
on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Show Branch
        run: |
          echo "Event: ${{ github.event_name }}"
          echo "Branch: ${{ github.ref }}"
```

---

## 7. Path-Based Trigger

Only run workflow when specific files change.

```yaml
name: path-specific
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - 'docs/**'
      - '*.md'

jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Build
        run: echo "Building because source files changed"
```

---

## 8. OpenCode with Multiple Models

Use different OpenCode models based on task type.

```yaml
name: multi-model-opencode
on:
  workflow_dispatch:
    inputs:
      task-type:
        description: 'Type of task'
        required: true
        default: 'general'
        type: choice
        options:
          - general
          - logic
          - multimodal

jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Install OpenCode CLI
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Run General Task
        if: github.event.inputs.task-type == 'general'
        run: |
          opencode run "General task" \
            --model opencode/kimi-k2.5-free

      - name: Run Logic Task
        if: github.event.inputs.task-type == 'logic'
        run: |
          opencode run "Logic-heavy task" \
            --model opencode/glm-4.7-free

      - name: Run Multimodal Task
        if: github.event.inputs.task-type == 'multimodal'
        run: |
          opencode run "Multimodal task" \
            --model opencode/minimax-m2.1-free
```

---

## 9. Conditional Execution

Skip workflow based on conditions.

```yaml
name: conditional-workflow
on:
  push:

jobs:
  job:
    runs-on: ubuntu-24.04-arm
    if: |
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main' &&
      !contains(github.event.head_commit.message, '[skip ci]')
    steps:
      - name: Run
        run: echo "Running on main push without [skip ci]"
```

---

## 10. Fail-Safe Workflow

Continue on error and report status.

```yaml
name: fail-safe-workflow
on:
  push:

jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Step 1 (Continue on Error)
        id: step1
        continue-on-error: true
        run: |
          This might fail
          echo "Step 1 completed"

      - name: Step 2 (Conditional)
        if: steps.step1.outcome == 'success'
        run: echo "Step 2 runs only if Step 1 succeeded"

      - name: Step 3 (Always Run)
        if: always()
        run: echo "This step always runs, even if previous steps failed"

      - name: Check Status
        if: failure()
        run: |
          echo "Workflow failed"
          # Send notification
```

---

## Summary

These patterns cover the most common GitHub Actions workflows:
1. Comment-triggered OpenCode
2. Basic CI (build, test, lint)
3. Auto-deploy
4. Scheduled tasks
5. Issue handling
6. Branch-specific triggers
7. Path-based triggers
8. Multiple model usage
9. Conditional execution
10. Fail-safe mechanisms