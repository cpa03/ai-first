/**
 * Export Connectors Configuration
 * Centralizes all third-party API configurations
 */

export const TRELLO_CONFIG = {
  API: {
    BASE_URL: 'https://api.trello.com/1',
    AUTH_URL: 'https://trello.com/1/authorize',
    VERSION: '1',
  },

  DEFAULTS: {
    LIST_NAMES: ['To Do', 'In Progress', 'Done'] as const,
    PROJECT_CARD_TITLE: '📋 Project Overview',
    BOARD_NAME_TEMPLATE: 'IdeaFlow: {title}',
  },

  PRIORITY: {
    HIGH_THRESHOLD: 4,
    MEDIUM_THRESHOLD: 2,
    LABELS: {
      HIGH: 'High Priority',
      MEDIUM: 'Medium Priority',
      LOW: 'Low Priority',
    },
  },

  APP: {
    NAME: 'IdeaFlow',
    EXPIRATION: 'never',
    RESPONSE_TYPE: 'token',
    SCOPE: 'read,write',
  },
} as const;

export const NOTION_CONFIG = {
  API: {
    BASE_URL: 'https://api.notion.com/v1',
    AUTH_URL: 'https://api.notion.com/v1/oauth/authorize',
    VERSION: '2022-06-28',
  },

  DEFAULTS: {
    SCOPE: 'read,write',
    PAGE_TITLE_TEMPLATE: 'Project: {title}',
    DATABASE_TITLE: 'Tasks',
  },

  PROPERTIES: {
    TASK_NAME: 'Name',
    STATUS: 'Status',
    PRIORITY: 'Priority',
    DESCRIPTION: 'Description',
  },

  STATUS_OPTIONS: {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
  },
} as const;

export const GITHUB_CONFIG = {
  API: {
    BASE_URL: 'https://api.github.com',
    AUTH_URL: 'https://github.com/login/oauth/authorize',
  },

  DEFAULTS: {
    REPO_NAME_TEMPLATE: 'ideaflow-{title}',
    ISSUE_LABEL: 'ideaflow',
  },
} as const;

export const LINEAR_CONFIG = {
  API: {
    BASE_URL: 'https://api.linear.app/graphql',
    AUTH_URL: 'https://linear.app/oauth/authorize',
  },

  DEFAULTS: {
    PROJECT_NAME_TEMPLATE: 'IdeaFlow: {title}',
    ISSUE_STATE_TODO: 'Backlog',
    ISSUE_STATE_IN_PROGRESS: 'In Progress',
    ISSUE_STATE_DONE: 'Done',
  },
} as const;

export const ASANA_CONFIG = {
  API: {
    BASE_URL: 'https://app.asana.com/api/1.0',
    AUTH_URL: 'https://app.asana.com/-/oauth_authorize',
  },

  DEFAULTS: {
    PROJECT_NAME_TEMPLATE: 'IdeaFlow: {title}',
    TASK_SECTIONS: ['To Do', 'In Progress', 'Done'],
  },
} as const;

export type ExportConnectorConfig = {
  trello: typeof TRELLO_CONFIG;
  notion: typeof NOTION_CONFIG;
  github: typeof GITHUB_CONFIG;
  linear: typeof LINEAR_CONFIG;
  asana: typeof ASANA_CONFIG;
};
