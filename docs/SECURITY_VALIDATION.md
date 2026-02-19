# Security Validation Guide

This document describes the security validation mechanisms implemented to prevent credential exposure, specifically protecting the `SUPABASE_SERVICE_ROLE_KEY` from being exposed to client bundles.

## Overview

The application implements a **multi-layer defense strategy** to ensure sensitive credentials remain secure:

1. **Runtime Validation** - Validates environment on startup
2. **Static Analysis** - Automated audits in CI/CD
3. **Bundle Analysis** - Checks build output for credential exposure
4. **Runtime Checks** - Browser context detection in code
5. **Documentation** - Security guidelines and examples

## Security Measures

### 1. Runtime Environment Validation

**File**: `src/lib/security/env-validation.ts`

On application startup, the system validates:

- ✅ No sensitive keys have `NEXT_PUBLIC_` prefix
- ✅ Required environment variables are present
- ✅ Keys don't contain placeholder/example values
- ✅ Keys meet minimum length requirements

**Usage**:

```typescript
import { validateEnvironmentStrict } from '@/lib/security/env-validation';

// Throws error if critical violations detected
validateEnvironmentStrict();
```

This validation runs automatically in `src/instrumentation.ts` on Node.js startup.

### 2. Security Audit Script

**File**: `scripts/security/audit-credentials.js`

A comprehensive audit tool that checks for:

- `.env` files in git repository
- Hardcoded credentials in source code
- `NEXT_PUBLIC_` prefix on sensitive keys
- Credential exposure in build output
- Security best practices in code

**Usage**:

```bash
# Run security audit
node scripts/security/audit-credentials.js

# Exit codes:
# 0 = No issues found
# 1 = Critical security issues detected
# 2 = Warnings found (non-critical)
```

### 3. CI/CD Security Checks

**File**: `.github/workflows/security-audit.yml`

Automated security checks that run on:

- Every push to `main`
- Every pull request
- Daily scheduled runs

Checks include:

- Security audit script execution
- `.env` file detection in PRs
- Build output credential scanning
- Bundle analysis for key exposure

### 4. Runtime Browser Detection

**Files**: `src/lib/db.ts`, `src/lib/ai.ts`

Both database and AI services implement runtime checks:

```typescript
// SECURITY: Runtime check to ensure we're on the server
if (typeof window !== 'undefined') {
  throw new Error(
    'CRITICAL SECURITY VIOLATION: getSupabaseAdmin() was called in browser context.'
  );
}
```

This ensures the service role key can **never** be accessed in browser contexts, even if somehow imported into client code.

### 5. Lazy Initialization

Sensitive credentials are **never accessed at module load time**:

```typescript
// SECURITY: Service role key is NEVER accessed at module level
// to prevent accidental bundling in client-side code.
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  // Lazy initialization only when function is called
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    // ...
  }
}
```

This prevents the key from being captured during static analysis or build-time bundling.

## Environment Variable Configuration

### Correct Configuration

```bash
# ✅ CORRECT: Public variables (safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ✅ CORRECT: Private variables (server-only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_API_KEY=your-admin-api-key
OPENAI_API_KEY=sk-...
```

### Incorrect Configuration (CRITICAL)

```bash
# ❌ WRONG: Service role key with NEXT_PUBLIC_ prefix
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ❌ WRONG: Committing .env files to git
# .env.local should be in .gitignore
```

## API Architecture

The application uses a **secure API pattern** to prevent credential exposure:

### Client Components

```typescript
// ✅ CORRECT: Client calls API route
const response = await fetch(`/api/ideas/${ideaId}`, {
  method: 'PUT',
  body: JSON.stringify({ status: 'clarified' }),
});
```

### API Routes (Server-Side)

```typescript
// ✅ CORRECT: API route uses admin client
import { dbService } from '@/lib/db';

export async function PUT(request: Request) {
  // Server-side only - safe to use admin client
  const updated = await dbService.updateIdea(id, updates);
  return Response.json(updated);
}
```

### ❌ NEVER DO THIS

```typescript
// ❌ WRONG: Direct dbService call in client component
import { dbService } from '@/lib/db';

// This would expose the service role key!
await dbService.updateIdea(id, updates);
```

## Security Checklist

Before deploying, ensure:

- [ ] No `.env` files are committed to git
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does NOT have `NEXT_PUBLIC_` prefix
- [ ] Security audit passes: `node scripts/security/audit-credentials.js`
- [ ] Build completes without credential exposure warnings
- [ ] All sensitive operations go through API routes
- [ ] No hardcoded credentials in source code
- [ ] Production keys are rotated and different from development

## Incident Response

If you suspect credential exposure:

1. **Immediate Actions**:
   - Rotate exposed keys immediately in Supabase Dashboard
   - Review Supabase logs for unauthorized access
   - Check if any sensitive data was accessed

2. **Code Review**:
   - Run `node scripts/security/audit-credentials.js`
   - Check build output: `grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/`
   - Review recent commits for `.env` files

3. **Prevention**:
   - Enable branch protection requiring security checks
   - Add pre-commit hooks to prevent `.env` commits
   - Regular security audits in CI/CD

## Files and References

- **Environment Config**: `config/.env.example`
- **Database Service**: `src/lib/db.ts`
- **AI Service**: `src/lib/ai.ts`
- **Validation Module**: `src/lib/security/env-validation.ts`
- **Audit Script**: `scripts/security/audit-credentials.js`
- **CI Workflow**: `.github/workflows/security-audit.yml`
- **Main Security Doc**: `SECURITY.md`

## Support

For security-related questions or to report vulnerabilities:

1. Check existing issues with `security` label
2. Review `SECURITY.md` for reporting procedures
3. Contact the security team (see `SECURITY.md`)

---

**Last Updated**: 2026-02-19  
**Version**: 1.0.0  
**Related**: Issue #1135 - Supabase Service Role Key Exposure Prevention
