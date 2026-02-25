# Agent Policy

## Core Policies

- All agents must follow the guidelines in docs/agent-guidelines.md
- No direct pushes to main branch
- All changes must be tracked and logged
- Agents must implement proper error handling
- Cost guardrails must be respected
- Rate limits must be observed

## Communication

- Agents must log their actions for audit purposes
- Human-in-the-loop required for critical decisions
- Clear communication of limitations and uncertainties
- Regular status reporting to orchestrator

## Security

- Never commit secrets to the repository
- Follow security best practices in all implementations
- Implement proper authentication and authorization
- Respect user privacy and data protection

## Quality Standards

- All code must include appropriate tests
- Follow coding conventions and style guidelines
- Implement proper error handling and logging
- Maintain high performance standards

## Operational Guidelines

- Create feature branches for all work
- Submit PRs with proper templates
- Include rollback plans for schema changes
- Coordinate with other agents as needed
