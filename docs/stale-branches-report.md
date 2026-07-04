# Stale Branches Report

**Generated**: 2026-07-04  
**Repository**: cpa03/ai-first  
**Branch**: repokeeper/maintenance-session-20260704-repohealth

## Summary

| Category                          | Count | Action                 |
| --------------------------------- | ----- | ---------------------- |
| Merged branches (safe to delete)  | 2     | Delete remote branches |
| Stale unmerged branches (>7 days) | 32    | Review and decide      |
| Active branches (<7 days)         | 11    | Keep                   |

## Merged Branches (Safe to Delete)

These branches have been merged into main and can be safely deleted:

| Branch                                                  | Status | Date       |
| ------------------------------------------------------- | ------ | ---------- |
| `origin/repokeeper/maintenance-session-20260704-013420` | merged | 2026-07-04 |
| `origin/repokeeper/maintenance-session-26`              | merged | 2026-07-02 |

### Delete Commands

```bash
# Delete merged remote branches
git push origin --delete repokeeper/maintenance-session-20260704-013420
git push origin --delete repokeeper/maintenance-session-26
```

## Stale Unmerged Branches (>7 days old)

These branches are older than 7 days and have not been merged. Review each to determine if they should be:

1. **Merged** - If the work is complete and valuable
2. **Closed** - If the work is no longer needed
3. **Updated** - If the work should continue

### Older than 14 days (June 20-23)

| Branch                                                           | Last Commit | Age     |
| ---------------------------------------------------------------- | ----------- | ------- |
| `origin/palette/task-item-ux-enhancement-3440664062071426879`    | 2026-06-20  | 14 days |
| `origin/bolt-sanitize-html-optimization-4239138431437011943`     | 2026-06-21  | 13 days |
| `origin/sentinel/standardize-csp-logging-1302652341255851852`    | 2026-06-21  | 13 days |
| `origin/refactor/decompose-database-service`                     | 2026-06-21  | 13 days |
| `origin/palette/onboarding-focus-visibility-a11y`                | 2026-06-21  | 13 days |
| `origin/bugfix/fix-anthropic-timeout-config`                     | 2026-06-21  | 13 days |
| `origin/brocula/fix-heading-hierarchy-a11y`                      | 2026-06-21  | 13 days |
| `origin/flexy/modularize-remaining-hardcoded`                    | 2026-06-21  | 13 days |
| `origin/sentinel/fix-metrics-auth-fail-open-6747267804239174279` | 2026-06-22  | 12 days |
| `origin/bolt-csrf-optimization-12509291956161220936`             | 2026-06-22  | 12 days |
| `origin/brocula/fix-test-type-errors`                            | 2026-06-22  | 12 days |
| `origin/bugfix/fix-log-sample-rate-default`                      | 2026-06-23  | 11 days |
| `origin/bolt/optimize-date-formatting-7330234455077622024`       | 2026-06-23  | 11 days |
| `origin/sentinel/sanitize-html-enhancement-8812962067955003314`  | 2026-06-23  | 11 days |
| `origin/repokeeper/maintenance-session-5`                        | 2026-06-23  | 11 days |
| `origin/palette/email-button-visual-feedback`                    | 2026-06-23  | 11 days |
| `origin/palette-tooltip-shortcuts-8667103210883627339`           | 2026-06-23  | 11 days |

### 7-13 days old (June 24-27)

| Branch                                                         | Last Commit | Age     |
| -------------------------------------------------------------- | ----------- | ------- |
| `origin/bolt/optimize-pii-typedarray-6684512142872105468`      | 2026-06-24  | 10 days |
| `origin/sentinel/regex-and-xss-hardening-11869385931801674639` | 2026-06-24  | 10 days |
| `origin/repokeeper/maintenance-session-8`                      | 2026-06-24  | 10 days |
| `origin/repokeeper/maintenance-session-9`                      | 2026-06-24  | 10 days |
| `origin/repokeeper/maintenance-session-10`                     | 2026-06-24  | 10 days |
| `origin/palette/mobile-step-connectors`                        | 2026-06-25  | 9 days  |
| `origin/repokeeper/cleanup-redundant-files`                    | 2026-06-25  | 9 days  |
| `origin/fix/resolve-zod-dependency-conflict`                   | 2026-06-25  | 9 days  |
| `origin/flexy/modularize-hardcoded-strings`                    | 2026-06-25  | 9 days  |
| `origin/refactor/split-constants-ts`                           | 2026-06-25  | 9 days  |
| `origin/sentinel/ssrf-bypass-detection-13314798183915616214`   | 2026-06-25  | 9 days  |
| `origin/bolt-optimize-db-pagination-5335318928471857024`       | 2026-06-26  | 8 days  |
| `origin/fix/typescript-errors-services-test`                   | 2026-06-26  | 8 days  |
| `origin/brocula/browser-console-fixes-20260626-074143`         | 2026-06-26  | 8 days  |
| `origin/sentinel/fix-idea-creation-xss-7380207059922651774`    | 2026-06-26  | 8 days  |
| `origin/palette-task-management-shortcuts-9012983147212740810` | 2026-06-26  | 8 days  |
| `origin/sentinel/fix-sanitization-bypass-937659009778794445`   | 2026-06-27  | 7 days  |
| `origin/brocula/browser-console-fixes-20260627-204812`         | 2026-06-27  | 7 days  |
| `origin/flexy/modularize-auth-storage-keys`                    | 2026-06-27  | 7 days  |

