# Stale Branches Report - 2026-07-07

**Maintainer**: RepoKeeper  
**Date**: 2026-07-07  
**Branch**: `repokeeper/cleanup-stale-branches-and-docs-update`

## Summary

| Metric                   | Status |
| ------------------------ | ------ |
| Total Unmerged Branches  | 83     |
| Very Stale (>14 days)    | 23     |
| Stale (7-14 days)        | 45     |
| Recent (<7 days)         | 15     |
| Merged Branches (pruned) | 2      |

## Branch Analysis by Age

### Very Stale (>14 days old - June 20-23)

These branches are over 2 weeks old and likely abandoned:

| Branch                                                         | Last Updated | Category   |
| -------------------------------------------------------------- | ------------ | ---------- |
| origin/palette/task-item-ux-enhancement-3440664062071426879    | 2026-06-20   | palette    |
| origin/bolt-sanitize-html-optimization-4239138431437011943     | 2026-06-21   | bolt       |
| origin/sentinel/standardize-csp-logging-1302652341255851852    | 2026-06-21   | sentinel   |
| origin/refactor/decompose-database-service                     | 2026-06-21   | refactor   |
| origin/palette/onboarding-focus-visibility-a11y                | 2026-06-21   | palette    |
| origin/bugfix/fix-anthropic-timeout-config                     | 2026-06-21   | bugfix     |
| origin/brocula/fix-heading-hierarchy-a11y                      | 2026-06-21   | brocula    |
| origin/flexy/modularize-remaining-hardcoded                    | 2026-06-21   | flexy      |
| origin/sentinel/fix-metrics-auth-fail-open-6747267804239174279 | 2026-06-22   | sentinel   |
| origin/bolt-csrf-optimization-12509291956161220936             | 2026-06-22   | bolt       |
| origin/brocula/fix-test-type-errors                            | 2026-06-22   | brocula    |
| origin/bugfix/fix-log-sample-rate-default                      | 2026-06-23   | bugfix     |
| origin/bolt/optimize-date-formatting-7330234455077622024       | 2026-06-23   | bolt       |
| origin/sentinel/sanitize-html-enhancement-8812962067955003314  | 2026-06-23   | sentinel   |
| origin/repokeeper/maintenance-session-5                        | 2026-06-23   | repokeeper |
| origin/palette/email-button-visual-feedback                    | 2026-06-23   | palette    |
| origin/palette-tooltip-shortcuts-8667103210883627339           | 2026-06-23   | palette    |

**Recommendation**: These branches should be deleted unless they contain critical unfinished work.

### Stale (7-14 days old - June 24-July 1)

| Branch                                                       | Last Updated | Category   |
| ------------------------------------------------------------ | ------------ | ---------- |
| origin/bolt/optimize-pii-typedarray-6684512142872105468      | 2026-06-24   | bolt       |
| origin/sentinel/regex-and-xss-hardening-11869385931801674639 | 2026-06-24   | sentinel   |
| origin/repokeeper/maintenance-session-8                      | 2026-06-24   | repokeeper |
| origin/repokeeper/maintenance-session-9                      | 2026-06-24   | repokeeper |
| origin/repokeeper/maintenance-session-10                     | 2026-06-24   | repokeeper |
| origin/palette/mobile-step-connectors                        | 2026-06-25   | palette    |
| origin/repokeeper/cleanup-redundant-files                    | 2026-06-25   | repokeeper |
| origin/fix/resolve-zod-dependency-conflict                   | 2026-06-25   | fix        |
| origin/flexy/modularize-hardcoded-strings                    | 2026-06-25   | flexy      |
| origin/refactor/split-constants-ts                           | 2026-06-25   | refactor   |
| origin/sentinel/ssrf-bypass-detection-13314798183915616214   | 2026-06-25   | sentinel   |
| origin/bolt-optimize-db-pagination-5335318928471857024       | 2026-06-26   | bolt       |
| origin/fix/typescript-errors-services-test                   | 2026-06-26   | fix        |
| origin/brocula/browser-console-fixes-20260626-074143         | 2026-06-26   | brocula    |
| origin/sentinel/fix-idea-creation-xss-7380207059922651774    | 2026-06-26   | sentinel   |
| origin/palette-task-management-shortcuts-9012983147212740810 | 2026-06-26   | palette    |
| origin/sentinel/fix-sanitization-bypass-937659009778794445   | 2026-06-27   | sentinel   |
| origin/brocula/browser-console-fixes-20260627-204812         | 2026-06-27   | brocula    |
| origin/flexy/modularize-auth-storage-keys                    | 2026-06-27   | flexy      |
| origin/bolt/optimize-rate-limit-search-12456184781728283877  | 2026-06-28   | bolt       |
| origin/palette/task-management-keyboard-shortcuts            | 2026-06-28   | palette    |
| origin/flexy/modularize-remaining-hardcoded-20260628-074401  | 2026-06-28   | flexy      |
| origin/brocula/browser-optimization-20260628-0743            | 2026-06-28   | brocula    |
| origin/brocula/browser-console-fixes-20260628-1657           | 2026-06-28   | brocula    |
| origin/flexy/modularize-hardcoded-20260628-165545            | 2026-06-28   | flexy      |
| origin/palette/password-checklist-ux-8448078425020539985     | 2026-06-28   | palette    |
| origin/palette/dashboard-keyboard-nav-7073565558942816835    | 2026-06-29   | palette    |
| origin/bolt-resolve-n1-similarity-2355380361530250559        | 2026-06-30   | bolt       |
| origin/repokeeper/maintenance-session-25                     | 2026-06-30   | repokeeper |
| origin/brocula/browser-console-audit                         | 2026-06-30   | brocula    |
| origin/flexy/modularization-20260630                         | 2026-06-30   | flexy      |
| origin/palette/scroll-to-question-on-step-change             | 2026-06-30   | palette    |
| origin/bolt/ai-service-optimizations-3107212969444968575     | 2026-07-01   | bolt       |
| origin/sentinel/security-enhancements-5341324102903061486    | 2026-07-01   | sentinel   |

