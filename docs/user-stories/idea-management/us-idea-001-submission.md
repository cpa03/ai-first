# US-IDEA-001: Idea Submission

## Story Metadata

- **Story ID**: US-IDEA-001
- **Status**: In Progress (85%)
- **Title**: Idea Submission with Clarification
- **Priority**: P0 (Must Have)
- **Story Points**: 5
- **Epic**: Idea Management
- **Sprint**: Phase 1 MVP
- **Related Issues**: #205, #219, #638

## User Story

```
As a startup founder,
I want to submit my raw idea and receive clarifying questions,
So that my idea is refined into a structured, actionable plan.
```

## Acceptance Criteria

### Scenario 1: Successful Idea Submission

```gherkin
Given I am on the home page
When I enter my idea "Build a mobile app for tracking personal finances"
And I click the "Submit" button
Then I should see a clarification flow with targeted questions
And I should see a progress indicator showing the current step
And my idea should be saved with status "clarifying"
```

### Scenario 2: Clarification Questions Display

```gherkin
Given I have submitted an idea
When the clarification flow starts
Then I should see 3-5 relevant questions about my idea
And each question should have a clear input field
And I should see "Skip" and "Next" buttons for navigation
```

### Scenario 3: Empty Idea Rejection

```gherkin
Given I am on the home page
When I leave the idea field empty
And I click the "Submit" button
Then I should see an error message "Please describe your idea"
And the submit button should remain disabled until valid input
```

### Scenario 4: Idea Too Short Warning

```gherkin
Given I am on the home page
When I enter an idea with less than 10 characters
And I click the "Submit" button
Then I should see a warning "Please provide more detail about your idea"
And I should be allowed to proceed but with a confirmation prompt
```

### Checklist

- [ ] Idea input textarea with placeholder text
- [ ] Character count indicator (min 10, max 5000)
- [ ] Submit button with loading state
- [ ] Clarification flow triggered after submission
- [ ] Auto-save draft functionality
- [ ] Progress indicator for clarification steps

## Technical Requirements

- [ ] Store idea in Supabase `ideas` table
- [ ] Set initial status to "clarifying"
- [ ] Generate unique idea ID (UUID)
- [ ] Trigger clarification agent via API
- [ ] Implement optimistic UI updates

### Technical Notes

- Use React Hook Form for form validation
- Debounce auto-save to prevent excessive API calls
- Store drafts in localStorage as backup
- Rate limit submissions: max 10 ideas per user per day

## Dependencies

### Depends On

- [ ] Supabase database configured
- [ ] Clarification agent API endpoint `/api/clarify`

### Blocks

- [ ] US-BREAKDOWN-001: Breakdown Engine (requires clarified idea)
- [ ] US-IDEA-002: Idea Dashboard
- [ ] All export features

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for form validation
- [ ] Integration tests for submission flow
- [ ] E2E test for happy path
- [ ] All acceptance criteria verified

### Documentation

- [ ] API documentation updated
- [ ] Component props documented

### Security

- [ ] Input sanitization for XSS prevention
- [ ] Rate limiting verified
- [ ] No sensitive data logged

## Resources

- [Clarification Agent Documentation](../../../src/lib/prompts/clarifier/)
- [API Reference](../../api.md)
- [User Personas](../personas.md)

## Implementation Notes

- Consider adding example ideas as placeholder inspiration
- Show estimated time for clarification completion
- Add "Save as Draft" option for unfinished ideas
- Consider voice-to-text input for accessibility

## Questions / Clarifications

| Question                                   | Answer                            | Date       |
| ------------------------------------------ | --------------------------------- | ---------- |
| Should unauthenticated users submit ideas? | No, require login for MVP         | 2026-02-19 |
| What's the maximum idea length?            | 5000 characters                   | 2026-02-19 |
| Should we support markdown in idea input?  | No, plain text for MVP simplicity | 2026-02-19 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-19 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
