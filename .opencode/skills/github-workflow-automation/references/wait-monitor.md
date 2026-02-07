# Wait and Monitor Patterns

Patterns for waiting, monitoring, and controlling workflow execution.

---

## Queue Management

### Using turnstyle for Concurrency
Prevent race conditions and manage concurrent workflow executions.

```yaml
import: softprops/turnstyle@v2

jobs:
  opencode:
    # ... setup ...

    steps:
      - name: Wait in Queue
        uses: softprops/turnstyle@v2
        with:
          poll-interval-seconds: 30
          token: ${{ secrets.GITHUB_TOKEN }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Customizing turnstyle

```yaml
- name: Wait in Queue with Customizations
  uses: softprops/turnstyle@v2
  with:
    poll-interval-seconds: 10      # Check every 10 seconds
    abort-after-seconds: 3600      # Abort after 1 hour if queued
    cancel-concurrent-workflows: false  # Don't cancel concurrent workflows
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Timeouts

### Job-Level Timeout

```yaml
jobs:
  long-running-task:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60   # Cancel after 60 minutes
    steps:
      - name: Run Long Task
        run: long-running-command
```

### Step-Level Timeout

```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Timeout After 10 Minutes
        timeout-minutes: 10
        run: command-that-may-hang
```

### Conditional Timeouts

```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: ${{ github.ref == 'refs/heads/main' && 60 || 30 }}
    steps:
      - name: Task
        run: command
```

## Continue on Error

### Step Continues on Error

```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Optional Step
        id: optional
        continue-on-error: true
        run: fail

      - name: Check Optional Status
        run: |
          if [[ "${{ steps.optional.outcome }}" == "failure" ]]; then
            echo "Optional step failed, continuing"
          fi
```

### Job Continues on Error

```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    continue-on-error: true
    steps:
      - name: Might Fail
        run: command
```

## Retry Logic

### Basic Retry with Actions

```yaml
- name: Retry on Failure
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: command-that-may-fail
```

### Retry with Backoff

```yaml
- name: Retry with Exponential Backoff
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 30
    max_attempts: 5
    retry_wait_seconds: 5     # Start with 5 seconds
    exponential_backoff: true # Exponential backoff
    command: unstable-command
```

### Conditional Retry

```yaml
- name: Conditional Retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: critical-command
  env:
    RETRY: "true"
```

## Polling and Waiting

### Poll for External Condition

```yaml
jobs:
  poll:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Poll Until Complete
        run: |
          for i in {1..60}; do
            STATUS=$(curl -s https://api.example.com/status)
            if [[ "$STATUS" == "complete" ]]; then
              echo "Task complete"
              exit 0
            fi
            echo "Waiting... ($i/60)"
            sleep 30
          done
          echo "Timeout reached"
          exit 1
```

### Wait for Service

```yaml
- name: Wait for Database
  run: |
    timeout 60 bash -c 'until nc -z $DB_HOST $DB_PORT; do echo "Waiting for database..."; sleep 2; done'
  env:
    DB_HOST: localhost
    DB_PORT: 5432
```

### Wait for File

```yaml
- name: Wait for Result File
  run: |
    timeout 300 bash -c 'until [ -f result.json ]; do echo "Waiting for result..."; sleep 5; done'
```

## Workflow Monitoring

### Check Workflow Status

```yaml
jobs:
  monitor:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Check Other Workflow
        run: |
          gh run list --workflow=*.yml --limit 1 --json status,conclusion
```

### Wait for Workflow to Complete

```yaml
jobs:
  wait-for-workflow:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Wait for Deploy Workflow
        id: wait
        run: |
          RUN_ID=$(gh run list --workflow=deploy.yml --branch=main --limit 1 --json databaseId --jq '.[0].databaseId')

          echo "Waiting for run $RUN_ID..."

          gh run watch $RUN_ID

          CONCLUSION=$(gh run view $RUN_ID --json conclusion --jq '.conclusion')

          if [[ "$CONCLUSION" != "success" ]]; then
            echo "Workflow failed or cancelled"
            exit 1
          fi
```

## Monitoring Multiple Conditions

### All Must Succeed

```yaml
jobs:
  orchestrate:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Start Process 1
        run: start_process_1.sh

      - name: Start Process 2
        run: start_process_2.sh

      - name: Start Process 3
        run: start_process_3.sh

      - name: Wait for All Processes
        run: |
          check_processes() {
            SUCCESS=0
            RUNNING=0

            if curl -s http://localhost:3000/health; then ((SUCCESS++)); fi
            if curl -s http://localhost:3001/health; then ((SUCCESS++)); fi
            if curl -s http://localhost:3002/health; then ((SUCCESS++)); fi

            echo "Running: $SUCCESS/3"
            [[ $SUCCESS -eq 3 ]]
          }

          timeout 300 bash -c 'while ! check_processes; do sleep 10; done'
```

