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
  SVG_VIEWBOX,
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
  SVG_CIRCLE,
  GAP_SIZES,
  Z_INDEX_LAYERS,
  CARD_PATTERNS,
  LOADING_PATTERNS,
  SKELETON_PATTERNS,
  GRADIENT_PATTERNS,
  TEXT_COLOR_CLASSES,
  BG_COLOR_CLASSES,
  BORDER_COLOR_CLASSES,
  FOCUS_RING_CLASSES,
  SPACING_CLASSES,
  TYPOGRAPHY_CLASSES,
  LAYOUT_CLASSES,
  TRANSITION_CLASSES,
  SHADOW_CLASSES,
  ROUNDED_CLASSES,
  PROGRESS_BAR_A11Y,
  CHAR_COUNT_COLORS,
  TAILWIND_UTILS,
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
  NOT_FOUND_PAGE_CONFIG,
  NOT_FOUND_LABELS,
  LOGIN_PAGE_CONTENT,
  SIGNUP_PAGE_CONTENT,
  DASHBOARD_PAGE_CONTENT,
  CLARIFY_PAGE_CONTENT,
  RESULTS_PAGE_CONTENT,
  LOGIN_ERROR_FALLBACK,
  SIGNUP_ERROR_FALLBACK,
  DASHBOARD_ERROR_FALLBACK,
  CLARIFY_ERROR_FALLBACK,
  RESULTS_ERROR_FALLBACK,
  AUTH_CALLBACK_ERROR_FALLBACK,
  LAYOUT_ERROR_FALLBACKS,
  type HomePageConfig,
  type LoginPageConfig,
  type SignupPageConfig,
  type AuthCallbackPageConfig,
  type LoginErrorFallback,
  type SignupErrorFallback,
  type DashboardErrorFallback,
  type ClarifyErrorFallback,
  type ResultsErrorFallback,
  type AuthCallbackErrorFallback,
  type LayoutErrorFallback,
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

// Legacy API Error Messages Configuration (backward compatibility)
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

export {
  EXTERNAL_API_DOMAINS,
  PRECONNECT_URLS,
  type ExternalApiDomains,
  type PreconnectUrls,
} from './external-api-domains';

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
  TextColorClasses,
  BgColorClasses,
  BorderColorClasses,
  FocusRingClasses,
  SpacingClasses,
  TypographyClasses,
  LayoutClasses,
  TransitionClasses,
  ShadowClasses,
  RoundedClasses,
  TailwindUtils,
  CharCountColors,
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
  HAMBURGER_MENU_CONFIG,
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
  ID_PREFIX_CONFIG,
  ERROR_CONTEXT_CONFIG,
  PRECISION_CONFIG,
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
export {
  ROUTES,
  createRouteWithParams,
  createRouteWithPathParams,
  type Routes,
} from './routes';

// API Routes Configuration
// Centralizes all API endpoint paths
export { API_ROUTES, type ApiRoutes } from './api-routes';

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
  DELIVERABLE_CARD_LABELS,
  IDEA_READY_INDICATOR_LABELS,
  STEP_CELEBRATION_LABELS,
  USER_ONBOARDING_COMPLETION_LABELS,
  CLARIFICATION_FLOW_LABELS,
  FEATURE_GRID_LABELS,
  DASHBOARD_LABELS,
  BLUEPRINT_DISPLAY_LABELS,
  WHY_CHOOSE_SECTION_LABELS,
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
  type DeliverableCardLabels,
  type IdeaReadyIndicatorLabels,
  type StepCelebrationLabels,
  type UserOnboardingCompletionLabels,
  type ClarificationFlowLabels,
  type FeatureGridLabels,
  type WhyChooseSectionLabels,
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
  FORM_OVERLAY_STYLES,
  FORM_ARIA_LABELS,
  type PageLayout,
  type OpacityConfig,
  type FormOverlayStyles,
  type FormAriaLabels,
} from './page-layout';

// Tailwind Arbitrary Values Configuration
// Centralizes hardcoded Tailwind arbitrary values (e.g., text-[10px], min-w-[1.5rem])
export {
  TAILWIND_ARBITRARY,
  DASHBOARD_TAILWIND,
  MOBILE_NAV_TAILWIND,
  SKELETON_TAILWIND,
  SPINNER_TAILWIND,
  INPUT_TAILWIND,
  STEP_CELEBRATION_TAILWIND,
  type TailwindArbitrary,
} from './tailwind-arbitrary';

// Comprehensive API Error Messages Configuration
// Centralizes all hardcoded error messages used in API routes and handlers
export {
  API_ERROR_MESSAGES as COMPREHENSIVE_API_ERROR_MESSAGES,
  getApiErrorMessage,
  createApiError,
  type ApiErrorMessages,
} from './api-error-messages';

