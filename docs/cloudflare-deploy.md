# Cloudflare Deployment Guide

## Overview

This guide covers deploying IdeaFlow to Cloudflare Workers/Pages, including environment configuration, build setup, and CI/CD integration.

## Prerequisites

- Cloudflare account (free tier)
- Supabase account (free tier)
- AI provider account (OpenAI or Anthropic)
- Node.js 18+ installed locally
- Wrangler CLI installed globally

## Quick Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

### 3. Set Up Project Locally

```bash
# Clone repository
git clone https://github.com/cpa03/ai-first.git
cd ai-first

# Install dependencies
npm install

# Copy environment template
cp config/.env.example .env.local
```

### 4. Configure Environment Variables

Edit `.env.local` with your actual values:

```bash
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Required: AI Provider (at least one)
OPENAI_API_KEY=sk-your-openai-api-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Required: Cost Guardrails
COST_LIMIT_DAILY=10.0

# Required: Application URL
NEXT_PUBLIC_APP_URL=https://ideaflow.ai

# Optional: Export Integrations
NOTION_API_KEY=...
TRELLO_API_KEY=...
GITHUB_TOKEN=...
```

### 5. Run Automated Setup Script

```bash
# Make script executable
chmod +x scripts/setup-cloudflare-env.sh

# Run setup script
./scripts/setup-cloudflare-env.sh
```

This script will:

- Validate your `.env.local` configuration
- Prompt you to select environments (Production/Preview/Both)
- Automatically configure all environment variables in Cloudflare

### 6. Deploy to Cloudflare

```bash
# Deploy to production
wrangler pages deploy .next --project-name=ideaflow

# Or use npm script (if configured)
npm run deploy:cloudflare
```

## Manual Cloudflare Dashboard Configuration

If you prefer manual configuration or need to verify settings:

### Step 1: Access Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → **ideaflow** → **Settings** → **Environment Variables**

### Step 2: Add Required Environment Variables

Add the following variables to both **Production** and **Preview** environments:

#### Supabase Configuration

| Variable                        | Description                              | Example                                   |
| ------------------------------- | ---------------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                | `https://your-project-id.supabase.co`     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key            | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (admin access) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

#### AI Provider Configuration (at least one required)

| Variable            | Description       | Example       |
| ------------------- | ----------------- | ------------- |
| `OPENAI_API_KEY`    | OpenAI API key    | `sk-proj-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...`  |

#### Application Configuration

| Variable              | Description             | Example               |
| --------------------- | ----------------------- | --------------------- |
| `COST_LIMIT_DAILY`    | Daily cost limit in USD | `10.0`                |
| `NEXT_PUBLIC_APP_URL` | Application URL         | `https://ideaflow.ai` |

### Step 3: Optional Export Integrations

Only configure these if you plan to use export features:

#### Notion Integration

| Variable                | Description                        |
| ----------------------- | ---------------------------------- |
| `NOTION_API_KEY`        | Notion integration token           |
| `NOTION_CLIENT_ID`      | OAuth client ID                    |
| `NOTION_CLIENT_SECRET`  | OAuth client secret                |
| `NOTION_REDIRECT_URI`   | OAuth redirect URI                 |
| `NOTION_PARENT_PAGE_ID` | Default parent page ID for exports |

#### Trello Integration

| Variable              | Description        |
| --------------------- | ------------------ |
| `TRELLO_API_KEY`      | Trello API key     |
| `TRELLO_TOKEN`        | Trello OAuth token |
| `TRELLO_REDIRECT_URI` | OAuth redirect URI |

#### Google Tasks Integration

| Variable               | Description         |
| ---------------------- | ------------------- |
| `GOOGLE_CLIENT_ID`     | OAuth client ID     |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_REDIRECT_URI`  | OAuth redirect URI  |
| `GOOGLE_REFRESH_TOKEN` | OAuth refresh token |

#### GitHub Projects Integration

| Variable               | Description           |
| ---------------------- | --------------------- |
| `GITHUB_TOKEN`         | Personal access token |
| `GITHUB_CLIENT_ID`     | OAuth client ID       |
| `GITHUB_CLIENT_SECRET` | OAuth client secret   |
| `GITHUB_REDIRECT_URI`  | OAuth redirect URI    |

### Step 4: Configure Build Settings

In Cloudflare dashboard:

1. Navigate to: **Workers & Pages** → **ideaflow** → **Settings** → **Builds**
2. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`

### Step 5: Configure Deployment Triggers

In Cloudflare dashboard:

1. Navigate to: **Workers & Pages** → **ideaflow** → **Settings** → **Build & deployments**
2. Configure:
   - **Preview Deployments**: Enabled (recommended)
   - **Production branch**: `main`
   - **Automatic git deployments**: Enabled

## CI/CD Integration

### GitHub Actions Configuration

The project uses GitHub Actions for automated deployments:

#### Workflows

- **`.github/workflows/on-pull.yml`**: Runs on pull requests, performs CI checks
- **`.github/workflows/on-push.yml`**: Runs on pushes to main, triggers deployment

#### Cloudflare Build Check

The **Cloudflare Workers Build** check is automatically triggered when:

- A pull request is opened
- A commit is pushed to a branch
- A branch is merged to `main`

This check ensures that:

1. The application builds successfully
2. All environment variables are configured
3. The deployment succeeds

### Troubleshooting CI Failures

If the **Cloudflare Workers Build** check fails:

