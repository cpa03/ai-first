# Troubleshooting

Common issues, diagnostics, and solutions for GitHub Actions workflows with OpenCode CLI.

---

## Workflow Won't Trigger

### Issue 1: Workflow File in Wrong Location

**Symptom:** Workflow never triggers.

**Cause:** Workflow file not in `.github/workflows/`

**Solution:**
```bash
# Ensure workflow is in correct location
.github/workflows/my_workflow.yml
```

### Issue 2: Workflow Filename Has Wrong Extension

**Symptom:** Workflow not recognized.

**Cause:** Wrong file extension (must be `.yml` or `.yaml`)

**Solution:**
```yaml
# .github/workflows/workflow.yml  (CORRECT)
# .github/workflows/workflow.yaml (CORRECT)
# .github/workflows/workflow.txt (WRONG)
```

### Issue 3: Incorrect Trigger Event

**Symptom:** Workflow doesn't trigger on expected events.

**Cause:** Wrong event configuration.

**Solution:**
```yaml
# Correct trigger for push to main branch
on:
  push:
    branches: [main]

# Correct trigger for issue comments
on:
  issue_comment:
    types: [created]

# Correct trigger with multiple paths
on:
  push:
    paths:
      - 'src/**'
    paths-ignore:
      - 'docs/**'
```

### Issue 4: Workflow Disabled

**Symptom:** Was triggering, but stopped.

**Cause:** Workflow disabled in UI.

**Solution:**
1. Go to Actions tab
2. Find workflow
3. Click "..." → Enable workflow

---

## Authentication and Permission Issues

### Issue 1: Permission Denied

**Symptom:**
```
Error: Resource not accessible by integration
```

**Cause:** Insufficient permissions.

**Solution:**
```yaml
# Grant required permissions
permissions:
  contents: write      # For pushing code
  pull-requests: write # For creating PRs
  issues: write        # For creating comments
```

### Issue 2: GITHUB_TOKEN Not Passing

**Symptom:**
```
Error: Unauthenticated
```

**Cause:** Not using `GITHUB_TOKEN`.

**Solution:**
```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Issue 3: Third-Party Action Fails Authentication

**Symptom:** Action fails to authenticate.

**Cause:** Missing secrets or permissions.

**Solution:**
```yaml
- uses: third-party/action@v1
  with:
    api-key: ${{ secrets.API_KEY }}  # Pass required secret
```

---

## Checkout Issues

### Issue 1: Shallow Checkout Causes Problems

**Symptom:**
```
fatal: bad revision
```

**Cause:** Shallow checkout for git operations requiring history.

**Solution:**
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Full history for git operations
```

### Issue 2: Wrong Branch Checked Out

**Symptom:** Working on wrong branch.

**Cause:** Default checkout behavior.

**Solution:**
```yaml
- uses: actions/checkout@v4
  with:
    ref: agent-workspace  # Checkout specific branch
```

### Issue 3: Submodules Not Checked Out

**Symptom:** Submodules are empty.

**Cause:** Submodules not initialized.

**Solution:**
```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive
```

---

## OpenCode CLI Issues

### Issue 1: API Key Not Found

**Symptom:**
```
Error: API_KEY not provided
```

**Cause:** OpenCode API key not set.

**Solution:**
```yaml
jobs:
  opencode:
    runs-on: ubuntu-24.04-arm
    env:
      # Set OpenCode API key
      OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    steps:
      - name: Install OpenCode
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Run OpenCode
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          opencode run "Your prompt" --model opencode/kimi-k2.5-free
```

### Issue 2: Wrong Model Name

**Symptom:**
```
Error: Model not found
```

**Cause:** Incorrect model name.

**Solution:**
```yaml
# Use free models only
opencode run "Your prompt" --model opencode/kimi-k2.5-free
```

### Issue 3: Command Not Found

**Symptom:**
```
command not found: opencode
```

**Cause:** OpenCode CLI not in PATH.

