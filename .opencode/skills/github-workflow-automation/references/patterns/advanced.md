# Advanced Workflow Patterns

Complex patterns for real-world GitHub Actions automation scenarios.

---

## 1. Multi-Job Workflow with Dependencies

Build, test, and deploy with job dependencies.

```yaml
name: multi-job-workflow
on:
  push:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-24.04-arm
    outputs:
      node-version: ${{ steps.setup.outputs.node-version }}
    steps:
      - id: setup
        run: echo "node-version=20" >> $GITHUB_OUTPUT

  build:
    needs: setup
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build

  test:
    needs: build
    runs-on: ubuntu-24.04-arm
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4
      - run: npm test

  deploy:
    needs: test
    if: success()
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Deploy
        run: echo "Deploying to production"
```

---

## 2. Matrix Builds for Multiple Versions

Test across multiple Node.js, Python, or Go versions.

```yaml
name: matrix-build
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-24.04-arm
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]
        fail-fast: false

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install
        run: npm ci
      - name: Test
        run: npm test
```

### Conditional Matrix Entries
```yaml
strategy:
  matrix:
    include:
      - node-version: 20
        os: ubuntu-latest
        full-test: true
    exclude:
      - node-version: 18
        os: windows-latest
```

---

## 3. Conditional Deployments

Deploy based on branch, tags, or manual input.

```yaml
name: conditional-deploy
on:
  push:
    branches: [main, develop, staging]
    tags: ['v*']
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

jobs:
  deploy:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: Determine Environment
        id: env
        run: |
          if [[ "${{ github.event_name }}" == "workflow_dispatch" ]]; then
            echo "environment=${{ github.event.inputs.environment }}" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == refs/heads/main ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == refs/heads/develop ]]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == refs/tags/* ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
          else
            echo "environment=dev" >> $GITHUB_OUTPUT
          fi

      - name: Deploy
        run: |
          echo "Deploying to ${{ steps.env.outputs.environment }}"
          # Your deployment command
```

---

## 4. Reusable Workflows

Share common workflows across repositories.

### Define Reusable Workflow
**File:** `.github/workflows/deploy-service.yml`

```yaml
name: Deploy Service
on:
  workflow_call:
    inputs:
      service-name:
        required: true
        type: string
      environment:
        required: true
        type: string
    secrets:
      deploy-token:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Deploy ${{ inputs.service-name }}
        env:
          TOKEN: ${{ secrets.deploy-token }}
        run: |
          echo "Deploying ${{ inputs.service-name }} to ${{ inputs.environment }}"
          # Your deployment command
```

### Use Reusable Workflow
**File:** `.github/workflows/main.yml`

```yaml
name: Main Workflow
on:
  push:
    branches: [main]

jobs:
  deploy-api:
    uses: ./.github/workflows/deploy-service.yml
    with:
      service-name: api-service
      environment: production
    secrets:
      deploy-token: ${{ secrets.DEPLOY_TOKEN }}

  deploy-web:
    needs: deploy-api
    uses: ./.github/workflows/deploy-service.yml
    with:
      service-name: web-service
      environment: production
    secrets:
      deploy-token: ${{ secrets.DEPLOY_TOKEN }}
```

---

## 5. Workflow Call with Inputs and Outputs

Pass complex data between workflows.

```yaml
name: workflow-with-outputs
on:
  workflow_dispatch:

jobs:
  analyze:
    outputs:
      issues-found: ${{ steps.analyze.outputs.issues }}
      critical: ${{ steps.analyze.outputs.critical }}
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - id: analyze
        run: |
          # Run analysis
          ISSUES=5
          CRITICAL=1
          echo "issues=$ISSUES" >> $GITHUB_OUTPUT
          echo "critical=$CRITICAL" >> $GITHUB_OUTPUT

  decide:
    needs: analyze
    outputs:
      action: ${{ steps.decide.outputs.action }}
    runs-on: ubuntu-24.04-arm
    steps:
      - id: decide
        run: |
          if [[ "${{ needs.analyze.outputs.critical }}" == "1" ]]; then
            echo "action=CRITICAL" >> $GITHUB_OUTPUT
          elif [[ "${{ needs.analyze.outputs.issues }}" -gt 10 ]]; then
            echo "action=FIX_ALL" >> $GITHUB_OUTPUT
          else
            echo "action=MONITOR" >> $GITHUB_OUTPUT
          fi

  execute:
    needs: decide
    if: needs.decide.outputs.action == 'CRITICAL'
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "Critical issues detected, taking action"
```

---

## 6. Fan-In / Fan-Out Pattern

Run multiple jobs in parallel, then combine results.

