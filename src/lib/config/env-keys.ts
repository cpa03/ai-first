/**
 * Environment Keys Configuration
 * Centralizes all environment variable keys used throughout the codebase
 * Follows the "Flexy" principle: eliminate hardcoded environment variable strings
 *
 * This module provides a single source of truth for all environment variable names,
 * making it easy to:
 * 1. Find all environment variables used in the codebase
 * 2. Rename environment variables without breaking the code
 * 3. Add validation for required environment variables
 * 4. Document environment variable usage
 */

import { EnvLoader } from './environment';

/**
 * AI Provider Environment Keys
 * Used for OpenAI, Anthropic, and other AI service integrations
 */
export const AI_ENV_KEYS = {
  /** OpenAI API key for GPT models */
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  /** Anthropic API key for Claude models */
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  /** Daily cost limit for AI usage (in USD) */
  COST_LIMIT_DAILY: 'COST_LIMIT_DAILY',
} as const;

/**
 * Database Environment Keys
 * Used for Supabase and other database connections
 */
export const DATABASE_ENV_KEYS = {
  /** Supabase project URL (public) */
  NEXT_PUBLIC_SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  /** Supabase anonymous key (public) */
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  /** Supabase service role key (server-side only) */
  SUPABASE_SERVICE_ROLE_KEY: 'SUPABASE_SERVICE_ROLE_KEY',
} as const;

/**
 * Export Connector Environment Keys
 * Used for third-party integrations (GitHub, Notion, Trello, Google)
 */
export const EXPORT_ENV_KEYS = {
  /** GitHub personal access token */
  GITHUB_TOKEN: 'GITHUB_TOKEN',
  /** GitHub OAuth client ID */
  GITHUB_CLIENT_ID: 'GITHUB_CLIENT_ID',
  /** GitHub OAuth redirect URI */
  GITHUB_REDIRECT_URI: 'GITHUB_REDIRECT_URI',
  /** Notion API key */
  NOTION_API_KEY: 'NOTION_API_KEY',
  /** Notion OAuth client ID */
  NOTION_CLIENT_ID: 'NOTION_CLIENT_ID',
  /** Notion OAuth redirect URI */
  NOTION_REDIRECT_URI: 'NOTION_REDIRECT_URI',
  /** Notion parent page ID for creating pages */
  NOTION_PARENT_PAGE_ID: 'NOTION_PARENT_PAGE_ID',
  /** Trello API key */
  TRELLO_API_KEY: 'TRELLO_API_KEY',
  /** Trello OAuth token */
  TRELLO_TOKEN: 'TRELLO_TOKEN',
  /** Trello OAuth redirect URI */
  TRELLO_REDIRECT_URI: 'TRELLO_REDIRECT_URI',
  /** Google OAuth client ID */
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  /** Google OAuth client secret */
  GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
  /** Google OAuth redirect URI */
  GOOGLE_REDIRECT_URI: 'GOOGLE_REDIRECT_URI',
} as const;

/**
 * Platform Detection Environment Keys
 * Used for detecting runtime environment and platform
 */
export const PLATFORM_ENV_KEYS = {
  /** Node.js environment (development, production, test) */
  NODE_ENV: 'NODE_ENV',
  /** CI environment flag */
  CI: 'CI',
  /** Jest worker ID (set during test execution) */
  JEST_WORKER_ID: 'JEST_WORKER_ID',
  /** Vitest worker ID (set during test execution) */
  VITEST_WORKER_ID: 'VITEST_WORKER_ID',
  /** Next.js runtime (nodejs, edge) */
  NEXT_RUNTIME: 'NEXT_RUNTIME',
  /** Cloudflare Pages flag */
  CF_PAGES: 'CF_PAGES',
  /** Cloudflare Worker flag */
  CF_WORKER: 'CF_WORKER',
  /** Vercel deployment URL */
  VERCEL_URL: 'VERCEL_URL',
  /** Vercel live URL */
  VERCEL_LIVE_URL: 'VERCEL_LIVE_URL',
  /** Cloudflare Pages URL */
  CF_PAGES_URL: 'CF_PAGES_URL',
  /** Cloudflare Pages branch URL */
  CF_PAGES_BRANCH_URL: 'CF_PAGES_BRANCH_URL',
} as const;

/**
 * Security Environment Keys
 * Used for authentication and security configuration
 */
export const SECURITY_ENV_KEYS = {
  /** Admin API key for protected endpoints */
  ADMIN_API_KEY: 'ADMIN_API_KEY',
  /** Internal API secret for service-to-service communication */
  INTERNAL_API_SECRET: 'INTERNAL_API_SECRET',
} as const;

