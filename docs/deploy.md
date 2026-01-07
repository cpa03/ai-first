# Deployment Guide

This guide covers deploying IdeaFlow to Vercel with Supabase backend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Supabase Setup](#supabase-setup)
- [Environment Configuration](#environment-configuration)
- [Vercel Deployment](#vercel-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Post-Deployment Steps](#post-deployment-steps)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- [Vercel account](https://vercel.com/signup) (free tier)
- [Supabase account](https://supabase.com/signup) (free tier)
- [GitHub account](https://github.com/signup)

### Local Requirements

- Node.js 18+ installed
- Git installed
- npm or yarn package manager

### Optional for Export Features

- Notion account (for Notion integration)
- Trello account (for Trello integration)
- Google account (for Google Tasks integration)
- GitHub account (for GitHub Projects integration)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/cpa03/ai-first.git
cd ai-first
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy example environment file
cp config/.env.example .env.local

# Edit with your actual values
nano .env.local
```

### 4. Validate Environment

```bash
# Check environment variables are set correctly
npm run env:check
```

### 5. Start Development Server

```bash
# Start with environment validation
npm run dev:check

# Or start directly
npm run dev
```

Application will be available at `http://localhost:3000`

### 6. Development Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Build with environment check
npm run build:check
```

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or sign in
3. Click "New Project"
4. Choose organization
5. Set project name and password
6. Select region (choose closest to your users)
7. Click "Create new project"

### 2. Get Project Credentials

After project is created (1-2 minutes):

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: `SUPABASE_SERVICE_ROLE_KEY`

### 3. Apply Database Schema

Option 1: Using Supabase Dashboard

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `supabase/schema.sql`
3. Paste into SQL Editor
4. Click "Run"

Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize local environment
supabase init

# Apply migrations
supabase db push
```

### 4. Configure Authentication

1. Go to Authentication → Providers in Supabase dashboard
2. Enable email/password authentication
3. Optionally enable social providers (Google, GitHub, etc.)
4. Configure email templates if needed

### 5. Set Row Level Security (RLS)

Schema includes RLS policies. Review and adjust:

1. Go to Database → Policies in Supabase dashboard
2. Review existing policies
3. Customize based on your security requirements

### 6. Test Database Connection

```bash
# Check database health
curl http://localhost:3000/api/health/database
```

---

## Environment Configuration

### Required Variables

All required variables must be set for application to function.

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Provider Configuration (at least one REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Cost Guardrails (REQUIRED)
COST_LIMIT_DAILY=10.0

# Application Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables for Export Integrations

Only configure these if you plan to use export features.

```bash
# Notion Integration
NOTION_API_KEY=secret_your_notion_api_key
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=https://your-domain.com/api/auth/notion/callback
NOTION_PARENT_PAGE_ID=your_parent_page_id

# Trello Integration
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_REDIRECT_URI=https://your-domain.com/api/auth/trello/callback

# Google Tasks Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# GitHub Projects Integration
GITHUB_TOKEN=ghp_your_github_token
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://your-domain.com/api/auth/github/callback
```

### Environment Variable Security

**Never commit secrets to repository!**

- Use `.env.local` for local development (already in `.gitignore`)
- Use Vercel environment variables for production
- Rotate credentials regularly
- Use minimal required permissions

---

## Vercel Deployment

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or sign in
3. Click "Add New Project"
4. Import Git repository: `cpa03/ai-first`
5. Authorize Vercel to access your GitHub

### 2. Configure Build Settings

Vercel will automatically detect Next.js and configure:

```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

Review and adjust if needed in Project Settings.

### 3. Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

Add **all required variables**:

| Variable                      | Environment | Value                              |
| ----------------------------- | ----------- | ---------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL      | All         | Your Supabase project URL          |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | All         | Your Supabase anon key             |
| SUPABASE_SERVICE_ROLE_KEY     | All         | Your Supabase service role key     |
| OPENAI_API_KEY                | All         | Your OpenAI API key                |
| ANTHROPIC_API_KEY             | All         | Your Anthropic API key             |
| COST_LIMIT_DAILY              | All         | Your daily cost limit (e.g., 10.0) |
| NEXT_PUBLIC_APP_URL           | Production  | Your production URL                |
| NEXT_PUBLIC_APP_URL           | Preview     | Your Vercel preview URL            |

**Important**: Add any optional export integration variables if needed.

### 4. Deploy to Production

1. Click "Deploy" in Vercel dashboard
2. Vercel will build and deploy automatically
3. Wait for deployment to complete (2-3 minutes)
4. Access production URL

### 5. Configure Custom Domain (Optional)

1. Go to Domains in Vercel dashboard
2. Add your domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

### 6. Deploy from Command Line

After initial setup, deploy from CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## CI/CD Pipeline

### GitHub Actions Integration

Repository includes GitHub Actions workflows:

**`.github/workflows/on-pull.yml`**

- Runs on every pull request
- Runs build, type-check, lint, and tests
- Provides CI status checks

**`.github/workflows/on-push.yml`**

- Runs on push to main
- Triggers deployment via Vercel git integration

### Automatic Deployment Flow

1. Push to `main` branch
2. GitHub Actions runs CI checks
3. All checks must pass
4. Vercel automatically deploys to production
5. Preview deployments created for all branches

### Pre-merge Checklist

Before merging PR to main:

- [ ] All CI checks passing (build, type-check, lint, test)
- [ ] Manual testing completed
- [ ] Documentation updated if needed
- [ ] Database migrations tested
- [ ] No breaking changes without migration plan

---

## Post-Deployment Steps

### 1. Verify Environment Variables

```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Check detailed health
curl https://your-domain.com/api/health/detailed

# Check database connectivity
curl https://your-domain.com/api/health/database
```

### 2. Test Core Functionality

- [ ] Application loads successfully
- [ ] Idea submission works
- [ ] Clarification flow works
- [ ] Breakdown generation works
- [ ] Blueprint download works
- [ ] Export integrations work (if configured)

### 3. Set Up Monitoring

**Vercel Analytics**

1. Go to Vercel Dashboard → Analytics
2. Monitor page views, traffic patterns
3. Set up error tracking

**Supabase Monitoring**

1. Go to Supabase Dashboard → Reports
2. Monitor database performance
3. Track API usage and costs
4. Set up alerting

### 4. Configure Alerts

Set up alerts for:

- Deployment failures (Vercel)
- Database errors (Supabase)
- High error rates (Vercel Analytics)
- Cost thresholds (Supabase)
- API errors (health endpoint monitoring)

### 5. Test Export Integrations (If Configured)

Test each configured export:

- Notion export
- Trello export
- Google Tasks export
- GitHub Projects export

### 6. Verify Security Headers

```bash
curl -I https://your-domain.com
```

Verify headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## Rollback Procedures

### Option 1: Vercel Dashboard Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

### Option 2: Git-based Rollback

```bash
# Revert specific commit
git revert <commit-sha>

# Push to trigger deployment
git push origin main
```

Vercel will automatically deploy the reverted commit.

### Option 3: Emergency Disable

If critical issue occurs:

1. Go to Vercel Dashboard
2. Pause project temporarily
3. Fix issue
4. Resume deployment

---

## Troubleshooting

### Build Failures

**Error: "Build failed" in Vercel**

Solutions:

1. Check build logs in Vercel dashboard
2. Ensure `npm run build` passes locally
3. Verify environment variables are set correctly
4. Check for missing dependencies

```bash
# Test build locally
npm run build:check
```

**Error: "Module not found"**

Solutions:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check package.json dependencies
3. Verify all imports are correct

### Environment Variable Issues

**Error: "Environment variable not found"**

Solutions:

1. Verify variable names match exactly (case-sensitive)
2. Check Vercel environment variables in dashboard
3. Redeploy after adding variables
4. Restart local development server after changes

**Error: "Supabase clients not initialized"**

Solutions:

1. Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://your-project-id.supabase.co`
2. Check Supabase project is active (not paused)
3. Verify API keys are correct
4. Test connection manually:
   ```bash
   curl https://your-project-id.supabase.co
   ```

### Database Issues

**Error: "Database connection failed"**

Solutions:

1. Check Supabase project status
2. Verify service role key is correct
3. Check RLS policies aren't blocking access
4. Test database health endpoint:
   ```bash
   curl https://your-domain.com/api/health/database
   ```

**Error: "Migration failed"**

Solutions:

1. Check schema.sql for syntax errors
2. Verify Supabase CLI is installed
3. Run migrations manually via SQL Editor
4. Check migration logs in Supabase dashboard

### AI Provider Issues

**Error: "OpenAI API error"**

Solutions:

1. Verify API key is valid and has credits
2. Check OpenAI service status
3. Verify `OPENAI_API_KEY` is set correctly
4. Check `COST_LIMIT_DAILY` isn't blocking requests

**Error: "Anthropic API error"**

Solutions:

1. Verify API key is valid and has credits
2. Check Anthropic service status
3. Verify `ANTHROPIC_API_KEY` is set correctly
4. Check `COST_LIMIT_DAILY` isn't blocking requests

### Deployment Issues

**Error: "Deployment stuck in progress"**

Solutions:

1. Cancel deployment in Vercel dashboard
2. Check for concurrent deployments
3. Verify branch is up to date
4. Retry deployment

**Error: "Preview deployment fails"**

Solutions:

1. Check preview environment variables
2. Ensure branch doesn't have merge conflicts with main
3. Verify all CI checks pass
4. Check Vercel logs for specific error

### Performance Issues

**Issue: Slow page load times**

Solutions:

1. Check Vercel Analytics for slow routes
2. Optimize images and assets
3. Review database query performance
4. Implement caching where appropriate
5. Check CDN edge locations

**Issue: High AI costs**

Solutions:

1. Monitor usage in provider dashboard
2. Adjust `COST_LIMIT_DAILY`
3. Implement response caching
4. Use more efficient AI models
5. Reduce API call frequency

### Getting Help

If you encounter issues not covered here:

1. Check health endpoints for system status
2. Review logs in Vercel dashboard
3. Check Supabase dashboard for database issues
4. Review [Troubleshooting Guide](./troubleshooting.md)
5. [Open an issue](https://github.com/cpa03/ai-first/issues) with details

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Setup Guide](./environment-setup.md)
- [Architecture Documentation](./architecture.md)
- [API Reference](./api.md)

---

## Checklist

Use this checklist for successful deployment:

- [ ] All prerequisites met
- [ ] Local development working
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Environment variables configured locally
- [ ] Environment validation passes (`npm run env:check`)
- [ ] All tests passing (`npm test`)
- [ ] Build passes locally (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Production deployment successful
- [ ] Health endpoints responding
- [ ] Core functionality tested
- [ ] Monitoring and alerts configured
- [ ] Rollback procedures documented
