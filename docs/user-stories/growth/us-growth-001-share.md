# JH|# US-GROWTH-001: Share Results Page

## Story Metadata

- **Story ID**: US-GROWTH-001
- **Status**: Ready
- **Title**: Share Results Page
- **Priority**: P2 (Could Have)
- **Story Points**: 2
- **Epic**: Growth & Viral Loops
- **Sprint**: Phase 1.5
- **Related Issues**: #1870

## User Story

```
As a startup founder,
I want to share my project plan with others,
So that I can get feedback or showcase my ideas to investors and team members.
```

## Acceptance Criteria

### Scenario 1: Share Button on Results Page

```gherkin
Given I have completed a breakdown and am on the results page
When I click the "Share" button
Then I should see a share dialog (on mobile) or the URL should be copied to clipboard (on desktop)
And I should see a success toast notification
```

### Scenario 2: Web Share API (Mobile)

```gherkin
Given I am on a mobile device with native share capability
When I click the "Share" button
Then the native share dialog should open
And I should be able to share via messaging apps, email, or social media
```

### Scenario 3: Clipboard Fallback (Desktop)

```gherkin
Given I am on a desktop device without Web Share API
When I click the "Share" button
Then the share URL should be copied to my clipboard
And I should see a toast message "Link copied to clipboard!"
```

### Scenario 4: Share Content Customization

```gherkin
Given I am on the results page
When the share is triggered
Then the shared content should include:
  | Content       | Source                              |
  | Title         | App name (IdeaFlow)                 |
  | Text          | "Check out my project plan!"       |
  | URL           | Current results page URL           |
```

### Scenario 5: Share Analytics Tracking

```gherkin
Given I successfully share content
When the share completes
Then the share event should be tracked for analytics
```

### Checklist

- [ ] Share button on results page
- [ ] Web Share API integration for mobile
- [ ] Clipboard fallback for desktop
- [ ] Success toast notification
- [ ] Share content includes title, text, and URL
- [ ] Analytics event tracking
- [ ] Accessibility (aria-labels, keyboard navigation)

## Technical Requirements

- [ ] Use Web Share API with `navigator.share()`
- [ ] Fallback to `navigator.clipboard.writeText()` for desktop
- [ ] Haptic feedback on mobile (`navigator.vibrate()`)
- [ ] Toast notification system integration
- [ ] Analytics callback support for growth tracking

### Component Implementation

- Use existing `ShareButton` component from `src/components/ShareButton.tsx`
- Support both default and icon-only variants
- Configurable share title, text, and URL

### Technical Notes

- The ShareButton component already exists at `src/components/ShareButton.tsx`
- Growth analytics integration points: `onShare` callback
- Accessibility: Uses Tooltip component for icon-only variant

## Dependencies

### Depends On

- [ ] US-IDEA-001: Idea Submission
- [ ] US-BREAKDOWN-001: Automatic Breakdown Engine
- [ ] Results page implementation complete

### Blocks

- None

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for ShareButton component
- [ ] Integration test for share flow
- [ ] Fallback behavior verified on desktop
- [ ] All acceptance criteria verified

### Documentation

- [ ] Share feature documented in user guide
- [ ] Growth analytics documented

### Security

- [ ] No sensitive data in share URL
- [ ] Share URL properly sanitized

## Resources

- `src/components/ShareButton.tsx`
- [Web Share API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [User Story Engineer Guide](../../user-story-engineer.md)
- [User Personas](../personas.md)

## Implementation Notes

- The ShareButton is already implemented in PR #1870
- This user story documents the existing implementation for completeness
- Future: Add share analytics dashboard for growth metrics
- Future: Add referral rewards tracking

## Questions / Clarifications

| Question                        | Answer                      | Date       |
| ------------------------------- | --------------------------- | ---------- |
| Should we track which platform? | Yes, in analytics (Phase 2) | 2026-02-26 |
| Is there a character limit?     | Follow platform limits      | 2026-02-26 |
| Track shares for rewards?       | Yes, via onShare callback   | 2026-02-26 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-26 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
