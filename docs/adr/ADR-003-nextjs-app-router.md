# ADR-003: Use Next.js App Router for Frontend

## Status

Accepted

## Context

IdeaFlow needs a modern, performant web frontend. We evaluated several frameworks:

- **CRA (Create React App)**: Deprecated, slower performance
- **Vue/Nuxt**: Less ecosystem for AI agent integration
- **Svelte/SvelteKit**: Smaller ecosystem
- **Next.js with Pages Router**: Legacy, being replaced
- **Next.js with App Router**: Latest framework with Server Components

## Decision

Use Next.js 16+ with App Router as the primary frontend framework.

### Key Implementation Choices

1. **App Router**: Use Next.js App Router (not Pages Router)
2. **Server Components**: Default to React Server Components for performance
3. **Server Actions**: Use for form submissions and data mutations
4. **Middleware**: For authentication and request preprocessing
5. **API Routes**: Route handlers in `src/app/api/`

### Directory Structure

```
src/app/
├── page.tsx              # Home page (Server Component)
├── layout.tsx           # Root layout
├── api/                  # API routes (Route Handlers)
│   ├── ideas/
│   ├── breakdown/
│   └── health/
├── (auth)/               # Auth route group
│   ├── login/
│   └── signup/
└── globals.css          # Global styles (Tailwind)
```

## Consequences

### Positive

- **Performance**: Server Components reduce client JavaScript
- **SEO**: Server-side rendering for dynamic content
- **Developer Experience**: File-based routing, hot reload
- **Ecosystem**: Largest React meta-framework community
- **Vercel integration**: Native deployment and optimization
- **TypeScript**: First-class TypeScript support

### Negative

- **Learning curve**: App Router differs from traditional React
- **Server/Client boundary**: Must explicitly mark client components
- **Cache complexity**: New caching semantics to learn
- **Bundle size**: Can grow large without careful monitoring

## Alternatives Considered

- **Remix**: Excellent, but smaller ecosystem
- **SvelteKit**: Growing but less React-specific tooling
- **Plain React**: Would need to build SSR/SSG ourselves

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Tutorial](https://nextjs.org/docs/app)
- [Project Structure](./README.md#-project-structure)
