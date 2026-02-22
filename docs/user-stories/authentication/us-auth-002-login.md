# US-AUTH-002: User Login

## Story Metadata

 **Story ID**: US-AUTH-002
 **Title**: User Login with Error Handling
 **Status**: Done ✅
 **Implementation**: 100%
- **Epic**: Authentication Flow
- **Sprint**: Phase 1 MVP
- **Related Issues**: #1177 (Closed), #1176

## User Story

```
As a startup founder,
I want to log in to my account using my email and password,
So that I can access my saved ideas and continue planning my projects.
```

## Acceptance Criteria

### Scenario 1: Successful Login

```gherkin
Given I am on the login page
And I have a verified account with email "founder@startup.com"
When I enter my email "founder@startup.com"
And I enter my correct password "SecurePass123!"
And I click the "Log In" button
Then I should be redirected to my dashboard
And I should see a welcome message "Welcome back!"
And my session should be active for 7 days
```

### Scenario 2: Invalid Credentials

```gherkin
Given I am on the login page
When I enter email "founder@startup.com"
And I enter an incorrect password "WrongPassword"
And I click the "Log In" button
Then I should see an error message "Invalid email or password"
And I should remain on the login page
And the password field should be cleared
```

### Scenario 3: Unverified Email

```gherkin
Given I have an unverified account with email "unverified@startup.com"
When I try to log in with correct credentials
Then I should see an error message "Please verify your email before logging in"
And I should see a "Resend verification email" link
```

### Scenario 4: Rate Limiting

```gherkin
Given I have failed to log in 5 times in the last 15 minutes
When I try to log in again
Then I should see an error message "Too many login attempts. Please try again in 15 minutes."
And the login form should be temporarily disabled
```

### Checklist

 [x] Login form with email and password fields
 [x] "Remember me" checkbox for extended session
 [x] "Forgot password?" link
 [x] Clear error messages for each failure case
 [x] Session persistence across browser refresh
 [x] Redirect to originally requested page after login

## Technical Requirements

- [ ] Use Supabase Auth `signInWithPassword()` method
- [ ] Store session in HTTP-only cookie
- [ ] Session duration: 7 days (configurable)
- [ ] Rate limiting: max 5 failed attempts per email per 15 minutes
- [ ] Log login attempts for security auditing

### Technical Notes

- Session token stored in Supabase-managed cookie
- Use `supabase.auth.getSession()` to check auth state
- Implement `useAuth` hook for client components
- Redirect URL stored in `nextUrl` query param for deep linking

## Dependencies

### Depends On

- [ ] US-AUTH-001: User Signup (requires verified users)
- [ ] Supabase project configured

### Blocks

- [ ] All authenticated features

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for login form
- [ ] Integration tests for login flow
- [ ] E2E test for happy path
- [ ] Rate limiting verified

### Documentation

- [ ] API documentation updated
- [ ] Auth flow documented in README

### Security

- [ ] No sensitive data in logs
- [ ] CSRF protection verified
- [ ] Session cookie flags: HttpOnly, Secure, SameSite

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [User Story Engineer Guide](../../user-story-engineer.md)
- [User Personas](../personas.md)

## Implementation Notes

- Consider adding "Log in with Google" button (Phase 2)
- Add loading state during authentication
- Focus email field on page load

## Questions / Clarifications

| Question                                            | Answer                  | Date       |
| --------------------------------------------------- | ----------------------- | ---------- |
| Should we show specific error for unverified email? | Yes, with resend option | 2026-02-19 |
| Session duration?                                   | 7 days, refreshable     | 2026-02-19 |

## History

| Date       | Action                        | Author              |
| ---------- | ----------------------------- | ------------------- |
| 2026-02-19 | Story created                 | User Story Engineer |
| 2026-02-22 | Status updated to Done (100%) | User Story Engineer |
---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
