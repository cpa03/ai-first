/**
 * OpenCode Model Constants
 *
 * Centralized model string definitions for all agents and categories.
 * Using constants instead of hardcoded strings improves maintainability
 * and makes model updates easier.
 *
 * ## Usage
 *
 * Instead of:
 * ```json
 * "model": "opencode/minimax-m2.5-free"
 * ```
 *
 * Use the constant:
 * ```json
 * "model": "${MODELS.MINIMAX_M2_5_FREE}"
 * ```
 *
 * Or in TypeScript:
 * ```typescript
 * import { MODELS } from './config/model-constants';
 * const model = MODELS.MINIMAX_M2_5_FREE;
 * ```
 */

export const MODELS = {
  /** High reasoning capability model - for complex logic */
  MINIMAX_M2_5_FREE: 'opencode/minimax-m2.5-free',

  /** Fast, efficient model - for UI/quick tasks */
  GLM_4_7_FREE: 'opencode/glm-4.7-free',

  /** Balanced performance model - for generic tasks */
  MINIMAX_M2_1_FREE: 'opencode/minimax-m2.1-free',
} as const;

export const AGENT_MODELS = {
  SISYPHUS: MODELS.MINIMAX_M2_5_FREE,
  HEPHAESTUS: MODELS.GLM_4_7_FREE,
  ORACLE: MODELS.MINIMAX_M2_5_FREE,
  LIBRARIAN: MODELS.GLM_4_7_FREE,
  EXPLORE: MODELS.GLM_4_7_FREE,
  MULTIMODAL_LOOKER: MODELS.GLM_4_7_FREE,
  PROMETHEUS: MODELS.MINIMAX_M2_5_FREE,
  METIS: MODELS.MINIMAX_M2_5_FREE,
  MOMUS: MODELS.MINIMAX_M2_5_FREE,
  ATLAS: MODELS.MINIMAX_M2_5_FREE,
  REPOKEEPER: MODELS.MINIMAX_M2_5_FREE,
} as const;

export const CATEGORY_MODELS = {
  /** Visual engineering tasks - require fast, efficient model */
  VISUAL_ENGINEERING: MODELS.GLM_4_7_FREE,

  /** Ultra brain tasks - require high reasoning model */
  ULTRABRAIN: MODELS.MINIMAX_M2_5_FREE,

  /** Deep reasoning tasks - require high reasoning model */
  DEEP: MODELS.MINIMAX_M2_5_FREE,

  /** Artistic/design tasks - require fast, efficient model */
  ARTISTRY: MODELS.GLM_4_7_FREE,

  /** Quick tasks - balanced performance */
  QUICK: MODELS.MINIMAX_M2_1_FREE,

  /** Unspecified low complexity - balanced performance */
  UNSPECIFIED_LOW: MODELS.MINIMAX_M2_1_FREE,

  /** Unspecified high complexity - high reasoning */
  UNSPECIFIED_HIGH: MODELS.MINIMAX_M2_5_FREE,

  /** Writing/documentation tasks - require fast, efficient model */
  WRITING: MODELS.GLM_4_7_FREE,
} as const;

export const BUILD_AGENT_MODELS = {
  SISYPHUS: MODELS.MINIMAX_M2_5_FREE,
  HEPHAESTUS: MODELS.GLM_4_7_FREE,
  ORACLE: MODELS.MINIMAX_M2_5_FREE,
  LIBRARIAN: MODELS.GLM_4_7_FREE,
  EXPLORE: MODELS.GLM_4_7_FREE,
  FRONTEND_UI_UX: MODELS.GLM_4_7_FREE,
  MINIMAX_AGENT: MODELS.MINIMAX_M2_1_FREE,
  FRONTEND_UI_AGENT: MODELS.GLM_4_7_FREE,
  BACKEND_AGENT: MODELS.MINIMAX_M2_5_FREE,
  ORACLE_AGENT: MODELS.MINIMAX_M2_5_FREE,
  LIBRARIAN_AGENT: MODELS.GLM_4_7_FREE,
  PROMETHEUS_AGENT: MODELS.GLM_4_7_FREE,
} as const;

// Re-export for convenience
export type ModelName = (typeof MODELS)[keyof typeof MODELS];
export type AgentModelName = keyof typeof AGENT_MODELS;
export type CategoryModelName = keyof typeof CATEGORY_MODELS;
