/**
 * Agent Model Configuration
 *
 * Centralizes all AI model identifiers used throughout the agent system.
 * Follows the "Flexy" principle: eliminate hardcoded model strings and make
 * them configurable from a single source of truth.
 *
 * Usage:
 * ```typescript
 * import { AGENT_MODELS, getModelForAgent } from '@/lib/config/agent-models';
 *
 * // Instead of hardcoded model string:
 * const model = AGENT_MODELS.MIMO_V2_5_FREE;
 *
 * // Get model for specific agent:
 * const agentModel = getModelForAgent('sisyphus');
 * ```
 */

/** Available AI model identifiers */
export const AGENT_MODELS = {
  /** High reasoning capability model */
  MIMO_V2_5_FREE: 'opencode/mimo-v2.5-free',
  /** Fast, efficient model */
  GLM_4_7_FREE: 'opencode/glm-4.7-free',
  /** Balanced performance model */
  MINIMAX_M2_1_FREE: 'opencode/minimax-m2.1-free',
} as const;

/** Type for model identifiers */
export type AgentModel = (typeof AGENT_MODELS)[keyof typeof AGENT_MODELS];

/** Agent-to-model mapping for quick lookup */
export const AGENT_MODEL_MAP: Record<string, AgentModel> = {
  sisyphus: AGENT_MODELS.MIMO_V2_5_FREE,
  hephaestus: AGENT_MODELS.GLM_4_7_FREE,
  oracle: AGENT_MODELS.MIMO_V2_5_FREE,
  librarian: AGENT_MODELS.GLM_4_7_FREE,
  explore: AGENT_MODELS.GLM_4_7_FREE,
  frontend_ui_ux: AGENT_MODELS.GLM_4_7_FREE,
  minimax_agent: AGENT_MODELS.MINIMAX_M2_1_FREE,
  repokeeper: AGENT_MODELS.MIMO_V2_5_FREE,
  cmz: AGENT_MODELS.MIMO_V2_5_FREE,
};

/**
 * Get the model identifier for a specific agent
 * @param agentName - The agent name to look up
 * @returns The model identifier, or the default model if not found
 */
export function getModelForAgent(agentName: string): AgentModel {
  return (
    AGENT_MODEL_MAP[agentName.toLowerCase()] ?? AGENT_MODELS.MIMO_V2_5_FREE
  );
}

/**
 * Check if a model string is valid
 * @param model - The model string to validate
 * @returns True if the model is a valid identifier
 */
export function isValidModel(model: string): model is AgentModel {
  return Object.values(AGENT_MODELS).includes(model as AgentModel);
}

/** Default model for new agents */
export const DEFAULT_AGENT_MODEL = AGENT_MODELS.MIMO_V2_5_FREE;
