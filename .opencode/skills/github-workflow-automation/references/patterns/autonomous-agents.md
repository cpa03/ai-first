# Autonomous Agent Patterns

Autonomous workflows that continuously operate on PRs, issues, and repositories.

---

## 1. Multi-Phase Agent Loop

Agent executes tasks in sequential phases.

```yaml
name: multi-phase-agent
on:
  issue_comment:
    types: [created]

permissions:
  contents: write
  issues: write
  pull-requests: write

concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false

jobs:
  agent:
    if: contains(github.event.comment.body, '/agent') || contains(github.event.comment.body, '/oc')
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60

    steps:
      - name: Wait in Queue
        uses: softprops/turnstyle@v2
        with:
          poll-interval-seconds: 30
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

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
          git merge origin/main --no-edit || echo "Merge conflict or already up to date"

      - name: Run Multi-Phase Agent
        run: |
          opencode run "$(cat <<'PROMPT'
            You are an autonomous software engineering agent.

            ISSUE CONTEXT:
            ${{ github.event.issue.html_url }}
            ${{ github.event.issue.title }}
            ${{ github.event.issue.body }}

            EXECUTE IN PHASES:

            PHASE 1 - ANALYSIS:
            - Read and understand the issue
            - Analyze codebase for relevant areas
            - Identify required changes
            - Report analysis summary

            PHASE 2 - IMPLEMENTATION:
            - Make necessary code changes
            - Update tests if needed
            - Update documentation
            - Commit changes with descriptive message

            PHASE 3 - VERIFICATION:
            - Run existing tests
            - Create new tests if needed
            - Verify all tests pass
            - Report test results

            PHASE 4 - PR CREATION:
            - Create PR from agent-workspace to main
            - Write comprehensive PR description
            - Mention issue in PR body
            - Report PR link

            IMPORTANT RULES:
            - Work on agent-workspace branch
            - Always commit before moving to next phase
            - Never skip phases
            - Stop and report if any phase fails
            - Use descriptive commit messages
            - Test thoroughly before creating PR

            Start from PHASE 1.
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 2. State Machine for PR Handling

Agent manages PR through different states (open, in-review, approved, merged).

```yaml
name: pr-state-machine
on:
  pull_request:
    types: [opened, labeled, review_requested]

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: false

jobs:
  handle-pr:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60

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

      - name: State Machine Handler
        run: |
          opencode run "$(cat <<'PROMPT'
            You are a PR state machine agent.

            PR INFO:
            PR Number: ${{ github.event.pull_request.number }}
            PR Title: ${{ github.event.pull_request.title }}
            PR Author: ${{ github.event.pull_request.user.login }}
            Event Type: ${{ github.event.action }}

            STATE MACHINE:

            STATE: OPENED
            When PR is opened:
            1. Perform automated review
            2. Check code quality
            3. Check test coverage
            4. Add labels based on findings
            5. Comment with review summary
            Transition to: AWAITING_REVIEW

            STATE: AWAITING_REVIEW
            When review is requested:
            1. Verify PR is ready for review (checks passing, no issues)
            2. Transition to: IN_REVIEW
            When changes are pushed:
            1. Re-run automated checks
            2. Stay in: AWAITING_REVIEW

            STATE: IN_REVIEW
            When label "approved" is added:
            1. Verify approval from required reviewers
            2. Transition to: READY_TO_MERGE
            When review changes are requested:
            1. Notify author
            2. Transition to: AWAITING_CHANGES

            STATE: AWAITING_CHANGES
            When new commits are pushed:
            1. Re-run checks
            2. Transition to: AWAITING_REVIEW

            STATE: READY_TO_MERGE
            Actions:
            1. Verify all conditions met
            2. Optionally auto-merge if allowed
            Transition to: MERGED

            CURRENT STATE: Determine from current event type and PR labels

            Execute appropriate state transition actions.
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 3. Continuous Improvement Agent

Agent continuously analyzes code and suggests improvements.

