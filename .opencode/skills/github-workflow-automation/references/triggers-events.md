# GitHub Actions Triggers & Events

## Workflow Events

GitHub Actions workflows are triggered by various events. Understanding these events is crucial for efficient automation.

## Core Event Types

### 1. Push Events
Triggers when code is pushed to a branch or tag.

```yaml
on:
  push:
    branches:
      - main
      - develop
    tags:
      - 'v*'
```

**Common `types` for push:**
- `push` (default - all pushes)
- No specific types available

### 2. Pull Request Events
Triggers when pull requests are opened, updated, or closed.

```yaml
on:
  pull_request:
    branches:
      - main
    types: [opened, reopened, synchronize, closed, merged]
```

**Available `types`:**
- `opened` - PR is opened
- `reopened` - PR is reopened after being closed
- `synchronize` - PR is updated with new commits
- `closed` - PR is closed without merging
- `merged` - PR is merged

### 3. Issue Events
Triggers when issues are opened, edited, or closed.

```yaml
on:
  issues:
    types: [opened, edited, deleted, closed, reopened]
```

**Available `types`:**
- `opened` - Issue is created
- `edited` - Issue title or body is edited
- `deleted` - Issue is deleted
- `closed` - Issue is closed
- `reopened` - Issue is reopened

### 4. Comment Events

#### Issue Comments
Triggers when comments are made on issues.

```yaml
on:
  issue_comment:
    types: [created, edited, deleted]
```

**Available `types`:**
- `created` - Comment is added
- `edited` - Comment is modified
- `deleted` - Comment is removed

#### Pull Request Review Comments
Triggers when comments are made on specific code lines or PR reviews.

```yaml
on:
  pull_request_review_comment:
    types: [created, edited, deleted]
```

**Available `types`:**
- `created` - Comment is added
- `edited` - Comment is modified
- `deleted` - Comment is removed

### 5. Scheduled Events
Triggers on a schedule using cron syntax.

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
```

**Cron Format:**
```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, SUN-SAT)
* * * * *
```

### 6. Workflow Dispatch
Manual trigger from GitHub UI.

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
```

### 7. Workflow Run Events
Triggers when another workflow completes or fails.

```yaml
on:
  workflow_run:
    workflows: ["build-and-test"]
    types: [completed]
```

**Available `types`:**
- `completed` - Workflow finished
- `requested` - Workflow started
- `in_progress` - Workflow is running

---

## Path Filters

### Run on Specific Paths
Use `paths` to trigger only when specific files change.

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
      - 'tsconfig.json'
```

### Ignore Specific Paths
Use `paths-ignore` to exclude certain changes.

```yaml
on:
  push:
    paths-ignore:
      - 'docs/**'
      - '*.md'
      - 'README.md'
```

### Combining Path Filters
You can use `paths` and `paths-ignore` together:

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'tests/**'
    paths-ignore:
      - 'src/assets/**'
      - 'tests/fixtures/**'
```

---

## Branch Filters

### Run on Specific Branches
```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'feature/**'
```

### Ignore Specific Branches
```yaml
on:
  push:
    branches-ignore:
      - 'docs/**'
      - 'temp/**'
```

---

## Tag Filters

### Run on Specific Tags
```yaml
on:
  push:
    tags:
      - 'v*'
      - 'release/*'
```

---

## Conditional Triggers

### Multiple Event Combinations
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

### Event-Specific Logic
```yaml
on:
  push:
  pull_request:

jobs:
  build:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
```

---

## Special Event Types

### Repository Events
```yaml
on:
  repository_dispatch:
    types: [trigger-build]
```

### Release Events
```yaml
on:
  release:
    types: [created, published, edited, deleted, prereleased, released]
```

### Status Events
```yaml
on:
  status: {}
```

---

## Event Context Access

In your workflow, you can access event details via `github.event` context:

```yaml
on:
  push:

jobs:
  analyze:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Show Event Context
        run: |
          echo "Event: ${{ github.event_name }}"
          echo "Actor: ${{ github.actor }}"
          echo "Branch: ${{ github.ref }}"
          echo "Commit: ${{ github.sha }}"
          if: github.event_name == 'push'
          then
            echo "Changed files: ${{ toJson(github.event.commits.*.modified) }}"
          fi
```

---

## Best Practices

1. **Be Specific with Types**
   - Use `types: [opened, reopened]` instead of all PR types
   - Reduces unnecessary workflow runs

2. **Use Path Filters**
   - Filter by `paths` for relevant file changes
   - Use `paths-ignore` for documentation or non-code changes

3. **Combine Filters Wisely**
   - Mix branch + path filters for precision
   - Example: Only test main branch + src changes

4. **Consider Concurrency**
   - Use `cancel-in-progress: true` for rapid iterations
   - Use `cancel-in-progress: false` for long-running processes

5. **Monitor Event Frequency**
   - Review workflow runs regularly
   - Adjust triggers if too many/few executions

---

## Common Trigger Patterns

### PR Only Workflow
```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize]
```

### Production Deployment
```yaml
on:
  push:
    branches: [main]
    tags: ['v*']
```

### Comment-Triggered Automation
```yaml
on:
  issue_comment:
    types: [created]
jobs:
  respond:
    if: contains(github.event.comment.body, '/opencode')
```

### Nightly Tasks
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC
```

---

## Reference

- [Official GitHub Events Documentation](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
