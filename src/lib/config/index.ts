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
  COMPONENT_DEFAULTS,
} from './ui';
export { ANIMATION_CONFIG } from './animation';

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
export { CACHE_TTL_CONFIG } from './cache-ttl-config';

// Component Configuration
export { COMPONENT_CONFIG } from './components';
// Proxy/Middleware Configuration
export { PROXY_CONFIG } from './proxy-config';

// Task Management Configuration
export {
  TASK_STATUS_CONFIG,
  RISK_LEVEL_CONFIG,
  TASK_ITEM_STYLES,
  TASK_HEADER_STYLES,
  DELIVERABLE_CARD_STYLES,
  DELIVERABLE_PROGRESS_CONFIG,
  TASK_MANAGEMENT_MESSAGES,
  TASK_DIMENSIONS,
  TASK_ANIMATION_DURATIONS,
} from './task-management';

// Cleanup Configuration
export { CLEANUP_CONFIG } from './cleanup';

// Theme Configuration
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
  DELIVERABLE_STYLES,
  OAUTH_PROVIDER_COLORS,
} from './theme';

// Page Configuration
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

// Health Monitoring Configuration (extracted from constants.ts for modularity)
export { HEALTH_CONFIG, MEMORY_CONFIG } from './health';

// Environment-based Configuration
// EnvLoader provides type-safe environment variable loading
// ENV_CONFIG contains runtime environment metadata
export { EnvLoader, ENV_CONFIG } from './environment';

// External API Versions Configuration (extracted from constants.ts)
export {
  EXTERNAL_API_VERSIONS,
  type ExternalApiVersionInfo,
} from './external-api-versions';

// Legacy constants (backward compatibility)
export * from './constants';

// Domain-specific config modules (extracted from constants.ts)
export {
  STATUS_CODES,
  AI_SERVICE_LIMITS,
  RATE_LIMIT_VALUES,
  CLARIFIER_VALUES,
  TASK_VALIDATION,
  RETRY_VALUES,
  HTTP_HEADERS,
  AUTH_CONFIG,
  PII_REDACTION_CONFIG,
} from './constants';

// Configuration Validator
export {
  validateConfiguration,
  validateConfigurationOrThrow,
  isConfigurationHealthy,
  type ConfigValidationResult,
} from './config-validator';

// Type exports
export type { AppConfig } from './app';
export type { ExportConnectorConfig } from './export-connectors';
export type { TimelineConfig, TaskConfig, IdeaConfig } from './timeline';
export type { UiConfig, ToastConfig, MessagesConfig } from './ui';
export type { AnimationConfig } from './animation';

export type { SeoConfig, FontConfig } from './seo';
export type { ComponentDefaults } from './ui';
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

export type { StatusCodes, HttpHeaders, AuthConfig } from './http';
export type { HealthConfig, MemoryConfig } from './health';

// Error Configuration (extracted from constants.ts)
export {
  ERROR_CONFIG,
  REQUEST_ID_CONFIG,
  RATE_LIMIT_ERROR_CONFIG,
  type ErrorConfig,
} from './error-config';

// CSP Configuration (extracted from constants.ts for modularity)
export { CSP_CONFIG, type CspConfig } from './csp-config';
