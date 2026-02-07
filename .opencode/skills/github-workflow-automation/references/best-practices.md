# Best Practices

Recommended practices for robust, efficient, and maintainable GitHub Actions workflows with OpenCode CLI.

---

## 1. Architecture Best Practices

### Single Responsibility Workflows
Each workflow should have one clear purpose.

**Good:**
```yaml
# .github/workflows/ci.yml - CI only
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-24.04-arm
    steps:
      - npm test
```

```yaml
# .github/workflows/deploy.yml - Deploy only
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-24.04-arm
    steps:
      - deploy_production
```

**Bad:**
```yaml
# Single workflow doing everything
name: CI-CD
on: [push, pull_request]
jobs:
  # Test, lint, build, deploy, notify all in one confusing file
```

### Reusable Workflows for Repetitive Tasks

**Define reusable workflow:**
```yaml
# .github/workflows/run-tests.yml
name: Run Tests
on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
jobs:
  test:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm test
```

**Use reusable workflow:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test-node-18:
    uses: ./.github/workflows/run-tests.yml
    with:
      node-version: '18'

  test-node-20:
    uses: ./.github/workflows/run-tests.yml
    with:
      node-version: '20'
```

---

## 2. Performance Best Practices

### Use Caching for Dependencies

```yaml
- name: Cache Node Modules
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Parallelize Independent Jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-24.04-arm
    steps:
      - npm run lint  # Runs in parallel with test

  test:
    runs-on: ubuntu-24.04-arm
    steps:
      - npm test  # Runs in parallel with lint

  build:
    needs: [lint, test]
    runs-on: ubuntu-24.04-arm
    steps:
      - npm run build  # Runs after both lint and test complete
```

### Use Shallow Checkouts When Possible

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1  # Fetch only latest commit (faster)
```

**Exception:** Use `fetch-depth: 0` when you need git operations.

### Optimize Docker Builds

```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
    push: true
    tags: myapp:latest
```

---

## 3. Security Best Practices

### Minimum Required Permissions

```yaml
# Only grant permissions that are actually needed
permissions:
  contents: read        # Read-only access
  pull-requests: read  # Only read PRs
```

### Use Environments for Critical Deployments

```yaml
jobs:
  deploy-staging:
    environment: staging
    runs-on: ubuntu-24.04-arm
    steps:
      - deploy-to-staging

  deploy-production:
    environment: production
    runs-on: ubuntu-24.04-arm
    steps:
      - deploy-to-production  # Requires manual approval
```

### Never Log Secrets

```yaml
# BAD
- run: echo "API Key: ${{ secrets.API_KEY }}"

# GOOD
- run: command_using_key "${{ secrets.API_KEY }}"
```

### Use GITHUB_TOKEN for Repository Access

```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}  # Use GITHUB_TOKEN for repo access
```

### Review Third-Party Actions

**Check these before using:**
- Repository verification status (Verified or not)
- Number of stars
- Release frequency
- Security advisories

```yaml
- uses: verified-org/verified-action@v1.2.3  # Use pinned versions
```

---

## 4. OpenCode CLI Best Practices

### Always Use Free Models

```yaml
# Use free models only
opencode run "Your prompt" \
  --model opencode/kimi-k2.5-free
```

### Use agent-workspace Branch for Automation

```yaml
- name: Branch Management
  run: |
    git fetch --all
    if git branch -r | grep "origin/agent-workspace"; then
      git checkout agent-workspace
      git pull origin agent-workspace
    else
      git checkout -b agent-workspace
    fi
```

### Set Timeouts Appropriately

```yaml
jobs:
  opencode-task:
    timeout-minutes: 60  # Set reasonable timeout
    runs-on: ubuntu-24.04-arm
    steps:
      - opencode run "Complex task" --model opencode/kimi-k2.5-free
```

### Use Queue Management