// Comprehensive UI Strings Configuration
// Centralizes all hardcoded UI strings used in components
export {
  UI_STRINGS as COMPREHENSIVE_UI_STRINGS,
  getUiString,
  getUiStringWithParams,
  BUTTON_LABELS as COMPREHENSIVE_BUTTON_LABELS,
  FORM_LABELS,
  PLACEHOLDER_TEXT,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
  type UiStrings,
} from './ui-strings';

// Validation Limits Configuration
// Centralizes all hardcoded validation limits used throughout the application
export {
  VALIDATION_LIMITS,
  getValidationLimit,
  validateAgainstLimits,
  clampToLimits,
  TITLE_LIMITS,
  DESCRIPTION_LIMITS,
  CONTENT_LIMITS,
  EMAIL_LIMITS,
  PASSWORD_LIMITS,
  USERNAME_LIMITS,
  FILE_SIZE_LIMITS,
  PAGINATION_LIMITS,
  RATE_LIMIT_CONFIG,
  RATE_LIMIT_CONFIG_WITH_EXTERNAL,
  TIMEOUT_LIMITS,
  RETRY_LIMITS,
  CACHE_LIMITS,
  API_LIMITS,
  DATABASE_LIMITS,
  AI_LIMITS,
  EXPORT_LIMITS,
  IMPORT_LIMITS,
  NOTIFICATION_LIMITS,
  SESSION_LIMITS,
  SECURITY_LIMITS,
  ANALYTICS_LIMITS,
  type ValidationLimits,
} from './validation-limits';

// UI Text Sizes Configuration
// Centralizes all hardcoded text sizes used across components
export {
  SMALL_TEXT_SIZES,
  MEDIUM_TEXT_SIZES,
  TEXT_SIZE_CLASSES,
  TEXT_SIZE_PRESETS,
  type SmallTextSizes,
  type MediumTextSizes,
} from './ui-text-sizes';

// UI Dimensions Configuration
// Centralizes all hardcoded pixel dimensions used across components
export {
  INPUT_HEIGHTS,
  CONTAINER_WIDTHS as UI_CONTAINER_WIDTHS,
  MIN_SIZES,
  INPUT_HEIGHT_CLASSES,
  CONTAINER_WIDTH_CLASSES,
  MIN_SIZE_CLASSES,
  TABLE_DIMENSIONS,
  TABLE_CLASSES as UI_TABLE_CLASSES,
  type InputHeights,
  type MinSizes,
} from './ui-dimensions';

// Animation Values Configuration
// Centralizes all hardcoded animation values used throughout the application
export {
  ANIMATION_VALUES,
  getDurationClass,
  getDelayClass,
  getEasingClass,
  getScaleClass,
  getRotateClass,
  getTranslateClass,
  getOpacityClass,
  getBlurClass,
  getBorderRadiusClass,
  getShadowClass,
  getTransitionClass,
  getKeyframeClass,
  getAnimationPreset,
  DURATION_VALUES,
  DELAY_VALUES,
  EASING_VALUES,
  SCALE_VALUES,
  ROTATE_VALUES,
  TRANSLATE_VALUES,
  OPACITY_VALUES,
  BLUR_VALUES,
  BORDER_RADIUS_VALUES,
  SHADOW_VALUES,
  TRANSITION_VALUES,
  KEYFRAME_VALUES,
  ITERATION_COUNT_VALUES,
  FILL_MODE_VALUES,
  PLAY_STATE_VALUES,
  DIRECTION_VALUES,
  ANIMATION_PRESETS,
  type AnimationValues,
} from './animation-values';

// Animation Classes Configuration
// Centralizes all hardcoded Tailwind animation class names used throughout components
export {
  ANIMATION_CLASSES,
  UI_FEEDBACK_ANIMATIONS,
  TASK_ANIMATIONS,
  CELEBRATION_ANIMATIONS,
  MOBILE_NAV_ANIMATIONS,
  SCROLL_ANIMATIONS,
  BADGE_ANIMATIONS,
  CHECKLIST_ANIMATIONS,
  TYPING_ANIMATIONS,
  ALL_ANIMATION_CLASSES,
  ANIMATION_CATEGORIES,
  getAnimationClass,
  getIndexedAnimationClass,
  FADE_IN,
  FADE_OUT,
  SLIDE_DOWN,
  SLIDE_UP,
  SCALE_IN,
  POP,
  BOUNCE,
  PULSE,
  SPIN,
  SUCCESS_CHECK,
  SUCCESS_POP,
  DRAW_CHECK,
  COPY_SUCCESS_GLOW,
  FOCUS_RING,
  TASK_COMPLETE,
  CHECKBOX_PULSE,
  DELIVERABLE_COMPLETE,
  COPY_CONFETTI,
  MOBILE_MENU_ITEM,
  SCROLL_TO_TOP_BOUNCE,
  BADGE_ENTRANCE_GLOW,
  COMING_SOON_BADGE,
  CHECKLIST_ITEM,
  REQUIREMENT_MET,
  TYPING_DOT,
  BREATHE,
  HERO_ENTRANCE,
  RIPPLE_RING_1,
  RIPPLE_RING_2,
  type AnimationClasses,
  type AllAnimationClasses,
} from './animation-classes';

