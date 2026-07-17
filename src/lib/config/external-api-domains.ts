/**
 * External API Domains Configuration Module
 *
 * Centralizes all external API domain URLs used for preconnect hints,
 * API calls, and other integrations. Eliminates hardcoded domain strings
 * scattered throughout the codebase.
 *
 * Follows the "Flexy" principle: every hardcoded value becomes configurable.
 *
 * @module lib/config/external-api-domains
 */

import { EnvLoader } from './environment';

/**
 * External API Domains Configuration
 * All domains are configurable via environment variables for flexibility
 */
export const EXTERNAL_API_DOMAINS = {
  /**
   * Supabase domains
   * Used for database, auth, and storage connections
   */
  SUPABASE: {
    /** Main Supabase domain pattern - Env: SUPABASE_DOMAIN (default: '*.supabase.co') */
    DOMAIN: EnvLoader.string('SUPABASE_DOMAIN', '*.supabase.co'),
    /** Full URL pattern for preconnect - Env: SUPABASE_URL_PATTERN (default: 'https://*.supabase.co') */
    PRECONNECT_URL: EnvLoader.string(
      'SUPABASE_PRECONNECT_URL',
      'https://*.supabase.co'
    ),
  },

  /**
   * OpenAI API domain
   * Used for AI completions and embeddings
   */
  OPENAI: {
    /** OpenAI API domain - Env: OPENAI_API_DOMAIN (default: 'api.openai.com') */
    DOMAIN: EnvLoader.string('OPENAI_API_DOMAIN', 'api.openai.com'),
    /** Full URL for preconnect - Env: OPENAI_PRECONNECT_URL (default: 'https://api.openai.com') */
    PRECONNECT_URL: EnvLoader.string(
      'OPENAI_PRECONNECT_URL',
      'https://api.openai.com'
    ),
  },

  /**
   * Anthropic API domain
   * Used for Claude AI completions
   */
  ANTHROPIC: {
    /** Anthropic API domain - Env: ANTHROPIC_API_DOMAIN (default: 'api.anthropic.com') */
    DOMAIN: EnvLoader.string('ANTHROPIC_API_DOMAIN', 'api.anthropic.com'),
    /** Full URL for preconnect - Env: ANTHROPIC_PRECONNECT_URL (default: 'https://api.anthropic.com') */
    PRECONNECT_URL: EnvLoader.string(
      'ANTHROPIC_PRECONNECT_URL',
      'https://api.anthropic.com'
    ),
  },

  /**
   * Notion API domain
   * Used for export to Notion
   */
  NOTION: {
    /** Notion API domain - Env: NOTION_API_DOMAIN (default: 'api.notion.com') */
    DOMAIN: EnvLoader.string('NOTION_API_DOMAIN', 'api.notion.com'),
    /** Full URL for preconnect - Env: NOTION_PRECONNECT_URL (default: 'https://api.notion.com') */
    PRECONNECT_URL: EnvLoader.string(
      'NOTION_PRECONNECT_URL',
      'https://api.notion.com'
    ),
  },

  /**
   * Trello API domain
   * Used for export to Trello
   */
  TRELLO: {
    /** Trello API domain - Env: TRELLO_API_DOMAIN (default: 'api.trello.com') */
    DOMAIN: EnvLoader.string('TRELLO_API_DOMAIN', 'api.trello.com'),
    /** Full URL for preconnect - Env: TRELLO_PRECONNECT_URL (default: 'https://api.trello.com') */
    PRECONNECT_URL: EnvLoader.string(
      'TRELLO_PRECONNECT_URL',
      'https://api.trello.com'
    ),
  },

  /**
   * GitHub API domain
   * Used for GitHub Projects export and repository operations
   */
  GITHUB: {
    /** GitHub API domain - Env: GITHUB_API_DOMAIN (default: 'api.github.com') */
    DOMAIN: EnvLoader.string('GITHUB_API_DOMAIN', 'api.github.com'),
    /** Full URL for preconnect - Env: GITHUB_PRECONNECT_URL (default: 'https://api.github.com') */
    PRECONNECT_URL: EnvLoader.string(
      'GITHUB_PRECONNECT_URL',
      'https://api.github.com'
    ),
  },

  /**
   * Google Tasks API domain
   * Used for Google Tasks export
   */
  GOOGLE_TASKS: {
    /** Google Tasks API domain - Env: GOOGLE_TASKS_API_DOMAIN (default: 'tasks.googleapis.com') */
    DOMAIN: EnvLoader.string('GOOGLE_TASKS_API_DOMAIN', 'tasks.googleapis.com'),
    /** Full URL for preconnect - Env: GOOGLE_TASKS_PRECONNECT_URL (default: 'https://tasks.googleapis.com') */
    PRECONNECT_URL: EnvLoader.string(
      'GOOGLE_TASKS_PRECONNECT_URL',
      'https://tasks.googleapis.com'
    ),
  },

  /**
   * Linear API domain
   * Used for Linear export
   */
  LINEAR: {
    /** Linear API domain - Env: LINEAR_API_DOMAIN (default: 'api.linear.app') */
    DOMAIN: EnvLoader.string('LINEAR_API_DOMAIN', 'api.linear.app'),
    /** Full URL for preconnect - Env: LINEAR_PRECONNECT_URL (default: 'https://api.linear.app') */
    PRECONNECT_URL: EnvLoader.string(
      'LINEAR_PRECONNECT_URL',
      'https://api.linear.app'
    ),
  },

  /**
   * Asana API domain
   * Used for Asana export
   */
  ASANA: {
    /** Asana API domain - Env: ASANA_API_DOMAIN (default: 'app.asana.com') */
    DOMAIN: EnvLoader.string('ASANA_API_DOMAIN', 'app.asana.com'),
    /** Full URL for preconnect - Env: ASANA_PRECONNECT_URL (default: 'https://app.asana.com') */
    PRECONNECT_URL: EnvLoader.string(
      'ASANA_PRECONNECT_URL',
      'https://app.asana.com'
    ),
  },
} as const;

/**
 * Preconnect URLs for all external APIs
 * Used in HTML head for performance optimization
 */
export const PRECONNECT_URLS = [
  EXTERNAL_API_DOMAINS.SUPABASE.PRECONNECT_URL,
  EXTERNAL_API_DOMAINS.OPENAI.PRECONNECT_URL,
  EXTERNAL_API_DOMAINS.ANTHROPIC.PRECONNECT_URL,
  EXTERNAL_API_DOMAINS.NOTION.PRECONNECT_URL,
  EXTERNAL_API_DOMAINS.TRELLO.PRECONNECT_URL,
  EXTERNAL_API_DOMAINS.GITHUB.PRECONNECT_URL,
] as const;

/**
 * Type for external API domains
 */
export type ExternalApiDomains = typeof EXTERNAL_API_DOMAINS;

/**
 * Type for preconnect URLs
 */
export type PreconnectUrls = typeof PRECONNECT_URLS;
