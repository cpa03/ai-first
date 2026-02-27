# ADR-002: Use Supabase as Primary Database and Backend Services

## Status

Accepted

## Context

IdeaFlow requires a backend database to store:

- User accounts and profiles
- Ideas and their metadata
- Deliverables and tasks
- Session data for clarification flows
- Analytics events

Additionally, the project needs:

- Authentication (OAuth + email/password)
- File storage for exports
- Real-time subscriptions for collaboration
- Vector database for AI similarity search

The team evaluated several backend options including:

- **Self-hosted PostgreSQL**: Requires infrastructure management
- **Firebase**: Vendor lock-in, limited SQL capabilities
- **MongoDB**: Less structured, challenging for complex queries
- **Prisma + PlanetScale**: Good but lacks built-in auth

## Decision

Use **Supabase** as the primary backend platform:

1. **PostgreSQL Database**: Full-featured relational database with:
   - Row Level Security (RLS) for data protection
   - Rich JSON support for flexible schemas
   - Triggers and functions for business logic

2. **Supabase Auth** for authentication:
   - OAuth providers (GitHub, Google)
   - Email/password
   - Magic links
   - JWT-based sessions

3. **Supabase Storage** for file management:
   - User avatars
   - Exported documents

4. **Supabase Realtime** for live features:
   - Collaboration indicators
   - Real-time task updates

5. **Supabase Vector** (planned) for AI features:
   - Idea similarity search
   - Semantic embeddings

### Database Schema

Key tables:

- `users` - User profiles linked to Supabase Auth
- `ideas` - Core idea storage with user ownership
- `deliverables` - Breakdown of ideas into deliverables
- `tasks` - Individual tasks within deliverables
- `sessions` - Clarification flow session data
- `events` - Analytics event tracking

### Security Model

- All tables use Row Level Security (RLS)
- Policies enforce user-level data isolation
- Service role used only for migrations
- API routes validate auth and ownership

## Alternatives Considered

### 1. Firebase Firestore

- **Pros**: Excellent offline support, easy mobile integration
- **Cons**: Vendor lock-in, limited querying, no SQL transactions
- **Verdict**: Rejected for complex relational queries needed

### 2. Self-Hosted PostgreSQL + Custom Auth

- **Pros**: Full control, no vendor lock-in
- **Cons**: Infrastructure management burden, must build auth from scratch
- **Verdict**: Rejected for faster development velocity

### 3. PlanetScale (MySQL) + Clerk Auth

- **Pros**: Serverless MySQL, good DX
- **Cons**: No foreign keys, separate auth provider needed
- **Verdict**: Rejected; Supabase provides all-in-one solution

### 4. MongoDB Atlas

- **Pros**: Flexible schema, good for prototyping
- **Cons**: Less structured, harder to enforce relationships
- **Verdict**: Rejected; relational model better for structured data

## Consequences

### Positive

- **Fast Development**: Auth, database, storage in one platform
- **Security**: Built-in RLS provides defense-in-depth
- **Scalability**: Serverless scaling handles growth
- **Developer Experience**: Excellent SDK, great documentation
- **Real-time**: Built-in subscription support for live features
- **Vector Search**: Future-proofing for AI features

### Negative

- **Vendor Lock-in**: Migration would be significant effort
- **Cost at Scale**: Free tier limited, costs increase with usage
- **Cold Starts**: Serverless can have latency on inactive databases
- **Complex Queries**: Some advanced SQL features limited

### Mitigations

- Use standard SQL where possible for portability
- Document data model for potential future migration
- Monitor usage and set budget alerts
- Use connection pooling to handle cold starts

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Database Schema](../../supabase/schema.sql)
- [Auth Configuration](../../src/lib/auth.ts)
- [Database Service](../../src/lib/db.ts)

## Notes

- Consider adding read replicas for heavy read workloads
- Evaluate Supabase vs self-hosted for cost optimization at scale
- Vector search feature not yet implemented but architecture supports it
