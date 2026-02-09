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
export {
  TIMELINE_CONFIG,
  TASK_CONFIG,
  IDEA_CONFIG,
} from './timeline';

// UI Configuration
export {
  UI_CONFIG,
  LABELS,
  PLACEHOLDERS,
  BUTTON_LABELS,
  TOAST_CONFIG,
} from './ui';

// SEO Configuration
export { SEO_CONFIG, FONT_CONFIG } from './seo';

// Legacy constants (backward compatibility)
export * from './constants';

// Type exports
export type { AppConfig } from './app';
export type {
  ExportConnectorConfig,
} from './export-connectors';
export type {
  TimelineConfig,
  TaskConfig,
  IdeaConfig,
} from './timeline';
export type { UiConfig, ToastConfig } from './ui';
export type { SeoConfig, FontConfig } from './seo';