**Solution:**
```yaml
- name: Install OpenCode
  run: |
    curl -fsSL https://opencode.ai/install | bash
    echo "$HOME/.opencode/bin" >> $GITHUB_PATH

- name: Verify Installation
  run: |
    opencode --version
```

### Issue 4: Prompt Too Long

**Symptom:** Truncation or errors in agent tasks.

**Cause:** Prompt exceeds character limit.

**Solution:**
```yaml
# Use heredoc for multi-line prompts
opencode run "$(cat <<'PROMPT'
  You are an expert engineer.

  Task: [concise description]

  Start now.
PROMPT
)" --model opencode/kimi-k2.5-free
```

---

## Git Issues

### Issue 1: Conflict in agent-workspace Branch

**Symptom:**
```
CONFLICT (content): Merge conflict in file
```

**Cause:** Concurrent changes in agent-workspace.

**Solution:**
```yaml
- id: merge
  continue-on-error: true
  run: |
    git branch -r | grep "origin/agent-workspace"
    if [ $? -eq 0 ]; then
      git checkout agent-workspace
      git pull origin agent-workspace
      git merge origin/main
    else
      git checkout -b agent-workspace
    fi

- if: steps.merge.outcome == 'failure'
  run: |
    echo "Merge conflict detected, aborting merge"
    git merge --abort
    exit 1
```

### Issue 2: Git User Not Configured

**Symptom:**
```
ERROR: Author identity unknown
```

**Cause:** Git user not configured.

**Solution:**
```yaml
- name: Configure Git
  run: |
    git config --global user.name "${{ github.actor }}"
    git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"
```

### Issue 3: Branch Not Found

**Symptom:**
```
fatal: bad revision 'origin/agent-workspace'
```

**Cause:** Branch doesn't exist.

**Solution:**
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

### Issue 4: Failed to Push

**Symptom:**
```
Error: failed to push some refs
```

**Cause:** Remote outdated or conflict.

**Solution:**
```yaml
- name: Safe Push
  run: |
    git pull --rebase origin agent-workspace
    git push origin agent-workspace
```

---

## Queue Management Issues

### Issue 1: Turnstyle Doesn't Wait

**Symptom:** Multiple workflows run concurrently.

**Cause:** GITHUB_TOKEN not passed correctly.

**Solution:**
```yaml
- name: Wait in Queue
  uses: softprops/turnstyle@v2
  with:
    poll-interval-seconds: 30
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Issue 2: Workflow Cancels Instead of Queuing

**Symptom:** Previous run cancelled instead of queued.

**Cause:** Wrong `cancel-in-progress` setting.

**Solution:**
```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false  # Don't cancel ongoing work
```

### Issue 3: Timeout in Queue

**Symptom:** Workflow times out while waiting.

**Cause:** Queue timeout too short.

**Solution:**
```yaml
- name: Wait in Queue
  uses: softprops/turnstyle@v2
  with:
    poll-interval-seconds: 30
    cancel-concurrent-workflows: false
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Timeout Issues

### Issue 1: Job Times Out

**Symptom:**
```
The operation was canceled.
```

**Cause:** exceeds default 360 minute limit.

**Solution:**
```yaml
jobs:
  long-task:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 360  # Set explicit timeout
    steps:
      - run: long_running_task
```

### Issue 2: Step Times Out

**Symptom:** Individual step cancels.

**Cause:** Step takes too long.

**Solution:**
```yaml
steps:
  - name: Install Dependencies
    timeout-minutes: 15  # Step timeout
    run: npm install
```

### Issue 3: Agent Task Too Long

**Symptom:** OpenCode task exceeds limits.

**Cause:** Task is too complex for single run.

**Solution:** Break task into smaller chunks:
```yaml
- name: Part 1: Analysis
  timeout-minutes: 30
  run: |
    opencode run "Analyze the codebase" \
      --model opencode/kimi-k2.5-free

- name: Part 2: Implementation
  timeout-minutes: 30
  run: |
    opencode run "Implement the changes" \
      --model opencode/kimi-k2.5-free
```

---

## Environment Variable Issues

