# Deployment Guide

## Vercel + Supabase Setup

### Prerequisites

- Vercel account
- Supabase account
- Node.js 18+ installed locally

### Local Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env.local` and fill in environment variables
4. Run `npm run dev` to start the development server

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key (if using OpenAI)
- `ANTHROPIC_API_KEY` - Your Anthropic API key (if using Anthropic)

### Supabase Database Setup

1. Create a new Supabase project
2. Apply the schema from `supabase/schema.sql`
3. Configure authentication settings
4. Set up row level security policies as needed

### Vercel Deployment

1. Link your repository to Vercel
2. Add the required environment variables in Vercel dashboard
3. Deploy the project
4. Configure custom domain if needed

### Post-Deployment Steps

1. Verify that all environment variables are correctly set
2. Test the application functionality
3. Set up monitoring and error tracking
4. Configure any required webhooks