// Remaining Hardcoded Styles Configuration
// Centralizes remaining hardcoded Tailwind classes throughout components
export {
  GRAY_CLASSES,
  GRAY_TEXT_COMBOS,
  GRAY_BG_COMBOS,
  FOCUS_RING_PATTERNS,
  BUTTON_HOVER_PATTERNS,
  ELEMENT_PATTERNS,
  WHITE_BG_PATTERNS,
  LAYOUT_PATTERNS,
  ANIMATION_PATTERNS,
  TRANSITION_PATTERNS,
  TYPOGRAPHY_PATTERNS,
  SPACING_PATTERNS,
  BORDER_PATTERNS,
  SHADOW_PATTERNS,
  ROUNDED_PATTERNS,
  POSITION_PATTERNS,
  FLEX_PATTERNS,
  GRID_PATTERNS,
  COMPONENT_PATTERNS,
  DASHBOARD_PATTERNS,
  FOOTER_PATTERNS,
  FORM_PATTERNS,
  REMAINING_STYLES,
} from './remaining-styles';

// Component-Specific Tailwind Class Configuration
// Centralizes hardcoded Tailwind class strings used in components
export {
  COMPONENT_STYLES,
  PULSE_DOT,
  KBD_STYLE,
  TOAST_CLEAR_ALL_BUTTON,
  PROGRESS_BAR_TRACK,
  SKELETON_PROGRESS,
  PRIMARY_PULSE_CONTAINER,
  PRIMARY_PULSE_INNER,
  REFERRAL_ICON_CONTAINER,
  LOADING_SPINNER_RIPPLE,
  KEYBOARD_SHORTCUT_CATEGORY_ICON,
  KEYBOARD_SHORTCUT_FOOTER,
  BUTTON_RIPPLE,
  SCROLL_PROGRESS_BAR,
  ERROR_FALLBACK_CONTAINER,
  TOAST_PROGRESS_BAR,
  TOAST_DISMISS_BUTTON,
  SKELETON_INPUT,
  SKELETON_TEXTAREA,
  CLARIFICATION_NAV_CONTAINER,
  PASSWORD_REQUIREMENT_ICON,
  PASSWORD_REQUIREMENT_TEXT,
  STEP_CELEBRATION_CHECKMARK_CONTAINER,
  STEP_CELEBRATION_CHECKMARK_ICON,
  STEP_CELEBRATION_RIPPLE_1,
  STEP_CELEBRATION_RIPPLE_2,
  STEP_CELEBRATION_PROGRESS_TRACK,
  STEP_CELEBRATION_PARTICLE,
  STEP_CELEBRATION_TEXT_CONTAINER,
  STEP_CELEBRATION_STEP_COMPLETE,
  STEP_CELEBRATION_PROGRESS_COMPLETE,
  IDEA_INPUT_FORM,
  IDEA_INPUT_CONTAINER,
  IDEA_INPUT_LOADING_INDICATOR,
  IDEA_INPUT_CONFETTI_DOT,
  IDEA_INPUT_FEEDBACK_TEXT,
  IDEA_INPUT_ERROR_CONTAINER,
  IDEA_INPUT_ERROR_TEXT,
  IDEA_INPUT_STATUS_CONTAINER,
  IDEA_INPUT_STATUS_ITEMS,
  IDEA_INPUT_STATUS_ITEM,
  IDEA_INPUT_SEND_ICON,
  IDEA_INPUT_SUBMIT_BUTTON_TEXT,
  CLARIFICATION_FLOW_QUESTION_HEADING,
  CLARIFICATION_FLOW_QUESTION_DESCRIPTION,
  CLARIFICATION_FLOW_ANSWER_CONTAINER,
  CLARIFICATION_FLOW_INFO_TEXT,
  CLARIFICATION_FLOW_KEYBOARD_HINT,
  CLARIFICATION_FLOW_STEP_INDICATOR,
  CLARIFICATION_FLOW_STEP_TEXT,
  CLARIFICATION_FLOW_STEP_SEPARATOR,
  CLARIFICATION_FLOW_INPUT_LABEL,
  MOBILE_NAV_DESKTOP_LINK,
  MOBILE_NAV_DESKTOP_LINK_ITEM,
  MOBILE_NAV_ACTIVE_INDICATOR,
  MOBILE_NAV_CLOSE_HINT,
  MOBILE_NAV_CLOSE_HINT_TEXT,
  MOBILE_NAV_CLOSE_HINT_KBD,
  MOBILE_NAV_MENU_ITEM,
  MOBILE_NAV_MENU_INDICATOR_CONTAINER,
  MOBILE_NAV_MENU_KEYBOARD_HINT,
  type ComponentStyles,
} from './component-styles';
