# Environment Configuration Setup

# This file helps developers set up their environment correctly

## Required Environment Variables

### Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### AI Provider Configuration (at least one required)

```bash
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Cost Guardrails

```bash
COST_LIMIT_DAILY=10.0
```

### Application Configuration

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at https://supabase.com
2. Go to Project Settings > API
3. Copy the Project URL (NEXT_PUBLIC_SUPABASE_URL)
4. Copy the Public API Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Generate Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

### 2. AI Provider Setup

#### OpenAI (Recommended)

1. Create account at https://platform.openai.com
2. Go to API Keys section
3. Create new API key
4. Set OPENAI_API_KEY in your environment

#### Anthropic (Alternative)

1. Create account at https://console.anthropic.com
2. Generate API key
3. Set ANTHROPIC_API_KEY in your environment

### 3. Local Development Setup

1. Copy the example environment file:

```bash
cp config/.env.example .env.local
```

2. Edit `.env.local` with your actual values:

```bash
nano .env.local
```

3. Ensure `.env.local` is in your `.gitignore` (already included)

### 4. Database Setup

1. Install Supabase CLI:

```bash
npm install -g @supabase/cli
```

2. Run migrations:

```bash
npm run db:migrate
```

### 5. Verify Setup

1. Start development server:

```bash
npm run dev
```

2. Check application health:

```bash
curl http://localhost:3000/api/health
```

## Optional: Export Integrations

The application supports exporting to various platforms. These are optional and only needed if you want to use these features:

### Notion Integration

```bash
NOTION_API_KEY=your_notion_integration_token
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback
NOTION_PARENT_PAGE_ID=your_parent_page_id
```

### Trello Integration

```bash
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_REDIRECT_URI=http://localhost:3000/api/auth/trello/callback
```

### Google Tasks Integration

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

### GitHub Projects Integration

```bash
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

## Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Verify your Supabase URL and keys
   - Check if your Supabase project is active
   - Ensure you're using the correct keys (anon vs service)

2. **AI API Errors**
   - Verify your API key is valid
   - Check if you have sufficient credits
   - Ensure the key hasn't expired

3. **Build Failures**
   - Ensure all required environment variables are set
   - Check for typos in variable names
   - Verify `.env.local` is not committed to git

### Environment Variable Validation

The application includes validation to help identify missing variables:

```bash
# Check environment setup
npm run env:check

# Start with environment validation
npm run dev:check
```

### Security Notes

- Never commit `.env.local` to version control
- Use different keys for development and production
- Regularly rotate your API keys
- Use the principle of least privilege for API permissions

## Production Deployment

For production deployment, ensure you:

1. Set all required environment variables in your hosting platform
2. Use production-ready Supabase configuration
3. Enable proper CORS settings in Supabase
4. Configure proper authentication providers
5. Set up monitoring and error tracking

## Support

If you encounter issues:

1. Check this document first
2. Review the Supabase and AI provider documentation
3. Check the application logs for detailed error messages
4. Create an issue in the repository with your error details
