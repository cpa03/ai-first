/**
 * Centralized Configuration Module
 *
 * This module provides a single source of truth for all application constants,
 * eliminating hardcoded values throughout the codebase.
 *
 * Usage:
 * ```typescript
 * import { APP_CONFIG, TRELLO_CONFIG, UI_CONFIG } from '@/lib/config';
 * ```
 */

// Application Configuration
export { APP_CONFIG } from './app';

// Export Connectors Configuration
export {
  TRELLO_CONFIG,
  NOTION_CONFIG,
  GITHUB_CONFIG,
  LINEAR_CONFIG,
  ASANA_CONFIG,
} from './export-connectors';

// Timeline and Task Configuration
export { TIMELINE_CONFIG, TASK_CONFIG, IDEA_CONFIG } from './timeline';

// UI Configuration
export {
  UI_CONFIG,
  LABELS,
  PLACEHOLDERS,
  BUTTON_LABELS,
  TOAST_CONFIG,
  MESSAGES,
} from './ui';

// SEO Configuration
export { SEO_CONFIG, FONT_CONFIG } from './seo';

// Validation Configuration
export {
  VALIDATION_CONFIG,
  SANITIZATION_CONFIG,
  ERROR_SUGGESTIONS_CONFIG,
} from './validation';

// Agent Configuration
export { CLARIFIER_CONFIG, AGENT_PROMPTS, AI_CONFIG } from './agents';

// Cache Configuration
export { CACHE_CONFIG } from './cache';

// Component Configuration
export { COMPONENT_CONFIG } from './components';

// Cleanup Configuration
export { CLEANUP_CONFIG } from './cleanup';

// Theme Configuration (eliminates hardcoded styling values)
export {
  FOCUS_SHADOWS,
  BORDER_COLORS,
  RING_COLORS,
  TEXT_COLORS,
  BG_COLORS,
  INPUT_STYLES,
  ANIMATION_DURATIONS,
  SPACING_PX,
  SIZES,
} from './theme';

// Environment-based Configuration (addresses issues #981-986)
// These exports allow runtime configuration via environment variables
export {
  ENV_CONFIG,
  TIMEOUT_CONFIG,
  RATE_LIMIT_CONFIG,
  RETRY_CONFIG,
  CACHE_CONFIG as ENV_CACHE_CONFIG,
  UI_CONFIG as ENV_UI_CONFIG,
  VALIDATION_CONFIG as ENV_VALIDATION_CONFIG,
  AI_CONFIG as ENV_AI_CONFIG,
  RESILIENCE_CONFIG,
  AGENT_CONFIG,
  SECURITY_CONFIG,
} from './environment';

// Legacy constants (backward compatibility)
export * from './constants';

export {
  STATUS_CODES,
  AI_SERVICE_LIMITS,
  RATE_LIMIT_VALUES,
  CLARIFIER_VALUES,
  TASK_VALIDATION,
  RETRY_VALUES,
} from './constants';

// Type exports
export type { AppConfig } from './app';
export type { ExportConnectorConfig } from './export-connectors';
export type { TimelineConfig, TaskConfig, IdeaConfig } from './timeline';
export type { UiConfig, ToastConfig, MessagesConfig } from './ui';
export type { SeoConfig, FontConfig } from './seo';
export type {
  ValidationConfig,
  SanitizationConfig,
  ErrorSuggestionsConfig,
} from './validation';
export type { ClarifierConfig, AgentPrompts, AiConfig } from './agents';
export type { CacheConfig } from './cache';
export type { ComponentConfig } from './components';
export type { CleanupConfig } from './cleanup';
export type {
  FocusShadows,
  BorderColors,
  RingColors,
  TextColors,
  BgColors,
  InputStyles,
} from './theme';