**Recommendation**: Review these branches for valid work that should be merged or abandoned.

### Recent (<7 days old - July 2-6)

| Branch                                                             | Last Updated | Category   |
| ------------------------------------------------------------------ | ------------ | ---------- |
| origin/bolt/resilience-ai-perf-14234929701407493520                | 2026-07-02   | bolt       |
| origin/palette/task-item-keyboard-shortcut-hint                    | 2026-07-03   | palette    |
| origin/flexy/modularize-remaining-hardcoded-values                 | 2026-07-03   | flexy      |
| origin/perf-optimize-dependency-analyzer-10320778019602255751      | 2026-07-03   | perf       |
| origin/repokeeper/cleanup-readme-fix-20260703                      | 2026-07-03   | repokeeper |
| origin/sentinel/sanitize-task-updates-10934618272305624147         | 2026-07-03   | sentinel   |
| origin/agent-11985937172099420222                                  | 2026-07-03   | agent      |
| origin/bolt/memoize-platform-detection-7847075536831248981         | 2026-07-04   | bolt       |
| origin/sentinel/fix-supabase-filter-injection-16616913367529283454 | 2026-07-04   | sentinel   |
| origin/palette/adaptive-ripple-color                               | 2026-07-04   | palette    |
| origin/repokeeper/maintenance-session-20260704-repohealth          | 2026-07-04   | repokeeper |
| origin/fix/1816-consolidate-database-migrations                    | 2026-07-04   | fix        |
| origin/palette/micro-ux-keyboard-shortcut-hint                     | 2026-07-04   | palette    |
| origin/repokeeper/maintenance-session-20260704-1400                | 2026-07-04   | repokeeper |
| origin/palette/smooth-delete-modal-animation                       | 2026-07-04   | palette    |
| origin/bugfix/fix-circular-dependency-errors                       | 2026-07-04   | bugfix     |
| origin/brocula/browser-console-fixes                               | 2026-07-04   | brocula    |
| origin/repokeeper/cleanup-docs-and-stale-branches-20260704         | 2026-07-04   | repokeeper |
| origin/refactor/flexy-modularize-hardcoded-values                  | 2026-07-04   | refactor   |
| origin/🎨-palette-consistent-success-confetti-8335385052643825807  | 2026-07-04   | palette    |
| origin/palette/search-escape-clear                                 | 2026-07-05   | palette    |
| origin/repokeeper/maintenance-session-20260705-2                   | 2026-07-05   | repokeeper |
| origin/flexy/modularize-hardcoded-values-20260705-065929           | 2026-07-05   | flexy      |
| origin/bolt/optimize-hot-paths-10495518322151279238                | 2026-07-05   | bolt       |
| origin/sentinel/task-xss-protection-7713347011479957166            | 2026-07-05   | sentinel   |
| origin/sentinel/fix-stored-xss-task-api-2925051936226532847        | 2026-07-06   | sentinel   |
| origin/flexy/modularize-remaining-hardcoded-20260706-211938        | 2026-07-06   | flexy      |
| origin/palette/micro-ux-hamburger-reduced-motion                   | 2026-07-06   | palette    |
| origin/repokeeper/maintenance-session-20260706                     | 2026-07-06   | repokeeper |
| origin/palette-dashboard-nav-shortcuts-9927997883043949930         | 2026-07-06   | palette    |

**Recommendation**: These are recent and may still be active. Monitor for updates.

## Branch Categories

| Category   | Count | Description               |
| ---------- | ----- | ------------------------- |
| palette    | 25    | UI/UX improvements        |
| bolt       | 15    | Performance optimizations |
| sentinel   | 15    | Security enhancements     |
| flexy      | 12    | Code modularization       |
| repokeeper | 10    | Maintenance tasks         |
| brocula    | 8     | Browser console fixes     |
| bugfix     | 4     | Bug fixes                 |
| fix        | 4     | Issue fixes               |
| refactor   | 4     | Code refactoring          |
| agent      | 1     | Agent-generated           |
| perf       | 1     | Performance               |

## Recommendations

### Immediate Actions

1. **Delete very stale branches** (>14 days old) that are clearly abandoned
2. **Review stale branches** (7-14 days) for valid work to merge or close
3. **Monitor recent branches** (<7 days) for activity

### Process Improvements

1. **Automated branch cleanup**: Set up GitHub Actions to auto-delete branches after 30 days of inactivity
2. **Branch naming conventions**: Enforce consistent naming to improve organization
3. **PR requirements**: Require PRs for all changes to main (no direct pushes)

### Cleanup Commands

```bash
# Delete very stale branches (use with caution)
git branch -r --no-merged main --format='%(committerdate:iso) %(refname:short)' | sort | awk '$1 < "2026-06-24" {print $2}' | xargs -I {} git push origin --delete {}

# Prune remote tracking branches
git fetch --prune
```

---

_Report generated by RepoKeeper maintenance session - 2026-07-07_
