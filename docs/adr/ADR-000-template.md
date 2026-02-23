# ADR-000: Architecture Decision Record Template

## Status

Template

## Context

This is a template for creating Architecture Decision Records (ADRs) in the IdeaFlow project.

## Decision

Use the following format for all ADRs:

### Required Sections

1. **Title** - Short noun phrase (e.g., "Use PostgreSQL for Primary Database")
2. **Status** - One of:
   - `Proposed` - Under discussion
   - `Accepted` - Approved and in effect
   - `Deprecated` - No longer recommended for new code
   - `Superseded` - Replaced by another ADR (link to it)
3. **Context** - Describe the situation, constraints, and forces at play
4. **Decision** - State the decision clearly and concisely
5. **Consequences** - Document the effects:
   - What becomes easier?
   - What becomes harder?
   - Any trade-offs?

### Optional Sections

- **Alternatives Considered** - Other options that were evaluated
- **References** - Links to relevant documentation, discussions, or external resources
- **Notes** - Additional information, updates, or observations

## Consequences

### Positive

- Standardized format improves consistency
- Easy to compare decisions across the codebase
- Follows industry best practices

### Negative

- Requires discipline to maintain
- Adds documentation overhead

## Example

```markdown
# ADR-001: Use AI Provider Abstraction Layer

## Status

Accepted

## Context

IdeaFlow needs to integrate with multiple AI providers (OpenAI, Anthropic, etc.) for
generating project breakdowns. Direct coupling to any single provider would create
vendor lock-in and limit flexibility.

## Decision

Implement an AI abstraction layer that:

1. Defines a common interface for AI completions
2. Supports multiple providers through adapters
3. Handles provider-specific configuration
4. Provides fallback and retry logic

## Consequences

### Positive

- Easy to switch providers
- Can use different providers for different tasks
- Testable with mock providers

### Negative

- Additional abstraction complexity
- May not support provider-specific features immediately
```