### Issue 1: Environment Variable Not Set

**Symptom:** Variable is empty.

**Cause:** Not defined or typo in name.

**Solution:**
```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    env:
      MY_VAR: my_value
    steps:
      - name: Check Variable
        run: |
          echo "$MY_VAR"  # Verify variable
```

### Issue 2: Secret Not Accessible

**Symptom:** Secret is empty.

**Cause:** Secret not set or wrong name.

**Solution:**
```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Check Secret
        run: |
          if [ -z "${{ secrets.MY_SECRET }}" ]; then
            echo "Secret not set"
            exit 1
          fi
```

### Issue 3: Environment Variable Not Persisted

**Symptom:** Variable lost between steps.

**Cause:** Variable not written to environment file.

**Solution:**
```yaml
- name: Set Variable for Next Step
  run: echo "MY_VAR=value" >> $GITHUB_ENV

- name: Use Variable
  run: echo "$MY_VAR"
```

---

## Runner Issues

### Issue 1: Runner Not Responding

**Symptom:** Job hangs indefinitely.

**Cause:** Runner freeze or issue.

**Solution:** Set timeouts:
```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 120
```

### Issue 2: Out of Space Error

**Symptom:**
```
No space left on device
```

**Cause:** Disk full.

**Solution:**
```yaml
- name: Clean Cache
  run: |
    sudo rm -rf /var/cache/*
    sudo rm -rf /var/lib/apt/lists/*
```

### Issue 3: Wrong Runner Type

**Symptom:** Expected ARM runner got x64.

**Cause:** Runner type misconfiguration.

**Solution:**
```yaml
# For OpenCode agents, use ARM runner
jobs:
  agent-task:
    runs-on: ubuntu-24.04-arm  # ARM runner
    steps:
      - name: Install OpenCode
        run: curl -fsSL https://opencode.ai/install | bash
```

---

## Workflow Logic Issues

### Issue 1: Job Not Running

**Symptom:** Job appears but never runs.

**Cause:** Incorrect `if` condition.

**Solution:**
```yaml
jobs:
  job:
    if: github.event_name == 'push'  # Check condition
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo "Job running"
```

### Issue 2: Needs Relation Not Working

**Symptom:** Job runs before dependency completes.

**Cause:** `needs` not properly defined.

**Solution:**
```yaml
jobs:
  build:
    runs-on: ubuntu-24.04-arm
    steps:
      - run: build

  deploy:
    needs: build  # Wait for build
    runs-on: ubuntu-24.04-arm
    steps:
      - run: deploy
```

### Issue 3: Output Not Accessible

**Symptom:** Job output not read by another job.

**Cause:** Outputs not defined correctly.

**Solution:**
```yaml
jobs:
  job1:
    runs-on: ubuntu-24.04-arm
    steps:
      - id: step1
        run: echo "output=my_value" >> $GITHUB_OUTPUT
    outputs:
      my_output: ${{ steps.step1.outputs.output }}

  job2:
    needs: job1
    runs-on: ubuntu-24.04-arm
    steps:
      - run: echo ${{ needs.job1.outputs.my_output }}
```

---

## Cache Issues

### Issue 1: Cache Not Restored

**Symptom:** Cache downloads every time.

**Cause:** Cache key mismatch.

**Solution:**
```yaml
- name: Cache Node Modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Issue 2: Cache Too Large

**Symptom:** Cache exceeds size limit.

**Cause:** Caching too much.

**Solution:**
```yaml
# Cache only dependencies, not output
paths: |
  ~/.npm
  node_modules  # Not dist or build output
```

---

## Secret Issues

### Issue 1: Secret Appears in Logs

**Symptom:** Secret visible in logs.

**Cause:** Echoed or logged.

**Solution:**
```yaml
- name: Mask Secret
  run: |
    SECRET="${{ secrets.MY_SECRET }}"
    echo "::add-mask::$SECRET"
    use_secret "$SECRET"
