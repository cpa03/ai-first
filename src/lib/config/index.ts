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

// Legacy constants (backward compatibility)
export * from './constants';

// Type exports
export type { AppConfig } from './app';
export type {
  ExportConnectorConfig,
} from './export-connectors';
