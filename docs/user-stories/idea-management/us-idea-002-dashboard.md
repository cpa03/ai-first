# US-IDEA-002: Idea Dashboard

## Story Metadata

- **Story ID**: US-IDEA-002
- **Title**: Idea Dashboard for Viewing and Managing Ideas
- **Priority**: P0 (Must Have)
- **Story Points**: 5
- **Epic**: Idea Management
- **Sprint**: Phase 1 MVP
- **Related Issues**: #205, #1176
- **Implementation Status**: Ready (90% complete)

## User Story

```
As a startup founder,
I want to view all my ideas in one place and manage them easily,
So that I can track progress and quickly continue working on any idea.
```

## Acceptance Criteria

### Scenario 1: View Ideas List

```gherkin
Given I am logged in and have existing ideas
When I navigate to the dashboard page
Then I should see a list of all my ideas with title, status, and created date
And I should see the total count of ideas
And the list should be sorted by most recently updated
```

### Scenario 2: Filter by Status

```gherkin
Given I am on the dashboard page with multiple ideas
When I select "Completed" from the status filter dropdown
Then I should only see ideas with status "completed"
And the filter should apply immediately without page reload
And the total count should reflect the filtered results
```

### Scenario 3: Continue Working on Idea

```gherkin
Given I am on the dashboard page with an idea in "draft" status
When I click the "Continue" link for that idea
Then I should be redirected to the clarify page with the idea pre-loaded
And I should be able to continue from where I left off
```

### Scenario 4: View Completed Blueprint

```gherkin
Given I am on the dashboard page with a completed idea
When I click the "View" link for that idea
Then I should be redirected to the results page showing the full blueprint
And I should see all deliverables and tasks
```

### Scenario 5: Delete Idea with Confirmation

```gherkin
Given I am on the dashboard page with an existing idea
When I click the "Delete" button for that idea
Then I should see a confirmation modal with the idea title
And the modal should have "Cancel" and "Delete" buttons
And pressing Escape should close the modal
And clicking outside the modal should close it
```

### Scenario 6: Confirm Deletion

```gherkin
Given the delete confirmation modal is open
When I click the "Delete Idea" button
Then the idea should be removed from the list
And the modal should close
And I should see the updated idea count
And the idea should be permanently deleted from the database
```

### Scenario 7: Empty State

```gherkin
Given I am logged in but have no ideas
When I navigate to the dashboard page
Then I should see an empty state message "No ideas yet"
And I should see a "Create Your First Idea" button
And clicking the button should navigate to the home page
```

### Scenario 8: Unauthenticated Access

```gherkin
Given I am not logged in
When I navigate to the dashboard page
Then I should see an error message "Please sign in to view your ideas"
And I should not see any ideas list
And I should see a "Try Again" button
```

### Checklist

- [x] Ideas list with title, status, created date
- [x] Status badges with color coding (draft, clarified, breakdown, completed)
- [x] Status filter dropdown (All, Draft, Clarified, In Progress, Completed)
- [x] Total idea count display
- [x] "New Idea" button linking to home page
- [x] "Continue" link for each idea (navigates to clarify page)
- [x] "View" link for each idea (navigates to results page)
- [x] "Delete" button with confirmation modal
- [x] Empty state with "Create Your First Idea" CTA
- [x] Authentication check with appropriate error message
- [x] Loading state while fetching ideas
- [x] Error handling with retry option

## Technical Requirements

- [x] Fetch ideas from `/api/ideas` endpoint
- [x] Filter by status via query parameter
- [x] Delete via `/api/ideas/{id}` DELETE endpoint
- [x] Use `useAuthCheck` hook for authentication
- [x] Implement focus management for delete modal
- [x] Focus trap within modal for accessibility
- [x] Optimistic UI updates where appropriate

### Technical Notes

- Uses React `useState`, `useEffect`, `useCallback`, `useRef` hooks
- Status colors: draft (gray), clarified (blue), breakdown (yellow), completed (green)
- Modal implements WCAG 2.1 focus management requirements
- Pagination supported via `limit` and `offset` query parameters
- Character limit for titles enforced at API level

## Dependencies

### Depends On

- [x] US-AUTH-002: User Login (requires authentication)
- [x] US-IDEA-001: Idea Submission (ideas must exist to display)
- [x] `/api/ideas` endpoint for fetching and deleting

### Blocks

- None (dashboard is a view-only feature)

## Definition of Done

### Code Quality

- [x] Code follows style guidelines (ESLint/Prettier)
- [x] Code reviewed by at least one team member
- [x] No TypeScript errors
- [x] No linting warnings

### Testing

- [x] Unit tests for component rendering
- [x] Integration tests for API interactions
- [x] E2E test for delete flow with modal
- [x] Accessibility tests for focus management
- [x] All acceptance criteria verified

### Documentation

- [x] Component documented with props
- [x] API integration documented

### Security

- [x] Authentication required for all operations
- [x] User can only see/delete their own ideas (RLS)
- [x] CSRF protection on delete endpoint
- [x] No sensitive data exposed in client-side code

### Accessibility

- [x] Keyboard navigation supported
- [x] Focus trap in modal
- [x] ARIA labels on interactive elements
- [x] Screen reader announcements for status changes
- [x] Escape key closes modal

## Resources

- [Dashboard Page Implementation](../../../src/app/dashboard/page.tsx)
- [API Reference: /api/ideas](../../api.md)
- [User Personas](../personas.md)
- [User Story Engineer Guide](../../user-story-engineer.md)

## Implementation Notes

- Current implementation at 90% - fully functional for MVP
- Consider adding search functionality in Phase 2
- Consider adding bulk operations (archive, export) in Phase 2
- Consider adding sorting options (by date, by status, alphabetically) in Phase 2
- Consider adding infinite scroll for large idea lists

## Questions / Clarifications

| Question                                    | Answer                                             | Date       |
| ------------------------------------------- | -------------------------------------------------- | ---------- |
| Should users be able to edit idea titles?   | No, for MVP the title is derived from idea content | 2026-02-21 |
| Should there be a limit on ideas per user?  | No hard limit for MVP                              | 2026-02-21 |
| Should deleted ideas go to a trash/archive? | No, permanent deletion for MVP simplicity          | 2026-02-21 |
| Should pagination be visible?               | Not for MVP - using default limit                  | 2026-02-21 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-21 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
