# Deployment

## Prerequisites

- Node.js 18+
- Vercel account
- Supabase account
- GitHub account

## Environment Variables

Before deploying, ensure the following environment variables are set:

```bash
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI API configuration
OPENAI_API_KEY=your_openai_api_key  # or use Anthropic API key
ANTHROPIC_API_KEY=your_anthropic_api_key

# GitHub configuration (for agent automation)
GH_TOKEN=your_github_token
IFLOW_API_KEY=your_iflow_api_key
```

## Deployment to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

2. **Set Environment Variables**:
   - In the Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add all the environment variables listed above

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Development Command: `npm run dev`

4. **Database Setup**:
   - After deployment, go to your Supabase dashboard
   - Apply the schema from `supabase/schema.sql`
   - You can use the Supabase CLI or web interface

5. **Run the Application**:
   - Vercel will automatically build and deploy your application
   - The live URL will be available in the Vercel dashboard

## Supabase Setup

1. **Create a new project** in Supabase
2. **Apply the schema**:
   ```bash
   supabase db push
   ```
3. **Set up authentication**:
   - Configure email/password authentication
   - Set up OAuth providers if needed
4. **Configure storage**:
   - Set up any required storage buckets
   - Configure RLS policies for storage

## GitHub Actions Automation

The agent system requires specific GitHub secrets to function:

- `GH_TOKEN`: GitHub token with appropriate permissions
- `IFLOW_API_KEY`: OpenCode API key for agent operations

To set these up:

1. Go to your repository Settings
2. Navigate to Secrets and Variables → Actions
3. Add the required secrets

## Post-Deployment Steps

1. Verify all environment variables are correctly set
2. Test the application functionality
3. Check that agent workflows are running correctly
4. Monitor the `agent-report.md` file for agent activity
5. Set up monitoring and alerting as needed

## Rollback Process

In case of deployment issues:

1. Identify the problematic deployment in Vercel
2. Use Vercel's rollback feature to revert to a previous version
3. If database changes were made, apply the appropriate migration to revert
4. Update the `agent-report.md` with rollback details

## Monitoring

- Check Vercel logs for application errors
- Monitor Supabase for database performance
- Review `agent-report.md` for agent execution status
- Monitor GitHub Actions for workflow failures