### Any Must Succeed

```yaml
jobs:
  orchestrate:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Start Multiple Workers
        run: |
          for i in {1..5}; do
            start_worker.sh $i &
          done
          wait

      - name: Wait for Any Success
        run: |
          for i in {1..60}; do
            if check_success_any; then
              echo "Success found"
              exit 0
            fi
            sleep 30
          done
          echo "Timeout"
          exit 1
```

## Conditional Wait

### Wait Based on Branch

```yaml
jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Wait on Staging
        if: github.ref == 'refs/heads/staging'
        run: |
          # Wait only for staging branch
          sleep 300

      - name: No Wait on Production
        if: github.ref == 'refs/heads/production'
        run: echo "Proceed immediately"
```

### Wait Based on Input

```yaml
on:
  workflow_dispatch:
    inputs:
      wait-time:
        description: 'Wait time in minutes'
        required: true
        default: '10'
        type: choice
        options: [5, 10, 15, 30]

jobs:
  wait:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Wait
        id: wait
        run: |
          WAIT_TIME=${{ github.event.inputs.wait-time }}
          echo "Waiting for $WAIT_TIME minutes..."
          echo "waited=true" >> $GITHUB_OUTPUT
        timeout-minutes: ${{ github.event.inputs.wait-time }}
```

## Status Checks

### Wait for CI Checks to Pass

```yaml
jobs:
  deploy:
    runs-on: ubuntu-24.04-arm
    needs: [build, test, lint]
    steps:
      - name: Verify All Checks Passed
        run: |
          if [[ "${{ needs.build.result }}" != "success" ]] ||
             [[ "${{ needs.test.result }}" != "success" ]] ||
             [[ "${{ needs.lint.result }}" != "success" ]]; then
            echo "One or more checks failed"
            exit 1
          fi
          echo "All checks passed, deploying..."
```

### Check PR Status

```yaml
jobs:
  deploy:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Check PR Status
        run: |
          PR_NUMBER=${{ github.event.pull_request.number }}
          PR_STATE=$(gh pr view $PR_NUMBER --json state --jq '.state')

          if [[ "$PR_STATE" != "open" ]]; then
            echo "PR is not open, skipping deploy"
            exit 0
          fi

          # Check if PR is mergeable
          MERGEABLE=$(gh pr view $PR_NUMBER --json mergeable --jq '.mergeable')

          if [[ "$MERGEABLE" == "true" ]]; then
            echo "PR is ready to merge"
          else
            echo "PR has conflicts, skipping deploy"
            exit 0
          fi
```

## Long-Running Operations

### Monitor Long-Running Operation

```yaml
jobs:
  long-task:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 180  # 3 hours
    steps:
      - name: Start Operation
        id: start
        run: |
          OP_ID=$(start-long-operation.sh)
          echo "operation_id=$OP_ID" >> $GITHUB_OUTPUT

      - name: Monitor Operation
        run: |
          OP_ID=${{ steps.start.outputs.operation_id }}

          for i in {1..360}; do  # Check for up to 3 hours
            STATUS=$(check-operation-status $OP_ID)

            if [[ "$STATUS" == "completed" ]]; then
              echo "Operation completed successfully"
              exit 0
            elif [[ "$STATUS" == "failed" ]]; then
              echo "Operation failed"
              exit 1
            fi

            echo "Operation in progress... ($STATUS) [$i/360]"
            sleep 30
          done

          echo "Operation timed out"
          exit 1
```

### Progress Reporting

```yaml
jobs:
  monitor-task:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 120
    steps:
      - name: Start Task with Progress
        id: task
        run: |
          TASK_ID=$(start-task.sh)
          echo "task_id=$TASK_ID" >> $GITHUB_OUTPUT

      - name: Monitor with Progress Updates
        run: |
          TASK_ID=${{ steps.task.outputs.task_id }}

          for i in {1..240}; do
            INFO=$(get-task-info $TASK_ID)

            PROGRESS=$(echo $INFO | jq '.progress')
            STATUS=$(echo $INFO | jq '.status')

            echo "Progress: $PROGRESS%"

            if [[ "$STATUS" == "completed" ]]; then
              echo "Task completed at $PROGRESS%"
              exit 0
            fi

            sleep 30
          done
```

## Wait and Retry Pattern

### Combined Wait and Retry

