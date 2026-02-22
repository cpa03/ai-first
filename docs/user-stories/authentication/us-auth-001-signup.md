# US-AUTH-001: User Signup

## Story Metadata

- **Story ID**: US-AUTH-001
- **Title**: User Signup with Email Verification
- **Priority**: P0 (Must Have)
- **Story Points**: 3
- **Epic**: Authentication Flow
- **Sprint**: Phase 1 MVP
- **Related Issues**: #1177 (Closed), #1176

## User Story

```
As a startup founder,
I want to create an account using my email and password,
So that I can save my ideas and plans securely with personalized access.
```

## Acceptance Criteria

### Scenario 1: Successful Signup

```gherkin
Given I am on the signup page
When I enter a valid email address "founder@startup.com"
And I enter a secure password "SecurePass123!"
And I click the "Create Account" button
Then I should receive a verification email within 2 minutes
And I should see a message "Check your email to verify your account"
And I should not be logged in until I verify my email
```

### Scenario 2: Email Verification

```gherkin
Given I have received a verification email
When I click the verification link in the email
Then I should be redirected to the login page
And I should see a success message "Email verified! You can now log in"
And my account status should be "verified"
```

### Scenario 3: Duplicate Email

```gherkin
Given an account already exists with email "founder@startup.com"
When I try to sign up with the same email
Then I should see an error message "An account with this email already exists"
And the signup form should remain on the page
```

### Scenario 4: Weak Password

```gherkin
Given I am on the signup page
When I enter email "new@user.com"
And I enter a weak password "password123"
And I click the "Create Account" button
Then I should see an error message "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
And the account should not be created
```

### Checklist

- [ ] Signup form with email and password fields
- [ ] Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
- [ ] Email format validation
- [ ] Duplicate email detection
- [ ] Verification email sent via Supabase Auth
- [ ] Success/error toast notifications
- [ ] Redirect to login after verification

## Technical Requirements

- [ ] Use Supabase Auth `signUp()` method
- [ ] Email verification redirect URL configured
- [ ] Password requirements enforced client-side and server-side
- [ ] Rate limiting on signup endpoint (max 5 attempts per IP per hour)
- [ ] Log signup attempts for security auditing

### Technical Notes

- Supabase handles email sending and verification tokens
- Configure redirect URL in Supabase dashboard: `{BASE_URL}/auth/callback`
- Password validation regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`
- Consider adding CAPTCHA for production (Phase 2)

## Dependencies

### Depends On

- [ ] Supabase project configured with email auth enabled
- [ ] Email templates customized for IdeaFlow branding

### Blocks

- [ ] US-AUTH-002: User Login (requires verified users)
- [ ] All personalized features (ideas, plans, exports)

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for form validation
- [ ] Integration tests for signup flow
- [ ] E2E test for happy path
- [ ] All acceptance criteria verified

### Documentation

- [ ] API documentation updated
- [ ] README updated with auth flow description

### Security

- [ ] Password never logged or exposed
- [ ] CSRF protection on signup form
- [ ] Rate limiting verified working
- [ ] Security review completed

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [User Story Engineer Guide](../../user-story-engineer.md)
- [User Personas](../personas.md)

## Implementation Notes

- Consider adding Google OAuth as an alternative signup method (Phase 2)
- Email verification timeout should be 24 hours
- Account deletion should be supported for GDPR compliance

## Questions / Clarifications

| Question                                 | Answer                            | Date       |
| ---------------------------------------- | --------------------------------- | ---------- |
| Should we support username-based signup? | No, email-only for MVP simplicity | 2026-02-19 |
| What's the email verification timeout?   | 24 hours                          | 2026-02-19 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-19 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
