# Git Commit Message Standards

## Overview

AI-optimized git commit message standards that ensure clarity, consistency, and automation compatibility. Designed for both human readability and AI processing.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without behavior change
- **perf**: Performance improvements
- **test**: Adding or correcting tests
- **chore**: Build process, dependencies, etc.
- **ci**: CI/CD changes
- **security**: Security-related changes

## Subject Line Rules

1. Use imperative mood ("Add feature" not "Added feature")
2. Don't capitalize first letter
3. No period at the end
4. Maximum 50 characters
5. Describe what the commit does, not what it did

## Body Rules

1. Separate from subject with blank line
2. Explain what and why, not how
3. Wrap at 72 characters
4. Use bullet points for multiple changes
5. Reference issues and PRs

## Examples

### Good Examples

```
feat(auth): add OAuth2 integration

- Implement Google and GitHub OAuth
- Add token refresh mechanism
- Update user model with OAuth fields

Closes #123
```

```
fix(api): handle null response from database

Add null check before processing query results
to prevent TypeError in production.

Fixes #456
```

```
refactor(utils): extract validation logic

Move input validation from controllers to
dedicated validation utilities for better
separation of concerns and reusability.
```

### Bad Examples

```
Fixed bug                    # Missing type, past tense
```

```
feat: Added new feature      # Past tense, capitalized
```

```
update                       # No type, too vague
```

## Scopes

Common scopes for this project:

- `api`: API endpoints
- `ui`: User interface
- `auth`: Authentication
- `db`: Database
- `test`: Tests
- `ci`: CI/CD
- `docs`: Documentation
- `config`: Configuration

## Footers

### Breaking Changes

```
BREAKING CHANGE: API response format changed
```

### Issue References

```
Closes #123
Fixes #456
Relates to #789
```

### Co-authors

```
Co-authored-by: Name <email@example.com>
```

## AI Integration

### Automated Generation

AI can generate commit messages based on:

- Changed files
- Diff analysis
- PR description
- Issue context

### Validation

- Check format compliance
- Verify type validity
- Ensure subject clarity
- Validate issue references

### Best Practices for AI

1. **Analyze the full diff**: Understand all changes
2. **Group related changes**: Separate unrelated changes
3. **Focus on intent**: What is the purpose?
4. **Be specific**: Avoid vague descriptions
5. **Reference context**: Link to issues/PRs

## Integration with CMZ

- **Self-Learn**: Improve message quality over time
- **Self-Heal**: Fix commit message issues automatically
- **Git Master Skill**: Enforce standards in git operations
- **Workflow Integration**: Validate before commit

## Tools and Automation

### Commitlint

Validate commit messages:

```bash
commitlint --from=HEAD~1 --to=HEAD
```

### Husky

Pre-commit hook:

```bash
#!/bin/sh
.commit-msg $1
```

### AI Generation Script

```bash
#!/bin/bash
# Generate commit message from diff
git diff --cached | opencode generate-commit-message
```

## Checklist

- [ ] Type is appropriate
- [ ] Scope is specified (if applicable)
- [ ] Subject is clear and concise
- [ ] Body explains motivation (if needed)
- [ ] Breaking changes are marked
- [ ] Issues are referenced
- [ ] No spelling errors
- [ ] Imperative mood used
