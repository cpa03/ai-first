# Git Master

## Overview

Advanced git operations skill for AI agents. Provides atomic commits, intelligent branching, and conflict resolution with best practices enforcement.

## Core Capabilities

### Atomic Commits

- Commit related changes together
- Separate unrelated changes
- Clear, descriptive commit messages
- Proper staging and verification

### Branch Management

- Feature branch creation
- Clean branch naming conventions
- Synchronization with remote
- Safe branch deletion

### Conflict Resolution

- Identify conflict sources
- Resolve with context preservation
- Test after resolution
- Clean merge commits

## Commands

### Commit Workflow

```
1. Review changes: git status
2. Stage selectively: git add -p
3. Verify staged: git diff --cached
4. Commit with message: git commit -m "type(scope): subject"
5. Push to remote: git push origin branch-name
```

### Branch Workflow

```
1. Create feature branch: git checkout -b feature/name
2. Work and commit regularly
3. Sync with main: git pull origin main
4. Resolve conflicts if any
5. Push and create PR
```

### Safe Operations

- Always check status before operations
- Verify remote exists
- Confirm branch is up to date
- Check for uncommitted changes

## Best Practices

### Commit Messages

- Use conventional commits format
- Keep subject under 50 chars
- Explain what and why in body
- Reference issues when applicable

### Branch Naming

- feature/description
- bugfix/issue-description
- hotfix/critical-fix
- refactor/component-name

### Before Committing

- [ ] Tests pass
- [ ] No linting errors
- [ ] No console warnings
- [ ] Code reviewed by self
- [ ] Commit message follows standards

## Integration with CMZ

- Self-heal: Fix git issues automatically
- Self-learn: Improve git patterns over time
- Orchestration: Coordinate git ops across agents
- Git Commit Message Skill: Enforce commit standards

## Safety Rules

1. Never force push to main
2. Always pull before pushing
3. Resolve conflicts carefully
4. Verify before destructive operations
5. Keep backups of important branches
