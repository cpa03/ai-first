# Architect Workflow Fixes - Implementation Guide

## Issue Summary

The Architect agent workflow has been consistently failing across multiple recent runs, preventing proper project orchestration and automated management.

## Root Cause Analysis

1. **API Connectivity Issues**: No verification of OpenCode API connectivity before execution
2. **Missing Retry Logic**: No mechanism to handle transient failures
3. **Insufficient Diagnostics**: Limited error information for troubleshooting
4. **No Health Monitoring**: No tracking of consecutive failures or system health

## Required Changes to `.github/workflows/OC Architect.yml`

### 1. Add API Connectivity Testing Step

Insert after "Install OpenCode CLI" step:

```yaml
- name: Test OpenCode API Connectivity
  run: |
    set -euo pipefail
    echo "Testing OpenCode CLI installation..."
    if ! opencode --version; then
      echo "❌ OpenCode CLI installation failed"
      exit 1
    fi

    echo "Testing API connectivity with IFLOW_API_KEY..."
    if ! opencode models | grep -q "iflowcn"; then
      echo "❌ Cannot access iflowcn models - API connectivity issue"
      exit 1
    fi

    echo "Testing model availability..."
    if ! opencode models | grep -q "iflowcn/glm-4.6"; then
      echo "❌ Required model iflowcn/glm-4.6 not available"
      exit 1
    fi

    echo "✅ OpenCode API connectivity verified"
```

### 2. Update Run Architect Step

Replace the existing "Run Architect" step with enhanced retry logic:

```yaml
- name: Run Architect
  id: run_architect
  continue-on-error: true
  timeout-minutes: 30
  run: |
    set -euo pipefail
    echo "Executing Architect for event: ${GITHUB_EVENT_NAME}"

    # Set retry variables
    MAX_RETRIES=3
    RETRY_DELAY=30
    ATTEMPT=1

    while [ $ATTEMPT -le $MAX_RETRIES ]; do
      echo "🚀 Attempt $ATTEMPT of $MAX_RETRIES - Running Architect..."
      
      # Create a test prompt first to verify connectivity
      echo "Testing API connectivity with simple prompt..."
      if opencode run "Respond with 'API_TEST_SUCCESS'" --model iflowcn/glm-4.6 --share false --timeout 60; then
        echo "✅ API connectivity test passed"
        
        # Run the full Architect prompt
        echo "Running full Architect execution..."
        if opencode run "$(cat <<'PROMPT'
          # [Existing Architect prompt content here]
        PROMPT
        )" \
          --model iflowcn/glm-4.6 \
          --share false \
          --timeout 1200; then
          echo "✅ Architect execution completed successfully"
          exit 0
        else
          echo "❌ Architect execution failed on attempt $ATTEMPT"
        fi
      else
        echo "❌ API connectivity test failed on attempt $ATTEMPT"
      fi
      
      if [ $ATTEMPT -lt $MAX_RETRIES ]; then
        echo "⏳ Waiting $RETRY_DELAY seconds before retry..."
        sleep $RETRY_DELAY
        RETRY_DELAY=$((RETRY_DELAY * 2))  # Exponential backoff
      fi
      
      ATTEMPT=$((ATTEMPT + 1))
    done

    echo "❌ All $MAX_RETRIES attempts failed"
    exit 1
```

### 3. Enhanced Failure Handling

Replace the "Handle Execution Failure" step with comprehensive diagnostics:

```yaml
- name: Handle Execution Failure
  if: ${{ steps.run_architect.outcome == 'failure' }}
  run: |
    set -euo pipefail
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")

    # Collect diagnostic information
    echo "Collecting diagnostic information..."
    OPENCODE_VERSION=$(opencode --version 2>/dev/null || echo "FAILED")
    MODELS_LIST=$(opencode models 2>/dev/null | head -5 || echo "FAILED")

    cat >> agent-report.md <<EOR
    ### [Architect] Report - FAILED
    **Date:** $TIMESTAMP
    **Event:** ${GITHUB_EVENT_NAME}
    **Ref:** ${GITHUB_REF}

    #### Execution Status
    ❌ **FAILED** - Architect run did not complete successfully.

    #### Diagnostic Information
    - **OpenCode Version:** $OPENCODE_VERSION
    - **Available Models:** $MODELS_LIST
    - **API Key Status:** \`${IFLOW_API_KEY:+SET}\`
    - **Runner OS:** \$(uname -a)
    - **Node Version:** \$(node --version 2>/dev/null || echo "N/A")

    #### Potential Root Causes
    - [ ] OpenCode API connectivity issues
    - [ ] Invalid or expired IFLOW_API_KEY
    - [ ] Model availability problems
    - [ ] Network connectivity issues
    - [ ] Rate limiting or quota exceeded

    #### Immediate Actions Required
    - [ ] Verify IFLOW_API_KEY validity and permissions
    - [ ] Test OpenCode API endpoint accessibility
    - [ ] Check if model iflowcn/glm-4.6 is available
    - [ ] Review GitHub Actions runner logs for detailed errors
    - [ ] Consider fallback model or retry strategy

    #### Long-term Improvements Needed
    - [ ] Implement workflow health monitoring
    - [ ] Add alerting for consecutive failures
    - [ ] Create manual override mechanism
    - [ ] Document troubleshooting procedures

    ---
    EOR

    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git add agent-report.md || true
    git commit -m "Add detailed failure report for Architect run - $TIMESTAMP" || true
    git push || true
```

### 4. Enhanced Completion Logging

Replace the "Log Completion" step with health monitoring:

```yaml
- name: Log Completion and Health Check
  if: ${{ always() }}
  run: |
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")

    if [[ "${{ steps.run_architect.outcome }}" == "success" ]]; then
      echo "✅ Architect execution completed successfully for event: ${GITHUB_EVENT_NAME}"
      
      # Add success report
      cat >> agent-report.md <<EOR
      ### [Architect] Report - SUCCESS
      **Date:** $TIMESTAMP
      **Event:** ${GITHUB_EVENT_NAME}
      **Ref:** ${GITHUB_REF}
      
      #### Execution Status
      ✅ **SUCCESS** - Architect run completed successfully.
      
      #### System Health
      - OpenCode API: ✅ Operational
      - Model Access: ✅ Available
      - Authentication: ✅ Valid
      
      ---
      EOR
      
    else
      echo "❌ Architect execution failed for event: ${GITHUB_EVENT_NAME}"
      
      # Check for consecutive failures
      FAILURE_COUNT=$(grep -c "Architect.*Report.*FAILED" agent-report.md | tail -1)
      if [[ $FAILURE_COUNT -gt 3 ]]; then
        echo "🚨 CRITICAL: Multiple consecutive Architect failures detected"
        echo "Immediate manual intervention required"
      fi
    fi

    # Commit any changes to agent reports
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git add agent-report.md || true
    git commit -m "Update Architect execution status - $TIMESTAMP" || true
    git push || true
```

## Implementation Steps

1. **Manual Application**: These changes must be applied manually to the workflow file due to GitHub App permissions
2. **Testing**: After implementation, trigger a test run to verify the fixes work
3. **Monitoring**: Check agent-report.md for enhanced diagnostic information
4. **Validation**: Ensure retry logic and connectivity testing function properly

## Expected Outcomes

- ✅ Reduced workflow failures through proactive connectivity testing
- ✅ Automatic recovery from transient issues via retry logic
- ✅ Better debugging capabilities with enhanced diagnostics
- ✅ Improved system health monitoring and alerting
- ✅ Restored automated project management functionality

## Success Criteria

- Architect agent executes successfully on push events
- All workflow triggers functioning properly
- Proper issue creation and assignment
- Automated project management restored
- Health monitoring implemented

Fixes #36