```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false  # Preserve long-running work

steps:
  - uses: softprops/turnstyle@v2
    with:
      poll-interval-seconds: 30
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 5. Workflow Management Best Practices

### Use Workflow Disposition Labels

```yaml
# .github/workflows/disposition.yml
name: Workflow Disposition
on:
  workflow_run:
    workflows: ["main-workflow"]
    types: [completed]

jobs:
  update-disposition:
    runs-on: ubuntu-24.04-arm
    if: github.event.workflow_run.conclusion == 'failure'
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Workflow failed. Please review logs.'
            })
```

### Use Composite Actions for Repeated Steps

```yaml
# .github/actions/setup-node/action.yml
name: Setup Node
description: Setup Node.js with caching
inputs:
  node-version:
    description: Node version
    required: true
runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}

    - uses: actions/cache@v4
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}

    - run: npm ci
      shell: bash
```

**Use composite action:**
```yaml
- uses: ./.github/actions/setup-node
  with:
    node-version: '20'
```

---

## 6. Error Handling Best Practices

### Use continue-on-error Gratefully

```yaml
steps:
  - id: optional-setup
    continue-on-error: true
    run: |
      optional-setup-command

  - name: Use Default if Setup Failed
    if: steps.optional-setup.outcome == 'failure'
    run: |
      use-default-configuration

  - name: Proceed Either Way
    if: always()
    run: |
      continue-with-task
```

### Always Check for Conflicts

```yaml
- id: merge
  continue-on-error: true
  run: |
    git checkout agent-workspace
    git merge origin/main

- if: steps.merge.outcome == 'failure'
  run: |
    echo "Merge conflict detected"
    git merge --abort
    # Handle conflict (notify, resolve, etc.)
```

### Fail Fast for Critical Errors

```yaml
jobs:
  critical-task:
    strategy:
      fail-fast: true  # Stop entire matrix if one fails
    matrix:
        config: [a, b, c]
    runs-on: ubuntu-24.04-arm
    steps:
      - run: critical-command
```

---

## 7. Notification Best Practices

### Group Notifications

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1.25.0
  with:
    payload: |
      {
        "text": "Workflow failed: ${{ github.workflow }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Workflow:* ${{ github.workflow }}\n*Status:* Failure\n*URL:* ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Use GitHub Status Checks

```yaml
- name: Set Status
  if: failure()
  uses: Sibz/github-status-action@v1
  with:
    authToken: ${{ secrets.GITHUB_TOKEN }}
    context: 'deploy'
    description: 'Deployment failed'
    state: 'failure'
    targetUrl: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

---

## 8. Documentation Best Practices

### Document Complex Workflows

```yaml
# .github/workflows/complex-workflow.yml
# Description: This workflow handles... (explain purpose)
# Dependencies: Requires environment variables X, Y, Z
# Maintenance: Update when...
name: Complex Workflow
on:
  # ...
```

### Use Descriptive Job Names

```yaml
jobs:
  build-and-test-and-deploy:  # Bad: Too general

  build:                       # Good: Clear
  test:                        # Good: Clear
  deploy:                       # Good: Clear
```

### Add Step Descriptions

```yaml
steps:
  - name: Checkout Code with Full History  # Descriptive
    uses: actions/checkout@v4
    with:
      fetch-depth: 0

  - name: Install Node.js 20  # Descriptive
    uses: actions/setup-node@v4
    with:
      node-version: '20'
```

---

## 9. Testing Best Practices

### Test Workflows Locally

