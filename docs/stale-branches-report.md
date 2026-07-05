# Stale Branches Report

**Generated**: 2026-07-05 01:45 UTC  
**Repository**: cpa03/ai-first  
**Branch**: repokeeper/maintenance-session-20260705

## Summary

| Category                            | Count | Action            |
| ----------------------------------- | ----- | ----------------- |
| Active branches (<7 days)           | 35    | Keep              |
| Stale unmerged branches (7-14 days) | 28    | Review and decide |
| Very stale unmerged (>14 days)      | 11    | Close or update   |
| Total remote branches (excl main)   | 74    | —                 |

## Active Branches (<7 days old)

These branches are recent and should be kept:

| Branch                                                               | Last Commit | Age    |
| -------------------------------------------------------------------- | ----------- | ------ |
| `origin/bolt/memoize-platform-detection-7847075536831248981`         | 2026-07-05  | 0 days |
| `origin/agent-11985937172099420222`                                  | 2026-07-04  | 1 day  |
| `origin/bolt/ai-service-optimizations-3107212969444968575`           | 2026-07-04  | 1 day  |
| `origin/bolt-resolve-n1-similarity-2355380361530250559`              | 2026-07-03  | 2 days |
| `origin/palette/adaptive-ripple-color`                               | 2026-07-04  | 1 day  |
| `origin/repokeeper/maintenance-session-20260704-repohealth`          | 2026-07-04  | 1 day  |
| `origin/sentinel/fix-supabase-filter-injection-16616913367529283454` | 2026-07-04  | 1 day  |
| `origin/flexy/modularize-remaining-hardcoded-values`                 | 2026-07-03  | 2 days |
| `origin/palette/task-item-keyboard-shortcut-hint`                    | 2026-07-03  | 2 days |
| `origin/perf-optimize-dependency-analyzer-10320778019602255751`      | 2026-07-03  | 2 days |
| `origin/repokeeper/cleanup-readme-fix-20260703`                      | 2026-07-03  | 2 days |
| `origin/sentinel/sanitize-task-updates-10934618272305624147`         | 2026-07-03  | 2 days |

## Stale Branches (7-14 days old)

These branches need review - consider closing or updating:

| Branch                                                        | Last Commit | Age     |
| ------------------------------------------------------------- | ----------- | ------- |
| `origin/bolt-csrf-optimization-12509291956161220936`          | 2026-06-22  | 13 days |
| `origin/bolt-optimize-db-pagination-5335318928471857024`      | 2026-06-26  | 9 days  |
| `origin/bolt-optimize-date-formatting-7330234455077622024`    | 2026-06-23  | 12 days |
| `origin/bolt/optimize-pii-typedarray-6684512142872105468`     | 2026-06-24  | 11 days |
| `origin/bolt/optimize-rate-limit-search-12456184781728283877` | 2026-06-28  | 7 days  |
| `origin/bolt/resilience-ai-perf-14234929701407493520`         | 2026-07-02  | 3 days  |
| `origin/brocula/browser-console-audit`                        | 2026-06-30  | 5 days  |
| `origin/brocula/browser-console-fixes`                        | 2026-06-28  | 7 days  |
| `origin/brocula/browser-console-fixes-20260626-074143`        | 2026-06-26  | 9 days  |
| `origin/brocula/browser-console-fixes-20260627-204812`        | 2026-06-27  | 8 days  |
| `origin/brocula/browser-console-fixes-20260628-1657`          | 2026-06-28  | 7 days  |
| `origin/brocula/browser-optimization-20260628-0743`           | 2026-06-28  | 7 days  |

## Very Stale Branches (>14 days old)

These branches are candidates for cleanup:

| Branch                                                       | Last Commit | Age     |
| ------------------------------------------------------------ | ----------- | ------- |
| `origin/bolt-csrf-optimization-12509291956161220936`         | 2026-06-22  | 13 days |
| `origin/bolt-optimize-date-formatting-7330234455077622024`   | 2026-06-23  | 12 days |
| `origin/bolt-optimize-pii-typedarray-6684512142872105468`    | 2026-06-24  | 11 days |
| `origin/bolt-optimize-db-pagination-5335318928471857024`     | 2026-06-26  | 9 days  |
| `origin/brocula/browser-console-fixes-20260626-074143`       | 2026-06-26  | 9 days  |
| `origin/bolt-sanitize-html-optimization-4239138431437011943` | 2026-06-21  | 14 days |
| `origin/fix/typescript-errors-services-test`                 | 2026-06-21  | 14 days |
| `origin/fix/resolve-zod-dependency-conflict`                 | 2026-06-21  | 14 days |
| `origin/quality/fix-type-safety-test-files`                  | 2026-06-21  | 14 days |
| `origin/refactor/errors-split-v2`                            | 2026-06-21  | 14 days |
| `origin/repokeeper/cleanup-redundant-files`                  | 2026-06-21  | 14 days |

## Recommendations

1. **Close stale branches**: Consider closing branches older than 14 days that haven't been updated
2. **Review 7-14 day branches**: These need attention - either merge, update, or close
3. **Clean up remote tracking**: Run `git fetch --prune` to remove stale remote tracking branches
4. **Archive completed work**: For merged branches, ensure they're properly closed

## How to Clean Up

```bash
# Prune stale remote tracking branches
git fetch --prune

# Delete a specific remote branch (use with caution)
git push origin --delete <branch-name>

# List branches merged into main
git branch -r --merged origin/main | grep -v "remotes/origin/main"

# Find branches with no recent commits
git for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)' refs/remotes/origin | head -20
```

---

**Note**: Always verify a branch is merged or no longer needed before deleting. Consider creating backups for important work.