/**
 * Logging Environment Keys
 * Used for configuring application logging behavior
 */
export const LOGGING_ENV_KEYS = {
  /** Log level (DEBUG, INFO, WARN, ERROR) */
  LOG_LEVEL: 'LOG_LEVEL',
  /** Log sample rate for performance monitoring (0.0 to 1.0, where 1.0 = 100%) */
  LOG_SAMPLE_RATE: 'LOG_SAMPLE_RATE',
  /** Suppress build-time logs */
  SUPPRESS_BUILD_LOGS: 'SUPPRESS_BUILD_LOGS',
  /** Enable debug logging in production */
  ENABLE_DEBUG_LOGS: 'ENABLE_DEBUG_LOGS',
  /** Enable structured JSON logging */
  STRUCTURED_LOGGING: 'STRUCTURED_LOGGING',
} as const;

/**
 * Application Environment Keys
 * Used for application configuration and URLs
 */
export const APP_ENV_KEYS = {
  /** Application base URL (public) */
  NEXT_PUBLIC_APP_URL: 'NEXT_PUBLIC_APP_URL',
  /** Application version */
  APP_VERSION: 'APP_VERSION',
} as const;

/**
 * All environment keys organized by category
 * Provides a single import point for all environment variable access
 */
export const ALL_ENV_KEYS = {
  AI: AI_ENV_KEYS,
  DATABASE: DATABASE_ENV_KEYS,
  EXPORT: EXPORT_ENV_KEYS,
  PLATFORM: PLATFORM_ENV_KEYS,
  SECURITY: SECURITY_ENV_KEYS,
  LOGGING: LOGGING_ENV_KEYS,
  APP: APP_ENV_KEYS,
} as const;

/**
 * Type-safe environment variable accessor
 * Provides a single point of access for all environment variables
 * with automatic type inference
 */