## Active Branches (<7 days old)

These branches are recent and should be kept:

| Branch                                                          | Last Commit | Age    |
| --------------------------------------------------------------- | ----------- | ------ |
| `origin/bolt/optimize-rate-limit-search-12456184781728283877`   | 2026-06-28  | 6 days |
| `origin/palette/task-management-keyboard-shortcuts`             | 2026-06-28  | 6 days |
| `origin/flexy/modularize-remaining-hardcoded-20260628-074401`   | 2026-06-28  | 6 days |
| `origin/brocula/browser-optimization-20260628-0743`             | 2026-06-28  | 6 days |
| `origin/chore/repokeeper-docs-sync-2026-06-28`                  | 2026-06-28  | 6 days |
| `origin/palette/scroll-to-top-bounce-animation`                 | 2026-06-28  | 6 days |
| `origin/brocula/browser-console-fixes-20260628-1657`            | 2026-06-28  | 6 days |
| `origin/flexy/modularize-hardcoded-20260628-165545`             | 2026-06-28  | 6 days |
| `origin/palette/password-checklist-ux-8448078425020539985`      | 2026-06-28  | 6 days |
| `origin/palette/dashboard-keyboard-nav-7073565558942816835`     | 2026-06-29  | 5 days |
| `origin/bolt-resolve-n1-similarity-2355380361530250559`         | 2026-06-30  | 4 days |
| `origin/repokeeper/maintenance-session-25`                      | 2026-06-30  | 4 days |
| `origin/brocula/browser-console-audit`                          | 2026-06-30  | 4 days |
| `origin/flexy/modularization-20260630`                          | 2026-06-30  | 4 days |
| `origin/palette/scroll-to-question-on-step-change`              | 2026-06-30  | 4 days |
| `origin/bolt/ai-service-optimizations-3107212969444968575`      | 2026-07-01  | 3 days |
| `origin/sentinel/security-enhancements-5341324102903061486`     | 2026-07-01  | 3 days |
| `origin/palette/final-step-indicator`                           | 2026-07-02  | 2 days |
| `origin/bolt/resilience-ai-perf-14234929701407493520`           | 2026-07-02  | 2 days |
| `origin/repokeeper/cleanup-readme-fix-20260703`                 | 2026-07-03  | 1 day  |
| `origin/palette/task-item-keyboard-shortcut-hint`               | 2026-07-03  | 1 day  |
| `origin/flexy/modularize-remaining-hardcoded-values`            | 2026-07-03  | 1 day  |
| `origin/perf-optimize-dependency-analyzer-10320778019602255751` | 2026-07-03  | 1 day  |
| `origin/sentinel/sanitize-task-updates-10943618272305624147`    | 2026-07-03  | 1 day  |
| `origin/agent-11985937172099420222`                             | 2026-07-03  | 1 day  |

## Recommendations

### Immediate Actions

1. **Delete merged branches** - Remove the 2 confirmed merged branches
2. **Review stale branches** - Decide on the 32 stale unmerged branches

### Branch Cleanup Policy

- **Delete merged branches** immediately after merge
- **Review branches** older than 7 days
- **Close abandoned branches** older than 14 days with no activity
- **Update stale branches** if work should continue

### GitHub Settings

Consider enabling:

- **Auto-delete head branches** in repository settings
- **Branch protection rules** for main branch
- **Required reviews** for PR merges

---

_This report was generated by RepoKeeper maintenance session 20260704-repohealth_
