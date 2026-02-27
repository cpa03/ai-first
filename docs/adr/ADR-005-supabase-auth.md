# ADR-005: Authentication with Supabase Auth

## Status

Accepted

## Context

IdeaFlow requires user authentication for:

- Personal idea storage (user isolation)
- Session management for clarification flows
- Analytics attribution
- Future: Team collaboration
- Future: Paid features (user accounts)

The team needed an authentication solution that:

- Works with Supabase (our database choice)
- Supports multiple authentication methods
- Provides secure session management
- Integrates well with Next.js
- Has good developer experience

## Decision

Use **Supabase Auth** as the authentication provider:

### 1. Supported Authentication Methods

| Method         | Use Case            | Status |
| -------------- | ------------------- | ------ |
| GitHub OAuth   | Developer users     | ✅     |
| Google OAuth   | General users       | ✅     |
| Email/Password | Traditional login   | ✅     |
| Magic Link     | Passwordless access | ✅     |

### 2. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Authentication Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User ──► Login Page ──► Supabase Auth ──► JWT Token       │
│                           │                    │            │
│                           ▼                    ▼            │
│                    [OAuth/Email]         Store in            │
│                                         httpOnly cookie     │
│                                                              │
│  Request ──► API Route ──► Validate JWT ──► Process        │
│                           │                    │            │
│                           ▼                    ▼            │
│                    [Invalid]            [Valid]             │
│                    401 Error           Continue             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Session Management

- JWT tokens stored in HTTP-only cookies
- Access token: Short-lived (1 hour)
- Refresh token: Longer-lived for session extension
- Automatic token refresh on API calls

### 4. API Route Protection

All protected routes validate the JWT:

```typescript
// API route handler
export async function handler(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('UNAUTHORIZED', 'No token provided', 401);
  }

  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return errorResponse('UNAUTHORIZED', 'Invalid token', 401);
  }

  // Process request with user context
  return processRequest(request, user);
}
```

### 5. Row Level Security (RLS)

Database tables enforce access control:

```sql
-- Ideas table RLS policy
CREATE POLICY "Users can only see their own ideas"
ON ideas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own ideas"
ON ideas FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 6. Frontend Integration

React hooks for authentication:

```typescript
// Auth check hook
function useAuthCheck() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

### 7. Configuration

Environment variables required:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only
```

## Alternatives Considered

### 1. NextAuth.js (Auth.js)

- **Pros**: Framework-agnostic, many providers, active community
- **Cons**: Additional dependency, separate from database
- **Verdict**: Good option but adds complexity

### 2. Clerk

- **Pros**: Excellent DX, feature-rich, good UI components
- **Cons**: Separate from Supabase, cost at scale
- **Verdict**: Consider for advanced auth needs

### 3. Custom JWT Implementation

- **Pros**: Full control
- **Cons**: Security risks, maintenance burden
- **Verdict**: Rejected; reinventing the wheel

### 4. Firebase Auth

- **Pros**: Mature, good free tier
- **Cons**: Vendor lock-in, less SQL integration
- **Verdict**: Rejected; prefer Supabase integration

## Consequences

### Positive

- **Single Platform**: Auth + Database from one provider
- **Security**: Battle-tested, professional security
- **DX**: Easy to implement, good documentation
- **OAuth**: Quick GitHub/Google integration
- **RLS**: Database-level security enforcement

### Negative

- **Vendor Lock-in**: Migration would be significant
- **Customization**: Limited UI customization
- **Cost**: Pricing changes possible

### Mitigations

- Document auth flow for future migration
- Use standard JWT claims for portability
- Monitor pricing changes

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Auth Service Implementation](../../src/lib/auth.ts)
- [Authentication Tests](../../tests/auth.test.ts)
- [Supabase Schema - Users Table](../../supabase/schema.sql)

## Notes

- Consider adding two-factor authentication
- Could add role-based access control for future
- Session management could be improved with refresh tokens
- Consider adding account deletion (GDPR compliance)
