# User Story Engineer Guide

Specialist guide for writing, managing, and refining user stories in the IdeaFlow project.

## Overview

The User Story Engineer is responsible for transforming ideas and requirements into well-structured, actionable user stories that follow industry best practices and integrate seamlessly with the IdeaFlow workflow.

## Core Responsibilities

1. **Story Creation**: Write clear, concise user stories following the standard format
2. **Story Refinement**: Ensure stories meet INVEST criteria and have clear acceptance criteria
3. **Story Prioritization**: Collaborate with product owners to prioritize stories in backlogs
4. **Story Decomposition**: Break down large stories into smaller, manageable ones
5. **Story Integration**: Ensure stories align with blueprints, roadmaps, and project goals

## User Story Format

### Standard Format

```
As a [type of user/persona],
I want [some goal/desire],
So that [some benefit/reason].
```

### Example

```
As a startup founder,
I want to quickly convert my app idea into a prioritized task list,
So that I can start development with a clear roadmap.
```

## INVEST Criteria

Every user story must satisfy the INVEST criteria:

### Independent (I)

- Stories should be self-contained with no inherent dependencies on other stories
- If dependencies exist, document them clearly
- Order stories to minimize dependencies

**Good**: "As a user, I want to log in with my email"

**Bad**: "As a user, I want to log in (requires #123)"

### Negotiable (N)

- Stories are not contracts; they're invitations to conversation
- Details can be refined during implementation
- Leave room for discussion and adaptation

### Valuable (V)

- Stories must deliver value to the user or business
- Value should be clear from the "So that" clause
- Avoid technical stories that don't provide user value

**Good**: "As a founder, I want to see estimated hours for each task"

**Bad**: "As a developer, I want to refactor the API"

### Estimable (E)

- Stories must be sized enough to estimate
- If too large, break down into smaller stories
- Include technical context for accurate estimation

### Small (S)

- Stories should be completable within a single sprint
- Target 1-5 story points typically
- Large stories are "epics" that need decomposition

### Testable (T)

- Stories must have clear acceptance criteria
- Criteria should be verifiable through testing
- Use Given-When-Then format for complex scenarios

## Acceptance Criteria Guidelines

### Format

```gherkin
Given [initial context/precondition]
When [action/trigger]
Then [expected outcome]
```

### Example

```gherkin
Given I am on the idea submission page
When I enter my project idea and click "Generate Plan"
Then I should see a confirmation message
And I should receive a breakdown within 60 seconds
```

### Best Practices

1. **Be Specific**: Use concrete values and conditions
2. **Be Complete**: Cover happy path and error scenarios
3. **Be Testable**: Each criterion should be verifiable
4. **Be Concise**: One criterion per line, clear language
5. **Prioritize**: Mark criteria as required/optional if needed

## Definition of Done (DoD)

A user story is "Done" when:

### Code Quality

- [ ] Code follows project style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests written and passing
- [ ] Integration tests (if applicable) passing
- [ ] Acceptance criteria verified
- [ ] Edge cases covered

### Documentation

- [ ] API documentation updated (if applicable)
- [ ] README updated (if applicable)
- [ ] Changelog updated

### Deployment

- [ ] Feature flag implemented (if needed)
- [ ] Database migrations run (if applicable)
- [ ] CI/CD pipeline passes

### Security

- [ ] Security review completed (if applicable)
- [ ] No secrets committed
- [ ] PII handling verified

## Story Prioritization Framework

### MoSCoW Method

| Priority    | Label | Description                             |
| ----------- | ----- | --------------------------------------- |
| Must Have   | `P0`  | Critical for MVP, no release without it |
| Should Have | `P1`  | Important but not critical              |
| Could Have  | `P2`  | Nice to have, can be deferred           |
| Won't Have  | `P3`  | Explicitly out of scope for now         |

### Priority Factors

1. **Business Value**: How much value does this deliver?
2. **Risk Reduction**: Does this reduce technical or business risk?
3. **Dependencies**: Does this unblock other stories?
4. **Time Sensitivity**: Is there a deadline or market window?
5. **Effort**: What's the story point estimate?

## Story Decomposition Patterns

### When to Decompose

- Story exceeds 8 story points
- Multiple acceptance criteria that could be separate
- Complex technical requirements
- Multiple user types or personas involved

### Decomposition Approaches

1. **By Workflow**: Split by steps in a process
2. **By User Type**: Split by different personas
3. **By Data Type**: Split by different data categories
4. **By Platform**: Split by web/mobile/API
5. **By Complexity**: Split happy path from edge cases

### Example Decomposition

**Epic**: "As a user, I want to export my plan to different formats"

**Stories**:

1. "As a user, I want to export my plan to Markdown"
2. "As a user, I want to export my plan to Notion"
3. "As a user, I want to export my plan to Trello"
4. "As a user, I want to export my plan to GitHub Projects"

## Integration with IdeaFlow

### Story Lifecycle in IdeaFlow

```
Idea → Clarification → Breakdown → Stories → Tasks → Implementation
```

### Story Generation

1. **From Blueprint**: Extract user-facing features
2. **From Roadmap**: Convert milestones to stories
3. **From Feedback**: Transform user feedback into stories
4. **From Bugs**: Convert bugs with user impact

### AI-Assisted Story Writing

When using AI agents to generate stories:

1. **Review**: Always review AI-generated stories
2. **Refine**: Add missing acceptance criteria
3. **Validate**: Ensure INVEST compliance
4. **Prioritize**: Set appropriate priority

## Common Anti-Patterns

### Avoid These

1. **Technical Stories Without User Value**
   - Bad: "Refactor database layer"
   - Good: "As a user, I want faster load times on the dashboard"

2. **Vague Acceptance Criteria**
   - Bad: "The feature should work well"
   - Good: "The API responds within 200ms for 95% of requests"

3. **Stories Too Large**
   - Bad: "As a user, I want a complete dashboard with analytics"
   - Good: "As a user, I want to see my total idea count on the dashboard"

4. **Missing Context**
   - Bad: "I want to save my work"
   - Good: "As a user creating a new idea, I want auto-save so I don't lose progress"

5. **Negative Stories**
   - Bad: "As a user, I don't want the app to crash"
   - Good: "As a user, I want the app to handle errors gracefully"

## Story Writing Checklist

Before submitting a story for review:

- [ ] Uses standard format (As a... I want... So that...)
- [ ] Meets all INVEST criteria
- [ ] Has clear, testable acceptance criteria
- [ ] Includes priority label
- [ ] Estimated with story points (if applicable)
- [ ] Dependencies documented (if any)
- [ ] Technical requirements noted (if any)
- [ ] Aligned with project blueprint/roadmap

## Templates

Use the [User Story Template](./templates/user-story_template.md) for consistent story formatting.

## Related Documentation

- [Blueprint Template](./templates/blueprint_template.md) - For project blueprints
- [Tasks Template](./templates/tasks_template.md) - For task breakdown
- [Roadmap Template](./templates/roadmap_template.md) - For project roadmaps
- [Feature Guide](./feature.md) - For feature requests
- [Bug Guide](./bug.md) - For bug reports

---

_Maintained by the User Story Engineer specialist._