1. **Check build logs** in GitHub Actions
2. **Verify environment variables** in Cloudflare dashboard
3. **Run locally** to reproduce: `npm run build`
4. **Re-run the setup script**: `./scripts/setup-cloudflare-env.sh`
5. **Trigger manual build** in Cloudflare dashboard

## Supabase Database Setup

### 1. Create Supabase Project

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization
4. Set project name and database password
5. Wait for project to be provisioned

### 2. Apply Database Schema

```bash
# Navigate to project root
cd ai-first

# Apply schema from supabase/schema.sql
psql -h db.your-project-id.supabase.co -U postgres -d postgres -f supabase/schema.sql

# Or use Supabase CLI (if installed)
supabase db push
```

### 3. Get Database Credentials

From Supabase dashboard:

1. Navigate to: **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure Row Level Security (RLS)

Apply RLS policies from `supabase/migrations/`:

```bash
# Apply all migrations
supabase db push
```

## Deployment Verification

### 1. Check Build Status

```bash
# Check recent Cloudflare builds
wrangler pages deployment list --project-name=ideaflow

# View specific deployment
wrangler pages deployment tail --project-name=ideaflow
```

### 2. Test Application

After deployment, test:

```bash
# Health check
curl https://ideaflow.ai/api/health

# Detailed health check
curl https://ideaflow.ai/api/health/detailed
```

### 3. Monitor Logs

```bash
# View real-time logs
wrangler pages deployment tail --project-name=ideaflow

# Or use Cloudflare dashboard:
# Workers & Pages → ideaflow → Logs
```

## Environment-Specific Deployments

### Production Deployment

Production deploys automatically when:

- Changes are merged to `main` branch
- Manual deployment is triggered via Cloudflare dashboard

### Preview Deployment

Preview deploys automatically when:

- A pull request is created
- Changes are pushed to a non-`main` branch

Preview URLs:

```
https://<branch-name>.ideaflow.pages.dev
```

## Rollback Procedure

If a deployment causes issues:

### 1. Automatic Rollback

Cloudflare provides automatic rollback:

1. Navigate to: **Workers & Pages** → **ideaflow** → **Deployments**
2. Find the previous stable deployment
3. Click "Rollback"

### 2. Manual Rollback via Git

```bash
# Revert to previous commit
git revert HEAD

# Or reset to previous commit (use with caution)
git reset --hard HEAD~1

# Push to trigger new deployment
git push origin main
```

### 3. Emergency Rollback

If immediate action is needed:

1. Navigate to Cloudflare dashboard
2. Go to: **Workers & Pages** → **ideaflow** → **Settings**
3. Disable the project temporarily
4. Fix issues
5. Re-enable project

## Monitoring & Observability

### Health Checks

Application provides health endpoints:

- **`/api/health`** - Basic health status
- **`/api/health/database`** - Database connectivity
- **`/api/health/detailed`** - Comprehensive system status

### Error Tracking

Monitor errors via:

1. Cloudflare dashboard: **Workers & Pages** → **Logs**
2. Supabase dashboard: **Logs** → **Database** or **Edge Functions**
3. Application logs in `wrangler pages deployment tail`

### Metrics to Monitor

- Response times
- Error rates
- Database query performance
- AI API call costs (via `COST_LIMIT_DAILY`)

## Common Issues & Solutions

### Issue: Build fails due to missing environment variables

**Solution**:

```bash
# Run setup script
./scripts/setup-cloudflare-env.sh

# Or manually add variables in Cloudflare dashboard
```

### Issue: "Supabase clients not initialized" error

**Solution**:

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase project is active
- Validate URL format: `https://your-project-id.supabase.co`

### Issue: AI provider authentication fails

**Solution**:

- Verify `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set
- Check API key is valid and has sufficient credits
- Test API key locally with simple request

### Issue: Build succeeds but deployment fails

**Solution**:

- Check Cloudflare build logs for specific error
- Verify `.next` directory exists after build
- Ensure build output directory matches Cloudflare configuration

### Issue: Preview deployments not working

**Solution**:

- Ensure preview deployments are enabled in Cloudflare dashboard
- Check branch protection rules
- Verify GitHub integration is properly configured

## Security Best Practices

### 1. Never Commit Secrets

- ✅ Use `.env.local` for local development (in `.gitignore`)
- ✅ Use Cloudflare environment variables for production
- ❌ Never commit API keys or secrets to repository

### 2. Rotate Credentials Regularly

- Rotate Supabase service role key every 90 days
- Rotate AI provider API keys every 60 days
- Update secrets in Cloudflare dashboard after rotation

### 3. Use Minimal Permissions

- Use Supabase anon key for client-side operations
- Use service role key only for server-side operations
- Restrict AI API keys to necessary scopes

### 4. Enable RLS on Supabase

- Apply row-level security policies
- Restrict access based on user authentication
- Test RLS policies before production deployment

## Cost Optimization

### Cloudflare Limits

- Free tier: 100,000 requests/day
- Workers: 10ms CPU time limit (free tier)
- Pages: 500 builds/month (free tier)

### Supabase Limits

- Free tier: 500 MB database, 1 GB bandwidth
- Consider upgrading for production workloads

### AI API Costs

- Set `COST_LIMIT_DAILY` to control spending
- Monitor API usage in provider dashboard
- Implement caching to reduce API calls

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## Support

For deployment issues:

1. Check this documentation
2. Review build logs
3. Open GitHub issue with:
   - Environment details
   - Build logs
   - Error messages
   - Steps to reproduce
