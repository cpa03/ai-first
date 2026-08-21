#!/bin/bash
# Workflow Configuration Script
# Sources configuration from environment variables with sensible defaults
# Usage: source scripts/workflow-config.sh

# Agent execution configuration
export WORKFLOW_AGENT_TIMEOUT_MINUTES="${WORKFLOW_AGENT_TIMEOUT_MINUTES:-20}"
export WORKFLOW_MAX_RETRIES="${WORKFLOW_MAX_RETRIES:-2}"
export WORKFLOW_RETRY_DELAY_SECONDS="${WORKFLOW_RETRY_DELAY_SECONDS:-30}"
export WORKFLOW_AGENT_MODEL="${WORKFLOW_AGENT_MODEL:-opencode/mimo-v2.5-free}"
export WORKFLOW_SHARE_SESSIONS="${WORKFLOW_SHARE_SESSIONS:-false}"

# CI/CD pipeline configuration
export WORKFLOW_NODE_VERSION="${WORKFLOW_NODE_VERSION:-20}"
export WORKFLOW_RUNNER_OS="${WORKFLOW_RUNNER_OS:-ubuntu-24.04-arm}"
export WORKFLOW_CACHE_KEY_PREFIX="${WORKFLOW_CACHE_KEY_PREFIX:-opencode}"

# Git configuration
export WORKFLOW_GIT_FETCH_DEPTH="${WORKFLOW_GIT_FETCH_DEPTH:-0}"

# Schedule configuration
export WORKFLOW_ROUTINE_CRON="${WORKFLOW_ROUTINE_CRON:-0 */4 * * *}"
