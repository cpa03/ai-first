# Agent Guidelines

## Core Principles

- No direct pushes to main branch
- All changes must be logged and tracked
- Human-in-the-loop policy for critical decisions
- Rate-limits and cost guardrails must be implemented
- Secrets must never be committed to the repository
- All code changes must include appropriate tests
- Rollback procedures must be documented for all changes

## Commit Guidelines

- Include AGENT=<agent-name> in all commits
- Follow conventional commit format
- Reference relevant issue numbers

## Development Process

- Create feature branches for all work
- Submit pull requests with proper machine-readable templates
- All PRs must pass automated tests before merging
- Code review required for all non-trivial changes

## Error Handling

- Implement proper error handling in all functions
- Log agent actions for debugging and audit purposes
- Gracefully handle API failures and rate limits