```

### Issue 2: Secret Not Found

**Symptom:**
```
Unable to resolve variable 'secrets.MY_SECRET'
```

**Cause:** Secret not set.

**Solution:**
1. Check secret exists in repository settings
2. Verify secret name is correct
3. Ensure secret is correct scope (repo vs org)

---

## Action Version Issues

### Issue 1: Action Fails with Latest

**Symptom:** Action worked before, now failing.

**Cause:** Action updated to incompatible version.

**Solution:**
```yaml
# Pin specific version
- uses: actions/checkout@v4.1.1  # Instead of @v4 or @latest
```

### Issue 2: Action Not Found

**Symptom:**
```
Unable to resolve action `org/action@v1`
```

**Cause:** Action removed or incorrect name.

**Solution:**
```yaml
# Verify action exists
- uses: actual/action@v1  # Correct name
```

---

## Performance Issues

### Issue 1: Workflow Takes Too Long

**Symptom:** Workflow runs slowly.

**Causes:** No caching, sequential execution.

**Solutions:**
```yaml
# Add caching
- name: Cache
  uses: actions/cache@v4

# Parallelize jobs
jobs:
  job1:
    runs-on: ubuntu-24.04-arm

  job2:
    runs-on: ubuntu-24.04-arm  # Runs in parallel

  job3:
    needs: [job1, job2]
    runs-on: ubuntu-24.04-arm
```

### Issue 2: Workflow Times Out

**Symptom:** Job exceeds timeout.

**Cause:** Task too slow or infinite loop.

**Solutions:**
```yaml
# Increase timeout
timeout-minutes: 360

# Or optimize task
```

---

## Debugging Workflow

### Enable Debug Logging

```yaml
- name: Enable Debug
  run: |
    echo "ACTIONS_STEP_DEBUG=true" >> $GITHUB_ENV
    echo "ACTIONS_RUNNER_DEBUG=true" >> $GITHUB_ENV
```

### Use tmate for Interactive Debugging

```yaml
- name: Setup tmate session
  if: failure()
  uses: mxschmitt/action-tmate@v3
```

### Add Debug Outputs

```yaml
- name: Debug Info
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "Actor: ${{ github.actor }}"
```

### Check Workflow Run

```bash
# Use gh CLI to inspect workflow
gh run view <run-id>
gh run view <run-id> --log
```

---

## Common Error Messages

### Error: Resource Not Accessible by Integration

**Cause:** Missing permissions.

**Fix:**
```yaml
permissions:
  contents: write
```

### Error: Bad Revision

**Cause:** Wrong branch reference.

**Fix:**
```yaml
- uses: actions/checkout@v4
  with:
    ref: main  # Correct branch
```

### Error: Command Not Found

**Cause:** Command not installed or not in PATH.

**Fix:**
```yaml
- name: Install Tool
  run: |
    install_command
    echo "PATH=/path/to/tool:$PATH" >> $GITHUB_ENV
```

### Error: Timeout

**Cause:** Task takes too long.

**Fix:**
```yaml
jobs:
  job:
    timeout-minutes: 60  # Increase timeout
```

---

## Checklist for Troubleshooting

**Workflow not triggering:**
- [ ] File is in `.github/workflows/`
- [ ] File extension is `.yml` or `.yaml`
- [ ] Trigger events are correct
- [ ] Workflow is enabled

**Authentication issues:**
- [ ] Permissions are set
- [ ] GITHUB_TOKEN is used
- [ ] Secrets are set correctly

**Execution issues:**
- [ ] Timeouts are set appropriately
- [ ] Commands are available
- [ ] Environment variables are defined

**Git issues:**
- [ ] Git user is configured
- [ ] Full checkout for git operations
- [ ] Proper branch management

**OpenCode issues:**
- [ ] API keys are set
- [ ] Correct model name
- [ ] CLI is installed and in PATH

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [GitHub CLI](https://cli.github.com/manual/)
- [OpenCode CLI Documentation](https://opencode.ai/docs)
- [GitHub Status](https://www.githubstatus.com/)
- [GitHub Actions Troubleshooting Guide](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
