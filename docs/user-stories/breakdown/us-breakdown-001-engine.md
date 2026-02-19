# US-BREAKDOWN-001: Automatic Breakdown Engine

## Story Metadata

- **Story ID**: US-BREAKDOWN-001
- **Title**: Automatic Idea Breakdown into Tasks
- **Priority**: P0 (Must Have)
- **Story Points**: 8
- **Epic**: Breakdown System
- **Sprint**: Phase 1 MVP
- **Related Issues**: #721, #747

## User Story

```
As a startup founder,
I want my refined idea to be automatically broken down into prioritized tasks,
So that I can start implementation with a clear action plan.
```

## Acceptance Criteria

### Scenario 1: Successful Breakdown Generation

```gherkin
Given I have completed the clarification flow for my idea
When I click the "Generate Plan" button
Then I should see a breakdown result within 30 seconds
And I should see a prioritized list of tasks grouped by deliverable
And each task should have an estimated effort (story points)
And I should see a total timeline estimate
```

### Scenario 2: Task Hierarchy Display

```gherkin
Given I have a generated breakdown
When I view the results
Then I should see tasks organized by deliverable
And each deliverable should show its associated tasks
And tasks should show priority (P0/P1/P2)
And dependencies between tasks should be visible
```

### Scenario 3: Breakdown Progress Indication

```gherkin
Given I have clicked "Generate Plan"
When the breakdown is in progress
Then I should see a progress indicator with estimated time
And I should see which step is currently processing
And I should be able to cancel the operation
```

### Scenario 4: Breakdown Error Handling

```gherkin
Given the AI service is unavailable
When I try to generate a breakdown
Then I should see an error message "Unable to generate plan. Please try again."
And I should see a "Retry" button
And my idea should be preserved for retry
And the error should be logged for debugging
```

### Scenario 5: Task Reordering

```gherkin
Given I have a generated breakdown
When I drag and drop a task to a different position
Then the task order should be updated
And dependencies should be re-validated
And a warning should appear if dependencies are violated
```

### Checklist

- [ ] "Generate Plan" button with loading state
- [ ] Progress indicator during breakdown
- [ ] Task list with priority badges
- [ ] Deliverable grouping with collapse/expand
- [ ] Dependency visualization
- [ ] Timeline estimate display
- [ ] Retry functionality on error

## Technical Requirements

- [ ] Integrate with Breakdown Engine (`src/lib/agents/breakdown-engine.ts`)
- [ ] Use IdeaAnalyzer, TaskDecomposer, DependencyAnalyzer, TimelineGenerator
- [ ] Implement streaming response for progress updates
- [ ] Store breakdown results in Supabase
- [ ] Cache breakdown results to prevent regeneration

### Technical Notes

- Breakdown should use both rule-based and LLM-assisted approaches
- Estimated effort uses Fibonacci sequence: 1, 2, 3, 5, 8, 13
- Timeline generator uses historical data for accuracy
- Consider implementing partial results for long breakdowns

## Dependencies

### Depends On

- [ ] US-IDEA-001: Idea Submission (requires clarified idea)
- [ ] Clarification flow completed
- [ ] AI provider API access (OpenAI/Anthropic)

### Blocks

- [ ] US-EXPORT-001: Markdown Export (requires breakdown)
- [ ] US-IDEA-002: Idea Dashboard (displays breakdown)
- [ ] All export connectors

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for breakdown components
- [ ] Integration tests for breakdown API
- [ ] E2E test for full breakdown flow
- [ ] Performance test for response time (< 30s)
- [ ] All acceptance criteria verified

### Documentation

- [ ] Breakdown engine architecture documented
- [ ] API endpoint documented
- [ ] Component props documented

### Security

- [ ] Rate limiting on breakdown API
- [ ] Input validation for idea content
- [ ] No sensitive data in error messages

## Resources

- [Breakdown Engine Architecture](../../breakdown-engine-architecture.md)
- [API Reference: /api/breakdown](../../api.md)
- [User Personas](../personas.md)

## Implementation Notes

- Consider showing intermediate results as they're generated
- Add "Refine Breakdown" option for manual adjustments
- Implement task templates for common patterns
- Add export preview before final export

## Questions / Clarifications

| Question                                          | Answer                          | Date       |
| ------------------------------------------------- | ------------------------------- | ---------- |
| What's the maximum number of tasks per breakdown? | 50 tasks for MVP                | 2026-02-19 |
| Should breakdown be editable?                     | Yes, after generation           | 2026-02-19 |
| What happens if breakdown takes too long?         | Show partial results + continue | 2026-02-19 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-19 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
