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

// API Endpoint Configuration
export { API_ENDPOINTS } from './api-endpoints';

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
  DASHBOARD_FILTER_LABELS,
  PASSWORD_VALIDATION_CONFIG,
  EXPORT_LABELS,
  KEYBOARD_SHORTCUTS_MESSAGES,
  UI_STRINGS,
} from './ui';

export { UI_CONFIG as UI_TIMING_CONFIG } from './ui-config';
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
export {
  CLARIFIER_CONFIG,
  AGENT_PROMPTS,
  AI_CONFIG,
  EVENT_BUS_CONFIG,
} from './agents';

// Cache Configuration
export { CACHE_CONFIG } from './cache';

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

// Idea Status Configuration
export { IDEA_STATUS_CONFIG, type IdeaStatus } from './idea-status-config';

// Cleanup Configuration
export { CLEANUP_CONFIG } from './cleanup';

// Theme Configuration
export {
  STATE_SHADOWS,
  FOCUS_SHADOWS,
  BORDER_COLORS,
  RING_COLORS,
  TEXT_COLORS,
  BG_COLORS,
  INPUT_STYLES,
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
  DURATION_TAILWIND,
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
  BRAND_COLORS,
  OAUTH_PROVIDER_COLORS,
  CONFETTI_COLORS,
  ACTION_COLORS,
  TABLE_PATTERNS,
  MODAL_PATTERNS,
  SPINNER_PATTERNS,
  SVG_STROKE_WIDTHS,
  SVG_SIZES,
  GAP_SIZES,
  Z_INDEX_LAYERS,
  CARD_PATTERNS,
  LOADING_PATTERNS,
  SKELETON_PATTERNS,
  GRADIENT_PATTERNS,
} from './theme';

// Page Configuration
export {
  PAGE_CONFIG,
  RESULTS_PAGE_CONFIG,
  CLARIFY_PAGE_CONFIG,
  DASHBOARD_PAGE_CONFIG,
  HOME_PAGE_CONFIG,
  LOGIN_PAGE_CONFIG,
  SIGNUP_PAGE_CONFIG,
  AUTH_CALLBACK_PAGE_CONFIG,
  LOGIN_PAGE_CONTENT,
  SIGNUP_PAGE_CONTENT,
  DASHBOARD_PAGE_CONTENT,
  CLARIFY_PAGE_CONTENT,
  RESULTS_PAGE_CONTENT,
  type HomePageConfig,
  type LoginPageConfig,
  type SignupPageConfig,
  type AuthCallbackPageConfig,
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
  TIME_CONVERSION,
  EXTERNAL_RATE_LIMIT_TIMING,
  AI_TOKEN_ESTIMATION,
} from './time';

// API Error Messages Configuration
export { API_ERROR_MESSAGES } from './error-messages';

// Health Monitoring Configuration (extracted from constants.ts for modularity)
export { HEALTH_CONFIG, MEMORY_CONFIG } from './health';

// Environment-based Configuration
// EnvLoader provides type-safe environment variable loading
// ENV_CONFIG contains runtime environment metadata
export { EnvLoader, ENV_CONFIG } from './environment';

// Cloudflare Platform Configuration
export {
  CF_CACHE_TTL,
  CF_LIMITS,
  CLOUDFLARE_CONFIG,
} from './cloudflare-config';

// External API Versions Configuration (extracted from constants.ts)
export {
  EXTERNAL_API_VERSIONS,
  type ExternalApiVersionInfo,
} from './external-api-versions';

// Legacy constants (backward compatibility)
export * from './constants';

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
export type {
  ClarifierConfig,
  AgentPrompts,
  AiConfig,
  EventBusConfig,
} from './agents';
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
  DurationTailwind,
  SkeletonPatterns,
  GradientPatterns,
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
  TimeConversion,
  ExternalRateLimitTiming,
  AiTokenEstimation,
} from './time';

export type { StatusCodes, HttpHeaders, AuthConfig } from './http';
export type { HealthConfig, MemoryConfig } from './health';

export { type ErrorConfig } from './error-config';

// CSP Configuration (extracted from constants.ts for modularity)
export { CSP_CONFIG, type CspConfig } from './csp-config';

export {
  generateApiCacheControl,
  generateStaticAssetCacheControl,
  type EdgeCacheConfig,
} from './cache-control';

export {
  FEATURE_CONFIG,
  WHY_CHOOSE_CONFIG,
  type FeatureConfig,
  type WhyChooseConfig,
} from './landing-page';

export {
  MOBILE_NAV_CONFIG,
  FOOTER_NAV_CONFIG,
  type NavItem,
  type MobileNavConfig,
  type FooterNavConfig,
} from './navigation';

