# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with IdeaFlow.

## Quick Diagnostics

Start here when something goes wrong:

```bash
# 1. Check environment setup
npm run env:check

# 2. Check application health
curl http://localhost:3000/api/health

# 3. Check detailed system health
curl http://localhost:3000/api/health/detailed

# 4. Check database connection
curl http://localhost:3000/api/health/database
```

---

## Environment Setup Issues

### Environment variables not loading

**Symptoms:**

- Build fails with "Environment variable not found"
- Application starts but can't connect to services
- `npm run env:check` reports missing variables

**Diagnosis:**

```bash
# Check if .env.local exists
ls -la .env.local

# Check environment variables
npm run env:check
```

**Solutions:**

1. **Create environment file:**

   ```bash
   cp config/.env.example .env.local
   ```

2. **Verify required variables are set:**

   ```bash
   grep -E "NEXT_PUBLIC_SUPABASE_URL|OPENAI_API_KEY" .env.local
   ```

3. **Restart development server after changes:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Supabase connection failures

**Symptoms:**

- "Failed to connect to Supabase"
- Authentication errors
- Database queries failing

**Diagnosis:**

```bash
# Check detailed health endpoint
curl http://localhost:3000/api/health/detailed
```

**Solutions:**

1. **Verify Supabase credentials:**
   - Check `NEXT_PUBLIC_SUPABASE_URL` matches your project URL
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the public key, not service role
   - Confirm Supabase project is active (not paused)

2. **Test Supabase connection manually:**

   ```bash
   curl https://your-project.supabase.co/rest/v1/ \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

3. **Check Supabase status:**
   - Visit [Supabase Status](https://status.supabase.com/)
   - Check your project dashboard for maintenance alerts

### AI provider API errors

**Symptoms:**

- "API key invalid" or "authentication failed"
- "Quota exceeded" messages
- Timeout errors from AI service

**Diagnosis:**

```bash
# Check if AI key is set
echo $OPENAI_API_KEY

# Test health endpoint for AI status
curl http://localhost:3000/api/health/detailed
```

**Solutions:**

**OpenAI issues:**

1. Verify API key validity at [OpenAI Platform](https://platform.openai.com/api-keys)
2. Check API quota and billing at [OpenAI Billing](https://platform.openai.com/account/billing)
3. Ensure you're using the correct key (not organization key if not needed)

**Anthropic issues:**

1. Verify API key at [Anthropic Console](https://console.anthropic.com/)
2. Check usage limits and billing

**Generic solutions:**

- Regenerate API key if invalid
- Verify key doesn't have whitespace or special characters
- Ensure you have sufficient credits/usage quota

---

## Build and Development Issues

### Build fails with TypeScript errors

**Symptoms:**

- `npm run build` fails with type errors
- IDE shows red squigglies in TypeScript files
- "Property does not exist on type" errors

**Diagnosis:**

```bash
# Run type check
npm run type-check
```

**Solutions:**

1. **Clear Next.js cache:**

   ```bash
   rm -rf .next
   npm run build
   ```

2. **Update dependencies:**

   ```bash
   npm update
   npm run build
   ```

3. **Fix type errors individually:**
   - Review error messages
   - Check if type definitions are missing
   - Verify imports are correct

### Linting errors

**Symptoms:**

- `npm run lint` fails
- Pre-commit hooks blocking commits
- ESLint warnings in IDE

**Diagnosis:**

```bash
# Run linter
npm run lint
```

**Solutions:**

1. **Auto-fix where possible:**

   ```bash
   npm run lint -- --fix
   ```

2. **Common fixes:**
   - Remove unused imports
   - Fix console.log statements
   - Add missing semicolons
   - Fix quote style consistency

3. **If errors are intentional:**
   ```typescript
   // eslint-disable-next-line
   const intentionallyUnusedVar = value;
   ```

### Development server not starting

**Symptoms:**

- `npm run dev` hangs or fails
- "Port already in use" error
- Module not found errors

**Diagnosis:**

```bash
# Check if port is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Check for module errors
npm run dev 2>&1 | head -50
```

**Solutions:**

1. **Kill process using port 3000:**

   ```bash
   # macOS/Linux
   kill -9 $(lsof -t -i:3000)

   # Windows
   taskkill /PID <PID> /F
   ```

2. **Clear cache and reinstall:**

   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```

3. **Use different port:**
   ```bash
   PORT=3001 npm run dev
   ```

