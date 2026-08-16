---
name: repo-maintenance
description: Proactive repository maintenance and cleanup. Use when repository needs cleanup, dead code removal, dependency updates, or general maintenance to keep the codebase healthy.
metadata:
  author: RepoKeeper
  version: '1.0.0'
  category: maintenance
  triggers:
    - repo maintenance
    - repository cleanup
    - clean up repo
    - dead code removal
    - dependency updates
    - stale branches
    - repo health
---

# Repo Maintenance Skill

Proactive repository maintenance and cleanup to keep the codebase healthy, efficient, and well-organized.

## When to Use

- Repository cleanup and organization
- Dead code removal
- Dependency updates
- Stale branch cleanup
- Documentation updates
- Repository health checks

## Maintenance Checklist

### 1. File Cleanup

- [ ] Remove temporary files (*.tmp, *.bak, *.orig, *.log)
- [ ] Remove editor artifacts (*.swp, *.swo, *~, .DS_Store, Thumbs.db)
- [ ] Remove debug logs and local environment files
- [ ] Remove unused dependencies
- [ ] Clean up build artifacts

### 2. Branch Maintenance

- [ ] Identify stale branches (no commits in 30+ days)
- [ ] Identify merged branches (already merged into main)
- [ ] Create cleanup PR for branch deletion

### 3. Documentation Updates

- [ ] Verify documentation index is up to date
- [ ] Check for orphaned documentation files
- [ ] Update README if needed
- [ ] Validate documentation links

### 4. Code Quality

- [ ] Run linting and type checks
- [ ] Run test suite
- [ ] Check for circular dependencies
- [ ] Verify build succeeds

### 5. Dependency Health

- [ ] Check for outdated dependencies
- [ ] Review security advisories
- [ ] Update lock files if needed

## Workflow

1. **Create maintenance branch**: `repokeeper/maintenance-YYYYMMDD-HHMM`
2. **Perform cleanup tasks**
3. **Run quality checks**: `npm run check`
4. **Create PR with summary**
5. **Document changes in maintenance report**

## Output Format

After completing maintenance, create a report in `docs/maintenance/` with:

- Summary of changes
- Files cleaned up
- Branches identified for cleanup
- Any issues found
- Recommendations

## Anti-Patterns

- Never delete files without verifying they're unused
- Never force push to main
- Never skip quality checks
- Always create PRs for changes
- Document all changes
