# User Story Engineer Guide

Specialist guide for writing, managing, and refining user stories in the IdeaFlow project.

## Overview

The User Story Engineer is responsible for transforming ideas and requirements into well-structured, actionable user stories that follow industry best practices and integrate seamlessly with the IdeaFlow workflow.

---

## ⚡ Quick Reference

### Story Format (Copy-Paste Ready)

```
As a [persona],
I want [goal],
So that [benefit].
```

### Acceptance Criteria Format

```gherkin
Given [context]
When [action]
Then [expected outcome]
```

### Priority Labels

| Label | MoSCoW      | When to Use             |
| ----- | ----------- | ----------------------- |
| `P0`  | Must Have   | Blocks MVP/release      |
| `P1`  | Should Have | Important, not blocking |
| `P2`  | Could Have  | Nice to have            |
| `P3`  | Won't Have  | Explicitly deferred     |

### Story Points Quick Reference

| Points | Complexity | Time Estimate |
| ------ | ---------- | ------------- |
| 1      | Trivial    | < 1 hour      |
| 2      | Simple     | 1-2 hours     |
| 3      | Medium     | 2-4 hours     |
| 5      | Complex    | 4-8 hours     |
| 8      | Large      | 1-2 days      |
| 13     | Very Large | 2-3 days      |
| ?      | Unknown    | Needs spike   |

### INVEST Checklist

- **I**ndependent - No blocking dependencies
- **N**egotiable - Details can be refined
- **V**aluable - Clear user/business value
- **E**stimable - Can be sized
- **S**mall - Completable in one sprint
- **T**estable - Verifiable acceptance criteria

### Definition of Ready Summary

- [ ] Story follows standard format
- [ ] Acceptance criteria are testable
- [ ] Priority and story points assigned
- [ ] No unresolved questions
- [ ] Dependencies documented

### Definition of Done Summary

- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Unit tests passing
- [ ] Acceptance criteria verified
- [ ] Code reviewed

### Templates

- [User Story Template](./templates/user-story_template.md)
- [User Personas](./user-stories/personas.md)

---

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

## Definition of Ready (DoR)

A user story is "Ready" to be worked on when all of the following criteria are met:

### Story Quality

- [ ] Story follows the standard format (As a... I want... So that...)
- [ ] Story meets all INVEST criteria
- [ ] Story has clear, testable acceptance criteria
- [ ] Story includes appropriate persona reference
- [ ] Story has been reviewed by product owner

### Clarity & Scope

- [ ] Story is small enough to complete in one sprint (≤8 story points)
- [ ] Story has no unresolved questions or ambiguities
- [ ] Technical approach is understood by the team
- [ ] Dependencies on other stories are documented and resolved

### Priority & Estimation

- [ ] Priority label assigned (P0/P1/P2/P3)
- [ ] Story points estimated by the team
- [ ] Story is in the sprint backlog

### Resources

- [ ] Necessary design mockups available (if UI-related)
- [ ] API documentation available (if integration-related)
- [ ] Technical specifications available (if complex)

### Readiness Checklist Summary

| Category      | Required Items                               | Status    |
| ------------- | -------------------------------------------- | --------- |
| Story Quality | Format, INVEST, Acceptance Criteria, Persona | ☐ All met |
| Clarity       | Scope defined, No blockers, Tech approach    | ☐ All met |
| Priority      | Label, Points, Backlog position              | ☐ All met |
| Resources     | Mockups, Docs, Specs                         | ☐ All met |

**A story should NOT be pulled into a sprint if any Required item is missing.**

---

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

## Story Points Estimation Guide

### Fibonacci Scale

IdeaFlow uses the Fibonacci sequence for story point estimation:

| Points | Complexity      | Time Estimate   | Example                                         |
| ------ | --------------- | --------------- | ----------------------------------------------- |
| **1**  | Trivial         | < 1 hour        | Fix typo, add log statement                     |
| **2**  | Simple          | 1-2 hours       | Add form field, small UI tweak                  |
| **3**  | Straightforward | 2-4 hours       | Simple CRUD operation, basic validation         |
| **5**  | Medium          | 4-8 hours       | Feature with clear requirements, known patterns |
| **8**  | Complex         | 1-2 days        | Multi-component feature, some unknowns          |
| **13** | Very Complex    | 2-3 days        | Significant feature, integration required       |
| **21** | Epic            | 3-5 days        | Should be decomposed into smaller stories       |
| **?**  | Unknown         | Cannot estimate | Needs spike/research first                      |

### Estimation Considerations

When estimating story points, consider:

1. **Complexity**: How difficult is the implementation?
2. **Uncertainty**: How much is unknown about the solution?
3. **Dependencies**: Are there external dependencies?
4. **Risk**: What could go wrong?
5. **Effort**: How much work is actually required?

### Estimation Anti-Patterns

| Anti-Pattern            | Problem                         | Solution                                |
| ----------------------- | ------------------------------- | --------------------------------------- |
| Padding estimates       | Inflates velocity, hides issues | Estimate honestly, track actuals        |
| Averaging team opinions | Loses important context         | Discuss outliers, reach consensus       |
| Ignoring tech debt      | Accumulates over time           | Include refactoring in estimates        |
| One-person estimation   | Missing perspectives            | Use planning poker with team            |
| Perfect precision       | Wastes time on false precision  | Use relative sizing, accept uncertainty |

### Planning Poker Process

1. **Read Story**: Product owner reads the user story
2. **Discuss**: Team asks clarifying questions
3. **Estimate**: Each member selects a card privately
4. **Reveal**: All cards revealed simultaneously
5. **Discuss Outliers**: High/low estimates explain reasoning
6. **Consensus**: Re-vote until consensus (or accept majority)

### Quick Estimation Checklist

- [ ] Story meets INVEST criteria
- [ ] Acceptance criteria are clear
- [ ] Technical approach is understood
- [ ] Dependencies are identified
- [ ] Similar stories have been estimated before (for reference)
- [ ] Team has necessary skills/knowledge

### Velocity Tracking

Track team velocity to improve estimation accuracy:

```
Velocity = Total Story Points Completed / Sprint
```

| Metric                     | Purpose                        |
| -------------------------- | ------------------------------ |
| **Average Velocity**       | Sprint planning baseline       |
| **Velocity Trend**         | Team improvement over time     |
| **Commitment Reliability** | Committed vs. completed points |

---

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

## Programmatic Validation

The codebase includes built-in user story format validation that can be used programmatically:

### Available Functions

```typescript
import {
  validateUserStoryFormat,
  validateIdeaWithUserStory,
} from '@/lib/validation';

// Validate user story format only
const result = validateUserStoryFormat(ideaText, { strict: true });

// Validate idea with user story format
const result = validateIdeaWithUserStory(ideaText, {
  validateUserStory: true,
  strictUserStory: true,
});
```

### Validation Result

```typescript
interface UserStoryValidationResult {
  valid: boolean;
  errors: ValidationError[];
  persona?: string; // Extracted persona if valid
  goal?: string; // Extracted goal if valid
  benefit?: string; // Extracted benefit if valid
  suggestions?: string[]; // Improvement suggestions
  isPartial?: boolean; // True if partially matches format
}
```

### Configuration

User story validation is controlled by environment variable:

- `USER_STORY_FORMAT_VALIDATION_ENABLED`: Set to `true` to enable format validation (default: `false` for backward compatibility)

The validation uses patterns defined in `src/lib/config/constants.ts` under `USER_STORY_CONFIG`.

## Related Documentation

- [Blueprint Template](./templates/blueprint_template.md) - For project blueprints
- [Tasks Template](./templates/tasks_template.md) - For task breakdown
- [Roadmap Template](./templates/roadmap_template.md) - For project roadmaps
- [Feature Guide](./feature.md) - For feature requests
- [Bug Guide](./bug.md) - For bug reports

---

_Maintained by the User Story Engineer specialist._
