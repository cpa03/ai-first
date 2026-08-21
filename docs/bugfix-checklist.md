# Bugfix Checklist

Use this checklist when creating bugfix PRs to ensure all requirements are met.

## Before Starting

- [ ] Identify the root cause of the bug
- [ ] Check if fix already exists in another branch
- [ ] Create bugfix branch from main
- [ ] Branch naming: `bugfix/<issue-number>-<short-description>-<YYYYMMDD>`

## During Implementation

- [ ] Follow TypeScript strict mode
- [ ] Maintain existing test coverage
- [ ] Add tests for new functionality
- [ ] Update documentation if needed
- [ ] Follow coding conventions

## Before Submitting PR

### Code Quality

- [ ] Run `npm run lint` (0 warnings/errors)
- [ ] Run `npm run type-check` (no TypeScript errors)
- [ ] Run `npm run test:ci` (all tests pass)
- [ ] Run `npm run build` (production build succeeds)

### Security & Stability

- [ ] Run `npm run security:check` (no vulnerabilities)
- [ ] Run `npm run check:circular` (no circular dependencies)
- [ ] Run `npm run bug:scan` (comprehensive bug scan passes)

### Documentation

- [ ] Update PR template with verification results
- [ ] Add any necessary documentation updates
- [ ] Reference related issues

### Branch Management

- [ ] Ensure branch is up to date with main
- [ ] Resolve any merge conflicts
- [ ] Clean up commit history if needed

## PR Review Process

- [ ] Self-review completed
- [ ] Request review from maintainers
- [ ] Address review feedback
- [ ] Get approval from at least one reviewer

## After PR Approval

- [ ] Squash merge to main
- [ ] Delete feature branch
- [ ] Update issue status
- [ ] Document lessons learned
- [ ] Update bugfix documentation if needed

## Emergency Bugfix (Critical Issues)

For critical bugs that affect production:

1. **Immediate Actions**
   - [ ] Create bugfix branch immediately
   - [ ] Fix the issue
   - [ ] Test locally
   - [ ] Create PR with critical label

2. **Expedited Review**
   - [ ] Request emergency review
   - [ ] Get approval from at least one maintainer
   - [ ] Merge and deploy immediately

3. **Post-Fix**
   - [ ] Document the incident
   - [ ] Add monitoring/alerting if needed
   - [ ] Update bugfix documentation

## Common Bug Patterns to Check

### TypeScript Issues

- [ ] Unused variables (prefix with `_`)
- [ ] Missing type annotations
- [ ] Strict mode violations

### Async/Await Issues

- [ ] Missing error handling
- [ ] Memory leaks (missing cleanup)
- [ ] Race conditions

### Resource Management

- [ ] Proper cleanup in useEffect
- [ ] Connection closing
- [ ] Memory leak prevention

### Security Issues

- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

## Verification Commands

```bash
# Run all checks
npm run check

# Individual checks
npm run lint
npm run type-check
npm run test:ci
npm run build
npm run security:check
npm run check:circular
npm run bug:scan

# Comprehensive bug detection
./scripts/bugfixer-detect.sh
```

## Contact

For questions about the bugfix process:

- Check `docs/bugfixer-workflow.md`
- Review `.opencode/skills/` for related skills
- Contact the maintainers
