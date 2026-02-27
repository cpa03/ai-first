# ADR-002: Use Supabase for Database and Authentication

## Status

Accepted

## Context

IdeaFlow requires a backend database to store ideas, breakdowns, tasks, and user data. The project also needs authentication to manage user access. We evaluated several options:

- **Firebase**: Popular but vendor lock-in concerns, less flexible querying
- **MongoDB**: Flexible schema but requires manual connection pooling
- **PostgreSQL with custom backend**: Full control but significant development overhead
- **Supabase**: PostgreSQL + Auth + Storage + additional features with open-source option

## Decision

Use Supabase as the primary backend service, leveraging:

1. **PostgreSQL Database** - Primary data store for all application data
2. **Supabase Auth** - Authentication with OAuth support (GitHub, Google)
3. **Supabase Storage** - File storage capabilities
4. **Row Level Security (RLS)** - Fine-grained access control at database level
5. **Real-time subscriptions** - Live data updates (future consideration)

### Implementation Details

```typescript
// Database schema location: supabase/schema.sql
// Client: src/lib/db.ts

// RLS policies enforce:
// - Users can only see their own ideas
// - Public ideas are readable by all authenticated users
// - Tasks are owned by the user who created their parent idea
```

## Consequences

### Positive

- **Rapid development**: Auth and database in one service
- **PostgreSQL power**: Full SQL capabilities, complex queries
- **RLS security**: Database-level access control
- **Open-source option**: Can self-host if needed
- **TypeScript types**: Generated from schema
- **Easy migrations**: Supabase CLI for schema management

### Negative

- **Vendor dependency**: Tied to Supabase APIs and tooling
- **Cold starts**: Serverless function cold starts on free tier
- **Limited to PostgreSQL**: No alternative database options
- **RLS complexity**: Can become complex for sophisticated permissions

## Alternatives Considered

- **Firebase**: Rejected due to vendor lock-in and NoSQL limitations
- **Custom PostgreSQL backend**: Rejected due to development time
- **Prisma + managed PostgreSQL**: Would require building auth separately

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Schema](./database-schema.md)
- [Auth Implementation](./architecture.md#authentication)
