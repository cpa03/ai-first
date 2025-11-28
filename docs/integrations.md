# Export Integrations Setup Guide

This guide explains how to configure each export integration for IdeaFlow.

## Overview

IdeaFlow supports exporting project blueprints to multiple external services:

- **Notion** - Create structured pages and databases
- **Trello** - Generate boards, lists, and cards
- **GitHub Projects** - Create issues, milestones, and project boards
- **Google Tasks** - Sync tasks to Google Tasks

## General Setup

1. Copy `config/.env.example` to `.env.local`
2. Fill in the required environment variables for each integration
3. Restart your application

## Notion Integration

### Required Environment Variables

- `NOTION_API_KEY` - Your Notion integration token

### Optional Environment Variables

- `NOTION_PARENT_PAGE_ID` - ID of the page where new projects will be created
- `NOTION_CLIENT_ID` - OAuth client ID (for user authentication)
- `NOTION_CLIENT_SECRET` - OAuth client secret
- `NOTION_REDIRECT_URI` - OAuth callback URL

### Setup Instructions

1. **Create Notion Integration**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Give it a name (e.g., "IdeaFlow Export")
   - Select the workspace(s) to connect
   - Choose "Read content" and "Insert content" capabilities
   - Click "Submit"

2. **Get Integration Token**
   - Copy the "Internal Integration Token" from the integration page
   - Set `NOTION_API_KEY` environment variable to this token

3. **Share Pages with Integration**
   - Go to the page where you want to create projects
   - Click "Share" → "Invite"
   - Select your integration from the list
   - Grant "Full access" or "Can edit" permissions

4. **(Optional) Set Parent Page**
   - Get the page ID from the URL (the part after the last `-` and before `?`)
   - Set `NOTION_PARENT_PAGE_ID` environment variable

### OAuth Setup (Optional)

If you want users to authenticate with their own Notion accounts:

1. Go to https://www.notion.so/my-integrations
2. Click "OAuth" for your integration
3. Add redirect URI: `https://yourapp.com/api/auth/notion/callback`
4. Set `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, and `NOTION_REDIRECT_URI`

## Trello Integration

### Required Environment Variables

- `TRELLO_API_KEY` - Your Trello API key
- `TRELLO_TOKEN` - Your Trello API token

### Setup Instructions

1. **Get API Key**
   - Go to https://trello.com/app-key
   - Copy the "Key" value
   - Set `TRELLO_API_KEY` environment variable

2. **Generate Token**
   - On the same page, click the "Token" link
   - Click "Allow" to generate a token
   - Copy the token value
   - Set `TRELLO_TOKEN` environment variable

3. **Permissions**
   - The token will have the permissions you granted during generation
   - Recommended: "read" and "write" access

### What Gets Exported

- **Board**: Named "Project: [Project Title]"
- **Lists**: Backlog, To Do, In Progress, Review, Done
- **Cards**:
  - Deliverables as 📦 cards in Backlog
  - Tasks as 🔧 cards in appropriate lists based on status
  - Priority labels (High: red, Medium: orange, Low: yellow)

## GitHub Projects Integration

### Required Environment Variables

- `GITHUB_TOKEN` - GitHub personal access token
- `GITHUB_OWNER` - GitHub username or organization
- `GITHUB_REPO` - Target repository name

### Optional Environment Variables

- `GITHUB_CLIENT_ID` - OAuth app client ID
- `GITHUB_CLIENT_SECRET` - OAuth app client secret
- `GITHUB_REDIRECT_URI` - OAuth callback URL

### Setup Instructions

1. **Create Personal Access Token**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "IdeaFlow Export")
   - Select scopes: `repo` (full control), `project` (read and write)
   - Click "Generate token"
   - Copy the token immediately (you won't see it again)
   - Set `GITHUB_TOKEN` environment variable

2. **Set Target Repository**
   - Set `GITHUB_OWNER` to your GitHub username or organization
   - Set `GITHUB_REPO` to the target repository name

3. **Enable Projects (if not already enabled)**
   - Go to your repository
   - Click "Projects" tab
   - If projects are not enabled, click "Set up projects"

### What Gets Exported

- **Project Board**: Named "Project: [Project Title]"
- **Columns**: Backlog, To Do, In Progress, Review, Done
- **Issues**:
  - Deliverables as 📦 issues with "deliverable" label
  - Tasks as 🔧 issues with "task" label and priority labels
- **Milestones**: Created for each phase in the roadmap

### OAuth Setup (Optional)

If you want users to authenticate with their own GitHub accounts:

1. Create a GitHub OAuth App at https://github.com/settings/applications/new
2. Set authorization callback URL: `https://yourapp.com/api/auth/github/callback`
3. Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_REDIRECT_URI`

## Google Tasks Integration

### Required Environment Variables

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Optional Environment Variables

- `GOOGLE_REDIRECT_URI` - OAuth callback URL
- `GOOGLE_ACCESS_TOKEN` - User's access token (set automatically after OAuth)
- `GOOGLE_REFRESH_TOKEN` - User's refresh token (set automatically after OAuth)

### Setup Instructions

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google Tasks API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Tasks API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URI: `https://yourapp.com/api/auth/google/callback`
   - Click "Create"

4. **Set Environment Variables**
   - Copy "Client ID" and set `GOOGLE_CLIENT_ID`
   - Copy "Client Secret" and set `GOOGLE_CLIENT_SECRET`
   - Set `GOOGLE_REDIRECT_URI` to your callback URL

### What Gets Exported

- **Task List**: Named "Project: [Project Title]"
- **Tasks**:
  - Deliverables as 📦 tasks
  - Tasks as 🔧 tasks with subtasks if available
  - Due dates and notes preserved
  - Completion status synced

## Testing Your Configuration

You can test your export configuration by:

1. Going to the results page after creating a project blueprint
2. Clicking any export option
3. If configuration is missing, you'll see authentication prompts
4. Successful exports will show confirmation messages

## Security Considerations

- **Never commit API keys to version control**
- **Use environment variables or secret management**
- **Principle of least privilege**: Grant only necessary permissions
- **Regular token rotation**: Update tokens periodically
- **Monitor API usage**: Check for unusual activity

## Troubleshooting

### Common Issues

1. **"Not configured" errors**
   - Check that all required environment variables are set
   - Restart your application after changing environment variables

2. **Authentication failures**
   - Verify API keys/tokens are correct and not expired
   - Check that the integration has proper permissions

3. **Rate limiting**
   - APIs have rate limits. Wait and retry if you hit limits
   - Consider implementing caching for frequent operations

4. **Permission errors**
   - Ensure the integration/token has required permissions
   - For Notion: Share the target page with your integration
   - For GitHub: Ensure repo access and Projects are enabled

### Debug Mode

Set `DEBUG=exports` environment variable to see detailed export logs:

```bash
DEBUG=exports npm run dev
```

## Support

For integration-specific issues:

- **Notion**: https://developers.notion.com/docs
- **Trello**: https://developer.atlassian.com/cloud/trello/
- **GitHub**: https://docs.github.com/en/rest
- **Google Tasks**: https://developers.google.com/tasks
