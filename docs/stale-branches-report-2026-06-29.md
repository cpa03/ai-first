# Stale Branch Report - 2026-06-29

## Summary

- **Total remote branches**: 86
- **Branches older than 14 days (not merged)**: 2
- **Branches with open PRs**: 0
- **Recommended action**: Delete the 2 stale branches

## Stale Branches (Sorted by Age)

| Branch                                            | Age     | Last Commit | Status |
| ------------------------------------------------- | ------- | ----------- | ------ |
| `palette/add-search-clear-button`                 | 14 days | 2026-06-15  | No PR  |
| `flexy/modularize-hardcoded-values-20260615-0950` | 14 days | 2026-06-15  | No PR  |

## Recommendation

Both branches are:

1. Exactly 14 days old
2. Not merged to main
3. Have no open pull requests
4. Show no recent activity

**Safe to delete**: These branches appear to be abandoned feature branches that were never merged. Deleting them will clean up the repository and reduce clutter.

## Commands to Delete

```bash
# Delete all stale branches (execute with caution)
git push origin --delete \
  palette/add-search-clear-button \
  flexy/modularize-hardcoded-values-20260615-0950
```

## Recent Branches (Less than 14 days old)

These branches are recent and should be kept for potential use:

- `palette/password-checklist-ux-8448078425020539985` (1 day old)
- `flexy/modularize-hardcoded-20260628-165545` (1 day old)
- `brocula/browser-console-fixes-20260628-1657` (1 day old)
- `palette/scroll-to-top-bounce-animation` (1 day old)
- `brocula/browser-optimization-20260628-0743` (1 day old)
- And 43 other branches less than 14 days old

## Generated

- Date: 2026-06-29
- Session: RepoKeeper Maintenance Session 18