```yaml
name: continuous-improvement
on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM UTC
  workflow_dispatch:

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  improve:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 120

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

      - name: Continuous Improvement
        run: |
          opencode run "$(cat <<'PROMPT'
            You are a continuous improvement agent.

            TASK: Analyze entire codebase and suggest improvements.

            WORKFLOW:

            PHASE 1 - CODE QUALITY:
            - Scan all code for:
              * Code smells
              * Anti-patterns
              * Duplicate code
              * Long functions
              * Complex conditions
            - Create GitHub issues for high-priority findings

            PHASE 2 - SECURITY:
            - Scan for:
              * Input validation issues
              * SQL injection risks
              * XSS vulnerabilities
              * Hardcoded secrets
              * Outdated dependencies
            - Create GitHub issues with severity labels

            PHASE 3 - PERFORMANCE:
            - Identify:
              * Slow algorithms
              * Unoptimized queries
              * Memory leaks
              * N+1 query problems
              - Create GitHub issues

            PHASE 4 - DOCUMENTATION:
            - Check:
              * Missing API docs
              * Outdated comments
              * Unclear variable names
            - Create issues for improvements

            PHASE 5 - TEST COVERAGE:
            - Find:
              * Untested critical paths
              * Missing edge case tests
              - Create issues with priority labels

            PHASE 6 - DEPENDENCY CHECK:
            - Review:
              * Outdated packages
              * Security vulnerabilities
              * Deprecated libraries
            - Create issues for updates

            RULES:
            - Work on agent-workspace branch
            - Create PRs for fixes (not just issues)
            - Prioritize by severity and impact
            - One issue per finding
            - Skip trivial findings
            - Focus on value-adding improvements
            - Provide clear instructions for fixes

            Execute all phases systematically.
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 4. Autonomous Bug Fixer

Agent automatically fixes simple bugs when reported.

```yaml
name: autonomous-bug-fixer
on:
  issues:
    types: [created, labeled]
  workflow_dispatch:

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  fixer:
    if: |
      contains(github.event.label.*.name, 'bug') ||
      contains(join(fromJSON('["simple", "trivial", "quick-fix"]')), github.event.label.*.name)
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60

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
          BRANCH_NAME=fix-${{ github.event.issue.number }}-$(date +%s)
          if git branch -r | grep "origin/agent-workspace"; then
            git checkout agent-workspace
            git pull origin agent-workspace
            git checkout -b $BRANCH_NAME
          else
            git checkout agent-workspace
            git checkout -b $BRANCH_NAME
          fi

      - name: Fix Bug
        run: |
          opencode run "$(cat <<'PROMPT'
            You are an autonomous bug fixer agent.

            ISSUE TO FIX:
            Number: ${{ github.event.issue.number }}
            Title: ${{ github.event.issue.title }}
            Labels: ${{ join(github.event.issue.labels.*.name, ', ') }}
            Body:
            ${{ github.event.issue.body }}

            TASK: Fix the reported bug automatically.

            WORKFLOW:

            PHASE 1 - UNDERSTAND:
            - Read and understand the issue
            - Reproduce the bug if possible
            - Identify root cause

            PHASE 2 - FIX:
            - Make minimal code changes
            - Add or update tests
            - Ensure fix is correct

            PHASE 3 - VERIFY:
            - Run all tests
            - Verify fix works
            - Check no regressions

            PHASE 4 - PR:
            - Commit changes
            - Push to agent-workspace
            - Create PR
            - Reference issue in PR description
            - Request review

            RULES:
            - Only fix simple/trivial bugs
            - Ask for help if复杂
            - Create proper tests
            - Document changes
            - Be careful with breaking changes

            Start fixing now.
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 5. Multi-Agent Collaboration

Multiple agents work together on a complex task.

