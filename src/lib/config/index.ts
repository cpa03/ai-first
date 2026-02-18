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

export {
  TRELLO_CONFIG,
  NOTION_CONFIG,
  GITHUB_CONFIG,
  LINEAR_CONFIG,
  ASANA_CONFIG,
  GOOGLE_TASKS_CONFIG,
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

export {
  FOCUS_SHADOWS,
  BORDER_COLORS,
  RING_COLORS,
  TEXT_COLORS,
  BG_COLORS,
  INPUT_STYLES,
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
  SPACING_PX,
  SIZES,
  SVG_ANIMATION,
  CELEBRATION_COLORS,
  ANIMATION_PHYSICS,
  RIPPLE_CONFIG,
  BUTTON_STYLES,
  ALERT_STYLES,
  ALERT_BASE_STYLES,
} from './theme';

export {
  PAGE_CONFIG,
  RESULTS_PAGE_CONFIG,
  CLARIFY_PAGE_CONFIG,
  DASHBOARD_PAGE_CONFIG,
  HOME_PAGE_CONFIG,
} from './pages';

// Time Units Configuration
export {
  TIME_UNITS,
  CACHE_TTL,
  RATE_LIMIT_WINDOWS,
  RETRY_DELAYS,
  UI_DURATIONS,
  CIRCUIT_BREAKER_TIMES,
  API_TIMEOUTS,
} from './time';

// API Error Messages Configuration
export { API_ERROR_MESSAGES } from './error-messages';

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
  HTTP_HEADERS,
  AUTH_CONFIG,
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
  ButtonStyles,
  AlertStyles,
} from './theme';

// Time and Error Message Types
export type {
  TimeUnits,
  CacheTTL,
  RateLimitWindows,
  RetryDelays,
  UIDurations,
  CircuitBreakerTimes,
  APITimeouts,
} from './time';
export type { APIErrorMessages } from './error-messages';
