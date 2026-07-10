# Stale Branches Report - 2026-07-10

**Maintainer**: RepoKeeper  
**Date**: 2026-07-10  
**Branch**: `repokeeper/cleanup-maintenance-20260710`

## Summary

| Metric                | Count |
| --------------------- | ----- |
| Total Remote Branches | 90    |
| Stale (≥7 days)       | 45    |
| Very Stale (≥2 weeks) | 15    |
| Active (≤7 days)      | 45    |

## Stale Branches (≥2 weeks old) - Priority Cleanup

These branches are older than 2 weeks and should be reviewed for closure:

| Branch                                                  | Last Updated | Category |
| ------------------------------------------------------- | ------------ | -------- |
| `bolt-optimize-db-pagination-5335318928471857024`       | 2 weeks ago  | bolt     |
| `bolt/optimize-pii-typedarray-6684512142872105468`      | 2 weeks ago  | bolt     |
| `brocula/browser-console-fixes-20260626-074143`         | 2 weeks ago  | brocula  |
| `fix/resolve-zod-dependency-conflict`                   | 2 weeks ago  | fix      |
| `fix/typescript-errors-services-test`                   | 2 weeks ago  | fix      |
| `flexy/modularize-hardcoded-strings`                    | 2 weeks ago  | flexy    |
| `palette/mobile-step-connectors`                        | 2 weeks ago  | palette  |
| `refactor/split-constants-ts`                           | 2 weeks ago  | refactor |
| `sentinel/fix-idea-creation-xss-7380207059922651774`    | 2 weeks ago  | sentinel |
| `sentinel/regex-and-xss-hardening-11869385931801674639` | 2 weeks ago  | sentinel |
| `sentinel/ssrf-bypass-detection-13314798183915616214`   | 2 weeks ago  | sentinel |
| `palette-task-management-shortcuts-9012983147212740810` | 2 weeks ago  | palette  |
| `sentinel/fix-sanitization-bypass-937659009778794445`   | 2 weeks ago  | sentinel |
| `brocula/browser-console-fixes-20260627-204812`         | 2 weeks ago  | brocula  |
| `flexy/modularize-auth-storage-keys`                    | 2 weeks ago  | flexy    |

## Stale Branches (7-13 days old) - Secondary Cleanup

| Branch                                                 | Last Updated | Category |
| ------------------------------------------------------ | ------------ | -------- |
| `bolt-resolve-n1-similarity-2355380361530250559`       | 10 days ago  | bolt     |
| `palette/dashboard-keyboard-nav-7073565558942816835`   | 10 days ago  | palette  |
| `brocula/browser-console-fixes-20260628-1657`          | 11 days ago  | brocula  |
| `chore/repokeeper-docs-sync-2026-06-28`                | 11 days ago  | chore    |
| `flexy/modularize-hardcoded-20260628-165545`           | 11 days ago  | flexy    |
| `palette/password-checklist-ux-8448078425020539985`    | 11 days ago  | palette  |
| `palette/scroll-to-top-bounce-animation`               | 11 days ago  | palette  |
| `bolt/optimize-rate-limit-search-12456184781728283877` | 12 days ago  | bolt     |
| `brocula/browser-optimization-20260628-0743`           | 12 days ago  | brocula  |
| `palette/task-management-keyboard-shortcuts`           | 12 days ago  | palette  |
| `flexy/modularize-remaining-hardcoded-20260628-074401` | 12 days ago  | flexy    |
| `palette/scroll-to-question-on-step-change`            | 13 days ago  | palette  |
| `sentinel/security-enhancements-5341324102903061486`   | 13 days ago  | sentinel |

## Active Branches (≤7 days)

These branches are recent and should be kept:

| Branch                                              | Last Updated | Category   |
| --------------------------------------------------- | ------------ | ---------- |
| `main`                                              | 1 hour ago   | main       |
| `repokeeper/cleanup-redundant-files-20260710`       | 2 hours ago  | repokeeper |
| `feature/palette-autofocus-clarification-input`     | 3 hours ago  | feature    |
| `bugfix/remove-insecure-crypto-fallback`            | 3 hours ago  | bugfix     |
| `bolt-optimize-logger-675895658396470740`           | 4 hours ago  | bolt       |
| `fix/1135-service-role-key-security-test`           | 5 hours ago  | fix        |
| `repokeeper/cleanup-maintenance-20260710`           | Now          | repokeeper |
| `sentinel-rate-limit-fix-1022421317408582835`       | 6 hours ago  | sentinel   |
| `brocula/browser-console-audit-20260710-0125`       | 10 hours ago | brocula    |
| `repokeeper/maintenance-session-20260709`           | 14 hours ago | repokeeper |
| `palette/typing-indicator-ux`                       | 14 hours ago | palette    |
| `brocula/browser-console-audit-20260709-0730`       | 14 hours ago | brocula    |
| `flexy/modularize-remaining-hardcoded-20260709`     | 14 hours ago | flexy      |
| `bugfix/fix-summarize-error-bracket`                | 14 hours ago | bugfix     |
| `flexy/modularize-dashboard-hardcoded-strings`      | 20 hours ago | flexy      |
| `repokeeper/maintenance-cleanup-20260709`           | 20 hours ago | repokeeper |
| `docs/yaml-corruption-fix-documentation`            | 22 hours ago | docs       |
| `brocula/browser-console-lighthouse-fixes-20260708` | 27 hours ago | brocula    |
| `brocula/browser-console-fixes-20260708-1004`       | 35 hours ago | brocula    |
| `palette/task-checkbox-smooth-transition`           | 35 hours ago | palette    |

## Cleanup Script

To delete stale branches (requires GitHub CLI):

```bash
# Delete branches older than 2 weeks (very stale)
STALE_BRANCHES=(
  "bolt-optimize-db-pagination-5335318928471857024"
  "bolt/optimize-pii-typedarray-6684512142872105468"
  "brocula/browser-console-fixes-20260626-074143"
  "fix/resolve-zod-dependency-conflict"
  "fix/typescript-errors-services-test"
  "flexy/modularize-hardcoded-strings"
  "palette/mobile-step-connectors"
  "refactor/split-constants-ts"
  "sentinel/fix-idea-creation-xss-7380207059922651774"
  "sentinel/regex-and-xss-hardening-11869385931801674639"
  "sentinel/ssrf-bypass-detection-13314798183915616214"
  "palette-task-management-shortcuts-9012983147212740810"
  "sentinel/fix-sanitization-bypass-937659009778794445"
  "brocula/browser-console-fixes-20260627-204812"
  "flexy/modularize-auth-storage-keys"
)

for branch in "${STALE_BRANCHES[@]}"; do
  echo "Deleting: $branch"
  gh api repos/cpa03/ai-first/git/refs/heads/$branch -X DELETE || true
done
```

## Recommendations

1. **Immediate**: Delete the 15 branches older than 2 weeks
2. **Short-term**: Review branches 7-13 days old for merge or closure
3. **Long-term**: Set up automated branch cleanup via GitHub Actions
4. **Process**: Enforce branch lifecycle policy (max 14 days for feature branches)

## Branch Categories

| Category   | Count | Description                       |
| ---------- | ----- | --------------------------------- |
| bolt       | 15    | Performance optimization branches |
| palette    | 18    | UI/UX improvement branches        |
| sentinel   | 12    | Security hardening branches       |
| brocula    | 10    | Browser console audit branches    |
| flexy      | 12    | Code modularization branches      |
| repokeeper | 12    | Maintenance branches              |
| fix        | 4     | Bug fix branches                  |
| other      | 7     | Miscellaneous branches            |

---

_Report generated by RepoKeeper maintenance session - 2026-07-10_
