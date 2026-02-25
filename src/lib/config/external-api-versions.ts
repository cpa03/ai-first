/**
 * External API Versions Configuration Module
 *
 * Centralizes version tracking for all external API integrations.
 * Extracted from constants.ts to improve modularity.
 *
 * IMPORTANT: When updating API versions:
 * 1. Check the provider's changelog for breaking changes
 * 2. Update the LAST_VERIFIED date
 * 3. Run integration tests to verify compatibility
 * 4. Update the corresponding resilience config if needed
 *
 * Environment variable overrides are available for emergency version pinning
 *
 * @module lib/config/external-api-versions
 */

import { EnvLoader } from './environment';

export const EXTERNAL_API_VERSIONS = {
  /**
   * OpenAI API version
   * Note: OpenAI SDK uses the latest stable API by default
   * For explicit version pinning, use OPENAI_API_VERSION env var
   * Documentation: https://platform.openai.com/docs/api-reference/versioning
   * Env: OPENAI_API_VERSION (default: 'latest')
   */
  OPENAI: {
    VERSION: EnvLoader.string('OPENAI_API_VERSION', 'latest'),
    /**
     * Default model for chat completions
     * Env: OPENAI_DEFAULT_MODEL (default: 'gpt-4-turbo-preview')
     */
    DEFAULT_MODEL: EnvLoader.string(
      'OPENAI_DEFAULT_MODEL',
      'gpt-4-turbo-preview'
    ),
    /**
     * Date when this version was last verified as compatible
     */
    LAST_VERIFIED: '2026-02-18',
    /**
     * Changelog URL for version updates
     */
    CHANGELOG_URL: 'https://platform.openai.com/docs/api-reference/changelog',
  },

  /**
   * Notion API version
   * Notion uses dated versions that must be sent in the Notion-Version header
   * Documentation: https://developers.notion.com/reference/versioning
   * Env: NOTION_API_VERSION (default: '2022-06-28')
   */
  NOTION: {
    VERSION: EnvLoader.string('NOTION_API_VERSION', '2022-06-28'),
    LAST_VERIFIED: '2026-02-18',
    CHANGELOG_URL: 'https://developers.notion.com/page/changelog',
  },

  /**
   * Trello API version
   * Trello API v1 is stable with no breaking changes announced
   * Documentation: https://developer.atlassian.com/cloud/trello/rest/
   * Env: TRELLO_API_VERSION (default: '1')
   */
  TRELLO: {
    VERSION: EnvLoader.string('TRELLO_API_VERSION', '1'),
    LAST_VERIFIED: '2026-02-18',
    CHANGELOG_URL:
      'https://developer.atlassian.com/cloud/trello/guides/rest-api/',
  },

  /**
   * GitHub REST API version
   * Used in X-GitHub-Api-Version header for versioned requests
   * Documentation: https://docs.github.com/rest/about-the-rest-api/api-versions
   * Env: GITHUB_API_VERSION (default: '2022-11-28')
   */
  GITHUB: {
    VERSION: EnvLoader.string('GITHUB_API_VERSION', '2022-11-28'),
    LAST_VERIFIED: '2026-02-18',
    CHANGELOG_URL: 'https://docs.github.com/rest/overview/api-versions',
  },

  /**
   * Google Tasks API version
   * Uses v1 endpoint in URL path
   * Documentation: https://developers.google.com/tasks/reference/rest
   * Env: GOOGLE_TASKS_API_VERSION (default: 'v1')
   */
  GOOGLE_TASKS: {
    VERSION: EnvLoader.string('GOOGLE_TASKS_API_VERSION', 'v1'),
    LAST_VERIFIED: '2026-02-18',
    CHANGELOG_URL: 'https://developers.google.com/tasks/release-notes',
  },

  /**
   * Linear API
   * GraphQL API - version managed through schema evolution
   * Documentation: https://developers.linear.app/docs/
   */
  LINEAR: {
    VERSION: 'graphql',
    LAST_VERIFIED: '2026-02-18',
    CHANGELOG_URL: 'https://developers.linear.app/changelog',
  },

  /**
   * Asana API version
   * Uses versioned endpoint in URL path (1.0)
   * Documentation: https://developers.asana.com/docs/
   * Env: ASANA_API_VERSION (default: '1.0')
   */
  ASANA: {
    VERSION: EnvLoader.string('ASANA_API_VERSION', '1.0'),
    LAST_VERIFIED: '2026-02-18',
    CHANGELOG_URL: 'https://developers.asana.com/docs/.changelog',
  },

  /**
   * Supabase API version
   * Uses Supabase client library version for API compatibility
   * Documentation: https://supabase.com/docs/reference/javascript/introduction
   */
  SUPABASE: {
    VERSION: 'v2',
    LAST_VERIFIED: '2026-02-18',
    CHANGELOG_URL:
      'https://supabase.com/docs/reference/javascript/release-notes',
  },
} as const;

/**
 * Helper type for accessing API version info
 */
export type ExternalApiVersionInfo =
  (typeof EXTERNAL_API_VERSIONS)[keyof typeof EXTERNAL_API_VERSIONS];