---

## API and Integration Issues

### API returns 400 Validation Error

**Symptoms:**

- "Request validation failed" response
- Missing required field errors
- Field value out of range errors

**Diagnosis:**

```bash
# Make test request and see full error
curl -X POST http://localhost:3000/api/clarify/start \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "test", "ideaText": "too short"}' \
  -v
```

**Solutions:**

1. **Check request body:**
   - Ensure all required fields are present
   - Verify field types match expected types
   - Check field value constraints

2. **Common validation rules:**
   - `ideaText`: 10-10,000 characters
   - `ideaId`: Must be valid UUID
   - Request body: Maximum 1MB

3. **Review error details in response:**
   ```json
   {
     "error": "Request validation failed",
     "code": "VALIDATION_ERROR",
     "details": [
       {
         "field": "ideaText",
         "message": "must be between 10 and 10000 characters"
       }
     ]
   }
   ```

### Rate limit exceeded (429)

**Symptoms:**

- "Rate limit exceeded" error
- HTTP 429 status code
- Requests being blocked

**Diagnosis:**

```bash
# Check rate limit headers in response
curl -I http://localhost:3000/api/clarify/start
```

**Solutions:**

1. **Wait and retry:**
   - Check `Retry-After` header
   - Implement exponential backoff
   - Use request queue for bulk operations

2. **Monitor rate limits:**

   ```bash
   # Check remaining requests
   curl http://localhost:3000/api/clarify/start \
     -H "Content-Type: application/json" \
     -d '{"ideaId": "...", "ideaText": "..."}' \
     -i | grep -i x-ratelimit
   ```

3. **Contact support for higher limits** if needed for production

### Circuit breaker open (503)

**Symptoms:**

- "Circuit breaker open" error
- Service temporarily unavailable
- External service failures

**Diagnosis:**

```bash
# Check circuit breaker status
curl http://localhost:3000/api/health/detailed | jq '.checks.circuitBreakers'
```

**Solutions:**

1. **Wait for circuit breaker to reset:**
   - Error message includes reset time
   - Circuit opens after consecutive failures
   - Automatically closes after testing

