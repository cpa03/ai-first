# JH|# US-GROWTH-002: Referral Link for Viral Growth

## Story Metadata

- **Story ID**: US-GROWTH-002
- **Status**: Ready
- **Title**: Referral Link for Viral Growth
- **Priority**: P2 (Could Have)
- **Story Points**: 3
- **Epic**: Growth & Viral Loops
- **Sprint**: Phase 1.5
- **Related Issues**: #1883

## User Story

```
As a startup founder,
I want to share my unique referral link with friends and colleagues,
So that I can earn rewards when they sign up and try IdeaFlow.
```

## Acceptance Criteria

### Scenario 1: View Referral Link

```gherkin
Given I am a logged-in user with a referral code
When I navigate to the referral section (dashboard or settings)
Then I should see my unique referral link displayed
And the link should be in the format: "{baseUrl}/signup?ref={referralCode}"
```

### Scenario 2: Copy Referral Link

```gherkin
Given I am viewing my referral link
When I click the "Copy" button
Then the referral link should be copied to my clipboard
And I should see a success toast message "Referral link copied!"
```

### Scenario 3: Referral Link Tracking

```gherkin
Given I view or copy my referral link
When the action completes
Then the event should be tracked for analytics
```

### Scenario 4: Referral Signup Flow

```gherkin
Given a new user clicks on a referral link
When they arrive at the signup page
Then the referral code should be captured in the signup flow
And the referrer should be credited after the new user completes signup
```

### Scenario 5: Referral Link Display

```gherkin
Given I am viewing my referral link
Then the display should show:
  | Element              | Description                    |
  | ------------------- | ------------------------------ |
  | Heading             | "Share Your Referral Link"    |
  | Subtitle           | "Invite friends and earn..."  |
  | Referral URL        | Full URL with ref parameter   |
  | Copy Button         | Icon button to copy link      |
  | Visual Icon         | Team/users illustration       |
```

### Checklist

- [ ] Referral link component on dashboard/settings
- [ ] Unique referral code per user
- [ ] Copy to clipboard functionality
- [ ] Success toast notification
- [ ] View and copy event tracking
- [ ] Referral code captured in signup
- [ ] Responsive design (mobile-friendly)
- [ ] Accessibility (aria-labels, keyboard navigation)

## Technical Requirements

- [ ] Generate unique referral code for each user (e.g., user ID or UUID)
- [ ] Referral code stored in user profile
- [ ] URL format: `{baseUrl}/signup?ref={referralCode}`
- [ ] CopyButton component integration
- [ ] Analytics tracking for view and copy events

### Component Implementation

- Use existing `ReferralLink` component from `src/components/ReferralLink.tsx`
- Configurable base URL
- Callbacks: `onView`, `onCopy` for analytics

### Technical Notes

- The ReferralLink component already exists at `src/components/ReferralLink.tsx`
- Growth analytics integration points: `onView`, `onCopy` callbacks
- Referral code stored in database user table
- Signup flow needs to capture `?ref=` query parameter

## Dependencies

### Depends On

- [ ] US-AUTH-001: User Signup
- [ ] US-AUTH-002: User Login
- [ ] US-IDEA-002: Idea Dashboard

### Blocks

- None

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for ReferralLink component
- [ ] Integration test for referral code capture in signup
- [ ] All acceptance criteria verified

### Documentation

- [ ] Referral feature documented in user guide
- [ ] Growth analytics documented

### Security

- [ ] Referral codes are unique and not guessable
- [ ] No PII exposed in referral URL

## Resources

- [ReferralLink Component](./src/components/ReferralLink.tsx)
- [User Story Engineer Guide](../../user-story-engineer.md)
- [User Personas](../personas.md)

## Implementation Notes

- The ReferralLink is already implemented in PR #1883
- This user story documents the existing implementation for completeness
- Future: Referral rewards system (discounts, premium features)
- Future: Referral analytics dashboard (clicks, conversions, rewards)
- Future: Social sharing pre-filled with referral link

## Questions / Clarifications

| Question                         | Answer                      | Date       |
| -------------------------------- | --------------------------- | ---------- |
| What rewards should be offered?  | To be determined (Phase 2)  | 2026-02-26 |
| How to prevent referral fraud?   | Email verification required | 2026-02-26 |
| Track referral source in signup? | Yes, capture ref parameter  | 2026-02-26 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-26 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
