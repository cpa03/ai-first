// Export connector configurations
// This file contains environment variable requirements and setup instructions

export interface ExportConnectorConfig {
  name: string;
  type: string;
  requiredEnvVars: string[];
  optionalEnvVars: string[];
  setupInstructions: string[];
  oauthRequired: boolean;
}

export const exportConnectorConfigs: Record<string, ExportConnectorConfig> = {
  notion: {
    name: 'Notion',
    type: 'notion',
    requiredEnvVars: ['NOTION_API_KEY'],
    optionalEnvVars: [
      'NOTION_PARENT_PAGE_ID',
      'NOTION_CLIENT_ID',
      'NOTION_CLIENT_SECRET',
      'NOTION_REDIRECT_URI',
    ],
    setupInstructions: [
      '1. Create a Notion integration at https://www.notion.so/my-integrations',
      '2. Copy the "Internal Integration Token"',
      '3. Set NOTION_API_KEY environment variable to the token',
      '4. Share the target page/database with your integration',
      '5. (Optional) Set NOTION_PARENT_PAGE_ID to specify where pages are created',
      '6. For OAuth: Set NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, and NOTION_REDIRECT_URI',
    ],
    oauthRequired: false,
  },
  trello: {
    name: 'Trello',
    type: 'trello',
    requiredEnvVars: ['TRELLO_API_KEY', 'TRELLO_TOKEN'],
    optionalEnvVars: [],
    setupInstructions: [
      '1. Get your API key from https://trello.com/app-key',
      '2. Set TRELLO_API_KEY environment variable',
      '3. Generate a token using the "Token" link on the same page',
      '4. Set TRELLO_TOKEN environment variable',
      '5. The token will have the permissions you granted during generation',
    ],
    oauthRequired: false,
  },
  'github-projects': {
    name: 'GitHub Projects',
    type: 'github-projects',
    requiredEnvVars: ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'],
    optionalEnvVars: [
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'GITHUB_REDIRECT_URI',
    ],
    setupInstructions: [
      '1. Create a GitHub Personal Access Token at https://github.com/settings/tokens',
      '2. Grant "repo" and "project" scopes',
      '3. Set GITHUB_TOKEN environment variable',
      '4. Set GITHUB_OWNER to your GitHub username or organization',
      '5. Set GITHUB_REPO to the target repository name',
      '6. For OAuth: Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_REDIRECT_URI',
    ],
    oauthRequired: false,
  },
  'google-tasks': {
    name: 'Google Tasks',
    type: 'google-tasks',
    requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    optionalEnvVars: [
      'GOOGLE_REDIRECT_URI',
      'GOOGLE_ACCESS_TOKEN',
      'GOOGLE_REFRESH_TOKEN',
    ],
    setupInstructions: [
      '1. Create a project at https://console.cloud.google.com/',
      '2. Enable Google Tasks API',
      '3. Create OAuth 2.0 credentials',
      '4. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables',
      '5. Set GOOGLE_REDIRECT_URI to your callback URL',
      '6. Users will need to authenticate through OAuth flow',
    ],
    oauthRequired: true,
  },
};

// Environment variable validation
export function validateExportConfig(): Record<
  string,
  { valid: boolean; missing: string[] }
> {
  const results: Record<string, { valid: boolean; missing: string[] }> = {};

  for (const [type, config] of Object.entries(exportConnectorConfigs)) {
    const missing: string[] = [];

    for (const envVar of config.requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    results[type] = {
      valid: missing.length === 0,
      missing,
    };
  }

  return results;
}

// Generate .env.example content
export function generateEnvExample(): string {
  let content = '# Export Connector Configuration\n\n';

  for (const [type, config] of Object.entries(exportConnectorConfigs)) {
    content += `# ${config.name} Export\n`;

    for (const envVar of config.requiredEnvVars) {
      content += `${envVar}=\n`;
    }

    for (const envVar of config.optionalEnvVars) {
      content += `# ${envVar}=\n`;
    }

    content += '\n';
  }

  content += '# General Configuration\n';
  content += 'NEXT_PUBLIC_APP_URL=http://localhost:3000\n';

  return content;
}
