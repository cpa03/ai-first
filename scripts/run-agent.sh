#!/bin/bash
# Agent Execution Script with Retry Logic
# Usage: scripts/run-agent.sh <agent-name> <prompt>

set -euo pipefail

# Source workflow configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/workflow-config.sh"

# Get arguments
AGENT_NAME="${1:?Agent name required}"
PROMPT="${2:?Prompt required}"

# Configuration from environment
TIMEOUT_MINUTES="${WORKFLOW_AGENT_TIMEOUT_MINUTES}"
MAX_RETRIES="${WORKFLOW_MAX_RETRIES}"
RETRY_DELAY="${WORKFLOW_RETRY_DELAY_SECONDS}"
MODEL="${WORKFLOW_AGENT_MODEL}"
SHARE="${WORKFLOW_SHARE_SESSIONS}"

# Execute with retry logic
retry_count=0
echo "🏗️ Starting ${AGENT_NAME} Intelligence Cycle"

while [ $retry_count -lt $MAX_RETRIES ]; do
  echo "Attempt $((retry_count + 1)) of $MAX_RETRIES"
  if opencode run /ulw-loop "$PROMPT" \
    --agent RepoKeeper \
    --model "$MODEL" \
    --share "$SHARE"; then
    echo "✅ ${AGENT_NAME} work completed successfully"
    exit 0
  else
    retry_count=$((retry_count + 1))
    echo "❌ ${AGENT_NAME} execution failed, retrying in ${RETRY_DELAY} seconds..."
    sleep "$RETRY_DELAY"
    if [ $retry_count -eq $MAX_RETRIES ]; then
      echo "❌ All retry attempts failed"
      exit 1
    fi
  fi
done