2. **Check external service status:**
   - [OpenAI Status](https://status.openai.com/)
   - [Supabase Status](https://status.supabase.com/)

3. **Monitor recovery:**
   ```bash
   # Watch health endpoint
   watch -n 5 'curl -s http://localhost:3000/api/health/detailed | jq ".checks.circuitBreakers"'
   ```

---

## Database Issues

### Database connection failed

**Symptoms:**

- "Failed to connect to database"
- Timeout errors on database operations
- Migration failures

**Diagnosis:**

```bash
# Check database health
curl http://localhost:3000/api/health/database

# Check database connection directly
psql $DATABASE_URL -c "SELECT 1"
```

**Solutions:**

1. **Verify Supabase connection:**
   - Check project is not paused
   - Verify connection string format
   - Test connection in Supabase dashboard

2. **Run migrations:**

   ```bash
   npm run db:migrate
   ```

3. **Reset database (development only):**
   ```bash
   npm run db:reset
   ```

### Database schema mismatch

**Symptoms:**

- "Relation does not exist" errors
- Column not found errors
- Type mismatch errors

**Diagnosis:**

```bash
# Check schema
npm run db:migrate --dry-run

# Compare with expected schema
supabase db diff
```

**Solutions:**

1. **Run pending migrations:**

   ```bash
   npm run db:migrate
   ```

2. **Reset to latest schema (development):**

   ```bash
   npm run db:reset
   ```

3. **Check migration files:**
   ```bash
   ls -la supabase/migrations/
   ```

---

## Agent Issues

### Agent not responding

**Symptoms:**

- Clarification agent hangs
- Breakdown agent doesn't start
- No response from API

**Diagnosis:**

```bash
# Check AI service health
curl http://localhost:3000/api/health/detailed | jq '.checks.ai'

# Check agent logs
tail -f logs/agent.log
```

**Solutions:**

1. **Verify AI provider is accessible:**
   - Check API key is valid
   - Test API directly with curl
   - Verify quota not exceeded

2. **Check agent configuration:**

   ```bash
   cat ai/agent-configs/clarifier.yml
   ```

3. **Restart development server:**
   ```bash
   # Stop and restart
   npm run dev
   ```

### Agent generating poor results

**Symptoms:**

- Irrelevant clarification questions
- Breakdown not making sense
- Low confidence scores

**Solutions:**

1. **Check prompt templates:**

   ```bash
   cat ai/prompts/clarifier/*.yml
   ```

2. **Refine prompts:**
   - Update prompt templates
   - Add more specific instructions
   - Test with different AI models

3. **Provide better context:**
   - Ensure user responses are detailed
   - Check idea text is clear
   - Add more clarification questions

---

## Deployment Issues

### Build fails in production

**Symptoms:**

- Vercel build fails
- "Module not found" errors in production
- Environment variable errors during build

**Diagnosis:**

```bash
# Test production build locally
npm run build:check
```

**Solutions:**

1. **Verify environment variables in production:**
   - Check Vercel dashboard for env vars
   - Ensure all required variables are set
   - Variable names must match exactly

2. **Check production dependencies:**

   ```bash
   # Verify dependencies work in production mode
   NODE_ENV=production npm run build
   ```

3. **Review Vercel build logs:**
   - Check for specific error messages
   - Look for timeout errors
   - Verify build time limits

### Runtime errors in production

**Symptoms:**

- 500 errors in production
- Application crashes
- Features not working

**Diagnosis:**

1. **Check Vercel logs:**
   - Go to Vercel dashboard
   - View function logs
   - Check for error messages

2. **Test production API:**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

**Solutions:**

1. **Check environment variables:**
   - Production may have different requirements
   - Verify secrets are properly configured

2. **Monitor application health:**

   ```bash
   curl https://your-domain.vercel.app/api/health/detailed
   ```

3. **Rollback if needed:**
   - Use Vercel rollback feature
   - Revert to previous deployment

---

## Performance Issues

### Slow API responses

**Symptoms:**

- API takes > 10 seconds to respond
- Timeouts on long operations
- Poor user experience

**Diagnosis:**

```bash
# Measure response time
time curl http://localhost:3000/api/clarify/start \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "...", "ideaText": "..."}'

# Check health endpoint for latency
curl http://localhost:3000/api/health/detailed | jq '.checks.ai.latency'
```

**Solutions:**

1. **Optimize AI model calls:**
   - Use smaller/faster models when appropriate
   - Cache responses where possible
   - Implement request batching

2. **Check database queries:**
   - Add indexes to slow queries
   - Use query optimization
   - Implement caching

3. **Use faster AI provider:**
   - Consider using GPT-3.5 instead of GPT-4 for non-critical operations

---

## Getting Help

### Before seeking help:

1. **Run diagnostics:**

   ```bash
   npm run env:check
   curl http://localhost:3000/api/health/detailed
   ```

2. **Gather information:**
   - Error messages (full text)
   - Request ID from API responses
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

3. **Check existing resources:**
   - [README.md](../README.md)
   - [API Documentation](./api.md)
   - [Error Codes](./error-codes.md)
   - [Architecture](./architecture.md)

### When creating an issue:

Include the following information:

```markdown
## Environment

- OS: [e.g., macOS, Ubuntu 20.04]
- Node version: [e.g., v18.19.0]
- Package manager: [npm/yarn]

## Problem

[Describe the issue clearly]

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Error Messages
```

[Paste full error messages here]

```

## Request ID
[Paste the X-Request-ID from API response]

## What You've Tried
[List steps you've already taken to resolve the issue]
```

### Useful Resources:

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## Common Error Messages Quick Reference

| Error                     | Code                   | Retryable | Solution                   |
| ------------------------- | ---------------------- | --------- | -------------------------- |
| Request validation failed | VALIDATION_ERROR       | No        | Fix request body           |
| Rate limit exceeded       | RATE_LIMIT_EXCEEDED    | Yes       | Wait and retry             |
| Authentication failed     | AUTHENTICATION_ERROR   | No        | Check API keys             |
| Resource not found        | NOT_FOUND              | No        | Verify resource ID         |
| External service error    | EXTERNAL_SERVICE_ERROR | Yes       | Check service status       |
| Request timed out         | TIMEOUT_ERROR          | Yes       | Reduce complexity or retry |
| Circuit breaker open      | CIRCUIT_BREAKER_OPEN   | Yes       | Wait for reset             |
| Internal error            | INTERNAL_ERROR         | No        | Check logs, report issue   |

---

**Still stuck?** [Create an issue](https://github.com/cpa03/ai-first/issues) and include your diagnostic information.