```yaml
name: fan-in-fan-out
on: [push]

jobs:
  setup:
    runs-on: ubuntu-24.04-arm
    outputs:
      commit-sha: ${{ github.sha }}
    steps:
      - run: echo "Setting up"

  job-a:
    needs: setup
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "Job A"

  job-b:
    needs: setup
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "Job B"

  job-c:
    needs: setup
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "Job C"

  combine:
    needs: [job-a, job-b, job-c]
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "Combining results from all jobs"
```

---

## 7. Artifact Management

Build, upload, and download artifacts.

```yaml
name: artifact-workflow
on: [push]

jobs:
  build:
    runs-on: ubuntu-24.04-arm
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: |
          mkdir -p dist
          echo "Built on ${{ matrix.os }}" > dist/build.txt
      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.os }}
          path: dist/
          retention-days: 7

  download:
    needs: build
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Download All Artifacts
        uses: actions/download-artifact@v4
        with:
          path: ./artifacts
      - name: List Artifacts
        run: ls -R ./artifacts
```

---

## 8. Scheduled Automation with Cron

Run tasks on specific schedules.

```yaml
name: scheduled-tasks
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  nightly-analysis:
    if: github.event.schedule == '0 2 * * *'
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Nightly Analysis
        run: echo "Running nightly analysis"

  weekly-report:
    if: github.event.schedule == '0 0 * * 0'
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Weekly Report
        run: echo "Generating weekly report"
```

---

## 9. Complex Conditionals

Multiple conditions and logic.

```yaml
name: complex-conditions
on: [push, pull_request]

jobs:
  job:
    runs-on: ubuntu-24.04-arm
    if: |
      (github.event_name == 'push' &&
       (github.ref == 'refs/heads/main' ||
        github.ref == 'refs/heads/develop')) ||
      (github.event_name == 'pull_request' &&
       github.base_ref == 'refs/heads/main')
    steps:
      - name: Check Conditions
        run: |
          echo "Event: ${{ github.event_name }}"
          echo "Branch: ${{ github.ref }}"
```

---

## 10. Composite Actions

Create reusable action steps.

### Define Composite Action
**File:** `.github/actions/my-action/action.yml`

```yaml
name: My Composite Action
description: A custom composite action
inputs:
  message:
    description: Message to print
    required: true
outputs:
  result:
    description: Result of the action
    value: ${{ steps.step1.outputs.result }}

runs:
  using: composite
  steps:
    - id: step1
      shell: bash
      run: |
        echo "${{ inputs.message }}"
        echo "result=success" >> $GITHUB_OUTPUT
```

### Use Composite Action
```yaml
name: use-composite-action
on: [push]

jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - id: my-action
        uses: ./.github/actions/my-action
        with:
          message: "Hello from composite action"
      - name: Use Output
        run: echo "Result: ${{ steps.my-action.outputs.result }}"
```

---

## 11. Parallel Deployment with Rollback

Deploy to multiple environments with rollback capability.

```yaml
name: multi-env-deploy
on:
  workflow_dispatch:
    inputs:
      rollback:
        description: 'Rollback last deployment'
        type: boolean
        default: false

jobs:
  deploy-staging:
    if: github.event.inputs.rollback != 'true'
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Deploy to Staging
        run: echo "Deploying to staging"

  deploy-production:
    needs: deploy-staging
    if: github.event.inputs.rollback != 'true'
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Deploy to Production
        id: deploy
        continue-on-error: true
        run: |
          echo "Deploying to production"
          # Save deployment ID for rollback
          echo "deployment-id=$(date +%s)" >> $GITHUB_OUTPUT

      - name: Rollback on Failure
        if: steps.deploy.outcome == 'failure'
        run: |
          echo "Rolling back deployment ${{ steps.deploy.outputs.deployment-id }}"

  rollback:
    if: github.event.inputs.rollback == 'true'
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Rollback Last Deployment
        run: echo "Rolling back last deployment"
```

---

## 12. Workflow with Status Checks

Require specific checks before merge.

```yaml
name: status-requirements
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  check-required:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        id: tests
        run: npm test

      - name: Run Lint
        id: lint
        continue-on-error: true
        run: npm run lint

      - name: Set Status
        if: steps.tests.outcome == 'success' && steps.lint.outcome == 'success'
        run: |
          echo "All checks passed"
```

---

## Summary

Advanced patterns covered:
1. Multi-job dependencies
2. Matrix builds
3. Conditional deployments
4. Reusable workflows
5. Workflows with inputs/outputs
6. Fan-in / fan-out
7. Artifact management
8. Scheduled automation
9. Complex conditionals
10. Composite actions
11. Multi-env deployment with rollback
12. Status checks