export {
  HASH_CONFIG,
  TIMESTAMP_CONFIG,
  RATE_LIMIT_STORE_CONFIG,
  EXTERNAL_RATE_LIMIT_CONFIG,
  AB_TEST,
  ANALYTICS_CONFIG,
  AI_MODEL_CONFIG,
  SECURITY_CONFIG,
  TASK_ANIMATION_CONFIG,
  AI_HEALTH_CHECK_CONFIG,
  type ModularConstants,
} from './modular-constants';

// Similarity Search Configuration
export { SIMILARITY_CONFIG, type SimilarityConfig } from './similarity-config';

// Storage Keys Configuration
export {
  LOCAL_STORAGE_KEYS,
  SESSION_STORAGE_KEYS,
  SUPABASE_STORAGE_KEYS,
  STORAGE_KEYS,
  type LocalStorageKeys,
  type SessionStorageKeys,
  type StorageKeys,
} from './storage-keys';

export {
  NOTIFICATION_CONFIG,
  type NotificationConfig,
} from './notification-config';

// Page Routes Configuration
// Centralizes all client-side navigation paths
export { ROUTES, type Routes } from './routes';

export {
  SHARE_BUTTON_LABELS,
  COPY_BUTTON_LABELS,
  INPUT_VALIDATION_LABELS,
  LAYOUT_ERROR_LABELS,
  SCROLL_TO_TOP_LABELS,
  TOAST_CONTAINER_LABELS,
  AUTO_SAVE_INDICATOR_LABELS,
  KEYBOARD_SHORTCUTS_HELP_LABELS,
  PROGRESS_STEPPER_LABELS,
  REFERRAL_LINK_LABELS,
  ALERT_LABELS,
  KEYBOARD_SHORTCUTS_PROVIDER_LABELS,
  IDEA_INPUT_LABELS,
  USER_ONBOARDING_LABELS,
  TASK_MANAGEMENT_LABELS,
  IDEA_READY_INDICATOR_LABELS,
  STEP_CELEBRATION_LABELS,
  USER_ONBOARDING_COMPLETION_LABELS,
  CLARIFICATION_FLOW_LABELS,
  FEATURE_GRID_LABELS,
  type ShareButtonLabels,
  type CopyButtonLabels,
  type InputValidationLabels,
  type LayoutErrorLabels,
  type ScrollToTopLabels,
  type ToastContainerLabels,
  type AutoSaveIndicatorLabels,
  type KeyboardShortcutsHelpLabels,
  type ProgressStepperLabels,
  type ReferralLinkLabels,
  type AlertLabels,
  type KeyboardShortcutsProviderLabels,
  type IdeaInputLabels,
  type UserOnboardingLabels,
  type TaskManagementLabels,
  type IdeaReadyIndicatorLabels,
  type StepCelebrationLabels,
  type UserOnboardingCompletionLabels,
  type ClarificationFlowLabels,
  type FeatureGridLabels,
} from './component-labels';

// Embedding Configuration
export { EMBEDDING_CONFIG, type EmbeddingConfig } from './embedding-config';

// Database Tables and RPC Configuration
export {
  DB_TABLES,
  DB_RPC,
  DB_REFERENCE_TYPES,
  DB_COLUMNS,
  type DbTables,
  type DbRpc,
  type DbReferenceTypes,
  type DbColumns,
} from './database-tables';

export {
  AI_ENV_KEYS,
  DATABASE_ENV_KEYS,
  EXPORT_ENV_KEYS,
  PLATFORM_ENV_KEYS,
  SECURITY_ENV_KEYS,
  APP_ENV_KEYS,
  ENV_ACCESSORS,
  getEnvNumber,
  type AiEnvKeys,
  type DatabaseEnvKeys,
  type ExportEnvKeys,
  type PlatformEnvKeys,
  type SecurityEnvKeys,
  type AppEnvKeys,
  type EnvAccessors,
} from './env-keys';

export {
  RETRYABLE_PATTERNS,
  NETWORK_ERROR_PATTERNS,
  TIMEOUT_ERROR_PATTERNS,
  DATABASE_ERROR_PATTERNS,
  AUTH_ERROR_PATTERNS,
  RATE_LIMIT_ERROR_PATTERNS,
  VALIDATION_ERROR_PATTERNS,
  LOGIN_ERROR_PATTERNS,
  matchesPattern,
  type ErrorClassificationPatterns,
} from './error-classification';

// Page Layout Configuration
// Centralizes hardcoded CSS layout values used across page components
export {
  PAGE_LAYOUT,
  PAGE_LAYOUT_CLASSES,
  OPACITY_CONFIG,
  RESPONSIVE_PADDING,
  CONTAINER_WIDTHS,
  type PageLayout,
  type OpacityConfig,
} from './page-layout';
