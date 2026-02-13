# Branch Cleanup Registry

This document tracks branch cleanup activities and identifies candidates for future cleanup.

**Last Updated**: 2026-02-13

---

## Recent Cleanups

### 2026-02-13

**Deleted Branches** (merged to main):

- `brocula/console-lighthouse-optimizations-20260212-1652`
- `bugfix/pii-redaction-hyphen-keys`
- `fix/broc-console-optimization-20250212`
- `repokeeper/maintenance-20260212-2029`

### 2026-02-09

**Deleted Branches** (stale, last commit Nov 2025):

- `security-audit-vulnerabilities`
- `consolidate-duplicate-issues`
- `backend/export-connectors-enhancement`

---

## Active Branches (47 total)

### Recent Activity (2026-02-10 to 2026-02-13)

These branches have recent activity and may be active development:

| Branch                                                        | Last Update | Status    |
| ------------------------------------------------------------- | ----------- | --------- |
| `origin/repokeeper/cleanup-2026-02-13`                        | 2026-02-13  | Active    |
| `origin/fix/n1-query-pattern-947`                             | 2026-02-13  | Active    |
| `origin/main`                                                 | 2026-02-13  | Protected |
| `origin/sentinel/enhance-pii-redaction-and-security-config-*` | 2026-02-13  | Active    |
| `origin/bolt-optimize-rate-limiting-*`                        | 2026-02-13  | Active    |
| `origin/repokeeper/maintenance-20260213-0518`                 | 2026-02-13  | Active    |
| `origin/palette-task-management-a11y-fix-*`                   | 2026-02-12  | Active    |
| `origin/repokeeper/code-quality-fixes-20260212-124541`        | 2026-02-12  | Active    |
| `origin/sentinel/fix-timing-leak-auth-*`                      | 2026-02-12  | Active    |
| `origin/bolt-pii-optimization-*`                              | 2026-02-12  | Active    |
| `origin/brocula/console-fixes-20260211-1639`                  | 2026-02-11  | Active    |
| `origin/sentinel/restrict-detailed-health-*`                  | 2026-02-11  | Active    |

### Feature Categories

#### Repokeeper (Maintenance)

- `repokeeper/cleanup-2026-02-13`
- `repokeeper/maintenance-20260213-0518`
- `repokeeper/code-quality-fixes-20260212-124541`

#### Palette (UI/UX)

- `palette-task-management-a11y-fix-*`
- `palette-copy-feedback-*`
- `palette-task-delight-a11y-*`
- `palette-ux-task-mgmt-effort-aria-*`
- `palette/add-copy-to-clipboard-blueprint-*`
- `palette/keyboard-shortcuts-*`
- `palette/mobile-nav-ux-*`
- `pallete/button-focus-ring`

#### Sentinel (Security)

- `sentinel/enhance-pii-redaction-and-security-config-*`
- `sentinel/fix-timing-leak-auth-*`
- `sentinel/restrict-detailed-health-*`
- `sentinel/pii-redaction-enhancements-*`
- `sentinel/secure-logging-and-errors-*`
- `sentinel-redact-admin-keys-*`

#### Bolt (Performance)

- `bolt-optimize-rate-limiting-*`
- `bolt-pii-optimization-*`
- `bolt-optimize-interpolate-*`
- `bolt-optimize-cache-eviction-*`

#### Brocula (Console/Browser)

- `brocula/console-fixes-20260211-1639`
- `brocula/accessibility-improvements`
- `brocula/console-optimization-fixes`
- `brocula/fix-middleware-warning`

#### Bugfix

- `bugfix/fix-lint-warning-20260210-165328`
- `bugfix/fix-middleware-deprecation-warning`
- `bugfix/fix-test-and-coverage-issues`

#### Feature

- `feature/205-idea-dashboard`
- `feature/autosave-idea-input`
- `feature/task-management-api-220`
- `feature/ux-draft-indicator-20260209-020330`

#### Fix

- `fix/backend-code-quality-issues`
- `fix/cloudflare-build-config-465`
- `fix/cloudflare-build-resilience`
- `fix/cloudflare-env-validation-119`
- `fix/ip-spoofing-rate-limit`
- `fix/issue-297-auth-routes`
- `fix/issue-719-ssr-window-safety`
- `fix/n1-query-pattern-947`
- `fix/security-hardcoded-url-issue-460`
- `fix/test-mocks-pr177`

#### Flexy (Modularity)

- `flexy-modularize-hardcoded-values`

#### Reliability

- `reliability-engineer`

---

## Cleanup Recommendations

### Monthly Review Checklist

- [ ] Identify merged branches older than 1 week
- [ ] Check for abandoned feature branches (>1 month no activity)
- [ ] Verify all agent branches are properly merged
- [ ] Clean up temporary fix branches after merge

### Safe to Delete (If Merged)

Branches with patterns that are typically safe to delete after merge:

- `repokeeper/*` - Maintenance branches
- `bugfix/*` - Bug fix branches
- `fix/*` - General fixes
- `bolt-optimize-*` - Single-purpose optimization branches
- `brocula/console-fixes-*` - Console-specific fixes

### Retain Until Confirmed

- `feature/*` - May contain ongoing work
- `sentinel/*` - Security-related, verify before deletion
- `palette/*` - UI features, may be iterative

---

## Commands for Cleanup

### List branches by date

```bash
git for-each-ref --sort=-committerdate refs/remotes/origin --format='%(refname:short) %(committerdate:short)'
```

### Delete remote branch

```bash
git push origin --delete <branch-name>
```

### Prune local references

```bash
git remote prune origin
```

---

_This registry is maintained by RepoKeeper_