```yaml
name: multi-agent-collaboration
on:
  issue_comment:
    types: [created]

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  coordinator:
    if: contains(github.event.comment.body, '/multi-agent')
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 180

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
          git merge origin/main --no-edit

      - name: Multi-Agent Coordinator
        run: |
          opencode run "$(cat <<'PROMPT'
            You are a multi-agent coordinator.

            TASK: Coordinate multiple agents to complete complex task.

            ISSUE:
            ${{ github.event.issue.title }}
            ${{ github.event.issue.body }}

            AVAILABLE AGENTS:
            1. ANALYST - Analyzes requirements and constraints
            2. ARCHITECT - Designs solution architecture
            3. CODER - Implements code changes
            4. TESTER - Writes and runs tests
            5. REVIEWER - Reviews code for quality

            COORDINATION WORKFLOW:

            PHASE 1 - ANALYSIS (ANALYST):
            Task: Analyze the issue
            - Understand requirements
            - Identify constraints
            - Define success criteria
            Output: Analysis report to architect

            PHASE 2 - ARCHITECTURE (ARCHITECT):
            Input: Analysis report from analyst
            Task: Design solution
            - Create design document
            - Define components
            - Plan integration
            Output: Design specs to coder

            PHASE 3 - IMPLEMENTATION (CODER):
            Input: Design specs from architect
            Task: Implement solution
            - Write code following design
            - Add comments
            Output: Code changes to tester

            PHASE 4 - TESTING (TESTER):
            Input: Code from coder
            Task: Test implementation
            - Write unit tests
            - Write integration tests
            - Run all tests
            Output: Test report to reviewer
            If tests fail: Feedback to coder

            PHASE 5 - REVIEW (REVIEWER):
            Input: Code and test results
            Task: Review code
            - Check code quality
            - Verify best practices
            - Check documentation
            Output: Review report
            If issues: Feedback to coder
            If approved: Proceed to PR

            PHASE 6 - PR CREATION:
            Task: Create PR
            - Write comprehensive description
            - Link to design docs
            - Reference issue
            - Request review

            COORDINATION RULES:
            - Execute agents sequentially
            - Each agent outputs input for next agent
            - Previous agent's output is required context
            - If agent fails, coordinate recovery
            - Log all agent outputs
            - Track progress across phases

            Execute full coordination workflow.
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## 6. Iterate on PR (Complex Example)

Agent continuously improves a PR until approved.

```yaml
name: iterate-on-pr
on:
  pull_request:
    types: [opened, review_requested, dismissed, reopened]
  pull_request_review:
    types: [submitted, edited, dismissed]
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: false

jobs:
  iterate:
    if: |
      github.event_name == 'workflow_dispatch' ||
      (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 180

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

      - name: Iterate
        run: |
          opencode run "$(cat <<'PROMPT'
            You are an iterate-on-pr agent.

            PR CONTEXT:
            PR Number: ${{ github.event.pull_request.number }}
            PR Title: ${{ github.event.pull_request.title }}
            PR Body: ${{ github.event.pull_request.body }}
            Event: ${{ github.event_name }} - ${{ github.event.action }}

            MISSION: Continuously iterate on PR until approved.

            ITERATION WORKFLOW:

            LOOP until approved:

            PHASE 1 - ANALYZE:
            - Read PR description
            - Read code changes
            - Read review comments (if any)
            - Identify issues/feedback

            PHASE 2 - IMPROVE:
            - Make code changes
            - Address review feedback
            - Update tests if needed
            - Update documentation

            PHASE 3 - COMMIT:
            - Commit changes to PR branch
            - Push changes

            PHASE 4 - TEST:
            - Verify tests pass
            - Check CI status

            PHASE 5 - UPDATE PR:
            - Update PR description if changed
            - Respond to review comments
            - Mark as ready for review

            PHASE 6 - WAIT:
            - Wait for new review or approval
            - If approved: Exit loop
            - If review received: Continue loop

            RULES:
            - Don't break existing functionality
            - Respect code style
            - Add tests for changes
            - Review your own changes first
            - Be patient with reviews
            - Explain complex changes
            - Ask questions if unclear

            Start iterating now.
          PROMPT
          )" \
            --model opencode/kimi-k2.5-free \
            --share false
```

---

## Summary

Autonomous agent patterns:
1. Multi-phase agent loop
2. PR state machine
3. Continuous improvement agent
4. Autonomous bug fixer
5. Multi-agent collaboration
6. Iterate on PR

See [assets/examples/example-iterate.yml](assets/examples/example-iterate.yml) for complete complex example.