Use `act` to test workflows locally.

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow
act push
```

### Use Workflow Status Badges

```markdown
[![CI](https://github.com/username/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/username/repo/actions/workflows/ci.yml)
```

---

## 10. Maintenance Best Practices

### Pin Action Versions

```yaml
# Use specific version tags (not @latest or @v1)
- uses: actions/checkout@v4.1.1
- uses: actions/setup-node@v4.0.2
```

### Periodically Review Workflows
- Quarterly review of all workflows
- Update outdated actions
- Check for security vulnerabilities
- Remove unused workflows

### Use Workflow Analytics

```bash
# Analyze workflow runs
gh api repos/:owner/:repo/commits/:commit_sha/statuses
```

---

## 11. Cost Optimization

### Use Ubuntu Latest When Possible

```yaml
# Cheaper than ubuntu-24.04-arm for simple tasks
runs-on: ubuntu-latest
```

**Exception:** Use `ubuntu-24.04-arm` for OpenCode automation (mandatory).

### Use Self-Hosted Runners for Long Tasks

```yaml
runs-on: self-hosted
```

### Cancel Old Workflow Runs

```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: true
```

---

## 12. Debugging Best Practices

### Enable Debug Logging

```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Enable Debug
        run: |
          echo "ACTIONS_STEP_DEBUG=true" >> $GITHUB_ENV
          echo "ACTIONS_RUNNER_DEBUG=true" >> $GITHUB_ENV
```

### Add Explicit Outputs for Debugging

```yaml
- id: debug-step
  run: |
    VAR1=$(some-command)
    echo "var1=$VAR1" >> $GITHUB_OUTPUT
    echo "Debug: VAR1=$VAR1"  # Visible in logs
```

### Use tmate for Interactive Debugging

```yaml
- name: Setup tmate session
  if: failure()
  uses: mxschmitt/action-tmate@v3
```

---

## 13. CI/CD Best Practices

### Implement Branch Protection Rules

**Set these in repository settings:**
- Require PR reviews before merge
- Require status checks to pass
- Require up-to-date branches before merge
- Restrict who can push to main

### Use Semantic Versioning for Tags

```yaml
jobs:
  release:
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - name: Release
        run: echo "Releasing ${{ github.ref_name }}"
```

### Use Feature Branch Workflow

```gitflow
main (protected) <- agent-workspace (automation)
                    <- feature/* (developers)
```

---

## 14. Summary Checklist

- [ ] Workflows have single, clear purpose
- [ ] Use reusable workflows for repeated tasks
- [ ] Cache dependencies (npm, pip, go)
- [ ] Parallelize independent jobs
- [ ] Use minimum required permissions
- [ ] Use environments for critical deployments
- [ ] Never log secrets
- [ ] Verify third-party actions before use
- [ ] Use free OpenCode models
- [ ] Use agent-workspace for automation
- [ ] Set appropriate timeouts
- [ ] Use queue management (turnstyle)
- [ ] Handle errors gracefully
- [ ] Document complex workflows
- [ ] Use descriptive names
- [ ] Pin action versions
- [ ] Review workflows periodically
- [ ] Optimize for cost where possible

---

## 15. Anti-Patterns to Avoid

### Don't Do This
```yaml
# Don't use latest tags (unstable)
- uses: actions/checkout@latest

# Don't log secrets
- run: echo "$SECRETS.MY_SECRET"

# Don't give unnecessary permissions
permissions: write-all

# Don't skip error handling
- run: critical-command  # Without error handling

# Don't ignore timeouts
jobs:
  job:  # No timeout set
    runs-on: ubuntu-24.04-arm

# Don't use monolithic workflows
jobs:
  everything:  # CI, CD, deploy, notify all in one
    steps:
```

### Do This Instead
```yaml
# Use pinned versions
- uses: actions/checkout@v4.1.1

# Use secrets secretly
- run: command_using_key "${{ secrets.MY_SECRET }}"

# Give minimum permissions
permissions:
  contents: read

# Handle errors
- id: critical
  continue-on-error: true
  run: critical-command

- if: steps.critical.outcome == 'failure'
  run: handle_failure

# Set timeouts
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60

# Use modular workflows
jobs:
  test:
    # ... test logic

  deploy:
    needs: test
    # ... deploy logic
```

---

## Reference Resources

- [GitHub Actions Official Documentation](https://docs.github.com/en/actions)
- [open_code CLI Documentation](https://opencode.ai/docs)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [GitHub Security Lab](https://securitylab.github.com/)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)