# US-AUTH-003: Password Reset

## Story Metadata

- **Story ID**: US-AUTH-003
- **Title**: Self-Service Password Reset
- **Priority**: P1 (Should Have)
- **Story Points**: 2
- **Epic**: Authentication Flow
- **Sprint**: Phase 1 MVP or Post-MVP
- **Related Issues**: #1177 (Closed), #1176

## User Story

```
As a startup founder,
I want to reset my password if I forget it,
So that I can regain access to my account without contacting support.
```

## Acceptance Criteria

### Scenario 1: Request Password Reset

```gherkin
Given I am on the login page
And I click "Forgot password?"
When I enter my email "founder@startup.com"
And I click the "Send Reset Link" button
Then I should see a message "Check your email for password reset instructions"
And I should receive a password reset email within 2 minutes
And the reset link should expire after 1 hour
```

### Scenario 2: Reset Password via Email Link

```gherkin
Given I have received a password reset email
When I click the reset link
Then I should be redirected to the reset password page
And I should see a form to enter my new password
And my email should be pre-filled (read-only)
```

### Scenario 3: Set New Password

```gherkin
Given I am on the reset password page
When I enter a new password "NewSecurePass456!"
And I confirm the password "NewSecurePass456!"
And I click the "Update Password" button
Then my password should be updated
And I should be redirected to the login page
And I should see a success message "Password updated! Please log in with your new password."
```

### Scenario 4: Expired Reset Link

```gherkin
Given I have a reset link that is more than 1 hour old
When I click the reset link
Then I should see an error message "This reset link has expired. Please request a new one."
And I should see a link to request a new reset email
```

### Scenario 5: Email Not Found

```gherkin
Given I am on the forgot password page
When I enter an email that doesn't exist "nonexistent@example.com"
And I click the "Send Reset Link" button
Then I should see a generic message "If an account exists with this email, you will receive reset instructions"
And no email should be sent
And no information about account existence should be revealed
```

### Checklist

- [ ] Forgot password link on login page
- [ ] Email input form with validation
- [ ] Password reset email sent via Supabase Auth
- [ ] New password form with strength requirements
- [ ] Success/error notifications
- [ ] Redirect to login after successful reset

## Technical Requirements

- [ ] Use Supabase Auth `resetPasswordForEmail()` method
- [ ] Use Supabase Auth `updateUser()` for password update
- [ ] Reset link expiration: 1 hour
- [ ] Same password validation as signup
- [ ] Log password reset attempts

### Technical Notes

- Redirect URL: `{BASE_URL}/auth/reset-password`
- Token validation handled by Supabase
- Consider rate limiting password reset requests (max 3 per email per hour)
- Email should use IdeaFlow branding

## Dependencies

### Depends On

- [ ] US-AUTH-001: User Signup (requires user accounts)
- [ ] Supabase email templates configured

### Blocks

- None (non-blocking, recovery feature)

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for reset form validation
- [ ] Integration tests for reset flow
- [ ] E2E test for happy path
- [ ] Expiration handling verified

### Documentation

- [ ] Auth flow documented
- [ ] User-facing help text added

### Security

- [ ] No account enumeration in error messages
- [ ] Reset token single-use
- [ ] Password requirements enforced
- [ ] Security review completed

## Resources

- [Supabase Password Reset Guide](https://supabase.com/docs/guides/auth/auth-flow#password-reset)
- [User Story Engineer Guide](../../user-story-engineer.md)
- [User Personas](../personas.md)

## Implementation Notes

- Could be implemented post-MVP if time constrained
- Consider adding security notification email when password is changed
- Mobile-friendly reset form is essential

## Questions / Clarifications

| Question                    | Answer                                     | Date       |
| --------------------------- | ------------------------------------------ | ---------- |
| Reset link expiration time? | 1 hour                                     | 2026-02-19 |
| Can this be post-MVP?       | Yes, but recommended for MVP for better UX | 2026-02-19 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-19 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
