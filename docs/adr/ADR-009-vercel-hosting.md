# ADR-009: Use Vercel for Primary Hosting

## Status

Accepted

## Context

We needed a hosting platform for the Next.js application. Options evaluated:

- **AWS**: Powerful but complex, steep learning curve
- **Google Cloud**: Similar to AWS, complex setup
- **Cloudflare Pages**: Good but less Next.js optimization
- **Netlify**: Good free tier but less Next.js native
- **Vercel**: Creator of Next.js, deepest integration

## Decision

Use Vercel as the primary hosting platform.

### Why Vercel?

1. **Next.js native**: Created by Vercel, deepest integration
2. **Zero config**: Works out of the box with Next.js
3. **Edge network**: Global CDN for fast worldwide access
4. **Serverless functions**: API routes work seamlessly
5. **Preview deployments**: Automatic per-branch deploys
6. **Free tier**: Generous limits for small projects

### Deployment Configuration

```json
// vercel.json (optional, defaults work well)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### Environment Variables

```
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Preview Deployments

- Every PR gets automatic preview deployment
- Branch pushes get preview URLs
- Production deploys on merge to main

## Consequences

### Positive

- **Fastest Next.js**: Deepest framework integration
- **Zero DevOps**: No server management needed
- **Automatic SSL**: HTTPS everywhere
- **Preview UX**: Easy review of changes
- **Analytics**: Built-in performance analytics
- **Monitoring**: Error tracking integrated

### Negative

- **Vendor lock-in**: Tied to Vercel-specific features
- **Cold starts**: Serverless functions have latency
- **Egress costs**: High traffic can get expensive
- **Limited control**: Can't customize server config

## Alternatives Considered

- **Cloudflare Pages**: Cheaper but less Next.js specific
- **AWS Amplify**: More control, more complexity
- **Self-hosted**: Full control, high ops overhead

## References

- [Deployment Guide](./deploy.md)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
