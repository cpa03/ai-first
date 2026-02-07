# GitHub Actions Workflow Optimization

Optimizing GitHub Actions workflows is crucial for reducing execution time, saving resources, and improving developer productivity.

---

## 1. Trigger Optimization

### Selective Triggers with `paths`
Run workflows only when relevant files change.

```yaml
on:
  push:
    paths:
      - 'src/**'        # Only code
      - 'package.json'  # Only package dependencies
    paths-ignore:
      - 'docs/**'       # Ignore docs
      - '*.md'          # Ignore markdown
      - 'README.md'
```

### Event Type Specificity
Limit workflows to specific activity types.

```yaml
on:
  pull_request:
    types: [opened, reopened]  # Skip synchronize events
```

### Branch-Specific Triggers
Only run workflows on certain branches.

```yaml
on:
  push:
    branches:
      - main
      - develop
```

---

## 2. Conditional Execution

### Use `if` Conditions
Avoid running workflows when not needed.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-24.04-arm
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - name: Deploy
        run: echo "Deploying to production"
```

### Conditional Based on File Changes
```yaml
jobs:
  check-styles:
    runs-on: ubuntu-24.04-arm
    if: |
      contains(join(github.event.commits.*.modified, '.js') ||
      contains(join(github.event.commits.*.modified, '.ts')
    steps:
      - uses: actions/checkout@v4
```

### Skip Jobs Based on Changes
```yaml
jobs:
  setup:
    outputs:
      should_test: ${{ steps.changes.outputs.src }}
    steps:
      - name: Check Changes
        uses: dorny/paths-filter@v3
        id: changes
        with:
          filters: |
            src: 'src/**'

  test:
    needs: setup
    if: needs.setup.outputs.should_test == 'true'
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Run Tests
        run: npm test
```

---

## 3. Concurrency Control

### Cancel Old Runs
For fast feedback CI, cancel previous runs when new commits arrive.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Preserve Ongoing Work
For long-running processes, avoid cancellation.

```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false
```

### Per-Branch Concurrency
Different branches don't interfere with each other.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref }}
  cancel-in-progress: true
```

---

## 4. Dependency Caching

### Node.js Cache
```yaml
- name: Cache Node Modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Install Dependencies
  run: npm ci
```

### Python Cache
```yaml
- name: Cache Python Packages
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}

- name: Install Dependencies
  run: pip install -r requirements.txt
```

### Go Modules Cache
```yaml
- name: Cache Go Modules
  uses: actions/cache@v4
  with:
    path: |
      ~/.cache/go-build
      ~/go/pkg/mod
    key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
```

### Multi-Path Cache
```yaml
- name: Cache Dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.cache/pip
      node_modules
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json', '**/requirements.txt') }}
```

---

## 5. Parallel Job Execution

### Independent Jobs Run Simultaneously
```yaml
jobs:
  lint:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Lint
        run: npm run lint

  test:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Test
        run: npm test

  type-check:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Type Check
        run: npm run type-check
```

All three jobs run in parallel.

### Job Dependencies
```yaml
jobs:
  build:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Build
        run: npm run build

  test:
    needs: build
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Test
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Deploy
        run: npm run deploy
```

### Fan-In / Fan-Out Pattern
```yaml
jobs:
  setup:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Setup
        run: echo "Setting up"

  job-a:
    needs: setup
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Job A
        run: echo "Job A"

  job-b:
    needs: setup
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Job B
        run: echo "Job B"

  finalize:
    needs: [job-a, job-b]
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Finalize
        run: echo "Finalize"
```

---

## 6. Resource Optimization

### Set Timeouts
Prevent runaway jobs.

```yaml
jobs:
  build:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 30
    steps:
      - name: Build
        run: npm run build
```

### Use Appropriate Runners
Don't overprovision resources.

```yaml
# For lightweight tasks
runs-on: ubuntu-latest

# For heavy builds
runs-on: ubuntu-24.04-arm

# For specific OS
runs-on: macos-latest
runs-on: windows-latest
```

### Disable Unused Services
```yaml
- name: Stop MySQL
  if: "!contains(github.event.paths.*, 'db/')"
  run: sudo systemctl stop mysql
```

---

## 7. Reusable Workflows

### Define Reusable Workflow
**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy
on:
  workflow_call:
    inputs:
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
      - name: Deploy
        env:
          TOKEN: ${{ secrets.deploy-token }}
        run: echo "Deploying to ${{ inputs.environment }}"
```

### Reuse Workflow
```yaml
jobs:
  deploy-staging:
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
    secrets:
      deploy-token: ${{ secrets.STAGING_DEPLOY_TOKEN }}

  deploy-production:
    needs: deploy-staging
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
    secrets:
      deploy-token: ${{ secrets.PROD_DEPLOY_TOKEN }}
```

---

## 8. Matrix Builds with Smart Execution

### Basic Matrix
```yaml
jobs:
  test:
    runs-on: ubuntu-24.04-arm
    strategy:
      matrix:
        node-version: [18, 20]
        os: [ubuntu-latest, windows-latest]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

### Fail-Fast Control
```yaml
strategy:
  fail-fast: false  # Continue all jobs even if one fails
  matrix:
    node-version: [18, 20]
```

### Conditional Job Execution in Matrix
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

## 9. Artifacts and Caching

### Save Build Artifacts
```yaml
- name: Build
  run: npm run build

- name: Upload Artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-artifacts
    path: |
      dist/
      build/
```

### Download Artifacts
```yaml
- name: Download Artifacts
  uses: actions/download-artifact@v4
  with:
    name: build-artifacts
    path: ./artifacts
```

---

## 10. Output and Result Sharing

### Pass Data Between Jobs
```yaml
jobs:
  build:
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - id: version
        run: echo "version=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

---

## 11. Environment Variables Management

### Job-Level Variables
```yaml
jobs:
  build:
    env:
      NODE_ENV: production
      BUILD_TIME: ${{ github.event.head_commit.timestamp }}
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "$NODE_ENV"
```

### Step-Level Variables
```yaml
steps:
  - name: Build
    env:
      NODE_ENV: development
    run: npm run build
```

### Default Environment
```yaml
env:
  CI: true
jobs:
  test:
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "$CI"
```

---

## 12. Timeout Strategies

### Job-Level Timeout
```yaml
jobs:
  build:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 30
    steps:
      - name: Build
        run: npm run build
```

### Step-Level Timeout
```yaml
steps:
  - name: Build
    timeout-minutes: 10
    run: npm run build
```

---

## 13. Workflow Cancellation

### Manual Cancellation
Use GitHub UI to cancel running workflows.

### Programmatic Cancellation
```yaml
jobs:
  cancel-previous:
    if: github.event_name == 'push'
    steps:
      - name: Cancel Previous Runs
        uses: styfle/cancel-workflow-action@0.12.1
        with:
          access_token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 14. Summary of Optimization Checklist

- [ ] Use `paths` and `paths-ignore` filters
- [ ] Specify event types with `types: []`
- [ ] Add conditional `if:` statements
- [ ] Configure concurrency properly
- [ ] Cache dependencies (npm, pip, go, etc.)
- [ ] Parallelize independent jobs
- [ ] Set appropriate timeouts
- [ ] Use reusable workflows for common tasks
- [ ] Optimize matrix builds with `fail-fast`
- [ ] Use artifacts for ephemeral storage
- [ ] Monitor workflow execution time
- [ ] Review and adjust based on usage patterns

---

## 15. Performance Monitoring

### Use Actions Inspector
GitHub provides built-in tools to monitor:
- Workflow execution time
- Most expensive jobs
- Resource usage
- Cache hit rates

### Self-Hosted Runner Considerations
- Optimize runner provisioning
- Use appropriate runner classes
- Implement auto-scaling if needed

---

## Reference

- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [GitHub Actions Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