```yaml
jobs:
  robust-task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Wait and Retry Task
        uses: nick-invision/retry@v2
        with:
          timeout_minutes: 30
          max_attempts: 5
          retry_wait_seconds: 10
          command: |
            # Wait for resource
            timeout 60 bash -c 'until curl -f http://service/health; do sleep 5; done'

            # Perform task
            execute-task.sh
```

## Event-Based Waiting

### Wait for Manual Approval

```yaml
jobs:
  deploy:
    environment: production
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Production Deployment
        run: |
          echo "Deployment requires manual approval"
          echo "Waiting for approval in environment settings..."
          # Workflow will pause here; requires manual approval
          deploy-to-production.sh
```

### Wait for External Event

```yaml
jobs:
  wait-and-process:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Initialize
        id: init
        run: |
          echo "event_id=$(date +%s)" >> $GITHUB_OUTPUT

      - name: Wait for External Event
        run: |
          EVENT_ID=${{ steps.init.outputs.event_id }}

          for i in {1..60}; do
            RESPONSE=$(curl -s "https://api.example.com/events/$EVENT_ID")

            if echo $RESPONSE | grep -q "triggered"; then
              echo "Event received"
              execute-reaction.sh
              exit 0
            fi

            sleep 30
          done

          echo "No event received within timeout"
```

## Monitoring Scripts

### Monitoring Helper Script

```bash
# scripts/monitor.sh
#!/bin/bash

# Wait for condition
wait_condition() {
  local condition="$1"
  local timeout="$2"
  local interval="${3:-10}"

  local elapsed=0
  while [[ $elapsed -lt $timeout ]]; do
    if eval "$condition"; then
      return 0
    fi

    echo "Waiting... ($elapsed/$timeout)"
    sleep $interval
    elapsed=$((elapsed + interval))
  done

  return 1
}

# Monitor health
monitor_health() {
  local url="$1"
  local timeout="${2:-300}"

  wait_condition "curl -f -s '$url'" "$timeout"
}

# Monitor process
monitor_process() {
  local pid="$1"
  local timeout="${2:-300}"

  wait_condition "ps -p '$pid' > /dev/null" "$timeout" && \
    return 0 || return 1
}
```

### Using Helper Script

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Monitor Helper
        run: |
          chmod +x scripts/monitor.sh
          source scripts/monitor.sh

          # Wait for service to be healthy
          monitor_health "http://service:8080/health" 300 || exit 1

          # Run task
          start-service.sh &
          PID=$!

          # Monitor service process
          monitor_process $PID 600 || exit 1
```

## Best Practices for Waiting

### 1. Always Set Timeouts

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60  # Always set
```

### 2. Use Queue Management

```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: false  # Don't cancel long-running workflows

steps:
  - uses: softprops/turnstyle@v2
    with:
      cancel-concurrent-workflows: false
```

### 3. Graceful Degradation

```yaml
jobs:
  task:
    steps:
      - name: Graceful Failure
        id: task
        continue-on-error: true
        run: might-fail

      - name: Backup Approach
        if: steps.task.outcome == 'failure'
        run: use-backup-approach
```

### 4. Progress Reporting

```yaml
- name: Monitor with Progress
  run: |
    for i in {1..60}; do
      PROGRESS=$(get-progress)
      echo "::notice title=Operation Progress::$PROGRESS%"
      sleep 30
    done
```

### 5. Clean Up on Timeout

```yaml
jobs:
  task:
    steps:
      - name: Setup
        run: start-service.sh

      - name: Cleanup on Failure
        if: failure()
        run: |
          stop-service.sh
          clean-up-resources.sh
```

## Troubleshooting

### Workflow Times Out

**Issue:** Workflow stops after timeout.

**Solutions:**
1. Increase timeout: `timeout-minutes: 120`
2. Optimize task execution
3. Break into multiple jobs
4. Use background processes with monitoring

### Queue Not Working

**Issue:** Concurrent workflows still run.

**Solutions:**
1. Check GITHUB_TOKEN permission
2. Verify turnstyle configuration
3. Ensure workflow has same name for concurrency group

### Status Check Fails

**Issue:** Workflow fails when checking status.

**Solutions:**
1. Verify API access
2. Check permissions
3. Use `continue-on-error: true`
4. Validate status endpoint

## Summary

Key concepts covered:
- Queue management with turnstyle
- Job and step timeouts
- Continue-on-error patterns
- Retry logic
- Polling for conditions
- Workflow monitoring
- Status checks
- Long-running operations
- Event-based waiting
- Best practices

**Critical Rule:** Always use turnstyle with `cancel-in-progress: false` for long-running workflows.
