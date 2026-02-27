# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the IdeaFlow project.

## What is an ADR?

An Architecture Decision Record (ADR) captures a significant architectural decision along with its context and consequences. ADRs help teams:

- Document **why** a decision was made
- Understand the **context** at the time of the decision
- Track **consequences** (positive and negative)
- Provide **historical context** for future developers

## ADR Format

Each ADR follows this structure:

1. **Title** - Short noun phrase describing the decision
2. **Status** - Proposed, Accepted, Deprecated, Superseded
3. **Context** - The issue motivating this decision
4. **Decision** - The change being proposed or made
5. **Consequences** - What becomes easier or harder as a result

## Index

| ADR                                            | Title                                  | Status   | Date       |
| ---------------------------------------------- | -------------------------------------- | -------- | ---------- |
| [ADR-000](./ADR-000-template.md)               | ADR Template                           | Template | -          |
| [ADR-001](./ADR-001-ai-abstraction-layer.md)   | AI Provider Abstraction Layer          | Accepted | 2026-02-23 |
| [ADR-002](./ADR-002-supabase-database-auth.md) | Use Supabase for Database and Auth     | Accepted | 2026-02-27 |
| [ADR-003](./ADR-003-nextjs-app-router.md)      | Use Next.js App Router for Frontend    | Accepted | 2026-02-27 |
| [ADR-004](./ADR-004-rate-limiting.md)          | Implement Rate Limiting at API Level   | Accepted | 2026-02-27 |
| [ADR-005](./ADR-005-circuit-breaker.md)        | Use Circuit Breaker Pattern for AI     | Accepted | 2026-02-27 |
| [ADR-006](./ADR-006-standardized-errors.md)    | Standardized Error Response Format     | Accepted | 2026-02-27 |
| [ADR-007](./ADR-007-typescript-strict-mode.md) | TypeScript Strict Mode for Type Safety | Accepted | 2026-02-27 |
| [ADR-008](./ADR-008-tailwind-css.md)           | Use Tailwind CSS for Styling           | Accepted | 2026-02-27 |
| [ADR-009](./ADR-009-vercel-hosting.md)         | Use Vercel for Primary Hosting         | Accepted | 2026-02-27 |
| [ADR-010](./ADR-010-github-actions-ci-cd.md)   | GitHub Actions for CI/CD               | Accepted | 2026-02-27 |

## Creating a New ADR

1. Copy `ADR-000-template.md` to `ADR-XXX-short-title.md` (increment XXX)
2. Fill in all sections
3. Set status to "Proposed"
4. Submit for review
5. Upon approval, update status to "Accepted"
6. Update this index

## References

- [Documenting Architecture Decisions - Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
