#!/bin/bash
# Workflow Configuration Script
# Outputs workflow configuration values for GitHub Actions
# Usage: source scripts/workflow-config.sh && echo $AGENT_TIMEOUT_MINUTES

get_env_number() {
  local key="$1"
  local default="$2"
  local min="$3"
  local max="$4"
  
  local value="${!key}"
  if [ -z "$value" ]; then
    echo "$default"
    return
  fi
  
  # Validate it's a number
  if ! [[ "$value" =~ ^[0-9]+$ ]]; then
    echo "$default"
    return
  fi
  
  # Check min/max
  if [ -n "$min" ] && [ "$value" -lt "$min" ]; then
    echo "$min"
    return
  fi
  
  if [ -n "$max" ] && [ "$value" -gt "$max" ]; then
    echo "$max"
    return
  fi
  
  echo "$value"
}

get_env_string() {
  local key="$1"
  local default="$2"
  
  local value="${!key}"
  if [ -z "$value" ]; then
    echo "$default"
  else
    echo "$value"
  fi
}

# Agent Configuration
AGENT_TIMEOUT_MINUTES=$(get_env_number "WORKFLOW_AGENT_TIMEOUT_MINUTES" 20 5 60)
AGENT_MAX_RETRIES=$(get_env_number "WORKFLOW_MAX_RETRIES" 2 0 5)
AGENT_RETRY_DELAY_SECONDS=$(get_env_number "WORKFLOW_RETRY_DELAY_SECONDS" 30 5 120)
AGENT_MODEL=$(get_env_string "WORKFLOW_AGENT_MODEL" "opencode/mimo-v2.5-free")

# Pipeline Configuration
NODE_VERSION=$(get_env_string "WORKFLOW_NODE_VERSION" "20")
RUNNER_OS=$(get_env_string "WORKFLOW_RUNNER_OS" "ubuntu-24.04-arm")
CACHE_KEY_PREFIX=$(get_env_string "WORKFLOW_CACHE_KEY_PREFIX" "opencode")

# Schedule Configuration
ROUTINE_CRON=$(get_env_string "WORKFLOW_ROUTINE_CRON" "0 */4 * * *")

# Git Configuration
GIT_FETCH_DEPTH=$(get_env_number "WORKFLOW_GIT_FETCH_DEPTH" 0 0 1000)