export const ENV_ACCESSORS = {
  /** AI Provider keys */
  AI: {
    OPENAI_API_KEY: () => EnvLoader.string(AI_ENV_KEYS.OPENAI_API_KEY, ''),
    ANTHROPIC_API_KEY: () =>
      EnvLoader.string(AI_ENV_KEYS.ANTHROPIC_API_KEY, ''),
    COST_LIMIT_DAILY: () => EnvLoader.string(AI_ENV_KEYS.COST_LIMIT_DAILY, ''),
  },

  /** Database keys */
  DATABASE: {
    NEXT_PUBLIC_SUPABASE_URL: () =>
      EnvLoader.string(DATABASE_ENV_KEYS.NEXT_PUBLIC_SUPABASE_URL, ''),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: () =>
      EnvLoader.string(DATABASE_ENV_KEYS.NEXT_PUBLIC_SUPABASE_ANON_KEY, ''),
    SUPABASE_SERVICE_ROLE_KEY: () =>
      EnvLoader.string(DATABASE_ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY, ''),
  },

  /** Export connector keys */
  EXPORT: {
    GITHUB_TOKEN: () => EnvLoader.string(EXPORT_ENV_KEYS.GITHUB_TOKEN, ''),
    GITHUB_CLIENT_ID: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.GITHUB_CLIENT_ID, ''),
    GITHUB_REDIRECT_URI: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.GITHUB_REDIRECT_URI, ''),
    NOTION_API_KEY: () => EnvLoader.string(EXPORT_ENV_KEYS.NOTION_API_KEY, ''),
    NOTION_CLIENT_ID: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.NOTION_CLIENT_ID, ''),
    NOTION_REDIRECT_URI: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.NOTION_REDIRECT_URI, ''),
    NOTION_PARENT_PAGE_ID: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.NOTION_PARENT_PAGE_ID, ''),
    TRELLO_API_KEY: () => EnvLoader.string(EXPORT_ENV_KEYS.TRELLO_API_KEY, ''),
    TRELLO_TOKEN: () => EnvLoader.string(EXPORT_ENV_KEYS.TRELLO_TOKEN, ''),
    TRELLO_REDIRECT_URI: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.TRELLO_REDIRECT_URI, ''),
    GOOGLE_CLIENT_ID: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.GOOGLE_CLIENT_ID, ''),
    GOOGLE_CLIENT_SECRET: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.GOOGLE_CLIENT_SECRET, ''),
    GOOGLE_REDIRECT_URI: () =>
      EnvLoader.string(EXPORT_ENV_KEYS.GOOGLE_REDIRECT_URI, ''),
  },

  /** Platform detection keys */
  PLATFORM: {
    NODE_ENV: () => EnvLoader.string(PLATFORM_ENV_KEYS.NODE_ENV, 'development'),
    CI: () => EnvLoader.boolean(PLATFORM_ENV_KEYS.CI, false),
    JEST_WORKER_ID: () =>
      EnvLoader.string(PLATFORM_ENV_KEYS.JEST_WORKER_ID, ''),
    VITEST_WORKER_ID: () =>
      EnvLoader.string(PLATFORM_ENV_KEYS.VITEST_WORKER_ID, ''),
    NEXT_RUNTIME: () => EnvLoader.string(PLATFORM_ENV_KEYS.NEXT_RUNTIME, ''),
    CF_PAGES: () => EnvLoader.string(PLATFORM_ENV_KEYS.CF_PAGES, ''),
    CF_WORKER: () => EnvLoader.string(PLATFORM_ENV_KEYS.CF_WORKER, ''),
    VERCEL_URL: () => EnvLoader.string(PLATFORM_ENV_KEYS.VERCEL_URL, ''),
    VERCEL_LIVE_URL: () =>
      EnvLoader.string(PLATFORM_ENV_KEYS.VERCEL_LIVE_URL, ''),
    CF_PAGES_URL: () => EnvLoader.string(PLATFORM_ENV_KEYS.CF_PAGES_URL, ''),
    CF_PAGES_BRANCH_URL: () =>
      EnvLoader.string(PLATFORM_ENV_KEYS.CF_PAGES_BRANCH_URL, ''),
  },

  /** Security keys */
  SECURITY: {
    ADMIN_API_KEY: () => EnvLoader.string(SECURITY_ENV_KEYS.ADMIN_API_KEY, ''),
    INTERNAL_API_SECRET: () =>
      EnvLoader.string(SECURITY_ENV_KEYS.INTERNAL_API_SECRET, ''),
  },

  /** Logging keys */
  LOGGING: {
    LOG_LEVEL: () => EnvLoader.string(LOGGING_ENV_KEYS.LOG_LEVEL, 'INFO'),
    LOG_SAMPLE_RATE: () =>
      EnvLoader.number(LOGGING_ENV_KEYS.LOG_SAMPLE_RATE, 1.0, 0, 1),
    SUPPRESS_BUILD_LOGS: () =>
      EnvLoader.boolean(LOGGING_ENV_KEYS.SUPPRESS_BUILD_LOGS, false),
    ENABLE_DEBUG_LOGS: () =>
      EnvLoader.boolean(LOGGING_ENV_KEYS.ENABLE_DEBUG_LOGS, false),
    STRUCTURED_LOGGING: () =>
      EnvLoader.boolean(LOGGING_ENV_KEYS.STRUCTURED_LOGGING, false),
  },

  /** Application keys */
  APP: {
    NEXT_PUBLIC_APP_URL: () =>
      EnvLoader.string(APP_ENV_KEYS.NEXT_PUBLIC_APP_URL, ''),
    APP_VERSION: () => EnvLoader.string(APP_ENV_KEYS.APP_VERSION, '1.0.0'),
  },
} as const;

/**
 * Helper function to get environment variable value
 * Provides a consistent interface for accessing environment variables
 */
export function getEnvValue(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Helper function to check if environment variable is set
 * Useful for health checks and validation
 */
export function isEnvSet(key: string): boolean {
  return !!process.env[key];
}

/**
 * Helper function to get environment variable as number
 * Provides type-safe access with validation
 */
export function getEnvNumber(
  key: string,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  return EnvLoader.number(key, defaultValue, min, max);
}

/**
 * Helper function to get environment variable as boolean
 * Provides type-safe access with validation
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  return EnvLoader.boolean(key, defaultValue);
}

/**
 * Type exports for all environment key categories
 */
export type AiEnvKeys = typeof AI_ENV_KEYS;
export type DatabaseEnvKeys = typeof DATABASE_ENV_KEYS;
export type ExportEnvKeys = typeof EXPORT_ENV_KEYS;
export type PlatformEnvKeys = typeof PLATFORM_ENV_KEYS;
export type SecurityEnvKeys = typeof SECURITY_ENV_KEYS;
export type LoggingEnvKeys = typeof LOGGING_ENV_KEYS;
export type AppEnvKeys = typeof APP_ENV_KEYS;
export type AllEnvKeys = typeof ALL_ENV_KEYS;
export type EnvAccessors = typeof ENV_ACCESSORS;
