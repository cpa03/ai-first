/**
 * Workflow Configuration
 *
 * Centralized configuration for CI/CD workflows and agent execution.
 * Supports environment variable overrides for flexibility across environments.
 *
 * ## Usage:
 * ```typescript
 * import { WORKFLOW_CONFIG } from '@/lib/config';
 * const timeout = WORKFLOW_CONFIG.AGENT.TIMEOUT_MINUTES;
 * ```
 *
 * ## Environment Variables:
 * - WORKFLOW_AGENT_TIMEOUT_MINUTES: Agent execution timeout (default: 20)
 * - WORKFLOW_MAX_RETRIES: Maximum retry attempts (default: 2)
 * - WORKFLOW_RETRY_DELAY_SECONDS: Delay between retries (default: 30)
 * - WORKFLOW_AGENT_MODEL: Default agent model (default: opencode/mimo-v2.5-free)
 * - WORKFLOW_RUNNER_OS: Runner OS (default: ubuntu-24.04-arm)
 * - WORKFLOW_NODE_VERSION: Node.js version (default: 20)
 */
import { EnvLoader } from './environment';

/**
 * Agent execution configuration
 */
export const WORKFLOW_AGENT_CONFIG = {
  /** Timeout for agent execution in minutes */
  TIMEOUT_MINUTES: EnvLoader.number(
    'WORKFLOW_AGENT_TIMEOUT_MINUTES',
    20,
    5,
    60
  ),

  /** Maximum number of retry attempts */
  MAX_RETRIES: EnvLoader.number('WORKFLOW_MAX_RETRIES', 2, 0, 5),

  /** Delay between retries in seconds */
  RETRY_DELAY_SECONDS: EnvLoader.number(
    'WORKFLOW_RETRY_DELAY_SECONDS',
    30,
    5,
    120
  ),

  /** Default model for agent execution */
  MODEL: EnvLoader.string('WORKFLOW_AGENT_MODEL', 'opencode/mimo-v2.5-free'),

  /** Whether to share agent sessions */
  SHARE_SESSIONS: EnvLoader.boolean('WORKFLOW_SHARE_SESSIONS', false),
} as const;

/**
 * CI/CD pipeline configuration
 */
export const PIPELINE_CONFIG = {
  /** Node.js version */
  NODE_VERSION: EnvLoader.string('WORKFLOW_NODE_VERSION', '20'),

  /** Ubuntu runner version */
  RUNNER_OS: EnvLoader.string('WORKFLOW_RUNNER_OS', 'ubuntu-24.04-arm'),

  /** Cache key prefix */
  CACHE_KEY_PREFIX: EnvLoader.string('WORKFLOW_CACHE_KEY_PREFIX', 'opencode'),

  /** Cache restore keys */
  CACHE_RESTORE_KEYS: EnvLoader.array(
    'WORKFLOW_CACHE_RESTORE_KEYS',
    ['opencode-${{ runner.os }}-v1', 'opencode-${{ runner.os }}-'],
    (item: string) => item
  ),
} as const;

/**
 * Schedule configuration
 */
export const SCHEDULE_CONFIG = {
  /** Cron expression for routine checks (default: every 4 hours) */
  ROUTINE_CRON: EnvLoader.string('WORKFLOW_ROUTINE_CRON', '0 */4 * * *'),
} as const;

/**
 * Git configuration
 */
export const GIT_CONFIG = {
  /** Fetch depth for checkout */
  FETCH_DEPTH: EnvLoader.number('WORKFLOW_GIT_FETCH_DEPTH', 0, 0, 1000),
} as const;

/**
 * Export all workflow configurations
 */
export const WORKFLOW_CONFIG = {
  AGENT: WORKFLOW_AGENT_CONFIG,
  PIPELINE: PIPELINE_CONFIG,
  SCHEDULE: SCHEDULE_CONFIG,
  GIT: GIT_CONFIG,
} as const;

export type WorkflowConfig = typeof WORKFLOW_CONFIG;
export type WorkflowAgentConfig = typeof WORKFLOW_AGENT_CONFIG;
export type PipelineConfig = typeof PIPELINE_CONFIG;
