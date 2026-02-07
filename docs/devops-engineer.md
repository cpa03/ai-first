# DevOps Engineer Guide

## Overview

This guide provides comprehensive information for DevOps engineers working on the IdeaFlow project. It covers CI/CD pipelines, deployment processes, infrastructure management, monitoring, and operational best practices.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Strategies](#deployment-strategies)
- [Environment Management](#environment-management)
- [Monitoring & Observability](#monitoring--observability)
- [Security Practices](#security-practices)
- [Troubleshooting](#troubleshooting)
- [Runbooks](#runbooks)

---

## Architecture Overview

### Infrastructure Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    Pages     │  │   Workers    │  │   KV Storage     │   │
│  │  (Frontend)  │  │   (API)      │  │   (Session)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL  │  │  Auth/RLS    │  │  Storage/Edge    │   │
│  │  (Primary)   │  │  (Security)  │  │  Functions       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Providers                             │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │    OpenAI    │  │  Anthropic   │                         │
│  │   (GPT-4)    │  │   (Claude)   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Frontend (Next.js)**: Deployed on Cloudflare Pages
2. **Backend API**: Next.js API routes deployed as Cloudflare Workers
3. **Database**: Supabase PostgreSQL with Row Level Security
4. **AI Integration**: OpenAI and Anthropic APIs
5. **Monitoring**: Cloudflare Analytics + Supabase Dashboard

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. On Push (`.github/workflows/on-push.yml`)

**Triggers:**

- Push to `main` branch
- Scheduled every 4 hours
- Manual dispatch

**Stages:**

| Stage | Job         | Purpose                                  | Agent                    |
| ----- | ----------- | ---------------------------------------- | ------------------------ |
| 1     | Architect   | Strategy & triage                        | `arsitek` (GLM-4.7-free) |
| 2     | Specialists | Parallel execution of domain specialists | Various (Kimi K2.5-free) |
| 3     | Integrator  | PR merge & validation                    | `integrator`             |

**Specialist Roles:**

- `frontend-engineer`
- `backend-engineer`
- `api-specialist`
- `code-reviewer`
- `security-engineer`
- `quality-assurance`
- `performance-engineer`
- `database-architect`
- `devops-engineer` ← This role
- `ui-ux-engineer`
- `technical-writer`
- `reliability-engineer`
- `integration-engineer`

#### 2. On Pull Request (`.github/workflows/on-pull.yml`)

**Triggers:**

- Pull request events
- Completion of `iterate` workflow

**Phases:**

1. **Phase 0 - Entry Decision**: Check open PRs and issues
2. **Phase 1 - Deep Analysis**: Code scan and bug detection
3. **Phase 2 - Product Thinking**: Feature gap analysis
4. **Phase 3 - Documentation**: Repo maintenance

#### 3. Unified Specialists (`.github/workflows/specialists-unified.yml`)

**Purpose**: Issue-driven specialist execution

**Specialist Matrix:**

- Frontend Specialist
- Backend Specialist
- Testing Specialist
- Security Specialist
- SEO Specialist
- Content Specialist
- Repo Maintenance
- Deploy Specialist
- Analytics Specialist
- Affiliate Marketing Specialist
- Backlog Specialist

#### 4. Deploy (`.github/workflows/deploy.yml`)

**Trigger**: Issues labeled with `deploy-specialist`

**Responsibilities:**

- Cloudflare environment setup
- Supabase configuration
- Application build & deploy
- Database migrations
- Deployment verification

### Pipeline Best Practices

1. **Concurrency Control**: All workflows use `group: global` to prevent conflicts
2. **Timeout Limits**:
   - Specialists: 30 minutes
   - Deploy: 40 minutes
   - On-pull: 60 minutes
3. **Retry Logic**: 3 attempts with 30-second intervals
4. **Error Handling**: `continue-on-error: true` for non-critical steps

---

## Deployment Strategies

### Cloudflare Pages Deployment

#### Configuration (`wrangler.toml`)

```toml
name = "ai-first"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".next"

[env.production]
name = "ai-first"

[env.staging]
name = "ai-first-staging"

[vars]
NEXT_PUBLIC_APP_URL = "https://ideaflow.ai"
```

#### Deployment Methods

**Method 1: Git Integration (Recommended)**

- Production: Auto-deploy on push to `main`
- Preview: Auto-deploy on PR creation

**Method 2: Wrangler CLI**

```bash
# Install Wrangler
npm install -g wrangler

# Authenticate
wrangler login

# Deploy to production
wrangler pages deploy .next --project-name=ideaflow

# Deploy specific branch
wrangler pages deploy .next --project-name=ideaflow --branch=staging
```

**Method 3: GitHub Actions**
Triggered by `deploy-specialist` label on issues.

### Environment Variables Management

#### Cloudflare Secrets

```bash
# Set secret for production
echo "your-secret" | wrangler secret put SECRET_NAME --env production

# Set secret for staging
echo "your-secret" | wrangler secret put SECRET_NAME --env staging

# List all secrets
wrangler secret list
```

#### Required Variables

| Variable                        | Production | Preview | Description             |
| ------------------------------- | ---------- | ------- | ----------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✓          | ✓       | Supabase project URL    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓          | ✓       | Public API key          |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✓          | ✓       | Admin key (server-side) |
| `OPENAI_API_KEY`                | ✓          | ✓       | OpenAI API access       |
| `ANTHROPIC_API_KEY`             | ✓          | ✓       | Anthropic API access    |
| `COST_LIMIT_DAILY`              | ✓          | ✓       | Daily cost guardrail    |
| `NEXT_PUBLIC_APP_URL`           | ✓          | ✓       | Application URL         |

### Database Migrations

#### Supabase CLI

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Reset database (dangerous)
supabase db reset
```

#### Migration Safety

1. **Always backup** before migrations
2. Test migrations in **preview environment** first
3. Use **transactions** for schema changes
4. Implement **rollback scripts**

---

## Environment Management

### Environment Types

| Environment | URL                   | Purpose          | Branch           |
| ----------- | --------------------- | ---------------- | ---------------- |
| Production  | ideaflow.ai           | Live application | `main`           |
| Preview     | \*.ideaflow.pages.dev | PR testing       | Feature branches |
| Local       | localhost:3000        | Development      | Any              |

### Environment Setup Script

```bash
# Validate local environment
npm run env:check

# Start with validation
npm run dev:check

# Build with validation
npm run build:check
```

### Configuration Files

| File                  | Purpose                            |
| --------------------- | ---------------------------------- |
| `config/.env.example` | Template for environment variables |
| `.env.local`          | Local development (gitignored)     |
| `wrangler.toml`       | Cloudflare configuration           |
| `package.json`        | Scripts and dependencies           |

---

## Monitoring & Observability

### Health Check Endpoints

```bash
# Basic health
curl https://ideaflow.ai/api/health

# Detailed health
curl https://ideaflow.ai/api/health/detailed

# Database health
curl https://ideaflow.ai/api/health/database
```

### Expected Health Response

```json
{
  "status": "healthy",
  "timestamp": "2025-01-07T10:30:00.000Z",
  "version": "0.1.1",
  "checks": {
    "database": "connected",
    "ai_provider": "available",
    "storage": "operational"
  }
}
```

### Cloudflare Analytics

**Metrics to Monitor:**

- Request volume
- Error rates (4xx, 5xx)
- Response times
- Cache hit rates
- Edge location performance

**Access:**

```
https://dash.cloudflare.com/ → Workers & Pages → ideaflow → Analytics
```

### Supabase Monitoring

**Key Metrics:**

- Database connections
- Query performance
- Storage usage
- Auth events
- Edge function invocations

**Access:**

```
https://supabase.com/dashboard → Project → Reports
```

### Log Management

**Cloudflare Logs:**

```bash
# View real-time logs
wrangler pages deployment tail --project-name=ideaflow

# Filter by level
wrangler pages deployment tail --project-name=ideaflow --format=json
```

**Supabase Logs:**

- Database logs in Supabase Dashboard
- Edge Function logs in Functions section

---

## Security Practices

### Secrets Management

**✅ DO:**

- Use Cloudflare Secrets for production
- Rotate credentials every 90 days
- Use minimal required permissions
- Store `.env.local` in `.gitignore`

**❌ DON'T:**

- Commit secrets to repository
- Share service role keys
- Use production keys in development

### Security Headers

Verified in production:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Check with:

```bash
curl -I https://ideaflow.ai
```

### Row Level Security (RLS)

All database tables must have RLS enabled:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their own data"
  ON table_name
  FOR ALL
  USING (auth.uid() = user_id);
```

### Network Security

**CORS Configuration:**

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ];
}
```

---

## Troubleshooting

### Build Failures

**Issue:** `Module not found` errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

**Issue:** TypeScript errors

```bash
# Run type check separately
npm run type-check

# Check for type-only imports
import type { SomeType } from 'module';
```

**Issue:** Lint failures

```bash
# Run lint with debug
npx next lint --debug

# Fix auto-fixable issues
npx next lint --fix
```

### Deployment Failures

**Issue:** Cloudflare build fails

1. Check build logs in Cloudflare Dashboard
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check `wrangler.toml` configuration

**Issue:** "Supabase clients not initialized"

- Verify `NEXT_PUBLIC_SUPABASE_URL` format
- Check Supabase project is active
- Validate API keys are correct

### Database Issues

**Issue:** Connection failures

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/
  -H "apikey: your-anon-key"

# Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

**Issue:** Migration failures

```bash
# Reset and reapply
supabase db reset
supabase db push

# Or manually run SQL
psql $DATABASE_URL -f supabase/schema.sql
```

### Performance Issues

**Issue:** Slow API responses

1. Check Cloudflare Analytics for slow routes
2. Review Supabase query performance
3. Verify AI API response times
4. Check for N+1 query patterns

**Issue:** High costs

1. Monitor `COST_LIMIT_DAILY` usage
2. Review AI API call frequency
3. Implement response caching
4. Check Supabase bandwidth usage

---

## Runbooks

### Emergency Rollback

**Scenario:** Critical bug in production

```bash
# Step 1: Identify last stable deployment
wrangler pages deployment list --project-name=ideaflow

# Step 2: Rollback via Cloudflare Dashboard
# OR

# Step 3: Git rollback
git revert HEAD
git push origin main

# Step 4: Verify rollback
curl https://ideaflow.ai/api/health
```

### Database Recovery

**Scenario:** Data corruption or accidental deletion

```bash
# Step 1: Pause application (set maintenance mode)
# Set MAINTENANCE_MODE=true in Cloudflare secrets

# Step 2: Restore from backup
# Use Supabase Dashboard → Database → Backups

# Step 3: Verify data integrity
npm run db:verify

# Step 4: Resume application
# Remove MAINTENANCE_MODE flag
```

### Security Incident Response

**Scenario:** Suspected breach or key compromise

```bash
# Step 1: Rotate all keys immediately
# - Supabase service role key
# - OpenAI API key
# - Anthropic API key
# - Any integration tokens

# Step 2: Update Cloudflare secrets
echo "new-key" | wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production

# Step 3: Review access logs
# Check Cloudflare Analytics and Supabase Logs

# Step 4: Audit database for unauthorized changes
# Review recent transactions and user activity

# Step 5: Document incident
# Update security-assessment.md
```

### Scaling Procedures

**Scenario:** Traffic spike handling

```bash
# Step 1: Monitor current metrics
# Cloudflare Analytics + Supabase Dashboard

# Step 2: Enable caching improvements
# Update cache headers in next.config.js

# Step 3: Scale Supabase (if needed)
# Upgrade plan in Supabase Dashboard

# Step 4: Monitor AI API rate limits
# Check OpenAI/Anthropic dashboards

# Step 5: Review and optimize
# Analyze slow queries and API calls
```

---

## Checklist

### Pre-Deployment

- [ ] All CI checks passing
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security headers verified
- [ ] Health endpoints responding
- [ ] Rollback plan documented

### Post-Deployment

- [ ] Health checks pass
- [ ] Core functionality tested
- [ ] Monitoring alerts configured
- [ ] Performance metrics baseline recorded
- [ ] Documentation updated

### Weekly Maintenance

- [ ] Review Cloudflare Analytics
- [ ] Check Supabase performance
- [ ] Monitor AI API costs
- [ ] Review security logs
- [ ] Update dependencies (if needed)

---

## Resources

- [Cloudflare Documentation](https://developers.cloudflare.com/pages/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## Contact

For DevOps emergencies or questions:

- Create issue with `devops-engineer` label
- Document in `agent-report.md`
- Tag team lead for urgent issues
